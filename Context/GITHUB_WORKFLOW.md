# GitHub Workflow — InfraPulse AI

Repository: https://github.com/Aether-Frame-Creater/InfraPulse-AI  
Working branch: `dev`

## Required workflow for every change
```bash
git status --short --branch
git switch dev
# If dev does not exist locally, create it from the agreed base after checking remote branches:
git fetch origin
git switch -c dev origin/main
# If the remote branch dev already exists instead:
# git switch --track origin/dev

# Make the focused change
git diff --check
# Run project checks found in package.json / README
git diff
git add <specific-files>
git commit -m "type: concise description"
git push -u origin dev   # first push only
# later: git push origin dev
git rev-parse --short HEAD
```

Do not run the branch-creation commands blindly. First inspect `git branch -a`, `git status`, and the repository's actual default branch. Do not discard unrelated changes or force-push. Use specific paths rather than `git add .` when unrelated files may be present. Never commit `.env`, API keys, SMTP credentials, Clerk secrets, Supabase service-role keys, private Maps keys, tokens, or user data.

After each change, update `progress-tracker.md` with the date, summary, tests, commit hash, and push outcome. If a push cannot be completed, state that clearly and leave the commit ready for push.
