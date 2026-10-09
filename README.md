# InfraPulse AI

Infrastructure monitoring for servers and networks: uptime, CPU and memory, with
attention surfaced before it becomes an outage.

> **Status: early.** Authentication is implemented and verified. No monitoring
> features exist yet. See `Context/progress-tracker.md` for verified status.

## Stack

- **Next.js 16** (App Router, `src/`) + TypeScript + Tailwind CSS v4
- **Clerk** for authentication

Supabase, Google Maps, and Google SMTP are planned but not wired up. Their
environment variable names are listed in `.env.example`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the Clerk keys
npm run dev
```

Without Clerk keys the app still runs and shows an "authentication is not
configured" notice, so the build stays verifiable on machines without secrets.

To get keys, either create an application at [dashboard.clerk.com](https://dashboard.clerk.com)
or run `npx clerk@latest init`, which provisions temporary accountless
development keys. Run `npx clerk auth login` before deploying.

## Scripts

| Command             | Purpose                        |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start the dev server           |
| `npm run build`     | Production build               |
| `npm run start`     | Serve the production build     |
| `npm run lint`      | ESLint                         |
| `npm run typecheck` | `tsc --noEmit`                 |
| `npm test`          | Unit tests (`node:test`)       |

## Next.js 16 note

`middleware.ts` is deprecated in Next 16 and renamed to **`proxy.ts`**; the export
must be named `proxy`. This project uses `src/proxy.ts`.

## Security model

- `src/proxy.ts` redirects unauthenticated users away from `/dashboard`. Treat it
  as **user experience, not security** — a matcher can be bypassed.
- `src/app/dashboard/page.tsx` re-verifies the session **on the server** and is the
  actual authorization boundary. Every protected page and route handler must do
  the same; do not rely on the proxy alone.
- Never trust a client-supplied user ID as proof of identity or access.
- Secrets live only in server-side env. `.env.local` is git-ignored and
  `.env.example` contains variable names only.

## Project context

`Context/` holds the project documentation: scope, architecture, build plan, and
the progress tracker. Read `Context/README.md` for the index.