@~/.claude/prompts/new_functionality_prompt_spec.md

# Create Architecture Decision Records (ADRs) for MISEIA 1-1-100

## Role
Act as a Software Architect expert in Architecture Decision Records, technical documentation, and software design patterns.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript / MongoDB / RustFS / MailHog)  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-100-web-documents`  
Non-compliance: `dc_adrs_o_decision_log`

**Prerequisite:** Prompt 007 (trade-offs documented in README) should be completed first so the decisions are already identified.

**ADR Format to use (MADR — Markdown Architecture Decision Records):**
```markdown
# ADR-NNN: [Short Title]

## Status
Accepted | Deprecated | Superseded by ADR-XXX

## Context
What is the issue that motivates this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

## Alternatives Considered
What other options were evaluated?
```

**Decisions to document as ADRs:**

1. **ADR-001: MongoDB over PostgreSQL for document metadata**
   - Context: heterogeneous file types (PDF, video, audio, image) with different metadata
   - Decision: MongoDB with native driver (no ORM)
   - Consequences: flexible schema, no migrations; manual referential integrity
   - Code: `lib/db.ts`, `lib/types.ts`

2. **ADR-002: RustFS (S3-compatible) for file storage**
   - Context: need S3-compatible storage without AWS costs for local dev/learning
   - Decision: RustFS in Docker, AWS S3 SDK v3 client
   - Consequences: zero cost, Docker dependency, not production SLA
   - Code: `lib/s3.ts`

3. **ADR-003: HMAC-SHA256 HTTP-only cookies over JWT**
   - Context: session authentication for a Next.js full-stack app
   - Decision: Custom HMAC-signed cookies with Web Crypto API
   - Consequences: no jsonwebtoken dependency, server-side revocable; custom implementation maintenance
   - Code: `lib/auth.ts`

## Task
1. Create the directory `docs/decisions/` in the project.
2. Create 3 ADR files:
   - `docs/decisions/ADR-001-mongodb-over-postgresql.md`
   - `docs/decisions/ADR-002-rustfs-s3-storage.md`
   - `docs/decisions/ADR-003-hmac-cookies-over-jwt.md`
3. Create `docs/decisions/README.md` as an index listing all ADRs.
4. Add a link to `docs/decisions/` from the main `README.md` under the Architecture section.
5. Commit: `docs: add Architecture Decision Records (ADRs) for key technical decisions`.

### ADR Writing Guidelines
- Keep each ADR under 1 page (200-300 words max)
- "Status: Accepted" for all three (these are current decisions)
- Reference specific files in the codebase for each decision
- "Consequences" must include both positive AND negative effects
- "Alternatives Considered" must list at least 2 alternatives with a short rejection reason
- Use present tense: "We use MongoDB" not "We decided to use MongoDB"

## Output Format
```
[DIR]  docs/decisions/
[FILE] docs/decisions/README.md               — ADR index
[FILE] docs/decisions/ADR-001-mongodb-over-postgresql.md
[FILE] docs/decisions/ADR-002-rustfs-s3-storage.md
[FILE] docs/decisions/ADR-003-hmac-cookies-over-jwt.md
[FILE] README.md                               — link to docs/decisions/ added
[GIT]  commit hash                             — docs: add ADRs
```

## Output Checklist and Guardrails
- [ ] 3 ADR files created in `docs/decisions/`
- [ ] Each ADR has: Status, Context, Decision, Consequences, Alternatives Considered
- [ ] Alternatives Considered has ≥2 options with rejection rationale
- [ ] Consequences include both positive and negative effects
- [ ] ADR index at `docs/decisions/README.md`
- [ ] Link from main README to `docs/decisions/`
- [ ] Decisions accurately reflect the actual code (verify `lib/auth.ts`, `lib/db.ts`, `lib/s3.ts`)
- [ ] Conventional commit format
