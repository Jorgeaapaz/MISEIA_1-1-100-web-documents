@~/.claude/prompts/new_functionality_prompt_spec.md

# Create Dockerfile and Deploy Instructions for MISEIA 1-1-100

## Role
Act as a Software Architect and DevOps Engineer expert in Docker, Next.js containerization, and cloud deployment documentation.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript / MongoDB / RustFS / MailHog)  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-100-web-documents`  
Non-compliance: `dc_instrucciones_deploy`

**Target deployment environment:**
- GCP VM: `gcvmuser@34.174.56.186`
- Deploy path: `~/MISEIA1-1-100_web-documents`
- Domain: `web-documents.deviaaps.com` (Traefik wildcard `*.deviaaps.com`)
- Infrastructure: Traefik v3.3 + miseia-net Docker network (already running)
- MongoDB accessible at `mongodb:27017` inside `miseia-net`
- RustFS accessible at `rustfs:9000` inside `miseia-net`
- MailHog accessible at `mailhog:1025` inside `miseia-net`

**Next.js standalone output requirement:**  
Next.js 16 supports `output: 'standalone'` in `next.config.ts` which produces a self-contained directory without needing `node_modules` in the final image.

## Task
1. Add `output: 'standalone'` to `next.config.ts`.
2. Create a **multi-stage Dockerfile** at project root:
   - Stage 1 (`deps`): Install only production dependencies
   - Stage 2 (`builder`): Copy deps + source, run `npm run build`
   - Stage 3 (`runner`): Copy `.next/standalone` + `.next/static` + `public/`, run as non-root user
3. Create `.dockerignore` to exclude dev artifacts.
4. Create `docker-compose.app.yml` for running the app locally with all dependencies.
5. Add a `## Deploy` section to `README.md` with:
   - Docker build + run commands
   - Environment variables to pass at runtime
   - How to connect to the `miseia-net` network
   - Verification URL

### Dockerfile Guidelines
- Base: `node:24-alpine` (production LTS)
- Final image runs as non-root user `nextjs` (uid 1001)
- Expose port `3000`
- Use `COPY --chown=nextjs:nodejs` for file ownership
- `CMD ["node", "server.js"]` from `.next/standalone`
- Image size target: under 200 MB

### docker-compose.app.yml Guidelines
Connect to existing `miseia-net` as external network:
```yaml
networks:
  miseia-net:
    external: true
```
App service uses Traefik labels for `web-documents.deviaaps.com` with `certresolver: cloudflare`.

### README Deploy Section Must Include
```bash
# 1. Build the Docker image
docker build -t web-documents:latest .

# 2. Run (development/local with existing infra)
docker run -d \
  --name web-documents \
  --network miseia-net \
  -e MONGODB_URI=mongodb://mongodb:27017 \
  -e MONGODB_DB=web-documents \
  -e SESSION_SECRET=<your-secret> \
  ... other vars ...
  web-documents:latest

# 3. Or use docker-compose
docker compose -f docker-compose.app.yml up -d

# 4. Verify
curl https://web-documents.deviaaps.com/api/auth/me
# Expected: 401 {"error":"Unauthorized"} — app is running
```

## Output Format
```
[FILE] next.config.ts            — output: 'standalone' added
[FILE] Dockerfile                — multi-stage (deps → builder → runner)
[FILE] .dockerignore             — excludes node_modules, .next, .env.local, coverage
[FILE] docker-compose.app.yml   — app service + miseia-net external network
[FILE] README.md                 — ## Deploy section appended
[GIT]  commit hash               — feat: add Dockerfile and deploy instructions
```

## Output Checklist and Guardrails
- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] `npm run build` succeeds after config change (test locally)
- [ ] Dockerfile builds successfully: `docker build -t web-docs-test .`
- [ ] Final image is non-root (verify: `docker run --rm web-docs-test whoami` → `nextjs`)
- [ ] `.dockerignore` excludes `.env.local`, `node_modules`, `coverage/`, `__tests__/`, `e2e/`
- [ ] `docker-compose.app.yml` references `miseia-net` as external network
- [ ] README deploy section has copy-pasteable commands
- [ ] No real secrets appear in any committed file
