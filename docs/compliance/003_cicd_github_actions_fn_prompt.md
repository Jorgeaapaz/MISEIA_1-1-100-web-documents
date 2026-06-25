@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a Github CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in Github and Google Cloud Services

## Task
Create Github actions that allows to compile and deploy the app to `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186` in the directory ~/MISEIA1-1-100_web-documents. Test and build must be done in a GitHub Actions. The service must be created in the remote ubuntu VM in Docker.

The app must be accessible through Traefik using the domain web-documents.deviaaps.com, port 30001, use the traefik wildcard *.deviaaps.com.

Use gh and gcloud for all secrets required.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript / MongoDB / RustFS / MailHog)  
GitHub Repo: `https://github.com/Jorgeaapaz/MISEIA_1-1-100-web-documents`  
Non-compliance: `cq_ci_funcional` (GitHub path — priority over GitLab)

**GCP VM Details:**
- SSH: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- SSH key path (private): `C:\ubuntuiso\.ssh\vboxuser`
- VM user: `gcvmuser`
- Deploy directory: `~/MISEIA1-1-100_web-documents`
- Domain: `web-documents.deviaaps.com` via Traefik wildcard `*.deviaaps.com`
- Port: `30001`

**Infrastructure on VM (from docker-compose.yml):**
- Traefik v3.3 running on `miseia-net` bridge network
- MongoDB on port 27020 (mapped from 27017)
- RustFS S3-compatible storage
- MailHog SMTP

**Required GitHub Secrets (set with `gh secret set`):**
- `GCP_SSH_PRIVATE_KEY` — private SSH key content
- `GCP_VM_HOST` — `34.174.56.186`
- `GCP_VM_USER` — `gcvmuser`
- `MONGODB_URI` — `mongodb://mongodb:27017`
- `MONGODB_DB` — `web-documents`
- `SESSION_SECRET` — 32-char random hex
- `AWS_USERNAME` — RustFS access key
- `AWS_PASSWORD` — RustFS secret key
- `AWS_REGION` — `us-east-1`
- `AWS_URL` — `http://rustfs:9000`
- `AWS_BUCKET` — `ia4devs-storage`
- `MAILHOG_HOST` — `mailhog`
- `MAIL_PORT` — `1025`

### GitHub Actions Pipeline Requirements
The workflow `.github/workflows/ci-cd.yml` must have these stages:

1. **lint** — Run `npm run lint` (ESLint)
2. **test** — Run `npm run test:ci` (Jest with coverage)
3. **build** — Run `npm run build` (Next.js production build)
4. **deploy** — SSH into GCP VM and:
   - Pull latest code to `~/MISEIA1-1-100_web-documents`
   - Build Docker image using `Dockerfile` (must exist — see prompt 005)
   - Start/restart container connected to `miseia-net`
   - Register with Traefik labels for `web-documents.deviaaps.com`

### Dockerfile Requirements (create if not exists)
Multi-stage Dockerfile:
- **Stage 1 (builder):** `node:24-alpine`, install deps, run `npm run build`
- **Stage 2 (runner):** `node:24-alpine`, copy `.next/standalone`, expose port `3000`
- Next.js `output: 'standalone'` must be set in `next.config.ts`

### Traefik Docker Labels for App Container
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.web-documents.rule=Host(`web-documents.deviaaps.com`)"
  - "traefik.http.routers.web-documents.entrypoints=websecure"
  - "traefik.http.routers.web-documents.tls=true"
  - "traefik.http.routers.web-documents.tls.certresolver=cloudflare"
  - "traefik.http.services.web-documents.loadbalancer.server.port=3000"
networks:
  - miseia-net
```

## Implementation Guidelines
- Use `ubuntu-latest` for all GitHub Actions runners
- Cache `node_modules` with `actions/cache` keyed on `package-lock.json`
- The `deploy` job runs only on `push` to `master` branch
- `lint`, `test`, `build` run on every push and PR
- Use `appleboy/ssh-action` or raw SSH with the private key for deployment
- Set secrets with: `gh secret set SECRET_NAME --body "value"` for each secret
- Verify deployment: `curl -f https://web-documents.deviaaps.com/api/auth/me` returns 401 (app running)

## Output Format
```
[FILE] .github/workflows/ci-cd.yml     — full pipeline YAML
[FILE] Dockerfile                       — multi-stage Next.js build
[FILE] next.config.ts                   — output: standalone added
[FILE] .dockerignore                    — node_modules, .next, .env.local
[CMD]  gh secret set ...               — all secrets configured
[GIT]  commit hash                      — feat: add GitHub Actions CI/CD pipeline
```

## Output Checklist and Guardrails
- [ ] `.github/workflows/ci-cd.yml` exists and is valid YAML
- [ ] All 4 stages defined: lint → test → build → deploy
- [ ] `deploy` only triggers on `master` push (not PRs)
- [ ] SSH private key is set as a GitHub secret (NOT committed to code)
- [ ] App container joins `miseia-net` network to reach MongoDB/RustFS/MailHog
- [ ] Traefik labels use `web-documents.deviaaps.com` domain
- [ ] `curl https://web-documents.deviaaps.com` returns HTTP 200 after deploy
- [ ] Pipeline badge added to README
