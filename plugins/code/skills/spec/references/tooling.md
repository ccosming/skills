# Tooling

Reference for the `code` plugin's spec interview. Encodes the user's preferences for the tools the team uses to build, test, ship, and operate. The skill consults this file when proposing or filtering options.

**Anything not listed in this file is implicitly avoid.**

## Toolchain / version manager

| Tech       | Version | Notes                                         |
| ---------- | ------- | --------------------------------------------- |
| prototools | latest  | manages tool/runtime versions via .prototools |

## Package managers

| Tech | Version | Notes                    |
| ---- | ------- | ------------------------ |
| bun  | latest  | when bun is the runtime  |
| pnpm | >=10    | when node is the runtime |

## Monorepo orchestration

| Tech     | Version | Notes                       |
| -------- | ------- | --------------------------- |
| moonrepo | >=2     | monorepo task orchestration |

## Build / bundlers

| Tech | Version | Notes                                                   |
| ---- | ------- | ------------------------------------------------------- |
| tsup | latest  | for TS packages only (apps use the framework's bundler) |

## Lint & format

| Tech     | Version | Notes                |
| -------- | ------- | -------------------- |
| eslint   | >=10    | flat configs         |
| prettier | latest  |                      |
| ruff     | latest  | Python lint + format |

## Test runners

| Tech       | Version | Notes               |
| ---------- | ------- | ------------------- |
| vitest     | latest  | for TypeScript      |
| pytest     | latest  | for Python          |
| cargo test | -       | for Rust (built-in) |
| Playwright | latest  | for E2E tests       |

## CI/CD

| Tech           | Version | Notes |
| -------------- | ------- | ----- |
| GitHub Actions | -       |       |

## Observability

| Tech          | Version | Notes                     |
| ------------- | ------- | ------------------------- |
| OpenTelemetry | latest  | metrics + traces standard |

## Local dev / containers

| Tech     | Version | Notes                                |
| -------- | ------- | ------------------------------------ |
| OrbStack | latest  | Docker runtime for local dev (macOS) |
