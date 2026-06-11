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
`/summarize`), the reviewer (`/challenge`), and the standalone `/grill`. A delegate
does its job, reports, and returns — sequencing belongs to the door. (A third door,
`/issue` for symptom triage, is defined in the constitution but not yet
implemented.)

`/spec` authors every artifact through a shared **grilling engine**: a
dimension-coverage loop run against the artifact's rubric bundle. It scales depth
by materiality (challenging contested, irreversible, or high-blast-radius
decisions; confirming trivial ones), records stance-changing user interventions in
an `## Interaction notes` section, and ends with a mandatory `Accept` / `Adjust`
gate — nothing advances until you accept the artifact.

### Workflow

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#ebebeb','primaryBorderColor':'#686868','primaryTextColor':'#101010','lineColor':'#686868','secondaryColor':'#cccccc','tertiaryColor':'#a9a9a9','clusterBkg':'#cccccc','clusterBorder':'#525252','edgeLabelBackground':'#ebebeb'}}}%%
flowchart TD
    subgraph Spec["/spec — single door · runs each artifact's rubric"]
        Config["config.yaml"]
        Found["charter · guidelines · personality<br/>(foundation)"]
        Opt["stack · domain · arch · ux<br/>(optional)"]
        PRD["PRD → ADRs + FEATs"]
        Config --> Found --> Opt --> PRD
    end
    Code["/code<br/>implement a ready FEAT"]
    Challenge["/challenge<br/>review → REV"]
    Change["change flow · cascade<br/>→ PR-NNN"]

    PRD --> Code
    Code -.->|stack-touching block| Spec
    Code --> Challenge
    Challenge -.->|iterate up to 3| Code
    Spec -.->|change on existing spec| Change
    Change -.-> Spec
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

- config → `config.yaml` (languages; the Config bootstrap step)
- charter · guidelines · personality → the foundation, in order
- stack · domain · arch · ux → optional design artifacts (domain also resolves
  inline when a PRD introduces a term)
- PRD → PRD + derived ADRs + FEATs (fan-out)
- change → cascade over an existing spec, recorded as a `PR-NNN`

**Critics** (forked, read-only; run by `/spec` at each gate; not user-invocable)

- `/audit` — structural invariants over `.spec/` artifacts
- `/consistency` — semantic critic: cross-section contradictions before the gate
- `/detector` — cross-artifact captures, deposited by `/spec` into `state.yaml`

**Helpers** (forked, single-shot; not user-invocable)

- `/clarify` — disambiguate the single most load-bearing polysemic term
- `/research` — single-perspective domain research
- `/summarize` — multi-source consolidation

**Review**

- `/challenge` — review an implemented FEAT → REV with classified findings; runs
  up to 3 remediation cycles with `/code`

**Standalone**

- `/grill` — interview to articulate a fuzzy idea before a PRD →
  `.spec/grills/`. User-invoked only; nothing else calls it. Reuses `/clarify`,
  `/research`, `/summarize`.

**Authoring & quality** (general utilities, not part of the spec flow)

- `/commit` — Conventional Commits with a secrets check and explicit approval
- `/merge` — Git merge with strategy selection and approval
- `/create-skill` — interactive guide to add a new skill to this repo
- `/prompt-craft` — compression discipline for LLM-targeted markdown
- `/humanizer` — strip AI-writing tells from prose
- `/coding-rules` — behavioral guidelines for code work

## Hooks

The hooks in `hooks/hooks.json` are all Python under `hooks/`:

| Script           | Events                                     | What it does                                                                                                                                                                                          |
| ---------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inject.py`      | `SessionStart`                             | Emits the constitution plus, in a bootstrapped project, the live foundation into context — once per session, so skills do not re-read these files each run.                                           |
| `format_spec.py` | `PostToolUse` (`Write`/`Edit`/`MultiEdit`) | Normalizes any `.spec/*.md` just written — aligns GFM tables, wraps prose (keeping links and code spans atomic), normalizes blank lines — and leaves fenced code and YAML frontmatter verbatim.       |
| `metrics.py`     | `Stop`, `UserPromptSubmit`, `PostToolUse`, `SessionStart` | Updates the project's live cost-and-time ledger (`.spec/usage.md`). Four triggers so a missed `Stop` — e.g. a turn ending on a pending question — never strands the ledger: `PostToolUse` keeps it live mid-grilling and bootstraps it in a from-scratch session, the next prompt or session start backstops the rest. |

`.spec/usage.md` is a per-project, accumulating ledger: cost per `.spec/`
artifact (the five token categories + cache hit, plus tool calls, user prompts,
assistant turns), a time ledger per artifact (effective work vs. human wait vs.
real wall-clock), a per-skill breakdown, and a per-session log. It is parsed
incrementally; `Updated through` reports the last turn folded in, so a stale
ledger shows itself. Written only when the project already has a `.spec/`
directory. Like `config.yaml`, it is a generated non-artifact — `/audit` and the
formatter skip it.

## Artifacts

The skills operate over artifacts that live in the **target project**. Numbered
artifacts follow `.spec/{type}s/{TYPE}-NNN-{slug}.md` with `id: {TYPE}-NNN` in
frontmatter; singletons live at `.spec/{name}.md`. The body `# H1` is the human
title — the code lives in `id` and the filename, never a `title:` field.

| Artifact         | Path                               | Description                                                                                                                                                   | Skills that use it                                                |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Config**       | `.spec/config.yaml`                | Language preferences (`language.chat`, `language.artifacts`). Generated non-artifact — drives localization everywhere.                                        | `/spec` (Config step), all skills (read via foundation)      |
| **Usage ledger** | `.spec/usage.md`                   | Generated, accumulating cost-and-time ledger per artifact/skill/session. Written by the metrics hook (`Stop`/`UserPromptSubmit`/`PostToolUse`/`SessionStart`), not a skill. | `metrics.py` hook (writes)                                        |
| **Charter**      | `.spec/charter.md`                 | Project source of truth: problem, solution, domain, users, functional & non-functional requirements, success metrics, scope, constraints.                               | `/spec` (charter rubric), `/code` + downstream (read)                 |
| **Guidelines**   | `.spec/guidelines.md`              | Transversal engineering practices. Stack-agnostic.                                                                                                            | `/spec` (guidelines rubric), downstream (read)              |
| **Personality**  | `.spec/personality.md`             | Agent persona `/code` embodies (seniority, decision bias, communication, priority).                                                                           | `/spec` (personality rubric), `/code` (read)                            |
| **Stack**        | `.spec/stack.md`                   | Living source of truth for languages, monorepo, devtools, configs. Tracks `sync_status` against the actual repo.                                              | `/spec` (stack rubric + sync), `/code` (read)            |
| **Domain**       | `.spec/domain.md`                  | **Optional**. Ubiquitous language (DDD): terms, bounded contexts, context map. Skills degrade gracefully when absent.                                         | `/spec` (domain rubric), downstream (read if exists)          |
| **Architecture** | `.spec/arch.md`                    | **Optional**. Technical architecture across C4 levels (monochrome flowcharts), boundaries, data, integrations, NFRs. Generates ADRs.                          | `/spec` (arch rubric), downstream (read if exists)             |
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

Skills read `.spec/config.yaml` and apply:

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
- Diagrams use the minimalist Mermaid style from `references/diagrams.md` —
  `flowchart`/`graph` with `theme: neutral`, no custom colors. Architecture
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
| Stack                                            | `doc`, `status`, `sync_status`, `version`, `last_verified`, `adrs`       |
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
references/          constitution.md · artifact-model.md · diagrams.md
skills/<name>/       One folder per skill: SKILL.md (+ references/, scripts/)
skills/spec/references/  workflow.md (flow program) · grilling-engine.md · rubrics/
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
