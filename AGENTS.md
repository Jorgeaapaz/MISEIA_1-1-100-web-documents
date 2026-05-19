<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Microfrontend: 1-1-100-web-documents

## Description
Microaplicacion de gestion de documentos web. Permite subir, almacenar, organizar y consultar documentos (PDF, videos, audios, etc.) a traves de una interfaz web moderna construida con Next.js 16.

## Tech Stack
- **Framework**: Next.js 16.2.3 (App Router) con TypeScript
- **React**: 19.2.4
- **Estilos**: Tailwind CSS 4
- **Base de datos**: MongoDB (driver nativo) - local en `mongodb://localhost:27017`
- **Storage**: AWS S3 via RustFS (Docker) en `http://localhost:10000`
- **Email**: MailHog (Docker) en `localhost:1027`

## Design Guidelines
- Fondo claro con texto oscuro para mejor legibilidad
- Customer-facing: aspecto limpio y moderno - tipografia bold, CTAs claros
- Un solo color de acento consistente en toda la aplicacion
- Sin imagenes: usar placeholders con iconos CSS coloreados por categoria
- Layouts responsive (mobile-first)
- Usar la skill `frontend-design` para cada nueva pagina/componente

## Architecture

### Base de datos
- MongoDB con driver nativo (no Mongoose)
- Acceso centralizado en `lib/db.ts` (singleton) - nunca crear `MongoClient` inline
- MongoDB instalado localmente

### Storage (PDF, videos, audios)
- AWS S3 via RustFS en Docker
- Bucket: `ia4devs-storage`
- Endpoint: `http://localhost:10000`

### Email
- MailHog en Docker
- Host: `localhost`, Puerto: `1027`

### Frontend
- Next.js con TypeScript y App Router
- No usar `middleware.tsx` - usar proxy en su lugar (ver `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`)
- GlobalContext para estado global (usuario autenticado, preferencias, etc.) - pasar via prop drilling
- Ejecutar `npm run build` solo al finalizar la codificacion completa, no incrementalmente

## Coding Rules
1. Leer los docs de Next.js en `node_modules/next/dist/docs` antes de usar cualquier API
2. Todo acceso a BD debe ir por el singleton `lib/db.ts` - nunca crear un `MongoClient` inline
3. Valores monetarios almacenados y computados en **centimos** (enteros) - formatear solo al renderizar
4. API routes devuelven `{ error: string }` en caso de fallo con el codigo HTTP apropiado
5. No usar `any` - definir interfaces TypeScript en `lib/types.ts`
6. Server components obtienen datos directamente de MongoDB; client components llaman a API routes
7. Usar la skill `frontend-design` para cada nueva pagina/componente - no escribir HTML sin estilos

## Testing Rules
1. Playwright para pruebas end-to-end cubriendo flujos criticos (registro, login, subida de documentos, etc.)
2. Jest para pruebas unitarias de funciones criticas en `lib/` (validacion de datos, procesamiento, etc.)
3. TDD: escribir pruebas antes de implementar nuevas funcionalidades
4. Configurar CI para ejecutar pruebas automaticamente

## Git Conventions
- Commits con mensajes claros siguiendo conventional commits: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Codigo organizado en carpetas logicas: `components`, `app`, `lib`, `utils`, etc.
- Ramas para nuevas features o fixes, merge a `main` solo cuando esten completas

## Environment Variables
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
```

## Estructura de Carpetas Recomendada
```
app/
  layout.tsx                  # Layout raiz con GlobalContext
  page.tsx                    # Pagina principal
  globals.css                 # Estilos globales (Tailwind)
  (auth)/                     # Grupo de rutas de autenticacion
    login/page.tsx
    register/page.tsx
  documents/                  # CRUD de documentos
    page.tsx                  # Listado de documentos
    [id]/page.tsx             # Detalle de documento
    upload/page.tsx           # Subida de documentos
  api/                        # API Routes
    auth/
      login/route.ts
      register/route.ts
    documents/
      route.ts                # GET (listar), POST (crear)
      [id]/route.ts           # GET, PUT, DELETE por id
      [id]/download/route.ts  # Descarga del archivo
    upload/
      route.ts                # Subida a S3/RustFS
    mail/
      route.ts                # Envio de emails via MailHog
components/
  ui/                         # Componentes UI reutilizables (botones, inputs, modals)
  layout/                     # Header, Footer, Sidebar, Navbar
  documents/                  # Componentes especificos de documentos
lib/
  db.ts                       # Singleton MongoClient
  s3.ts                       # Cliente AWS S3 / RustFS
  mail.ts                     # Cliente MailHog
  types.ts                    # Interfaces TypeScript compartidas
  validators.ts               # Validacion de datos de entrada
context/
  GlobalContext.tsx            # Contexto global (usuario, preferencias)
utils/
  format.ts                   # Formateo de fechas, moneda (centimos -> display), etc.
  constants.ts                # Constantes de la aplicacion
public/
  favicon.ico
```
