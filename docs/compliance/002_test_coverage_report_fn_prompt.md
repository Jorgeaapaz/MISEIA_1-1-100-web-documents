@~/.claude/prompts/new_functionality_prompt_spec.md

# Configure Jest Coverage Report for MISEIA 1-1-100

## Role
Act as a Software Developer expert in Jest testing, TypeScript, and Next.js test configuration.

## Context
Project: `1-1-100-web-documents` (Next.js 16 / TypeScript)  
Location: `D:\Master-IA-Dev\01-Bloque01\1-1-100-web-documents`  
Non-compliance: `cq_cobertura_alta`

**Current state:**
- `jest.config.ts` exists with `ts-jest` preset but NO coverage configuration
- `__tests__/lib/format.test.ts` and `__tests__/lib/validators.test.ts` exist (unit tests)
- `e2e/` contains Playwright specs (separate from Jest)
- No `test` script in `package.json` (README says `npx jest`)
- No coverage badge in README

**Existing jest.config.ts:**
```ts
import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
};
export default config;
```

**Target coverage thresholds (evaluation requirement: >60% lines on domain code):**
- `branches`: 50
- `functions`: 60
- `lines`: 60
- `statements`: 60

## Task
1. Update `jest.config.ts` to enable coverage collection targeting `lib/` and `utils/` directories (domain code).
2. Add `collectCoverageFrom` to include `lib/**/*.ts`, `utils/**/*.ts`, exclude type-definition files.
3. Add `coverageThresholds` with the minimums specified above.
4. Add `coverageReporters: ["text", "lcov", "json-summary"]`.
5. Update `package.json` scripts:
   - `"test": "jest --coverage"` 
   - `"test:ci": "jest --coverage --ci --runInBand"` (for CI environments)
6. Add `coverage/` to `.gitignore`.
7. Run `npm test` and ensure it passes; include actual coverage percentages in the commit message.
8. Add a coverage badge line to README.md (use shields.io json badge pointing to `coverage/coverage-summary.json`).
9. Commit: `test: add jest coverage config with thresholds`.

### Implementation Guidelines
- `collectCoverage: true` should be the default (always generate coverage when running `npm test`)
- `coverageDirectory: "coverage"` — standard location
- Do NOT add `--coverage` to the e2e Playwright scripts
- If current tests don't meet the thresholds, add tests to `__tests__/lib/` before committing
- `ts-jest` is already installed; no new dependencies needed

## Examples and Steps to Follow

**jest.config.ts after update:**
```ts
import type { Config } from "jest";
const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "lib/**/*.ts",
    "utils/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThresholds: {
    global: { branches: 50, functions: 60, lines: 60, statements: 60 },
  },
  coverageReporters: ["text", "lcov", "json-summary"],
};
export default config;
```

## Output Checklist and Guardrails
- [ ] `npm test` exits with code 0 (tests pass, thresholds met)
- [ ] `coverage/` directory generated with `coverage-summary.json`
- [ ] `coverage/` is in `.gitignore`
- [ ] `package.json` has `test` and `test:ci` scripts
- [ ] README has coverage badge or section
- [ ] No Playwright files included in Jest coverage scope
