# Stack archetypes

Companion to `stack.md`. The stack is **not one-size-fits-all**: a CLI does not
need a dev-container, a systems runtime does not need an ESLint plugin set. This
file maps the project's **archetype** to the stack dimensions that apply, the
archetype-specific probes, and the research targets — so the grilling explores
what is pertinent and skips what is not.

## Picking the archetype

Read it from the charter (its archetype + the domain subdomains), not from a
guess. If the charter's shape spans two (a service that also ships a CLI), pick
the dominant one and treat the other's columns as `opt`. Confirm the archetype
with the user in the first stack turn before probing dimensions.

## Applicability matrix

`core` = always probe · `opt` = probe only if a signal appears (charter, arch,
or the user) · `—` = skip unless the user raises it (mark "N/A" in the artifact).

| Archetype             | runtime | packages | monorepo_tasks | framework | code_quality | testing_tools | git_governance | dev_environment | build_release | deploy | folder_structure | configurations |
| --------------------- | ------- | -------- | -------------- | --------- | ------------ | ------------- | -------------- | --------------- | ------------- | ------ | ---------------- | -------------- |
| Web app / frontend    | core    | core     | opt            | core      | core         | core          | core           | opt             | core          | core   | core             | core           |
| Backend service / API | core    | core     | opt            | core      | core         | core          | core           | core            | core          | core   | core             | core           |
| Library / SDK         | core    | core     | opt            | —         | core         | core          | core           | opt             | core          | —      | core             | core           |
| CLI tool              | core    | core     | —              | opt       | core         | core          | core           | —               | core          | —      | core             | core           |
| Systems runtime / fw  | core    | core     | opt            | —         | core         | core          | core           | opt             | core          | opt    | core             | core           |
| Data / ML pipeline    | core    | core     | opt            | core      | core         | core          | opt            | core            | core          | opt    | core             | core           |
| Mobile / desktop app  | core    | core     | —              | core      | core         | core          | core           | opt             | core          | core   | core             | core           |

## Archetype notes

Each block lists the **archetype-specific probes** beyond the generic dimension
seeds, the **research targets** (current-version / current-tool queries to run),
and the **default leaning** (a grounded starting proposal, never auto-baked).

### Web app / frontend

- Probes: rendering model (SSR/SSG/CSR/streaming), bundler/dev-server, styling
  approach, asset pipeline, browser support target.
- Research: current major of the framework and its meta-framework; the bundler the
  ecosystem now defaults to; the recommended styling toolchain.
- `build_release` includes a CDN/edge target; `deploy` is the hosting platform.

### Backend service / API

- Probes: API style (REST/GraphQL/gRPC) and its toolchain, server runtime/async
  model, the data-driver tooling for each store `arch` named (not the schema),
  container base image, scaling unit.
- Research: current LTS of the runtime; the API framework's current major;
  pertinent **base images** (slim/distroless/alpine tags) for the runtime.
- `dev_environment` is `core` — propose Docker Compose for local dependencies.

### Library / SDK

- Probes: public API surface boundary, MSRV/edition and the support window,
  SemVer discipline, distribution registry, docs/site tooling, example/playground.
- Research: the registry's current publishing flow; the docs toolchain the
  ecosystem favors; the current MSRV norm for the language.
- `framework` is usually `—`; `deploy` is `—`; `build_release` centers on
  **distribution** (crates.io / npm / PyPI / Maven), not a deploy target.

### CLI tool

- Probes: argument-parsing library, distribution channels (Homebrew / `cargo
  install` / npm bin / release binaries), cross-compilation targets, shell
  completions, self-update.
- Research: the arg-parsing library the ecosystem favors now; the current
  cross-compile/release tooling (e.g. release automation actions).
- `monorepo_tasks`, `dev_environment`, `deploy` are usually `—`.

### Systems runtime / framework

- Probes: async runtime / concurrency model, crate/module + workspace layout,
  feature-flag matrix, MSRV/edition, FFI/`no_std` surface, error-handling library,
  the public extension/plugin boundary.
- Research: the current async runtime and its major; the error-handling library
  the ecosystem favors; the current edition/MSRV norm.
- `framework` is `—`; `deploy` is `opt` (only if it ships a hosted mode).

### Data / ML pipeline

- Probes: the store/engine tooling per stateful component `arch` named, pipeline/
  orchestration framework, notebook/experiment tooling, model-serving runtime,
  data-format libraries.
- Research: current majors of the pipeline framework and serving runtime;
  pertinent **base images** for the data stores and GPU/compute.
- `dev_environment` is `core` — Compose for local stores; `git_governance` is
  `opt`.

### Mobile / desktop app

- Probes: platform toolchain (Xcode/Gradle/Tauri/Electron), native package
  manager (CocoaPods/SPM/Gradle), build & signing, distribution (App Store / Play
  / notarization), minimum OS target.
- Research: current platform SDK/min-target norms; the cross-platform framework's
  current major; signing/distribution tooling.
- `monorepo_tasks` is usually `—`; `deploy` is the store/distribution channel.

## Cross-cutting tooling (all archetypes)

When `arch.md` exists, its `cross_cutting` dimension (authn/authz, observability,
error handling, config/secrets) names the **strategy**. Stack's job is to name the
**concrete tool** for each — the logger/tracer/metrics library, the secrets
manager, the config loader — under `configurations`. Do not re-decide the
strategy; name what implements it, researched to a current version.

## Depth probes (archetype-gated)

Beyond the core dimensions, probe these where the archetype warrants. Each adds
**depth to an existing dimension**, never a new one — skip it (mark N/A) where the
archetype does not list it.

| Depth probe                                                          | Lives in                       | Archetypes                                            |
| -------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------- |
| Production image build (multi-stage, distroless, scan: trivy/grype)  | `build_release`                | backend, data/ML, mobile (server side)                |
| Documentation tooling (API-doc gen, docs site, ADR tooling)          | `build_release` + `configurations` | library (core); backend, systems-runtime (opt)    |
| Observability depth (OTel SDK, structured logger, error tracking, metrics) | `configurations` (from `arch`) | backend, systems-runtime, data/ML                 |
| Performance / benchmarking (criterion, k6, size-limit, bundle budget)| `testing_tools`                | systems-runtime (core); library, backend (opt); web   |
| Editor / DX (`.editorconfig`, recommended extensions, debug configs) | `configurations`               | all (cheap — always offer)                            |
