@~/.claude/prompts/new_functionality_prompt_spec.md

# Update GitLab CI Pipeline with Lint, Test, and Coverage for MISEIA 1-1-100

## Role
Act as a Software Architect and DevOps Engineer expert in GitLab CI/CD pipelines, Node.js, and Next.js.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript)  
GitLab Repo: `https://gitlab.codecrypto.academy/jorgeaapaz/miseia_1-1-100-web-documents`  
Non-compliance: `cq_ci_funcional` (GitLab path — secondary to GitHub CI)

**Current `.gitlab-ci.yml` (broken — only builds, no lint or test):**
```yaml
stages:
  - build

variables:
  NODE_VERSION: "20"

build:
  stage: build
  image: node:${NODE_VERSION}-alpine
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - .npm/
  before_script:
    - npm ci --cache .npm --prefer-offline
  script:
    - npm run build
  artifacts:
    paths:
      - .next/
    expire_in: 1 hour
  rules:
    - if: $CI_COMMIT_BRANCH
    - if: $CI_MERGE_REQUEST_ID
```

**Problems:**
1. Only `build` stage — missing `lint` and `test` stages
2. `npm run lint` may fail because `eslint` has no target path (needs `eslint .`)
3. No test execution (`npm test` script missing in package.json — see prompt 001)
4. No coverage report published to GitLab
5. Node.js 20 used (should be 24 per Vercel knowledge update)

## Task
1. Rewrite `.gitlab-ci.yml` with 3 stages: `lint` → `test` → `build`
2. Fix the `lint` stage to run `eslint .` (or `npm run lint`)  
3. Add `test` stage running `npm run test:ci` with coverage report via `coverage` regex
4. Update Node.js version to `24` in the pipeline
5. Publish coverage percentage to GitLab using `coverage: '/Lines\s*:\s*(\d+\.?\d+)%/'`
6. Ensure the `build` stage produces `.next/` artifact only after lint+test pass
7. Fix `package.json` lint script to `"lint": "eslint ."` (add target path)
8. Commit: `ci: update GitLab pipeline with lint, test and coverage stages`

### Implementation Guidelines
- Use `node:24-alpine` image for all stages (matching production Node.js 24 LTS)
- Share `node_modules` cache between stages using a single cache key
- The `test` stage must set `NODE_ENV=test`
- Coverage regex matches ts-jest output format: `Lines        :  XX.XX% ( X/X )`
- If GitLab CI variables are needed for test (e.g., `MONGODB_URI`), use mock values or skip DB tests in CI using `--testPathIgnorePatterns`
- Keep `rules` so pipeline runs on both branch pushes and MR events
- Add pipeline status badge to README

## Examples and Steps to Follow

**Target `.gitlab-ci.yml` structure:**
```yaml
stages:
  - lint
  - test
  - build

variables:
  NODE_VERSION: "24"
  NODE_ENV: "development"

.node_cache: &node_cache
  cache:
    key:
      files: [package-lock.json]
    paths: [.npm/]

lint:
  stage: lint
  image: node:${NODE_VERSION}-alpine
  <<: *node_cache
  before_script:
    - npm ci --cache .npm --prefer-offline
  script:
    - npm run lint

test:
  stage: test
  image: node:${NODE_VERSION}-alpine
  <<: *node_cache
  variables:
    NODE_ENV: "test"
  before_script:
    - npm ci --cache .npm --prefer-offline
  script:
    - npm run test:ci
  coverage: '/Lines\s*:\s*(\d+\.?\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    expire_in: 1 week

build:
  stage: build
  image: node:${NODE_VERSION}-alpine
  <<: *node_cache
  before_script:
    - npm ci --cache .npm --prefer-offline
  script:
    - npm run build
  artifacts:
    paths: [.next/]
    expire_in: 1 hour
  rules:
    - if: $CI_COMMIT_BRANCH
    - if: $CI_MERGE_REQUEST_ID
```

**Note on cobertura report:** Add `coverageReporters: ["text", "lcov", "json-summary", "cobertura"]` to `jest.config.ts` (coordinate with prompt 002).

## Output Checklist and Guardrails
- [ ] `.gitlab-ci.yml` has 3 stages: lint → test → build
- [ ] `npm run lint` has a target path (not bare `eslint`)
- [ ] `npm run test:ci` is defined in `package.json`
- [ ] Coverage percentage visible in GitLab MR view
- [ ] Node.js 24 used throughout
- [ ] Pipeline passes on last commit to master (all green)
- [ ] GitLab pipeline badge added to README
