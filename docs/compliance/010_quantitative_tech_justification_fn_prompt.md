@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Quantitative Technical Justification for MISEIA 1-1-100

## Role
Act as a Software Architect and Performance Engineer expert in benchmarking, latency analysis, and data-driven technical decision making.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript / MongoDB / RustFS)  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-100-web-documents`  
Non-compliance: `dc_justificacion_cuantitativa`

**Requirement:** At least ONE technical decision must be justified with real numbers: benchmark results, measured latency, estimated cost comparison, or a concrete alternative comparison. This replaces "X scales better" with "X is 3x faster at our query pattern, measured with this command."

**Recommended measurement target: MongoDB query performance**  
MongoDB is the core data store. Measuring list-documents query performance with and without index is concrete, reproducible, and directly relevant to the project.

**Alternative target: Docker image size comparison**  
Measuring single-stage vs multi-stage Dockerfile image size is quick, reproducible, and justifies the multi-stage build choice.

## Task

### Option A (Recommended): MongoDB Index Benchmark
1. Write a benchmark script at `scripts/benchmark-query.ts` that:
   - Inserts 1000 test documents into MongoDB
   - Times a `find({ type: "pdf" })` query WITHOUT an index (baseline)
   - Creates an index on `{ type: 1, createdAt: -1 }`
   - Times the same query WITH the index
   - Outputs results as JSON with `p50`, `p95`, `p99` latencies
2. Run the benchmark: `npx ts-node scripts/benchmark-query.ts`
3. Record the results (example: `without index: p50=45ms; with index: p50=2ms`)
4. Add the benchmark results to ADR-001 (`docs/decisions/ADR-001-mongodb-over-postgresql.md`) under a `## Measured Performance` section.
5. Add benchmark results summary to README under the Decisions section.

### Option B (Alternative): Docker Image Size Comparison
1. Build two Docker images:
   - Single-stage: `docker build -f Dockerfile.singlestage -t web-docs:single .`
   - Multi-stage (existing Dockerfile): `docker build -t web-docs:multi .`
2. Compare: `docker images web-docs --format "{{.Tag}}: {{.Size}}"`
3. Document results in ADR or README (example: `single-stage: 1.2GB; multi-stage: 178MB — 85% reduction`)

### Benchmark Script Guidelines (Option A)
```ts
// scripts/benchmark-query.ts
import { MongoClient } from 'mongodb'
import { performance } from 'node:perf_hooks'

const N_DOCS = 1000
const N_QUERIES = 100

async function runBenchmark() {
  const client = new MongoClient(process.env.MONGODB_URI ?? 'mongodb://localhost:27017')
  // ... insert test data, run timed queries, print results
  await client.close()
}

runBenchmark().catch(console.error)
```

### Documentation Format
Add to ADR-001 or README:
```markdown
## Measured Performance — MongoDB Index Benchmark

**Setup:** 1,000 documents, query `find({ type: "pdf" })`, 100 iterations  
**Command:** `npx ts-node scripts/benchmark-query.ts`

| Scenario | p50 | p95 | p99 |
|----------|-----|-----|-----|
| Without index (collection scan) | 45 ms | 78 ms | 102 ms |
| With compound index `{ type: 1, createdAt: -1 }` | 2 ms | 4 ms | 7 ms |

**Result:** 22x improvement at p50. Index added in `lib/db.ts` via `createIndex()`.
```

## Output Format
```
[FILE] scripts/benchmark-query.ts          — reproducible benchmark script
[FILE] docs/decisions/ADR-001-*.md         — Measured Performance section added
[FILE] README.md                           — quantitative result referenced
[CMD]  npx ts-node scripts/benchmark-query.ts  — run output captured
[GIT]  commit hash                         — docs: add quantitative benchmark for MongoDB index decision
```

## Output Checklist and Guardrails
- [ ] Benchmark script is reproducible (anyone can run `npx ts-node scripts/benchmark-query.ts`)
- [ ] Real numbers captured (not invented) — run the benchmark, record actual output
- [ ] Results referenced in ADR or README with the command to reproduce
- [ ] Benchmark script cleans up test data after running
- [ ] Numbers show a concrete improvement or comparison (not just "it's fast")
- [ ] Script connects to local MongoDB (uses `.env.local` or env var)
- [ ] Conventional commit: `docs: add quantitative benchmark for MongoDB index decision`
