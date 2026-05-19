# Plan de Implementacion: 1-1-100-web-documents

## Contexto

Microaplicacion de gestion de documentos web (PDF, video, audio, etc.) construida con Next.js 16.2.3, MongoDB nativo, S3/RustFS y MailHog. El proyecto esta recien creado — solo tiene el boilerplate de `create-next-app`. Este plan define 8 fases ordenadas por dependencia para llegar a una app funcional y testeada.

---

## Fase 1 — Fundacion e Infraestructura

**Meta**: Crear las librerias base, tipos, conectores a servicios externos y variables de entorno.

### Ficheros a crear

| Fichero | Descripcion |
|---------|-------------|
| `.env.local` | Variables de entorno (MongoDB, S3, MailHog, Next.js) |
| `lib/types.ts` | Interfaces: `User`, `Document`, `Session`, `ApiErrorResponse`, `PaginatedResponse` |
| `lib/db.ts` | Singleton `MongoClient`, exporta `getDb()` |
| `lib/s3.ts` | Cliente S3 con `uploadFile()`, `getFileStream()`, `deleteFile()`, `getSignedUrl()` |
| `lib/mail.ts` | Transporte Nodemailer apuntando a MailHog, exporta `sendMail(to, subject, html)` |
| `lib/validators.ts` | `validateEmail`, `validatePassword`, `validateDocumentInput` |
| `utils/format.ts` | `formatDate`, `formatFileSize`, `formatCurrency` |
| `utils/constants.ts` | Tipos de archivo permitidos, tamano maximo, categorias |

### Paquetes npm

```bash
npm install mongodb @aws-sdk/client-s3 @aws-sdk/s3-request-presigner nodemailer @types/nodemailer
```

### Dependencias

Ninguna (primera fase).

---

## Fase 2 — Layout, GlobalContext y Componentes UI

**Meta**: Shell navegable con header, footer, navbar responsive y libreria de componentes reutilizables.

### Ficheros a crear

| Fichero | Descripcion |
|---------|-------------|
| `context/GlobalContext.tsx` | Provider con `user`, `setUser`, `loading`. Llama `GET /api/auth/me` al montar |
| `components/ui/Button.tsx` | Variantes: primary, secondary, danger |
| `components/ui/Input.tsx` | Input con label y mensaje de error |
| `components/ui/Modal.tsx` | Overlay modal reutilizable |
| `components/ui/Badge.tsx` | Pill coloreado por tipo de archivo |
| `components/ui/Spinner.tsx` | Indicador de carga |
| `components/ui/FileIcon.tsx` | Icono CSS por tipo de archivo (sin imagenes) |
| `components/layout/Header.tsx` | Logo (texto), nav links, controles auth |
| `components/layout/Footer.tsx` | Footer simple |
| `components/layout/Navbar.tsx` | Nav responsive con hamburger menu |

### Ficheros a modificar

| Fichero | Cambio |
|---------|--------|
| `app/layout.tsx` | Envolver children en `GlobalProvider`, actualizar metadata |
| `app/globals.css` | Variable CSS `--accent`, quitar dark mode, colores por categoria |
| `app/page.tsx` | Reemplazar boilerplate con landing/dashboard |

### Dependencias

Fase 1.

---

## Fase 3 — Autenticacion

**Meta**: Registro, login, logout y sesion via cookies.

### Ficheros a crear

| Fichero | Descripcion |
|---------|-------------|
| `lib/auth.ts` | `hashPassword`, `comparePassword`, `createSession`, `verifySession` |
| `app/api/auth/register/route.ts` | POST: validar, crear usuario, set cookie |
| `app/api/auth/login/route.ts` | POST: verificar credenciales, set cookie |
| `app/api/auth/me/route.ts` | GET: leer cookie, devolver usuario o 401 |
| `app/api/auth/logout/route.ts` | POST: limpiar cookie |
| `app/(auth)/login/page.tsx` | Formulario login con `useActionState` |
| `app/(auth)/register/page.tsx` | Formulario registro |

### Paquetes npm

```bash
npm install bcryptjs @types/bcryptjs
```

### Dependencias

Fases 1-2.

---

## Fase 4 — CRUD de Documentos (solo metadatos)

**Meta**: Listar, ver detalle, crear, editar y eliminar registros de documentos. Sin upload de archivos aun.

### Ficheros a crear

| Fichero | Descripcion |
|---------|-------------|
| `app/api/documents/route.ts` | GET (listar paginado con busqueda/filtro), POST (crear) |
| `app/api/documents/[id]/route.ts` | GET, PUT, DELETE con verificacion de ownership |
| `app/documents/page.tsx` | Server component, fetch directo a MongoDB, usa `await searchParams` |
| `app/documents/[id]/page.tsx` | Server component, usa `await params` |
| `components/documents/DocumentList.tsx` | Grid responsive de cards |
| `components/documents/DocumentCard.tsx` | Card con FileIcon, titulo, badge, fecha |
| `components/documents/DocumentDetail.tsx` | Vista/edicion con modal de confirmacion para borrar |
| `components/documents/SearchBar.tsx` | Busqueda + filtro por tipo, actualiza URL params |
| `components/documents/Pagination.tsx` | Navegacion de paginas |

> **Patron critico Next.js 16**: `params` y `searchParams` son **Promises** — requieren `await` antes de desestructurar.

### Dependencias

Fases 1-3.

---

## Fase 5 — Upload y Download de Archivos

**Meta**: Subida de archivos a S3/RustFS y descarga/preview desde detalle.

### Ficheros a crear

| Fichero | Descripcion |
|---------|-------------|
| `app/api/upload/route.ts` | POST: `request.formData()`, validar tipo/tamano, subir a S3 |
| `app/api/documents/[id]/download/route.ts` | GET: stream desde S3 con headers correctos |
| `app/documents/upload/page.tsx` | Formulario drag-and-drop: (1) upload a S3, (2) crear registro |
| `components/documents/UploadZone.tsx` | Zona drag-and-drop con feedback visual y progreso |
| `components/documents/FilePreview.tsx` | PDF en iframe, video/audio nativos, o boton de descarga |

### Ficheros a modificar

| Fichero | Cambio |
|---------|--------|
| `next.config.ts` | Configurar limite de tamano si es necesario |

### Dependencias

Fases 1-4.

---

## Fase 6 — Notificaciones por Email

**Meta**: Emails de bienvenida, confirmacion de upload y compartir documento.

### Ficheros a crear

| Fichero | Descripcion |
|---------|-------------|
| `app/api/mail/route.ts` | POST: envio generico de email (requiere auth) |
| `lib/mail-templates.ts` | Templates HTML: `welcomeEmail`, `uploadConfirmationEmail`, `shareDocumentEmail` |
| `components/documents/ShareModal.tsx` | Modal para compartir documento por email |

### Ficheros a modificar

| Fichero | Cambio |
|---------|--------|
| `app/api/auth/register/route.ts` | Anadir envio de email de bienvenida |
| `app/api/upload/route.ts` | Anadir envio de confirmacion de upload |

### Dependencias

Fases 1, 3, 5. Puede ejecutarse en paralelo con Fase 7.

---

## Fase 7 — Error Handling, Loading States y Polish

**Meta**: Error boundaries, skeletons, 404 custom, accesibilidad y metadata por pagina.

### Ficheros a crear

| Fichero | Descripcion |
|---------|-------------|
| `app/error.tsx` | Error boundary global con boton retry |
| `app/not-found.tsx` | Pagina 404 custom |
| `app/global-error.tsx` | Error boundary raiz |
| `app/documents/loading.tsx` | Skeleton del listado |
| `app/documents/[id]/loading.tsx` | Skeleton del detalle |
| `app/documents/[id]/not-found.tsx` | Documento no encontrado |
| `app/documents/error.tsx` | Error boundary de documentos |

### Tareas adicionales

- [ ] Atributos `aria-` en componentes interactivos
- [ ] `generateMetadata` en cada pagina
- [ ] Auditar formato de error consistente en todas las API routes
- [ ] Verificar responsive en todas las paginas

### Dependencias

Fases 1-5. Puede ejecutarse en paralelo con Fase 6.

---

## Fase 8 — Testing

**Meta**: Tests unitarios y E2E cubriendo flujos criticos.

### Ficheros a crear

| Fichero | Descripcion |
|---------|-------------|
| `jest.config.ts` | Configuracion Jest |
| `playwright.config.ts` | Configuracion Playwright |
| `__tests__/lib/validators.test.ts` | Tests de validadores |
| `__tests__/lib/format.test.ts` | Tests de utilidades de formateo |
| `__tests__/lib/auth.test.ts` | Tests de hashing y sesiones |
| `e2e/auth.spec.ts` | E2E: registro, login, logout |
| `e2e/documents.spec.ts` | E2E: CRUD completo de documentos |
| `e2e/upload.spec.ts` | E2E: upload, verificar en listado, download |

### Paquetes npm

```bash
npm install -D jest @jest/globals ts-jest @playwright/test
```

### Dependencias

Todas las fases anteriores.

---

## Grafo de Dependencias

```
Fase 1 (Fundacion)
  └──> Fase 2 (Layout + UI)
        └──> Fase 3 (Auth)
              └──> Fase 4 (Document CRUD)
                    └──> Fase 5 (Upload/Download)
                          ├──> Fase 6 (Email)      ──┐
                          └──> Fase 7 (Polish)      ──┤
                                                      └──> Fase 8 (Testing)
```

---

## Verificacion

| Momento | Accion |
|---------|--------|
| Tras cada fase | `npm run dev` y probar manualmente los flujos implementados |
| Tras Fase 5 | Verificar upload/download con archivos reales contra RustFS |
| Tras Fase 6 | Verificar emails en la UI de MailHog (`http://localhost:8025`) |
| Tras Fase 8 | `npx jest` y `npx playwright test` deben pasar en verde |
| Al final | `npm run build` para verificar que compila sin errores |
