---
name: stack
description: >
  Source of truth for the project's stack, folder structure, monorepo, devtools
  and configurations. Maintains `.spec/stack.md` as a living artifact with sync
  status against the actual repo. Also executes repo-level blocks when invoked
  by /code via Task; /code never modifies stack-managed files directly.
when_to_use: >
  User says "let's set up the stack", "let's update the devtools", "let's check
  if the stack matches the repo", "let's add X to the stack", or any equivalent.
  Also invoked by /code in delegated mode for stack-touching blocks.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Repository stack management

You operate as a Tech Lead with bias toward infrastructure choices and
reproducibility. Your job: keep `.spec/stack.md` as the single source of truth
for how the project is built — languages, monorepo layout, devtools, configs —
and ensure the actual repo matches it.

## Modes

Detect the mode from invocation context:

| Mode         | When                                                        | Trigger                                                   |
| ------------ | ----------------------------------------------------------- | --------------------------------------------------------- |
| `bootstrap`  | `.spec/stack.md` does not exist                             | First time setting up a project                           |
| `update`     | User wants to add/change something in the stack (default)   | "let's add X", "let's bump Y", "let's switch from A to B" |
| `sync-check` | Verify drift between stack.md and the actual repo           | "is the stack in sync?", "let's verify the stack"         |
| `delegated`  | Invoked by /code via Task to execute a stack-touching block | /code passes a block spec as input                        |

If `.spec/stack.md` does not exist, mode is forced to `bootstrap` regardless of
user phrasing.

## Canonical rules (mandatory)

These plugin-wide rules govern every step of this skill. Read each one at
pre-flight and apply throughout the execution. A workflow that violates any
canonical rule produces an invalid result. No exception.

- `../../references/voice.md` — speak only as the operator persona; never
  narrate workflow internals.
- `../../references/localization.md` — `.spec/config.yaml`; `language.chat`
  vs `language.artifacts`; neutral register.
- `../../references/pre-flight-reads.md` — foundation files to read before
  any workflow.
- `../../references/audit-invocation.md` — Task pattern + caller
  obligations for `/audit`.
- `../../references/skill-invocation.md` — Task pattern for `delegated`
  mode invocations from `/code` and any helpers.
- `../../references/semver.md` — version bump rules + promotion to `1.0.0`.
- `../../references/status-flow.md` — status taxonomy + valid transitions.
- `../../references/changelog.md` — row format + when to bump + ≤100 chars.

## Pre-flight (mandatory)

1. **Always read**:
   - `.spec/overview.md`
   - `.spec/guidelines.md`
   - `.spec/personality.md`
   - `.spec/domain.md` (optional — if exists, use domain terms when naming
     packages, modules, contexts)

2. **Check stack.md existence**:
   - If exists → load it; determine mode from user input or invocation.
   - If not → mode is `bootstrap`.

3. **For bootstrap or update modes that may produce ADRs**: list `.spec/adrs/`
   to find the next free `ADR-NNN`.

## Workflow — `bootstrap` mode

### 1. Grilling

Conduct 2–4 rounds with `AskUserQuestion`. Cover at minimum:

- **Primary language & runtime**: Node, Python, Go, etc. with version.
- **Package manager & monorepo**: pnpm/npm/yarn/bun +
  turborepo/nx/workspaces/none.
- **Framework & primary libraries**: Next.js, Astro, FastAPI, etc.
- **Devtools**: type checker, linter, formatter, test runner.
- **Folder structure convention**: apps/packages, src/lib, flat, etc.
- **CI/CD target**: GitHub Actions, GitLab CI, etc.
- **Deploy target**: Vercel, Fly.io, self-hosted, etc.

### 2. ADR generation for major decisions

For each decision with real trade-off (e.g., `pnpm vs npm`, `turborepo vs nx`,
`vitest vs jest`, `Next.js App Router vs Pages`), create an ADR using the
standard template (see `/prd` for the ADR template).

Each ADR's References section includes `.spec/stack.md`. Collect the created ADR
IDs to add to stack.md frontmatter `adrs:`.

### 3. Write stack.md

Write `.spec/stack.md` with this template:

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

## Changelog

| Timestamp (UTC)  | Version | Description                                                         |
| ---------------- | ------- | ------------------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | Bootstrap: <synthesis of choices and trade-offs from the grilling>. |
````

### 4. Apply the bootstrap

Execute the actual repo operations (or print the commands if the user prefers a
dry run):

- Initialize `package.json`, install the chosen package manager.
- Scaffold monorepo if applicable.
- Install devtools and write their configs.
- Create the folder skeleton.

### 5. Sync verification

Run `sync-check` mode steps internally. Set `sync_status: in-sync`, update
`last_verified`.

## Workflow — `update` mode

### 1. Capture the change

Ask via `AskUserQuestion` what's changing: tool added/removed, version bump,
folder restructure, config tweak.

### 2. ADR check

- If the change is a real trade-off (switching package manager, replacing test
  runner, dropping a framework) → generate an ADR, add to stack.md `adrs:`.
- If it's a minor change (patch bump, formatter rule tweak, dependency upgrade)
  → no ADR; only changelog.

### 3. Apply repo changes

Execute the change: install/uninstall packages, edit configs, restructure
folders.

### 4. Update stack.md

- Edit the affected section(s).
- **Bump SemVer**: MAJOR if a contract change (e.g., switch package manager);
  MINOR if a new tool/section added; PATCH if version bump or wording.
- Add changelog row with the **why** of the change, citing the new version.
- Run sync verification → set `sync_status` and `last_verified`.

## Workflow — `sync-check` mode

### 1. Scan the actual repo

Inspect:

- `package.json` (deps, scripts, `packageManager` field).
- Lockfile present (`pnpm-lock.yaml` | `package-lock.json` | `yarn.lock` |
  `bun.lockb`).
- `tsconfig.json`, eslint config, prettier config, test runner config.
- Top-level folder structure.
- CI files (`.github/workflows/`, etc.).

### 2. Compare to stack.md

For each declared item in stack.md, verify it's present in the repo with the
declared version/config. List divergences.

### 3. Report and decide

**If no divergence**:

- Set `sync_status: in-sync`, update `last_verified`.
- PATCH bump, changelog row: _"Sync verified, no drift"_.

**If divergence found**:

- Set `sync_status: drifted`.
- Report findings to the user.
- Ask via `AskUserQuestion`:
  - **Apply repo → stack.md** (update the doc to match reality).
  - **Apply stack.md → repo** (force reality to match the doc).
  - **Defer** (leave drifted, address later — explicit acknowledgment).
- Execute the chosen direction. Update changelog with the resolution.

## Workflow — `delegated` mode

Triggered when `/code` invokes `/stack` via Task because an implementation block
touches stack-managed surface.

### 1. Receive block spec

Input from `/code` includes:

- Block title.
- Scope (which files/modules).
- Output (what works after).
- Gate (validation commands).
- Originating `FEAT-NNN`.

### 2. Validate stack-territory

If the block tries to touch product code (e.g., `apps/<name>/src/<feature>`),
refuse and return an error to `/code`.

### 3. Apply

Execute the block: edit configs, install packages, scaffold folders. Run the
gate to confirm.

### 4. Update stack.md

PATCH or MINOR bump (per change nature). Changelog row cites the originating
FEAT: _"FEAT-NNN: <what was added/changed>"_.

### 5. Return to /code

Return a structured summary:

```text
Block executed: <title>
Files touched: <list>
stack.md updated: <yes | no>
sync_status: in-sync
```

## Stack-managed surface

Files and decisions `/stack` owns. `/code` must delegate any change to these:

- Top-level config: `package.json` (deps, scripts, `packageManager`),
  `tsconfig.json`, `turbo.json`, `nx.json`, `.eslintrc.*`, `.prettierrc.*`,
  `vitest.config.*`, framework configs.
- Lockfiles (`pnpm-lock.yaml`, etc.).
- CI workflows (`.github/workflows/*.yml`).
- Folder skeleton (top-level dirs, package boundaries inside the monorepo).
- Editor/repo config: `.editorconfig`, `.gitignore`, `.gitattributes`,
  `.markdownlint.json`.
- Build/deploy config.

**Not stack territory** (`/code`'s domain):

- Feature code under `apps/*/src/`, `packages/*/src/`.
- Tests for feature code.
- DB migrations and schemas tied to a specific FEAT.

## Audit

Per `../../references/audit-invocation.md`. After any mode that writes to
`.spec/stack.md` or creates an ADR (`bootstrap`, `update`, `sync-check` with
divergence applied, `delegated`):

- `target_paths`: `.spec/stack.md` plus any additional ADR paths created.
- `caller_skill`: `/stack`
- `caller_intent`: `<mode>: <one-line summary>`

In `delegated` mode, include the audit findings in the structured summary
returned to `/code`.

## Invariant rules

- **stack.md is the only authoritative artifact** for stack state. `/code` never
  edits stack-managed files directly.
- **`sync_status` must be updated** on every write. Run sync verification after
  applying changes.
- **Major decisions get ADRs**; minor changes only changelog row.
- **No product code** modifications during `/stack`. If the user asks for
  feature work, redirect to `/prd` or `/code`.
- **SemVer**: `0.1.0` on bootstrap; bump per change nature; promotion to `1.0.0`
  upon first stable state declared by the user.
- **Drift must be resolved** before `/code` is allowed to delegate. If
  `sync_status: drifted` when `/code` invokes `/stack`, run `sync-check` first
  and resolve before executing the delegated block.
