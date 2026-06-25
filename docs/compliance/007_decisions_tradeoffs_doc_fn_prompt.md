@~/.claude/prompts/new_functionality_prompt_spec.md

# Document Technical Decisions and Trade-offs in README for MISEIA 1-1-100

## Role
Act as a Software Architect expert in technical documentation, architecture decision writing, and software engineering trade-off analysis.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript / MongoDB / RustFS / MailHog)  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-100-web-documents`  
Non-compliance: `dc_decisiones_documentadas`

**Current state:**  
README has a "Design Patterns / Architecture" section listing patterns (Singleton, Factory, Repository, etc.) but does NOT document trade-offs — the "why we chose X over Y" reasoning. The evaluation requires ≥2 real trade-off decisions, not generic ones like "used JavaScript because it's popular."

**Actual decisions made in this project that need documentation:**

1. **MongoDB vs PostgreSQL** — chose MongoDB for document metadata storage. Trade-off: flexible schema for varied file types (PDF/video/audio have different metadata needs) vs strong relational consistency. Consequence: no foreign key constraints, manual referential integrity.

2. **RustFS vs MinIO vs Managed S3** — chose RustFS (S3-compatible, Rust-based, Docker). Trade-off: zero cloud cost, local control vs operational overhead, no SLA, not production-hardened. Consequence: simpler local dev but requires Docker.

3. **HMAC-SHA256 cookies vs JWT** — chose custom HMAC-signed HTTP-only cookies. Trade-off: no library dependency, server-side revocable sessions vs JWT is stateless, widely understood, has ecosystem tooling. Consequence: custom `lib/auth.ts` implementation, sessions stored in cookie (not DB).

4. **Native MongoDB driver vs Mongoose** — no ORM. Trade-off: full control, no schema validation magic, lighter dependency vs Mongoose provides auto-validation, middleware, and typing. Consequence: explicit type definitions in `lib/types.ts` required.

## Task
1. Add a `## Decisiones Técnicas` section to `README.md` (after the Architecture section).
2. Document at least 3 of the 4 decisions above in a structured format:
   - **Contexto:** what problem needed solving
   - **Alternativas consideradas:** what other options were evaluated
   - **Decisión:** what was chosen and why
   - **Consecuencias:** what trade-offs were accepted
3. Keep each decision concise (5-8 lines), specific to THIS project, not generic.
4. Commit: `docs: add technical decisions and trade-offs section to README`.

### Decisions Guidelines
- Each trade-off must be specific to THIS project's constraints, not textbook generalities
- Reference actual files/code where the decision manifests (e.g., `lib/db.ts`, `lib/auth.ts`)
- "We chose X because of Y specific constraint in this project" — not "X is popular"
- Do NOT invent decisions not actually made in the project

## Output Format

**README section structure:**
```markdown
## Decisiones Técnicas

### MongoDB en lugar de PostgreSQL para metadatos de documentos
**Contexto:** Los documentos (PDF, video, audio, imagen) tienen atributos heterogéneos...
**Alternativas:** PostgreSQL con columnas JSONB, esquema normalizado...
**Decisión:** MongoDB con driver nativo — schema flexible sin migrations...
**Consecuencias:** Sin validación de FK en BD; la integridad referencial es responsabilidad de `lib/validators.ts`...

### RustFS en lugar de MinIO o S3 gestionado
...

### Cookies HMAC-SHA256 en lugar de JWT
...
```

## Output Checklist and Guardrails
- [ ] ≥3 decisions documented with Contexto / Alternativas / Decisión / Consecuencias
- [ ] Each decision references specific files in the codebase
- [ ] No generic or textbook trade-offs ("X scales better than Y" without project-specific context)
- [ ] Decisions accurately reflect the code (cross-check with `lib/auth.ts`, `lib/db.ts`, `lib/s3.ts`)
- [ ] Section placed after Architecture diagram in README
- [ ] Commit follows conventional commits format
