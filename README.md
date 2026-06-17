# ccosming skills

Personal Claude Code skills by Carlos Cosming — a spec-driven development system
that bootstraps, designs, builds, and reviews software from a versioned `.spec/`
source of truth.

Plugin namespace: `ccosming` → invoke as `/ccosming:<skill-name>`.

## Installation

The plugin is published as a Claude Code marketplace plugin from this repo:

```text
/plugin marketplace add ccosming/skills
/plugin install ccosming@ccosming
```

Once installed, a session-start hook injects the plugin constitution (and, in a
bootstrapped project, the live foundation) so the skills are ready to use.

## How it works

The system has a single source of truth, the `.spec/` directory in the **target
project** (not in this repo). Every artifact lives there; skills read and write
it under a shared set of rules (the _constitution_).

Two entry points (_doors_) drive the work:

- **`/spec`** — the only door that creates or evolves `.spec/` artifacts. It reads
  the flow program (`references/workflow.md`) and runs each artifact (config,
  charter, guidelines, personality, stack, domain, arch, ux, PRD, change…) through
  **one universal authoring procedure** against the artifact's rubric; it
  bootstraps, sequences, fans a PRD out into FEATs + ADRs, and cascades changes.
- **`/code`** — implements a `ready` FEAT, running its build⇄review loop
  internally.

The authoring artifacts are **not** skills — each is a **rubric bundle** under
`skills/spec/references/rubrics/` that `/spec` runs inline. The skills that remain
are the two doors plus a handful of forked, single-purpose delegates: the critics
(`/audit`, `/consistency`, `/detector`), the helpers (`/clarify`, `/research`,
`/summarize`), the reviewer (`/challenge`), and the standalone ideation skills
(`/ideate` and the older `/grill`). A delegate does its job, reports, and returns —
sequencing belongs to the door. (A third door, `/issue` for symptom triage, is
defined in the constitution but not yet implemented.)

Ideation has its own front door: **`/ideate`** turns a half-formed idea into a
standalone concept whitepaper — readable on its own, saved to a global
`~/.ccosming/ideas/` vault or the project's `.ideas/`. On a fresh project `/spec`
offers to seed the foundation from a closed whitepaper (via `/detector`), so an
idea travels from brainstorm to charter without leaving Claude Code. The grill
seeds hypotheses; the bar, critics, and gate still rule.

`/spec` authors every artifact through a shared **grilling engine**: a
dimension-coverage loop run against the artifact's rubric bundle. It scales depth
by materiality (challenging contested, irreversible, or high-blast-radius
decisions; confirming trivial ones), records stance-changing user interventions in
an `## Interaction notes` section, and ends with a mandatory `Accept` / `Adjust`
gate — nothing advances until you accept the artifact.

### Workflow

Every artifact — foundation, design, or driver — is produced by the **same
authoring loop**: `/spec` resolves the target, seeds it from parked captures,
grills it against its rubric and the specification bar, writes it, runs the
read-only critics, gates on your `Accept`, then detects and deposits
cross-artifact material for whatever comes next.

```mermaid
flowchart LR
    R["request →<br/>resolve target"] --> S["inject seeds<br/>(pending captures)"]
    S --> G["grill against rubric<br/>· specification bar"]
    G --> W["write artifact"]
    W --> C["/audit + /consistency<br/>(parallel, read-only)"]
    C -->|findings| G
    C -->|clean| Q{"decision ledger →<br/>Accept · Adjust"}
    Q -->|Adjust| G
    Q -->|Accept| D["/detector →<br/>deposit captures"]
    D --> N["advance"]
```

Zooming out, that loop runs over a **layered sequence** — foundation before
design before drivers — and the `project.json` buffer couriers material both
ways: top-down **captures** seed downstream artifacts, and bottom-up **impacts**
from drivers re-validate the design tier (the cascade). Each box in the spine is
one run of the loop above.

```mermaid
flowchart TD
    U["user request"] --> SP["/spec · single door<br/>(engine runs workflow.md)"]
    SP --> FND["foundation<br/>config · charter · guidelines · personality"]
    FND --> DSG["design — optional<br/>stack · domain · arch · ux"]
    DSG --> DRV["drivers<br/>PRD → FEATs + ADRs (fan-out)"]
    DRV --> CODE["/code · implement a ready FEAT"]
    CODE --> CH["/challenge → REV"]
    CH -.->|iterate ≤3| CODE
    CODE -.->|stack-touching block| SP
    DRV -.->|change| PR["cascade → PR-NNN"]
    PR -.->|re-validate| FND
    BUF[("project.json buffer<br/>captures · impacts")]
    FND -.->|capture| BUF
    DRV -.->|impact| BUF
    BUF -.->|seeds · re-validate| DSG
```

### Skill index

**Doors**

- `/spec` — single door to `.spec/`. Reads the flow program (`workflow.md`) and
  runs each artifact's rubric through one universal authoring procedure;
  bootstraps, sequences, fans out, and cascades
- `/code` — implement a `ready` FEAT (delegates stack-touching blocks back to
  `/spec`, invokes `/challenge` after implementation)

**Artifacts `/spec` authors** (rubric bundles in `skills/spec/references/rubrics/`,
not skills)

- config → languages in `project.json` (the Config bootstrap step)
- charter · guidelines · personality → the foundation, in order
- stack · domain · arch · ux → optional design artifacts (domain also resolves
  inline when a PRD introduces a term)
- PRD → PRD + derived ADRs + FEATs (fan-out)
- change → cascade over an existing spec, recorded as a `PR-NNN`

**Critics** (forked, read-only; run by `/spec` at each gate; not user-invocable)

- `/audit` — structural invariants over `.spec/` artifacts
- `/consistency` — semantic critic: cross-section contradictions before the gate
- `/detector` — cross-artifact captures, deposited by `/spec` into `project.json`

**Helpers** (forked, single-shot; not user-invocable)

- `/clarify` — disambiguate the single most load-bearing polysemic term
- `/research` — single-perspective domain research
- `/summarize` — multi-source consolidation

**Review**

- `/challenge` — review an implemented FEAT → REV with classified findings; runs
  up to 3 remediation cycles with `/code`

**Standalone**

- `/ideate` — articulate a half-formed idea into a standalone concept whitepaper
  (a global `~/.ccosming/ideas/` vault or the project's `.ideas/`); explores the
  idea and its implementation options without specifying the product. `/spec` can
  seed a new project's foundation from a closed one. The ideation front door.
- `/grill` — (older, pending removal) interview to articulate a fuzzy idea before
  a PRD → `.spec/grills/`. User-invoked only. Reuses `/clarify`, `/research`,
  `/summarize`.

**Authoring & quality** (general utilities, not part of the spec flow)

- `/commit` — Conventional Commits with a secrets check and explicit approval
- `/merge` — Git merge with strategy selection and approval
- `/create-skill` — interactive guide to add a new skill to this repo
- `/prompt-craft` — compression discipline for LLM-targeted markdown
- `/humanizer` — strip AI-writing tells from prose
- `/coding-rules` — behavioral guidelines for code work

## Hooks

The hooks in `hooks/hooks.json` are all Python under `hooks/`:

| Script            | Events                                     | What it does                                                                                                                                                                                          |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inject.py`       | `SessionStart`                             | Emits the constitution plus, in a bootstrapped project, the live foundation (languages from `project.json` + the foundation files) into context — once per session.                                  |
| `format_spec.py`  | `PostToolUse` (`Write`/`Edit`/`MultiEdit`) | Normalizes any `.spec/*.md` just written — aligns GFM tables, wraps prose (keeping links and code spans atomic), normalizes blank lines — and leaves fenced code and YAML frontmatter verbatim.       |
| `metrics.py`      | `Stop`, `UserPromptSubmit`, `PostToolUse`, `SessionStart` | Folds the transcript into `project.json`'s `usage` section through the coordinator. Four triggers so a missed `Stop` — e.g. a turn ending on a pending question — never strands the ledger: `PostToolUse` keeps it live mid-grilling and bootstraps it in a from-scratch session, the next prompt or session start backstops the rest. |
| `project_file.py` | (library + CLI, not event-bound)           | Single-writer coordinator for `.spec/project.json`. Every hook and skill that mutates it goes through here — an `flock` plus read-modify-write keeps a metrics fire from clobbering a `/spec` capture deposit, and vice versa. Migrates the legacy split files on first touch. |

`.spec/project.json` is the per-project, accumulating non-artifact file:
languages, runtime `state` (`in_flight`, `next_suggested`, cross-artifact
`captures`), and the `usage` ledger (cost and time per artifact/skill/session,
look-back attributed; `updated_through` reports the last turn folded in).
Written only when the project already has a `.spec/` directory; the legacy
`config.yaml`/`state.yaml`/`usage.yaml`/`.usage-state.json` files are migrated
and removed. `/audit` skips it.

## Artifacts

The skills operate over artifacts that live in the **target project**. Numbered
artifacts follow `.spec/{type}s/{TYPE}-NNN-{slug}.md` with `id: {TYPE}-NNN` in
frontmatter; singletons live at `.spec/{name}.md`. The body `# H1` is the human
title — the code lives in `id` and the filename, never a `title:` field.

| Artifact         | Path                               | Description                                                                                                                                                   | Skills that use it                                                |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Project file** | `.spec/project.json`               | Generated non-artifact: languages (`language.chat`, `language.artifacts`), runtime `state` (in_flight, next_suggested, captures), and the `usage` ledger. Written only through the `project_file.py` coordinator. | `/spec` (languages + state via CLI), `metrics.py` (usage), all skills (read) |
| **Charter**      | `.spec/charter.md`                 | Project source of truth: problem, solution, domain, users, functional & non-functional requirements, success metrics, scope, constraints.                               | `/spec` → `charter` skill, `/code` + downstream (read)                 |
| **Guidelines**   | `.spec/guidelines.md`              | Transversal engineering practices. Stack-agnostic.                                                                                                            | `/spec` (guidelines rubric), downstream (read)              |
| **Personality**  | `.spec/personality.md`             | Agent persona `/code` embodies (seniority, decision bias, communication, priority).                                                                           | `/spec` (personality rubric), `/code` (read)                            |
| **Stack**        | `.spec/stack.md`                   | Living source of truth for runtimes, package/task tooling, code quality, git governance, dev environment, build/release, and configs. Archetype-gated, research-backed. Tracks `sync_status` against the actual repo. | `/spec` (stack rubric + sync), `/code` (read)            |
| **Domain**       | `.spec/domain.md`                  | **Optional**. Ubiquitous language (DDD): terms, bounded contexts, context map. Skills degrade gracefully when absent.                                         | `/spec` (domain rubric), downstream (read if exists)          |
| **Architecture** | `.spec/arch.md`                    | **Optional**. Technical architecture across C4 levels (stereotype-labeled flowcharts), boundaries, data, integrations, NFRs. Generates ADRs.                          | `/spec` (arch rubric), downstream (read if exists)             |
| **Experience**   | `.spec/ux.md`                      | **Optional**. Surface-agnostic experience: interaction loops + testable quality triples. Generates ADRs.                                                      | `/spec` (ux rubric), downstream (read if exists)                 |
| **PRD**          | `.spec/prds/PRD-NNN-{slug}.md`     | New capability definition (problem, users, metrics, scope, criteria).                                                                                         | `/spec` (prd rubric), `/code` + `/challenge` (read)                   |
| **ADR**          | `.spec/adrs/ADR-NNN-{slug}.md`     | Technical decision with a real trade-off (reduced Nygard format).                                                                                             | `/spec` (adr rubric, fan-out), `/code` (read)                 |
| **FEAT**         | `.spec/feats/FEAT-NNN-{slug}.md`   | Implementable unit (scope, rules, criteria, plan, dependencies).                                                                                              | `/spec` (feat rubric), `/code` (writes plan/status), `/challenge` (reads) |
| **REV**          | `.spec/reviews/REV-NNN-{slug}.md`  | Code review with classified findings (blocker/major/minor/nit) and iterations.                                                                                | `challenge` (writes), `code` (reads in review mode)               |
| **PR**           | `.spec/prs/PR-NNN-{slug}.md`       | Immutable change request (`locked`) with cascade analysis.                                                                                                    | `/spec` (change flow, writes)                                                     |
| **GRILL**        | `.spec/grills/GRILL-NNN-{slug}.md` | Standalone interview notes (discovery/technical/full).                                                                                                        | `grill` (writes)                                                  |

## Conventions

Plugin-wide rules every skill enforces and `/audit` validates. They are the
constitution — projects inherit them by default.

### Status flow

- `draft` → `ready`: artifact complete and ready for the next consumer.
- `ready` → `in-progress`: a skill picked it up (FEAT during `/code`).
- `in-progress` → `done`: terminal success.
- `in-progress` → `locked`: terminal immutable (PR only).
- any state → `deprecated`: superseded by a newer artifact, kept for history.

### Versioning (SemVer)

Every artifact carries `version: X.Y.Z`. Born at `0.1.0`; never decreases.

- **MAJOR**: contract break — criterion removed/redefined, ADR replaced, scope
  inverted.
- **MINOR**: compatible addition — new section, criterion, or linked artifact.
- **PATCH**: clarification, wording, metadata refresh.
- **Promotion to `1.0.0`**: first transition to a terminal state
  (`done`/`locked`).

### Confirmation gate

No artifact is final until you accept it. After writing one, the skill
summarizes what was captured and asks `Accept` / `Adjust`. Nothing advances — no
next stage, no chaining — until you accept. On `Adjust`, the skill revises the
named part and re-confirms.

### Localization

Skills read the languages from `.spec/project.json` and apply:

- **`language.chat`** — all user-facing prose (questions, summaries,
  confirmations).
- **`language.artifacts`** — user-generated content written into artifacts.
- **Structure stays English** — frontmatter keys, `## Section` headers, table
  headers, status/enum values. Never translated.
- **Neutral register always** — no regional idioms; Spanish uses
  `tú`/impersonal, never voseo.

Supported languages: `en`, `es`. `/spec` recommends the detected system
language.

### Markdown & diagrams

- One `# H1` per artifact: the human title, **without** the artifact code.
- Diagrams follow `references/diagrams.md` — `flowchart`/`graph` with **no theme
  or init block** (default Mermaid rendering), no custom colors. Architecture
  views render the C4 levels as stereotype-labeled flowcharts.
- Line wrapping, table alignment, and blank-line spacing are the formatter's job
  (the `PostToolUse` hook) — write valid Markdown and let it normalize.

### Frontmatter shape

No `title:` field — the human title is the body `# H1`. Required fields per
type:

| Type                                             | Required fields                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| Foundation (charter / guidelines / personality)  | `id`, `status`, `version`, `prs`                                         |
| Domain                                           | `id`, `status`, `version`, `prs`                                         |
| Architecture                                     | `id`, `status`, `version`, `prs`, `adrs`                                 |
| Experience                                       | `id`, `status`, `version`, `prs`, `adrs`, `surfaces`                     |
| Stack                                            | `doc`, `status`, `sync_status`, `version`, `archetype`, `last_verified`, `adrs`, `sources` |
| PRD                                              | `id`, `status`, `version`, `prs`, `adrs`, `feats`                        |
| ADR                                              | `id`, `status`, `version`, `prs`, `prds`, `feats`                        |
| FEAT                                             | `id`, `status`, `version`, `prs`, `reviews`, `prd`, `adrs`, `depends_on` |
| REV                                              | `id`, `status`, `version`, `target`, `iterations`, `verdict`             |
| PR                                               | `id`, `status`, `version`, `target`, `affects`                           |
| GRILL                                            | `id`, `doc`, `status`, `profile`, `topic`, `lenses`, `open_questions`    |

Every artifact ends with a `## Changelog` section (one row per version bump,
stating the **why**); an `## Interaction notes` section sits just above it when
a user intervention shaped the artifact.

## Project structure

```text
.claude-plugin/      Plugin + marketplace manifests
hooks/               Session/format/metrics hooks (Python) + hooks.json
references/          backbone: constitution · artifact-model · specification-bar · authoring-procedure · grilling-engine · diagrams
skills/<name>/       One folder per skill: SKILL.md (+ references/, scripts/)
skills/spec/references/  workflow.md (flow program) · rubrics/
```

See [CLAUDE.md](CLAUDE.md) for the maintainer guide (skill authoring
conventions, frontmatter reference, the description-field formula,
anti-patterns).

## Contributing

Use `/create-skill` to scaffold a new skill, then follow the checklists in
[CLAUDE.md](CLAUDE.md). Commits go through `/commit` (Conventional Commits,
secrets check, explicit approval).

## License

MIT
