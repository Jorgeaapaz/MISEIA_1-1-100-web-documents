@~/.claude/prompts/new_functionality_prompt_spec.md

# Create .env.example and Fix .gitignore for MISEIA 1-1-100

## Role
Act as a Software Developer and DevSecOps Engineer expert in Next.js project configuration and secrets management.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript / MongoDB / RustFS / MailHog)  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-100-web-documents`  
Non-compliance: `dc_env_example` + `cq_sin_secretos_en_repo`

**Current problem:**  
- `.gitignore` contains the pattern `.env*` which correctly ignores `.env.local` (secrets) BUT also incorrectly ignores `.env.example` (the template that MUST be committed).
- `.env.example` file does not exist in the repository at all.
- `package.json` has no `test` script (README says `npx jest` but no npm shortcut).

**Required environment variables (from AGENTS.md + `.env.local`):**
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=web-documents
SESSION_SECRET=<generate-random-32-char-hex>

AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=ia4devs-storage

MAILHOG_HOST=localhost
MAIL_PORT=1027

NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Task
1. Create `.env.example` at the project root with all required variables, placeholder values (no real secrets), and inline comments explaining each group.
2. Fix `.gitignore`: replace the broad `.env*` pattern with specific entries that ignore `.env.local`, `.env.production`, `.env.development.local` but **not** `.env.example`.
3. Add a `"test": "jest --coverage"` script to `package.json` alongside the existing scripts.
4. Verify with `git status` that `.env.example` is tracked and `.env.local` is not.
5. Commit with message `chore: add .env.example template and fix .gitignore env pattern`.

### Implementation Guidelines
- `.env.example` must contain placeholder values only (e.g., `your-secret-here`, `change-me`)
- Add a comment block at the top of `.env.example` explaining it is a template
- Do NOT include real credentials from `.env.local` in `.env.example`
- The `SESSION_SECRET` placeholder should indicate it must be a 32+ char random hex string
- Verify `git log -p | grep -i 'password\|secret\|token'` shows no real values in history

## Output Format
```
[FILE] .env.example         — created, all vars with placeholders
[FILE] .gitignore           — updated, .env.example now tracked
[FILE] package.json         — test script added
[GIT]  git status           — shows .env.example as new tracked file
[GIT]  commit hash          — conventional commit message
```

## Output Checklist and Guardrails
- [ ] `.env.example` exists and is tracked by git
- [ ] `.env.local` is NOT tracked by git
- [ ] All variables from AGENTS.md are present in `.env.example`
- [ ] No real password or secret appears in `.env.example`
- [ ] `npm test` runs jest with coverage (add `--passWithNoTests` flag if needed)
- [ ] Commit is on current branch (not master directly if working on a feature branch)
