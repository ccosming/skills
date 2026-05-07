# Tooling

Reference for the `code` plugin's spec interview. Encodes the user's preferences for the tools the team uses to build, test, ship, and operate. The skill consults this file when proposing or filtering options. Each entry's "When to apply" decides whether to offer it for the current project.

**Anything not listed in this file is implicitly avoid.**

## Toolchain / version manager

| Tech       | Version | When to apply                                                    |
| ---------- | ------- | ---------------------------------------------------------------- |
| prototools | latest  | every project; manages tool / runtime versions via `.prototools` |

## Package managers

| Tech | Version | When to apply                                           |
| ---- | ------- | ------------------------------------------------------- |
| bun  | latest  | when bun is the runtime                                 |
| pnpm | >=10    | when node is the runtime, or for non-runtime workspaces |

## Monorepo orchestration

| Tech     | Version | When to apply                                            |
| -------- | ------- | -------------------------------------------------------- |
| moonrepo | >=2     | when more than one app or package lives in the same repo |

## Build / bundlers

| Tech | Version | When to apply                                                           |
| ---- | ------- | ----------------------------------------------------------------------- |
| tsup | latest  | publishing standalone TS packages; apps use the framework's own bundler |

## Lint & format

| Tech     | Version | When to apply                                           |
| -------- | ------- | ------------------------------------------------------- |
| eslint   | >=10    | every TypeScript / JavaScript project; use flat configs |
| prettier | latest  | every web / TS project                                  |
| ruff     | latest  | every Python project; lint + format in one tool         |

## Test runners

| Tech       | Version | When to apply                                           |
| ---------- | ------- | ------------------------------------------------------- |
| vitest     | latest  | every TypeScript project for unit and integration tests |
| pytest     | latest  | every Python project                                    |
| cargo test | -       | every Rust project (built-in)                           |
| Playwright | latest  | E2E coverage of critical browser flows                  |

## CI/CD

| Tech           | Version | When to apply                               |
| -------------- | ------- | ------------------------------------------- |
| GitHub Actions | -       | default CI/CD when the repo lives on GitHub |

## Observability

| Tech          | Version | When to apply                                                          |
| ------------- | ------- | ---------------------------------------------------------------------- |
| OpenTelemetry | latest  | every project that needs metrics or traces; pair with a chosen backend |

## Local dev / containers

| Tech     | Version | When to apply                                                                  |
| -------- | ------- | ------------------------------------------------------------------------------ |
| OrbStack | latest  | local Docker runtime on macOS; replace with Docker Desktop or Podman elsewhere |
