# Retrospectiva de Sesión — 2026-05-22
### Microaplicación de Gestión de Documentos Web (1-1-100-web-documents)

---

## Resumen / Overview

Se implementó una microaplicación completa de gestión de documentos web usando Next.js 16 (App Router), MongoDB, AWS S3-compatible (RustFS) y MailHog. El objetivo era construir un sistema que permita subir, almacenar, organizar, visualizar y compartir documentos (PDFs, videos, audios, imágenes) a través de una interfaz moderna, con autenticación, notificaciones por email y pruebas automatizadas.

**Estado final**: Implementación completa y funcional. Pipeline de CI en GitLab configurado.

---

## Proceso de instalación / Installation

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd 1-1-100-web-documents

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env.local   # o crear manualmente (ver sección de env vars)

# 4. Levantar servicios Docker (MongoDB local, RustFS y MailHog)
# MongoDB: instalado localmente en el sistema
# RustFS (S3-compatible):
docker run -d --name rustfs \
  -p 10000:10000 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin1234 \
  quay.io/minio/minio server /data --console-address ":10001"

# MailHog (SMTP local):
docker run -d --name mailhog \
  -p 1025:1025 \
  -p 8025:8025 \
  mailhog/mailhog

# Nota: el puerto de MailHog SMTP configurado en la app es 1027 en .env.local
# Verificar que el puerto en Docker coincida

# 5. Crear el bucket en RustFS
# Acceder a http://localhost:10001 con minioadmin / minioadmin1234
# Crear bucket: ia4devs-storage
```

---

## Comandos ejecutados / Commands Run

```bash
# Desarrollo local con HMR
npm run dev

# Build de producción (ejecutar solo al finalizar toda la codificación)
npm run build

# Servidor de producción
npm start

# Linting
npm run lint

# Pruebas unitarias (Jest)
npx jest

# Pruebas unitarias en modo watch
npx jest --watch

# Pruebas E2E (Playwright) — requiere app corriendo
npx playwright test

# Instalar navegadores Playwright
npx playwright install

# Ver reporte HTML de Playwright
npx playwright show-report
```

---

## Levantar y detener la aplicación / Running & Stopping

### Iniciar

```bash
# 1. Asegurarse de que MongoDB esté corriendo (local)
# En Windows: net start MongoDB   o   verificar en Servicios

# 2. Levantar servicios Docker
docker start rustfs
docker start mailhog

# 3. Iniciar Next.js en desarrollo
npm run dev
# → http://localhost:3000
```

### Detener

```bash
# Detener Next.js: Ctrl+C en la terminal

# Detener contenedores Docker
docker stop rustfs mailhog
```

### Probar endpoints con curl

```bash
# Registrar usuario
curl -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jorge","email":"jorge@test.com","password":"Secret123!"}'

# Login
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jorge@test.com","password":"Secret123!"}'

# Ver usuario actual
curl -b cookies.txt http://localhost:3000/api/auth/me

# Listar documentos (con paginación y búsqueda)
curl http://localhost:3000/api/documents?page=1&limit=20&search=report&type=pdf

# Subir archivo
curl -b cookies.txt -X POST http://localhost:3000/api/upload \
  -F "file=@/ruta/al/archivo.pdf"

# Enviar email de compartir
curl -b cookies.txt -X POST http://localhost:3000/api/mail \
  -H "Content-Type: application/json" \
  -d '{"to":"destino@test.com","documentId":"<id>","message":"Te comparto este documento"}'

# Eliminar documento
curl -b cookies.txt -X DELETE http://localhost:3000/api/documents/<id>
```

---

## Configuración de red / Network Configuration

La aplicación corre completamente en localhost. No requiere configuración NAT ni VirtualBox port forwarding para desarrollo local.

| Servicio | Host | Puerto | Propósito |
|----------|------|--------|-----------|
| Next.js | localhost | 3000 | Aplicación web |
| MongoDB | localhost | 27017 | Base de datos |
| RustFS API | localhost | 10000 | S3-compatible storage |
| RustFS Console | localhost | 10001 | UI de administración del bucket |
| MailHog SMTP | localhost | 1027 | Servidor SMTP de prueba |
| MailHog UI | localhost | 8025 | Bandeja de entrada de emails |

> **Nota**: Si se ejecuta desde una VM con NAT, agregar en `C:\Windows\System32\drivers\etc\hosts`:
> ```
> 127.0.0.1   localhost
> ```
> y configurar port forwarding en VirtualBox para los puertos 3000, 10000, 10001, 8025.

---

## URLs de prueba / Test URLs

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Landing page / Home |
| `http://localhost:3000/login` | Formulario de login |
| `http://localhost:3000/register` | Formulario de registro |
| `http://localhost:3000/documents` | Listado de documentos (SSR) |
| `http://localhost:3000/documents/upload` | Subida de documentos |
| `http://localhost:3000/documents/<id>` | Detalle de un documento |
| `http://localhost:10001` | RustFS Console (minioadmin / minioadmin1234) |
| `http://localhost:8025` | MailHog — bandeja de emails de prueba |

---

## Variables de entorno / Environment Variables

Archivo: `.env.local` en la raíz del proyecto

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=web-documents

# AWS S3 / RustFS
AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=ia4devs-storage

# Email (MailHog)
MAILHOG_HOST=localhost
MAIL_PORT=1027

# Next.js
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Auth (cambiar en producción por un string aleatorio de 32+ caracteres)
SESSION_SECRET=change-me-in-production-use-a-random-32-char-string
```

---

## Arquitectura implementada / Architecture

### Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js App Router | 16.2.3 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS | 4 |
| Base de datos | MongoDB (driver nativo) | 7.1.1 |
| File storage | AWS S3 SDK + RustFS Docker | 3.x |
| Email | Nodemailer + MailHog | 8.x |
| Auth | bcryptjs + HMAC-SHA256 (Web Crypto) | — |
| Testing (unit) | Jest + ts-jest | 30.x |
| Testing (E2E) | Playwright | 1.59.x |
| CI/CD | GitLab CI | — |

### Patrones de diseño aplicados

- **Singleton** — `lib/db.ts`: cliente MongoDB único reutilizable entre hot-reloads
- **Service Layer** — `lib/auth.ts`, `lib/s3.ts`, `lib/mail.ts`: operaciones centralizadas
- **Context/Provider** — `GlobalContext.tsx`: estado global del usuario sin prop drilling
- **Repository** — Queries directas en route handlers con TypeScript tipado
- **Template Method** — `lib/mail-templates.ts`: builders HTML para cada tipo de email

### Flujo de subida de archivos

```
1. Usuario arrastra archivo al UploadZone (validación client-side)
2. XHR POST /api/upload → validación server-side → subida a S3/RustFS
3. S3 devuelve s3Key → usuario completa metadatos (título, descripción, tags)
4. POST /api/documents → registro en MongoDB con s3Key
5. Redirección a /documents/<id>
6. Al eliminar: DELETE borra el registro de MongoDB Y el objeto de S3
```

---

## Funcionalidades implementadas / Features Implemented

### Autenticación
- [x] Registro con validación de email + contraseña fuerte
- [x] Hash de contraseñas con bcryptjs (10 salt rounds)
- [x] Login con cookies HTTP-only firmadas (HMAC-SHA256, TTL 7 días)
- [x] Logout con limpieza de cookie
- [x] Email de bienvenida automático al registrarse
- [x] Protección de rutas (propiedad de documentos)

### Gestión de documentos
- [x] Subida drag-and-drop con barra de progreso XHR
- [x] Formatos soportados: PDF, video (mp4/webm/mov/avi), audio (mp3/wav/ogg/flac), imagen (jpg/png/gif/webp/svg), office (docx/xlsx/pptx)
- [x] Límite de 100 MB por archivo
- [x] CRUD completo (crear, leer, actualizar, eliminar)
- [x] Búsqueda full-text en título, descripción y tags
- [x] Filtro por tipo de archivo
- [x] Paginación (20 items/página, máximo 100)
- [x] Preview en navegador (PDF, video, imagen)
- [x] Descarga vía URL firmada de S3 (expiración 1 hora)
- [x] Compartir documento por email con mensaje personalizado

### Frontend
- [x] Landing page con hero section y feature cards
- [x] Diseño responsive mobile-first (Tailwind CSS 4)
- [x] SSR en listado de documentos
- [x] Skeleton loaders con Suspense
- [x] Error boundaries (ruta y global)
- [x] Componentes UI reutilizables: Button, Input, Modal, Badge, FileIcon, Spinner
- [x] Interfaz en español

### Calidad y DevOps
- [x] 26 pruebas unitarias (Jest): formatters + validators
- [x] 3 suites E2E (Playwright): auth, documents, upload
- [x] TypeScript estricto, sin `any`
- [x] ESLint con reglas de Next.js
- [x] Pipeline GitLab CI (build + caché de dependencias)

---

## Problemas encontrados / Problems & Solutions

| Problema | Solución |
|----------|----------|
| Next.js 16 tiene APIs con breaking changes respecto a versiones anteriores | Se leyeron los docs en `node_modules/next/dist/docs/` antes de usar cualquier API |
| `middleware.tsx` no recomendado en este proyecto | Se usó proxy según documentación en `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` |
| Email fire-and-forget puede silenciar errores de MailHog | `sendMail()` captura y loguea errores sin bloquear la respuesta HTTP |
| MongoDB sin índices puede ser lento con muchos documentos | Pendiente agregar índices compuestos en `documents.uploadedBy` + `createdAt` |
| S3 keys necesitan incluir userId para aislamiento por usuario | Formato definido: `documents/{userId}/{uuid}/{fileName}` |

---

## Estructura de archivos clave / Key Files

```
lib/
  db.ts              ← Singleton MongoClient (NUNCA crear MongoClient inline)
  auth.ts            ← createSession, verifySession, hashPassword, comparePassword
  s3.ts              ← uploadFile, getSignedUrl, deleteFile
  mail.ts            ← transporter Nodemailer hacia MailHog
  mail-templates.ts  ← welcomeEmail, uploadConfirmationEmail, shareDocumentEmail
  types.ts           ← User, SafeUser, WebDocument, SessionPayload, FileType
  validators.ts      ← validateEmail, validatePassword, validateDocument, validateFile
context/
  GlobalContext.tsx  ← Provider global + hook useGlobal() → { user, setUser, loading }
__tests__/lib/
  format.test.ts     ← 8 tests: formatFileSize, formatDate, formatCurrency
  validators.test.ts ← 18 tests: todos los validadores
e2e/
  auth.spec.ts       ← register, login, logout flows
  documents.spec.ts  ← CRUD, search, filter
  upload.spec.ts     ← file upload con progreso
.gitlab-ci.yml       ← Pipeline: build only, Node 20 Alpine, artefacto .next/
```

---

## Resultados y conclusiones / Results & Conclusions

### Lo que funcionó bien
- La arquitectura con App Router de Next.js 16 + MongoDB nativo resultó limpia y sin overhead
- El patrón Singleton para MongoDB evitó problemas de connection pool en desarrollo con HMR
- HMAC-SHA256 con Web Crypto API es una solución segura sin dependencias externas para signing
- Tailwind CSS 4 permitió construir componentes con buen diseño sin librerías UI externas
- El email fire-and-forget evitó que fallos de MailHog afecten la experiencia de usuario

### Deuda técnica / Próximos pasos
- [ ] Agregar índices MongoDB en producción: `db.documents.createIndex({ uploadedBy: 1, createdAt: -1 })`
- [ ] Agregar rate limiting en endpoints de auth (registro y login)
- [ ] Añadir escaneo de virus en uploads antes de guardar en S3
- [ ] Ampliar pipeline CI: agregar stage de `test` (Jest) y `lint`
- [ ] Configurar `SESSION_SECRET` con valor seguro en producción
- [ ] Implementar roles de usuario (admin / usuario regular)
- [ ] Añadir paginación cursor-based para mejor performance en colecciones grandes
- [ ] Agregar audit log de operaciones sensibles (delete, share)

### Reglas clave a mantener
1. **Nunca** crear `MongoClient` inline — siempre importar el singleton de `lib/db.ts`
2. **Nunca** usar `any` en TypeScript — definir interfaces en `lib/types.ts`
3. **Nunca** usar `middleware.tsx` — usar proxy (ver docs de Next.js)
4. Ejecutar `npm run build` solo al finalizar la codificación completa, no incrementalmente
5. Server components obtienen datos directo de MongoDB; client components llaman a API routes
6. Usar la skill `frontend-design` para cada nueva página/componente
