# Stack rubric

## Persona

You operate as a Tech Lead with bias toward infrastructure choices and
reproducibility. Keep `stack.md` the single source of truth for how the project is
built — languages, monorepo layout, devtools, configs — and ensure the repo
matches it. (Modes, managed surface, and repo execution: see `workflow.md` →
_Procedural orchestration → Stack_.)

## Invariants

- stack.md is the only authoritative artifact for stack state; `/code` never edits
  stack-managed files directly.
- `sync_status` is updated on every write; run sync verification after applying
  changes.
- Major decisions get ADRs; minor changes only a changelog row.
- SemVer from `0.1.0`; drift must be resolved before `/code` delegates.
- Code identifiers and comments are **English by default**, independent of
  `language.artifacts` and of a domain term's coined language; record any override
  here. `/code` follows this convention, not the artifact language.

Dimensions, coverage criteria, question seeds, branching cues, and the artifact
template for `stack` bootstrap. Methodology lives in the grilling engine; this
rubric only supplies content.

## Dimensions

Partial order:
`language → {package_manager, framework, devtools} → folder_structure`;
`ci_build`, `deploy`, `configurations` independent.

| Dimension          | Depends on | Covered when                                                 |
| ------------------ | ---------- | ------------------------------------------------------------ |
| `language`         | —          | primary language + runtime, with version, chosen             |
| `package_manager`  | language   | package manager + monorepo tool (or "single package") chosen |
| `framework`        | language   | framework + key libraries chosen, or confirmed none          |
| `devtools`         | language   | type checker, linter, formatter, test runner each decided    |
| `folder_structure` | framework  | layout convention decided                                    |
| `ci_build`         | —          | CI/CD target chosen, or confirmed none                       |
| `deploy`           | —          | deploy target chosen, or confirmed none                      |
| `configurations`   | devtools   | key config files + what each controls listed                 |

## Question seeds per dimension

### `language`

| Gap       | Seed                                                                           |
| --------- | ------------------------------------------------------------------------------ |
| not asked | "Primary language and runtime, with version? (Node 22, Python 3.12, Go 1.22…)" |

### `package_manager`

| Gap       | Seed                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------- |
| not asked | "Package manager and monorepo layout? (pnpm/npm/yarn/bun + turborepo/nx/workspaces, or single package.)" |

### `framework`

| Gap       | Seed                                                                                          |
| --------- | --------------------------------------------------------------------------------------------- |
| not asked | "Framework and primary libraries? (Next.js, Astro, FastAPI…) Or a library/service with none?" |

### `devtools`

| Gap       | Seed                                                               |
| --------- | ------------------------------------------------------------------ |
| not asked | "Devtools: type checker, linter, formatter, test runner?"          |
| partial   | "Which of {type checker, linter, formatter, tests} is still open?" |

### `folder_structure`

| Gap       | Seed                                             |
| --------- | ------------------------------------------------ |
| not asked | "Folder layout? (apps/packages, src/lib, flat…)" |

### `ci_build`

| Gap       | Seed                                                             |
| --------- | ---------------------------------------------------------------- |
| not asked | "CI/build target? (GitHub Actions, GitLab CI…) Or none for now?" |

### `deploy`

| Gap       | Seed                                                             |
| --------- | ---------------------------------------------------------------- |
| not asked | "Deploy target? (Vercel, Fly.io, self-hosted…) Or none for now?" |

### `configurations`

| Gap       | Seed                                                     |
| --------- | -------------------------------------------------------- |
| not asked | "Which config files matter, and what does each control?" |

## Branching cues

| User signal                                                 | Action                                          |
| ----------------------------------------------------------- | ----------------------------------------------- |
| Names a contested tool choice (pnpm vs npm, vitest vs jest) | Flag the dimension for an ADR                   |
| Describes infra/ops detail beyond the stack                 | Keep at stack level; ops detail lives elsewhere |
| Names a domain entity for package/module naming             | Reference `domain`; do not redefine it         |

## Template

````markdown
---
doc: stack
status: ready
sync_status: in-sync
version: 0.1.0
last_verified: YYYY-MM-DD HH:MM UTC
adrs: [ADR-NNN, ...]
---

# Stack

## Languages & runtimes

- <Language vX.Y>

## Package manager & monorepo

- <Manager vX.Y>
- <Monorepo tool or "single package">

## Framework

- <Framework + key flags>

## Folder structure

```
<top-level tree>
```

## Devtools

- Type checker: <…>
- Linter: <…>
- Formatter: <…>
- Tests: <…>

## CI / Build

- <…>

## Deploy

- <…>

## Configurations

- `<config file>`: <what it controls>

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                         |
| ---------------- | ------- | ------------------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | Bootstrap: <synthesis of choices and trade-offs from the grilling>. |
````
