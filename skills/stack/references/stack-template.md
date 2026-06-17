# Stack template

The artifact template for the `stack` stage — loaded by the `drafting` subagent to transcribe the decision ledger into the artifact body, not during grilling.

## Template

````markdown
---
doc: stack
status: ready
sync_status: in-sync
version: 0.1.0
archetype: <web-app | backend-service | library | cli | systems-runtime | data-ml | mobile>
last_verified: YYYY-MM-DD HH:MM UTC
adrs: [ADR-NNN, ...]
sources: []        # research sources backing the versions/tools below
---

# Stack

## Runtime & toolchain

- <Language vX.Y · runtime vX.Y>
- Version manager: <mise | asdf | proto | rustup | nvm | system>
- <Edition / MSRV if applicable>

## Packages & dependencies

- Package manager: <manager vX.Y> · lockfile: <committed, pinning policy>
- Supply chain: <audit tool · renovate/dependabot, or manual>
- Security scanning: <secret scanning · SAST · SBOM/license, or N/A>
- Data/persistence: <driver · ORM · migration/seed per `arch` store, or N/A>

## Monorepo & tasks

- <Monorepo tool, or "single package">
- Task runner: <moon | turbo | nx | just | make, or N/A>

## Framework

- <Framework vX.Y + key libraries, or "none — library/runtime">

## Code quality

- Type checker: <… vX.Y>
- Linter: <… vX.Y> · plugins/presets: <…>
- Formatter: <… vX.Y> · plugins/presets: <…>

## Testing

- Test runner: <… vX.Y> · coverage: <…>
- E2E / property / fuzz: <… or N/A>

## Git governance

- Hooks: <lefthook | husky | pre-commit> — <what runs pre-commit/pre-push>
- Commits: <commitlint + Conventional Commits, or N/A>

## Dev environment

- <Native | devcontainer | Docker Compose>
- <Services + current image tags, if containerized>

## Build & release

- CI/build: <… → artifact>
- Distribution: <registry for a library · image+tagging for a service, or N/A>
- Release automation: <changelog · version bump · tagging, or manual>

## Deploy

- <Target + runtime, or N/A>

## Folder structure

```
<top-level tree>
```

## Configurations

- `<config file>`: <what it controls>
- Env & secrets: <env schema validation · .env/direnv · secret storage · per-env config>
- Cross-cutting tools (from `arch`): <logger/tracer/metrics · secrets · config loader>

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                         |
| ---------------- | ------- | ------------------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | Bootstrap: <archetype, researched choices, and trade-offs>.         |
````
