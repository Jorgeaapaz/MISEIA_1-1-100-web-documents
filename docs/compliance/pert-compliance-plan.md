# PERT Compliance Plan — MISEIA 1-1-100 Web Documents
**Fecha:** 2026-06-25  
**Objetivo:** Remediar todas las no conformidades detectadas en el compliance report  

---

## PERT Compliance Plan

Las tareas están ordenadas por dependencias lógicas: primero las bases (env, cobertura), luego CI/CD (requiere tests funcionando), luego deploy público (requiere Dockerfile + CI), y finalmente documentación de decisiones.

> **Nota:** Para tareas CI/CD se favorece el camino GitHub sobre GitLab.

---

### P01 — Crear `.env.example` y corregir `.gitignore`
**Criterios:** `dc_env_example`, `cq_sin_secretos_en_repo`  
**Nivel:** Base (bloqueante para P03, P04)  
**Prompt:** [`001_env_example_template_fn_prompt.md`](001_env_example_template_fn_prompt.md)  
**Duración estimada:** 30 min  
**Dependencias:** ninguna  

**Entregables:**
- `.env.example` commiteado con todas las variables sin valores reales
- `.gitignore` corregido: ignorar `.env.local` pero **no** `.env.example`
- Script `test` añadido en `package.json`

---

### P02 — Configurar reporte de cobertura de tests (Jest)
**Criterios:** `cq_cobertura_alta`  
**Nivel:** Excepcional  
**Prompt:** [`002_test_coverage_report_fn_prompt.md`](002_test_coverage_report_fn_prompt.md)  
**Duración estimada:** 1 hora  
**Dependencias:** ninguna (paralela a P01)  

**Entregables:**
- `jest.config.ts` con `collectCoverage: true` y umbrales (`branches: 60`, `lines: 60`)
- `scripts.test` en `package.json` con `jest --coverage`
- Badge de cobertura en README
- `coverage/` añadido al `.gitignore`

---

### P03 — Implementar GitHub Actions CI/CD con deploy a VM GCP
**Criterios:** `cq_ci_funcional`  
**Nivel:** Excepcional  
**Prompt:** [`003_cicd_github_actions_fn_prompt.md`](003_cicd_github_actions_fn_prompt.md)  
**Duración estimada:** 2-3 horas  
**Dependencias:** P01 (env.example), P02 (tests con cobertura)  
⭐ **Prioridad sobre P04 (GitLab)**  

**Entregables:**
- `.github/workflows/ci-cd.yml`: lint + test + build + deploy a VM GCP
- App corriendo en Docker en `~/MISEIA1-1-100_web-documents`
- Accesible en `web-documents.deviaaps.com` vía Traefik (port 30001)
- Secrets configurados con `gh secret set` y `gcloud`

---

### P04 — Actualizar pipeline GitLab CI con tests y linter
**Criterios:** `cq_ci_funcional` (GitLab)  
**Nivel:** Excepcional  
**Prompt:** [`004_cicd_gitlab_pipeline_fn_prompt.md`](004_cicd_gitlab_pipeline_fn_prompt.md)  
**Duración estimada:** 1 hora  
**Dependencias:** P01 (env.example), P02 (tests con cobertura)  
*(Paralela a P03)*  

**Entregables:**
- `.gitlab-ci.yml` con stages: `lint` → `test` → `build`
- Cobertura reportada en GitLab CI
- Pipeline en verde en último push

---

### P05 — Crear Dockerfile + instrucciones de deploy
**Criterios:** `dc_instrucciones_deploy`  
**Nivel:** Excepcional  
**Prompt:** [`005_dockerfile_deploy_instructions_fn_prompt.md`](005_dockerfile_deploy_instructions_fn_prompt.md)  
**Duración estimada:** 1.5 horas  
**Dependencias:** P01 (env.example)  
*(Paralela a P03/P04, requerida por P06)*  

**Entregables:**
- `Dockerfile` multi-stage (build + runtime Node 24-alpine)
- `docker-compose.app.yml` para correr la app + dependencias locales
- Sección `## Deploy` en README con pasos verificables
- `.dockerignore`

---

### P06 — Deploy público y URL en README
**Criterios:** `fn_deploy_publico_accesible`  
**Nivel:** Excepcional  
**Prompt:** [`006_public_deploy_url_fn_prompt.md`](006_public_deploy_url_fn_prompt.md)  
**Duración estimada:** 1 hora  
**Dependencias:** P03 (GitHub Actions CI/CD), P05 (Dockerfile)  

**Entregables:**
- App accesible en `https://web-documents.deviaaps.com`
- URL pública documentada en README (sección "Live Demo")
- Verificación manual del flujo principal en la URL pública

---

### P07 — Documentar trade-offs y decisiones técnicas en README
**Criterios:** `dc_decisiones_documentadas`  
**Nivel:** Notable  
**Prompt:** [`007_decisions_tradeoffs_doc_fn_prompt.md`](007_decisions_tradeoffs_doc_fn_prompt.md)  
**Duración estimada:** 45 min  
**Dependencias:** ninguna (puede hacerse en paralelo desde P01)  

**Entregables:**
- Sección `## Decisiones Técnicas` en README con ≥3 trade-offs reales:
  - MongoDB vs PostgreSQL para documentos
  - RustFS vs MinIO para almacenamiento
  - HMAC-SHA256 vs JWT para sesiones
- Cada decisión: contexto → alternativas → decisión → consecuencias

---

### P08 — Documentar cambios sobre borradores generados con IA
**Criterios:** `dc_cambios_ia_documentados`  
**Nivel:** Notable  
**Prompt:** [`008_ai_changes_documentation_fn_prompt.md`](008_ai_changes_documentation_fn_prompt.md)  
**Duración estimada:** 30 min  
**Dependencias:** P07 (opcional, complementa la sección de decisiones)  

**Entregables:**
- Sección `## Uso de IA` en README referenciando `RETROSPECTIVA-2026-05-22.md`
- Lista de al menos 3 cambios críticos realizados sobre los borradores IA
- Reflexión sobre qué fue aceptado vs. rechazado y por qué

---

### P09 — Crear ADRs (Architecture Decision Records)
**Criterios:** `dc_adrs_o_decision_log`  
**Nivel:** Excepcional  
**Prompt:** [`009_adr_decision_log_fn_prompt.md`](009_adr_decision_log_fn_prompt.md)  
**Duración estimada:** 1 hora  
**Dependencias:** P07 (trade-offs ya identificados)  

**Entregables:**
- `docs/decisions/` con 3 ADRs en formato Markdown:
  - `ADR-001-mongodb-vs-postgresql.md`
  - `ADR-002-rustfs-s3-storage.md`
  - `ADR-003-session-hmac-vs-jwt.md`
- Enlace a los ADRs desde README

---

### P10 — Añadir justificación cuantitativa a una decisión técnica
**Criterios:** `dc_justificacion_cuantitativa`  
**Nivel:** Excepcional  
**Prompt:** [`010_quantitative_tech_justification_fn_prompt.md`](010_quantitative_tech_justification_fn_prompt.md)  
**Duración estimada:** 1 hora  
**Dependencias:** P09 (ADRs escritos)  

**Entregables:**
- Al menos 1 ADR o sección README con datos cuantitativos:
  - Benchmark de latencia de queries MongoDB vs alternativa
  - O: estimación de coste RustFS vs S3 managed
  - O: tiempo de build Docker multi-stage vs single-stage
- Datos reproducibles (comando de medición incluido)

---

## Grafo de Dependencias PERT

```
P01 (env.example) ──┬──► P03 (GitHub CI/CD) ──► P06 (Deploy público)
                    │
                    └──► P04 (GitLab CI)

P02 (Cobertura) ────┬──► P03
                    └──► P04

P05 (Dockerfile) ───────► P06

P07 (Trade-offs) ───────► P08 (IA docs) ──► P09 (ADRs) ──► P10 (Cuantitativo)
```

**Camino crítico:** P01 → P02 → P03 → P06 → (P07 → P09 → P10)

---

## Proper Execution of Tasks

Ordered list following PERT dependency constraints. Tasks marked *(paralela)* can be executed concurrently with the previous task; tasks marked ⭐ take priority when parallelism is not possible.

1. **P01** — Crear `.env.example` y corregir `.gitignore`  
   Prompt: [`001_env_example_template_fn_prompt.md`](001_env_example_template_fn_prompt.md)  
   *Sin dependencias — ejecutar primero, desbloquea P03, P04 y P05*

2. **P02** — Configurar reporte de cobertura de tests (Jest)  
   Prompt: [`002_test_coverage_report_fn_prompt.md`](002_test_coverage_report_fn_prompt.md)  
   *(paralela con P01) — sin dependencias, desbloquea P03 y P04*

3. **P07** — Documentar trade-offs y decisiones técnicas en README  
   Prompt: [`007_decisions_tradeoffs_doc_fn_prompt.md`](007_decisions_tradeoffs_doc_fn_prompt.md)  
   *(paralela con P01/P02) — sin dependencias, desbloquea P08 y P09*

4. **P05** — Crear Dockerfile + instrucciones de deploy  
   Prompt: [`005_dockerfile_deploy_instructions_fn_prompt.md`](005_dockerfile_deploy_instructions_fn_prompt.md)  
   *Requiere: P01 — desbloquea P06*

5. **P03** ⭐ — Implementar GitHub Actions CI/CD con deploy a VM GCP  
   Prompt: [`003_cicd_github_actions_fn_prompt.md`](003_cicd_github_actions_fn_prompt.md)  
   *Requiere: P01 + P02 — prioridad sobre P04 — desbloquea P06*

6. **P04** — Actualizar pipeline GitLab CI con tests y linter  
   Prompt: [`004_cicd_gitlab_pipeline_fn_prompt.md`](004_cicd_gitlab_pipeline_fn_prompt.md)  
   *(paralela con P03) — Requiere: P01 + P02*

7. **P06** — Deploy público y URL en README  
   Prompt: [`006_public_deploy_url_fn_prompt.md`](006_public_deploy_url_fn_prompt.md)  
   *Requiere: P03 + P05*

8. **P08** — Documentar cambios sobre borradores generados con IA  
   Prompt: [`008_ai_changes_documentation_fn_prompt.md`](008_ai_changes_documentation_fn_prompt.md)  
   *Requiere: P07*

9. **P09** — Crear ADRs (Architecture Decision Records)  
   Prompt: [`009_adr_decision_log_fn_prompt.md`](009_adr_decision_log_fn_prompt.md)  
   *Requiere: P07 + P08*

10. **P10** — Añadir justificación cuantitativa a una decisión técnica  
    Prompt: [`010_quantitative_tech_justification_fn_prompt.md`](010_quantitative_tech_justification_fn_prompt.md)  
    *Requiere: P09*

---

## Estimación de Esfuerzo Total

| Fase | Tareas | Horas estimadas |
|------|--------|-----------------|
| Fase 1 (Bases) | P01, P02 | 1.5h |
| Fase 2 (CI/CD) | P03, P04, P05 | 4.5h (paralelo: ~3h) |
| Fase 3 (Deploy) | P06 | 1h |
| Fase 4 (Docs) | P07, P08, P09, P10 | 3.25h |
| **Total** | | **~9h** (paralelo: ~6.5h) |
