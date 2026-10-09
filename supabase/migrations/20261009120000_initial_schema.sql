-- InfraPulse AI — initial schema for uptime monitoring.
--
-- STATUS: written but NOT yet applied. This file has never been executed
-- against a database, so it must be reviewed and run in a real Supabase
-- project before it is trusted.
--
-- TENANCY: every tenant-owned row carries `org_id`, which holds a Clerk
-- Organization id. Row Level Security is the enforcement point.
--
-- IMPORTANT CAVEAT ON RLS AND CLERK JWTs
-- --------------------------------------
-- RLS policies below read org membership from `auth.jwt()`. For PostgREST to
-- evaluate those claims, the JWT you send must be verified by Supabase. A
-- Clerk-issued token is signed by Clerk, NOT by Supabase, so Supabase will
-- reject it unless one of these is configured:
--
--   (a) Set the Supabase project's JWT secret / JWKS to your Clerk instance
--       (Supabase dashboard -> Authentication -> JWT), or
--   (b) Do not call PostgREST from the browser at all. Call it only from
--       Next.js server code using the service-role key, and enforce org
--       scoping in application code. RLS remains as defence in depth.
--
-- Option (b) is the simpler and safer default for this project and is what the
-- data-access layer assumes. These policies exist so that a future direct
-- client path cannot leak cross-tenant data by accident.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

-- Returns true when the caller's token grants access to `target_org`.
--
-- Handles both claim shapes Clerk can emit:
--   * `org_id`  - the single active organization
--   * `org_ids` - an array of organizations the user belongs to
--
-- SECURITY DEFINER with a pinned search_path, so the function cannot be
-- hijacked via a malicious `search_path`.
create or replace function public.has_org_access(target_org text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    target_org is not null
    and (
      target_org = (select auth.jwt() ->> 'org_id')
      or exists (
        select 1
        from jsonb_array_elements_text(
          coalesce((select auth.jwt() -> 'org_ids'), '[]'::jsonb)
        ) as membership(org_id)
        where membership.org_id = target_org
      )
    );
$$;

comment on function public.has_org_access(text) is
  'True when the caller''s Clerk session grants access to the given organization id.';

-- ---------------------------------------------------------------------------
-- targets — the endpoints being monitored
-- ---------------------------------------------------------------------------

create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  name text not null check (length(btrim(name)) between 1 and 120),
  -- Only http/https may be probed; the app enforces this too, but the database
  -- should not be the only place it is untrue.
  url text not null check (url ~* '^https?://'),
  interval_seconds integer not null default 300
    check (interval_seconds between 30 and 86400),
  timeout_ms integer not null default 10000
    check (timeout_ms between 1000 and 60000),
  accept_error_statuses boolean not null default false,
  active boolean not null default true,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint targets_org_id_name_key unique (org_id, name)
);

comment on table public.targets is 'Endpoints monitored for availability, scoped to one organization.';

create index if not exists targets_org_active_idx
  on public.targets (org_id, active);

-- Keep `updated_at` honest without trusting the client to send it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger targets_set_updated_at
  before update on public.targets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- uptime_checks — the result of each probe (time series)
-- ---------------------------------------------------------------------------

create table if not exists public.uptime_checks (
  -- A bigint identity is used instead of a uuid because this table grows far
  -- faster than the others and benefits from a compact, ordered key.
  id bigint generated always as identity primary key,
  org_id text not null,
  target_id uuid not null references public.targets (id) on delete cascade,
  checked_at timestamptz not null default now(),
  status text not null check (status in ('up', 'down')),
  status_code integer check (status_code between 100 and 599),
  response_ms integer check (response_ms >= 0),
  -- Category only. Raw error text is deliberately not stored: it can contain
  -- internal hostnames and ports.
  error text check (error in (
    'invalid_url', 'timeout', 'dns', 'tls',
    'connection_refused', 'unreachable', 'http_error', 'unknown'
  )),
  final_url text
);

comment on table public.uptime_checks is
  'One row per probe. Time-series data; consider TimescaleDB before volume grows.';

-- Reading recent history for a target is the dominant query.
create index if not exists uptime_checks_target_time_idx
  on public.uptime_checks (target_id, checked_at desc);

create index if not exists uptime_checks_org_time_idx
  on public.uptime_checks (org_id, checked_at desc);

-- A check must agree with its own status: 'up' cannot carry an error category.
alter table public.uptime_checks
  add constraint uptime_checks_status_error_consistent
  check ((status = 'up' and error is null) or status = 'down');

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.targets enable row level security;
alter table public.uptime_checks enable row level security;

-- Targets: readable only within the caller's organization.
drop policy if exists targets_select_own_org on public.targets;
create policy targets_select_own_org
  on public.targets
  for select
  using (public.has_org_access(org_id));

-- Writes are scoped to the caller's org too. Note this allows any member of an
-- org to edit any target in it. If only org admins should edit, add a role
-- check here against the Clerk `org_role` claim - deliberately not done yet
-- because the in-org roles have not been decided.
drop policy if exists targets_insert_own_org on public.targets;
create policy targets_insert_own_org
  on public.targets
  for insert
  with check (public.has_org_access(org_id));

drop policy if exists targets_update_own_org on public.targets;
create policy targets_update_own_org
  on public.targets
  for update
  using (public.has_org_access(org_id))
  with check (public.has_org_access(org_id));

drop policy if exists targets_delete_own_org on public.targets;
create policy targets_delete_own_org
  on public.targets
  for delete
  using (public.has_org_access(org_id));

-- Checks: readable within the caller's organization.
drop policy if exists uptime_checks_select_own_org on public.uptime_checks;
create policy uptime_checks_select_own_org
  on public.uptime_checks
  for select
  using (public.has_org_access(org_id));

-- No INSERT/UPDATE/DELETE policy is created on purpose. Under RLS, a table
-- with no matching policy denies the operation, which means probe results can
-- only be written by the service-role path. That keeps a compromised client
-- token from fabricating "everything is up" history.

-- ---------------------------------------------------------------------------
-- No public access
-- ---------------------------------------------------------------------------

revoke all on table public.targets from anon;
revoke all on table public.uptime_checks from anon;