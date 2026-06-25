@~/.claude/prompts/new_functionality_prompt_spec.md

# Deploy App Publicly and Document URL in README for MISEIA 1-1-100

## Role
Act as a Software Architect and DevOps Engineer expert in Docker deployments, Traefik reverse proxy, and cloud infrastructure on Google Cloud Platform.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript)  
Non-compliance: `fn_deploy_publico_accesible`  
**Prerequisite:** Prompt 003 (GitHub Actions CI/CD) and Prompt 005 (Dockerfile) must be completed first.

**Infrastructure:**
- GCP VM: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- Traefik v3.3 running on VM with `*.deviaaps.com` wildcard cert (Cloudflare DNS-01)
- Docker network: `miseia-net` (external, already running)
- MongoDB: `mongodb:27017` on `miseia-net`
- RustFS: `rustfs:9000` on `miseia-net`
- MailHog: `mailhog:1025` on `miseia-net`

**Target public URL:** `https://web-documents.deviaaps.com`

## Task
1. SSH into GCP VM and verify all infrastructure services are running (`docker ps`).
2. Clone or pull latest code to `~/MISEIA1-1-100_web-documents`.
3. Create `.env.production` on the VM with real production values (do NOT commit this file).
4. Build the Docker image on the VM using the Dockerfile from prompt 005.
5. Start the app container with Traefik labels for `web-documents.deviaaps.com`.
6. Verify the deployment:
   - `curl -I https://web-documents.deviaaps.com` → HTTP 200
   - Test registration flow manually
   - Test document upload flow manually
7. Add a `## Live Demo` section to README with the public URL and a screenshot (or curl example).
8. Commit the README update: `docs: add live demo URL to README`.

### Deployment Commands (run on VM)
```bash
# 1. Navigate to deploy directory
cd ~/MISEIA1-1-100_web-documents

# 2. Pull latest code
git pull origin master

# 3. Build image
docker build -t web-documents:latest .

# 4. Stop existing container (if any)
docker rm -f web-documents 2>/dev/null || true

# 5. Start app container
docker run -d \
  --name web-documents \
  --restart unless-stopped \
  --network miseia-net \
  --env-file .env.production \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.web-documents.rule=Host(\`web-documents.deviaaps.com\`)" \
  --label "traefik.http.routers.web-documents.entrypoints=websecure" \
  --label "traefik.http.routers.web-documents.tls=true" \
  --label "traefik.http.routers.web-documents.tls.certresolver=cloudflare" \
  --label "traefik.http.services.web-documents.loadbalancer.server.port=3000" \
  web-documents:latest

# 6. Verify
curl -I https://web-documents.deviaaps.com
```

### Production Environment Variables (.env.production on VM)
```
MONGODB_URI=mongodb://admin:MongoAdmin2024!@mongodb:27017/web-documents?authSource=admin
MONGODB_DB=web-documents
SESSION_SECRET=<generate-with: openssl rand -hex 32>
AWS_USERNAME=rustfsadmin
AWS_PASSWORD=RustfsSecret2024!
AWS_REGION=us-east-1
AWS_URL=http://rustfs:9000
AWS_BUCKET=ia4devs-storage
MAILHOG_HOST=mailhog
MAIL_PORT=1025
NEXT_PUBLIC_API_URL=https://web-documents.deviaaps.com
NODE_ENV=production
```

### README Live Demo Section
```markdown
## Live Demo

> **URL:** https://web-documents.deviaaps.com

**Test the app:**
- Register: `POST /api/auth/register`
- Upload a document via the web UI
- Check emails at https://mailhog.deviaaps.com (MailHog web UI)
```

## Implementation Guidelines
- The `.env.production` file on the VM must NEVER be committed to git
- Use `docker logs web-documents` to debug startup errors
- MongoDB connection string must include auth (`authSource=admin`) since Mongo runs with credentials
- If the RustFS bucket doesn't exist, create it: `mc mb rustfs/ia4devs-storage`
- Verify Traefik picked up the container: check `https://traefik.deviaaps.com` dashboard

## Output Checklist and Guardrails
- [ ] `curl -I https://web-documents.deviaaps.com` returns HTTP 200
- [ ] Full registration flow works on the public URL
- [ ] Document upload and download work end-to-end
- [ ] URL is documented in README under `## Live Demo`
- [ ] No production credentials committed to git
- [ ] Container has `--restart unless-stopped` flag
- [ ] `docker ps` shows container as `Up` (not `Restarting`)
