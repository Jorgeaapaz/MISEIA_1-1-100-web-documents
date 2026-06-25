# MISEIA 1-1-100 — Web Documents

A **Next.js 16 / TypeScript full-stack web application** for managing documents (PDFs, videos, audios, images). Supports user authentication, file upload to S3-compatible storage, metadata management, search/filtering, and email sharing.

---

## Features Implemented

### 1. Authentication System
- User registration and login with email/password
- Passwords hashed with **bcryptjs** (10 salt rounds)
- Sessions managed via **HMAC-SHA256 signed HTTP-only cookies** (7-day TTL)
- Protected API routes validate the session cookie before mutating data
- Welcome email sent via MailHog on successful registration

### 2. Document Management
- Upload files up to **100 MB** (PDF, video, audio, image, office formats)
- Drag-and-drop upload zone with real-time XHR progress
- Files stored in **AWS S3-compatible RustFS** under a UUID-based key
- MongoDB records store metadata: title, description, file type, size, tags, owner
- Full CRUD: list, view, edit metadata, delete (removes DB record **and** S3 object)
- Paginated list (20/page, max 100) with text search and file-type filter
- Signed S3 download URLs (1-hour expiration)

### 3. Email Notifications
- **Nodemailer** connected to **MailHog** (local SMTP)
- HTML template factory: welcome, upload confirmation, document-share
- Share modal lets authenticated users email a download link to any recipient
- Emails sent asynchronously (fire-and-forget) to avoid blocking the UI

---

## Project Structure

```
app/
  layout.tsx                      # Root layout — mounts GlobalContext provider
  page.tsx                        # Hero landing page
  (auth)/
    login/page.tsx                # Login form
    register/page.tsx             # Registration form
  documents/
    page.tsx                      # Document list with SSR, search & pagination
    [id]/page.tsx                 # Document detail view
    [id]/loading.tsx              # Skeleton loader
    [id]/not-found.tsx            # 404 handler
    upload/page.tsx               # Upload form (file zone + metadata fields)
  api/
    auth/login/route.ts           # POST — verify credentials, set cookie
    auth/logout/route.ts          # POST — clear session cookie
    auth/me/route.ts              # GET  — return current user profile
    auth/register/route.ts        # POST — create user, set cookie, send welcome email
    documents/route.ts            # GET (list) · POST (create)
    documents/[id]/route.ts       # GET · PUT · DELETE by document id
    documents/[id]/download/route.ts # GET — proxy-stream file from S3
    upload/route.ts               # POST — upload file to S3, return s3Key
    mail/route.ts                 # POST — send share email
components/
  documents/
    DocumentCard.tsx              # Grid card: title, type badge, size, date, tags
    DocumentDetail.tsx            # Full view with edit/delete/download/share actions
    DocumentList.tsx              # Grid layout or empty state
    FilePreview.tsx               # In-browser preview (PDF, video, image)
    Pagination.tsx                # Page navigation controls
    SearchBar.tsx                 # Debounced search input + type filter
    ShareModal.tsx                # Modal form — send document link via email
    UploadZone.tsx                # Drag-drop area with XHR progress bar
  layout/
    Header.tsx                    # Top bar with auth state and logout button
    Navbar.tsx                    # Secondary navigation links
    Footer.tsx                    # Footer
  ui/
    Badge.tsx                     # File-type indicator chip
    Button.tsx                    # Variants: primary · secondary · danger
    FileIcon.tsx                  # SVG icon keyed by file type
    Input.tsx                     # Labelled text input
    Modal.tsx                     # Dialog overlay (header / body / footer)
    Spinner.tsx                   # Loading animation
context/
  GlobalContext.tsx               # React Context — user state + setUser hook
lib/
  auth.ts                         # Session signing, cookie helpers, password hashing
  db.ts                           # MongoDB singleton (cached MongoClient + DB ref)
  mail.ts                         # Nodemailer transporter factory
  mail-templates.ts               # HTML email template builders
  s3.ts                           # S3 upload, download, delete, presigned URLs
  types.ts                        # Shared TypeScript interfaces
  validators.ts                   # Input validation functions
utils/
  constants.ts                    # Allowed extensions, file-type map, colours
  format.ts                       # Date and byte-size formatters
__tests__/lib/
  format.test.ts                  # Unit tests — formatting utilities
  validators.test.ts              # Unit tests — validation rules
e2e/
  auth.spec.ts                    # Playwright — register, login, logout
  documents.spec.ts               # Playwright — CRUD, search, filter
  upload.spec.ts                  # Playwright — file upload flow
```

---

## Design Patterns / Architecture

| Pattern | Where | Purpose |
|---------|-------|---------|
| **Singleton** | `lib/db.ts` | One cached `MongoClient` reused across all API routes — avoids connection exhaustion |
| **Factory** | `lib/mail-templates.ts` | `welcomeEmail()`, `uploadConfirmationEmail()`, `shareDocumentEmail()` produce consistent HTML payloads |
| **Repository** | API route handlers | Typed MongoDB queries (`users`, `documents` collections) isolated from business logic |
| **Service Locator** | `lib/auth.ts`, `lib/s3.ts` | Centralised auth and storage operations imported by route handlers |
| **Context / Provider** | `context/GlobalContext.tsx` | Global user state surfaced via `useGlobal()` hook; no prop drilling past the root layout |

**Layer diagram:**

```
┌──────────────────────────────────┐
│  React Components / Pages (TSX)  │  UI Layer
├──────────────────────────────────┤
│  Next.js API Routes (route.ts)   │  API / Business Logic Layer
├──────────────────────────────────┤
│  Services  (auth · s3 · mail)    │  Service Layer
├──────────────────────────────────┤
│  MongoDB / RustFS / MailHog      │  Data / Infrastructure Layer
└──────────────────────────────────┘
```

---

## Decisiones Técnicas

### MongoDB en lugar de PostgreSQL para metadatos de documentos

**Contexto:** Los documentos gestionados (PDF, video, audio, imagen, office) tienen atributos heterogéneos — un PDF puede tener número de páginas, un vídeo tiene duración, una imagen tiene dimensiones. Un esquema relacional fijo obligaría a columnas nullable para cada tipo o a una tabla EAV con joins costosos.

**Alternativas consideradas:** PostgreSQL con columna JSONB para metadatos variables; esquema normalizado con tabla por tipo de archivo.

**Decisión:** MongoDB con driver nativo (sin ORM) — esquema flexible que acepta cualquier shape de metadatos sin migrations. Ver `lib/db.ts` (singleton) y `lib/types.ts` (interfaces).

**Consecuencias:** Sin validación de FK a nivel de BD; la integridad referencial es responsabilidad de `lib/validators.ts`. No se pueden usar JOINs nativos — `$lookup` reemplaza las relaciones. Sin Mongoose: las interfaces TypeScript en `lib/types.ts` son el único contrato de esquema.

---

### RustFS (S3-compatible) en lugar de MinIO o S3 gestionado

**Contexto:** El proyecto necesita almacenamiento de objetos compatible con AWS S3 SDK para archivos hasta 100 MB. En un entorno de aprendizaje local, los costes de S3 gestionado son innecesarios.

**Alternativas consideradas:** AWS S3 real (coste y credenciales reales requeridas); MinIO (Go-based, más maduro, más pesado).

**Decisión:** RustFS en Docker — servidor S3-compatible escrito en Rust, cero coste, arranca en un contenedor ligero. El cliente en `lib/s3.ts` usa `@aws-sdk/client-s3` estándar, por lo que cambiar a S3 real solo requiere actualizar variables de entorno.

**Consecuencias:** Sin SLA ni replicación. Requiere Docker en el entorno de desarrollo. No está validado para producción con carga alta. Si RustFS falla, los uploads fallan — no hay fallback.

---

### Cookies HMAC-SHA256 en lugar de JWT

**Contexto:** La autenticación necesita sesiones revocables (7 días TTL) sin añadir dependencias externas de signing. JWT es stateless pero requiere `jsonwebtoken` o similar y no permite revocación sin una lista negra.

**Alternativas consideradas:** JWT con `jsonwebtoken` (dependencia externa, tokens stateless no revocables); sesiones en BD con ID de sesión aleatorio (requiere lookup en MongoDB en cada request).

**Decisión:** HMAC-SHA256 personalizado usando la Web Crypto API nativa (`crypto.subtle`). El payload se codifica en base64 y se firma con `SESSION_SECRET`. Ver `lib/auth.ts` — `createSession()`, `verifySession()`, `sign()`.

**Consecuencias:** Sin dependencia de librerías de JWT. La sesión vive solo en la cookie (no en BD), por lo que revocar una sesión específica requiere rotar el `SESSION_SECRET`. Implementación propia que requiere mantenimiento si cambian los requisitos de seguridad.

---

### Driver nativo de MongoDB en lugar de Mongoose

**Contexto:** Mongoose añade schema validation, middleware y helpers útiles, pero también introduce una capa de abstracción con overhead en proyectos donde TypeScript ya cubre el tipado.

**Alternativas consideradas:** Mongoose (ORM-like, schema validation automática); Prisma con adaptador MongoDB.

**Decisión:** Driver nativo `mongodb` con interfaces TypeScript en `lib/types.ts`. El singleton en `lib/db.ts` gestiona la conexión. Toda la validación va a `lib/validators.ts`.

**Consecuencias:** Control total sobre las queries. Sin auto-timestamps (se añaden manualmente en los route handlers). La validación de datos es responsabilidad explícita del código — mayor superficie de error pero mayor transparencia.

---

## How It Works

A user registers (or logs in) and receives an HMAC-signed session cookie. From the documents list they can upload a file — the client streams it to `/api/upload`, which writes it to RustFS and returns an `s3Key`. The metadata form then POSTs to `/api/documents`, which persists the record in MongoDB. Download requests hit `/api/documents/[id]/download`, which fetches a signed S3 URL and redirects the browser.

```ts
// lib/db.ts — Singleton MongoClient
let cachedClient: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI!);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.MONGODB_DB);
}
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 LTS or later |
| MongoDB | 7.x (local or Docker) |
| Docker | For RustFS (S3) and MailHog |

### Clone & Install

```bash
git clone https://github.com/Jorgeaapaz/MISEIA_1-1-100-web-documents.git
cd MISEIA_1-1-100-web-documents
npm install
```

### Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=web-documents
SESSION_SECRET=your-secret-here

AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=ia4devs-storage

MAILHOG_HOST=localhost
MAIL_PORT=1027

NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Start Infrastructure (Docker)

```bash
# RustFS (S3-compatible storage) — port 10000
docker run -d -p 10000:10000 rustfs/rustfs

# MailHog (SMTP + web UI) — SMTP on 1027, UI on 8025
docker run -d -p 1027:1025 -p 8025:8025 mailhog/mailhog
```

### Run

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Tests

```bash
# Unit tests (Jest)
npx jest

# E2E tests (Playwright — requires dev server running)
npx playwright test
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register user, set session cookie |
| `POST` | `/api/auth/login` | — | Login, set session cookie |
| `POST` | `/api/auth/logout` | — | Clear session cookie |
| `GET` | `/api/auth/me` | ✓ | Return current user profile |

### Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/documents` | — | List (params: `page`, `limit`, `search`, `type`, `sort`, `order`) |
| `POST` | `/api/documents` | ✓ | Create document record |
| `GET` | `/api/documents/:id` | — | Get single document |
| `PUT` | `/api/documents/:id` | ✓ | Update title, description, tags |
| `DELETE` | `/api/documents/:id` | ✓ | Delete record and S3 object |
| `GET` | `/api/documents/:id/download` | — | Stream file from S3 |
| `POST` | `/api/upload` | ✓ | Upload file to S3, returns `s3Key` |
| `POST` | `/api/mail` | ✓ | Send share email |

---

## Example Flows

**Successful registration**

```
POST /api/auth/register
{ "name": "Jorge", "email": "jorge@example.com", "password": "secret123" }

→ 201  { "user": { "id": "...", "name": "Jorge", "email": "jorge@example.com" } }
→ Set-Cookie: session=<hmac-signed-token>; HttpOnly; SameSite=Lax
→ Welcome email dispatched to jorge@example.com
```

**Upload + create document**

```
POST /api/upload  (multipart/form-data, file ≤ 100 MB)
→ 200  { "s3Key": "uploads/uuid.pdf", "fileName": "report.pdf",
          "fileSize": 204800, "fileType": "pdf" }

POST /api/documents
{ "title": "Q1 Report", "description": "...", "s3Key": "uploads/uuid.pdf", "tags": ["finance"] }
→ 201  { "document": { "_id": "...", "title": "Q1 Report", ... } }
```

**Validation error — weak password**

```
POST /api/auth/register
{ "name": "J", "email": "bad-email", "password": "123" }

→ 400  { "error": "Password must be at least 8 characters" }
```

**Unauthorized delete**

```
DELETE /api/documents/abc123   (no session cookie)
→ 401  { "error": "Unauthorized" }
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.3 (App Router) |
| UI | React 19.2.4 + Tailwind CSS 4 |
| Language | TypeScript 5 |
| Database | MongoDB 7 (native driver) |
| File Storage | AWS S3 SDK v3 + RustFS |
| Email | Nodemailer 8 + MailHog |
| Auth | bcryptjs + Web Crypto (HMAC-SHA256) |
| Unit Tests | Jest 30 + ts-jest |
| E2E Tests | Playwright 1.59 |
