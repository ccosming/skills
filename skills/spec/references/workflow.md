# Workflow

This file is the **single source of the .spec flow rules** — the order artifacts
are built in, what each depends on, what changes ripple into what, and when one
artifact's material is parked for another. It does **not** hold the craft of
authoring any artifact (that is the rubric) nor the voice rules (the
constitution). It is the *program*; `/spec` is the *engine* that runs it.

The model has three parts:

- **Engine** — `/spec` reads this file and `.spec/project.json`, then acts.
- **Program** — this file: the flow rules, versioned, in one place.
- **Memory** — `.spec/project.json` (`state` section): the per-project runtime
  state. Written only through the coordinator (`hooks/project_file.py`), never
  by hand — see _project.json — runtime memory_.

Authoring artifacts are driven by a **rubric bundle**, not by bespoke
per-artifact logic — each (persona + dimensions + seeds + template + invariants)
is run by `/spec` through the *universal authoring procedure*
(`../../../references/authoring-procedure.md`). A rubric lives either inline
(`skills/spec/references/rubrics/<name>.md`) or inside the artifact's own **stage
skill** (`skills/<name>/references/`); when it is owned by a stage skill, `/spec`
dispatches the grilling there — same artifact, same gates. The operations that are always their own skill are those that are not
"author one artifact from one rubric": `/code` (writes source), and the read-only
critics (`/audit`, `/consistency`, `/detector`).

## Artifact registry

The nodes of the flow.

| Artifact    | Authored by                  | Rubric          | Tier        | Versioned |
| ----------- | ---------------------------- | --------------- | ----------- | --------- |
| config      | `/spec` (inline, bootstrap 1)| —               | static      | no        |
| charter     | `charter` skill              | `skills/charter`| anchor      | yes       |
| guidelines  | `guidelines` skill           | `skills/guidelines` | calibration | yes   |
| personality | `personality` skill          | `skills/personality`| calibration | yes   |
| stack       | `stack` skill                | `skills/stack`      | accretive   | yes   |
| domain      | `domain` skill               | `skills/domain`     | accretive   | yes   |
| arch        | `arch` skill                 | `skills/arch`       | accretive   | yes   |
| ux          | `ux` skill                   | `skills/ux`         | accretive   | yes   |
| PRD         | `prd` skill                  | `skills/prd`        | driver      | yes   |
| FEAT        | `feat` skill (fan-out)       | `skills/feat`       | driver      | yes   |
| ADR         | `adr` skill (fan-out)        | `skills/adr`        | record      | yes   |

`/code` consumes the registry and writes source; it never authors a `.spec`
artifact.

## Reactivity tiers

How an artifact evolves after it is born:

- **static** — set once, effectively never changes (config).
- **anchor** — the most stable. Changes rarely and deliberately. Its constraints
  and NFRs bound every other artifact (charter).
- **calibration** — born early, then *recalibrated* when a dependency lands
  (guidelines recalibrates when stack is defined; personality is the least
  reactive — it tracks the charter).
- **accretive** — grows as drivers reveal detail (stack, domain, arch, ux).
- **driver** — created on demand per capability; the *source* of bottom-up
  impacts on the accretive tier (PRD, FEAT).
- **record** — a decision log entry, immutable once written; superseded, never
  edited (ADR).

## The universal authoring procedure

`/spec` runs one identical loop for any rubric-backed artifact — the rubric is the
only thing that varies. The loop and its cross-cutting steps (resolve prerequisites
→ existence/mode → load rubric → inject seeds → grill → write → critique → gate →
detect/deposit → advance) live in `../../../references/authoring-procedure.md`. The
flow tables that procedure consults — the registry above, _Dependencies_, the
bootstrap sequence, the impact graph, _Writing it_ — are this file's job; the craft
of each artifact is the rubric's. Where an artifact's rubric is not yet in place,
`/spec` dispatches to its owning skill instead — same artifact, same gates.

## Tracks

After the foundation is complete, `/spec` classifies the project into one of two
**tracks** and records it in `project.json` (`state.category`). The track decides
how the design artifacts (stack, domain, arch, ux) come into being.

- **full** — design upfront. After the foundation, author stack / domain / arch /
  ux, then PRDs. The PRD's design prerequisites bind (each waivable). This is also
  the behavior for any project whose `category` is unset.
- **lean** — drivers first. After the foundation, go straight to PRDs. The design
  artifacts are **not** prerequisites; each is born **slice-incremental** the first
  time a PRD or FEAT needs material it owns (_On-demand orthogonals_), then accretes.

**Categorizing.** At foundation-complete, `/spec` dispatches the `categorizer`
(forked; a deterministic checklist over `charter.md`):

```
Skill(skill="categorizer", args="charter_path: .spec/charter.md")
```

It returns a track + the signals that drove it. `/spec` presents the verdict and the
user confirms or switches with one `AskUserQuestion` (**Accept <track>** | **Use
<other track>**), then records it — `<the coordinator> --project <root> set-category
<track>`. The categorizer never writes; `/spec` persists the confirmed track.

**Migration.** A project whose `project.json` has no `state.category` (anything
bootstrapped before tracks existed) is treated as **full** — its flow is unchanged.
The categorizer runs only for a new project at foundation-complete, or on demand
when the user asks to re-evaluate.

## Definition flow (top-down)

### Bootstrap sequence

`/spec` owns this order. Advance only after the user **accepts** the current
artifact. Drive it silently — the next stage's first question is the transition.

1. **config** — capture languages → `project.json` `language` section (see
   _Procedural orchestration → Config_).
2. **ideation fork** — on a fresh project, before the charter, offer a head start
   (see _Procedural orchestration → Ideation entry_): seed the foundation from an
   existing `/ideate` whitepaper, run an ideation session now, or go straight to
   the charter. Captures it produces seed the charter and downstream foundation.
3. **charter** — what the system is.
4. **guidelines** — engineering conventions.
5. **personality** — the implementer's persona.
6. **Foundation complete → categorize.** Dispatch the `categorizer` (forked) over
   the charter and confirm the track with the user (_Tracks_); record it via
   `set-category`.
7. **Branch on the track** (_Tracks_):
   - **full** — offer the design stages (stack, domain, arch, ux), then PRD. They
     are not silently skippable; a PRD's design prerequisites bind, each waivable
     with a reason (_Dependencies_).
   - **lean** — go straight to PRD. The design artifacts are built slice-incremental
     on demand (_On-demand orthogonals_), never upfront.

Skip any stage whose file already exists; resume at the first gap.

### Dependencies

Foundation = config + charter + guidelines + personality.

| Target      | Requires (block, route there first)           | Recommends (note, don't block) |
| ----------- | --------------------------------------------- | ------------------------------ |
| charter     | config                                        | —                              |
| guidelines  | config + charter                              | —                              |
| personality | config + charter + guidelines                 | —                              |
| domain      | foundation                                    | —                              |
| arch        | foundation                                    | —                              |
| ux          | foundation                                    | —                              |
| stack       | foundation                                    | arch                           |
| PRD (full)  | foundation + domain, arch, ux (each waivable) | stack                          |
| PRD (lean)  | foundation                                    | —                              |
| cascade     | target PRD exists and is not `in-progress`    | —                              |

A missing hard prerequisite routes there first. The PRD row depends on the track
(_Tracks_): in **full**, its design prerequisites (domain, arch, ux) block — each
**waivable at the gate with a one-line reason** (recorded in the PRD's interaction
notes), never skipped silently (a headless library waives `ux`, a CRUD tool rarely
waives `domain`); in **lean**, they do not block — the orthogonal artifacts are born
slice-incremental as the PRD/FEAT reveals their material (_On-demand orthogonals_).
A missing recommendation is surfaced once and the user decides.

### Gates

A **gate** is a pause where the engine waits for the user — one after every
artifact (post-critique), with three outcomes: **Accept & continue** advances;
**Accept & pause** locks the artifact and stops at a clean commit point (resume
via the recorded `next_suggested`); **Adjust** loops. On the continue path, never
announce the transition between bootstrap stages.

## Fan-out (PRD → FEATs + ADRs)

A PRD is not a bespoke procedure — it is the universal loop plus orchestration:

1. Author the **PRD** via the universal loop. Its template yields a
   **decomposition**: the FEATs to spawn and the contested decisions that warrant
   ADRs.
2. **Draft the children in parallel — do not re-grill each one.** The PRD already
   decided their shape, so for each listed FEAT and each contested decision, `/spec`
   writes the PRD plus that one decomposition item to a **per-child** temp input file
   and dispatches a forked drafter — `Skill(skill="drafting", args="artifact:
   feat|adr; input: <that path>; output: <FEAT/ADR path>; language:
   <language.artifacts>")` — collecting the returned bodies. The drafters are
   independent and their heavy templates never enter `/spec`'s context. A decision
   without a genuine alternative gets a changelog row, not an ADR.
3. Write the drafted bodies, run the critics over them, and present them at **one
   confirmation gate**. An adjusted child re-grills via its stage skill (the
   `feat`/`adr` dimensions); an accepted set advances.

The PRD's `derives-from:` links each FEAT/ADR back to the originating capability.

## Evolution flow (bottom-up) — the cascade

The accretive artifacts are nourished as drivers reveal detail, and existing
artifacts are revised through the **cascade**. Both run on the **impact graph**.
The rule is **detect and propose, never auto-execute**: the engine deposits
`pending` impacts into `project.json` (via the coordinator); each update runs
through the universal loop's gate.

### Impact graph

When the **source** is accepted or changed, the **impacted** artifacts may be
stale and a re-validation is proposed.

| Source change                  | Impacted                                   | Effect                                  |
| ------------------------------ | ------------------------------------------ | --------------------------------------- |
| charter constraints / NFRs     | domain, arch, stack, ux, guidelines, pers. | re-validate against the new bounds      |
| stack defined / changed        | guidelines                                 | recalibrate language/tooling conventions|
| arch changed                   | stack, ux                                  | re-validate tooling and renderability   |
| PRD/FEAT — new domain term     | domain                                     | add bounded context / term              |
| PRD/FEAT — boundary decision   | arch (+ ADR)                               | add component / decision                |
| PRD/FEAT — new dependency      | stack (+ ADR)                              | add dependency                          |
| PRD/FEAT — user-facing surface | ux                                         | add flow / interaction                  |

### Cascade procedure (change to an existing PRD)

1. Grill the change with the `change` rubric: what changes, why now, assumed cost.
2. Traverse the impact graph from the target. For each impacted artifact, propose:
   reopen `done` FEATs, supersede affected ADRs (records are immutable — write a
   new one), update accretive artifacts in `update` mode.
3. Record a `PR-NNN` capturing the change and its cascade.

A `locked` artifact is immutable; an `in-progress` PRD blocks the cascade until it
settles.

## Cross-artifact triggers

Two trigger types both deposit `pending` entries in `project.json`. They differ
by *when* they fire:

- **Capture (conversational bleed)** — mid-grill, the user gives material that
  belongs to another artifact. Park it; keep grilling the current one.
- **Impact (committed ripple)** — an accepted change makes another artifact
  potentially stale (the impact graph above).

| During         | Signal surfaced                  | Capture for | Direction  |
| -------------- | -------------------------------- | ----------- | ---------- |
| charter        | rich domain detail               | domain      | top-down   |
| charter        | technical convention preference  | guidelines  | top-down   |
| charter        | tone / voice preference          | personality | top-down   |
| charter        | tooling / tech mention           | stack       | top-down   |
| charter        | experience / flow mention        | ux          | top-down   |
| PRD, cascade   | new ubiquitous term              | domain      | bottom-up  |
| PRD, cascade   | component / boundary decision    | arch        | bottom-up  |
| PRD, cascade   | new dependency / tech            | stack       | bottom-up  |
| PRD, cascade   | user-facing surface              | ux          | bottom-up  |

## On-demand orthogonals (lean track)

In the **lean** track the design artifacts (stack, domain, arch, ux) are not built
upfront. Each is born the first time a PRD or FEAT needs material it owns, then
accretes — bottom-up, one slice at a time.

When PRD/FEAT grilling surfaces material an orthogonal artifact owns — a domain term,
an arch boundary, a UX surface, a stack dependency — the stage skill **parks** it as
usual (grilling engine, _Branching_), and `/spec`'s detector deposits it as a pending
capture (the _Cross-artifact triggers_ rows, bottom-up). On the **lean** track `/spec`
does not leave it pending: right after the driving artifact's gate it realizes each
orthogonal capture by dispatching the owning stage skill in **`slice` mode**
(stage-contract) — creating the artifact born `ready` (seeded by the slice) if absent,
or extending it if present, bar applied to the slice only, no full-dimension grilling
and no separate gate. (On the **full** track those captures simply stay pending and
feed each design artifact's later full authoring.)

`/code` requires `stack`. If a FEAT reaches implementation while `stack` is still
absent, `/code` stops and routes to `/spec`, which creates a minimal stack (a slice
or focused pass for what the FEAT builds) before `/code` resumes — `/code` never
authors `stack` itself.

A lean artifact grows exactly as the drivers demand and no more. To switch a lean
project to upfront design, re-run the categorizer or author the design artifacts
directly — they are the same artifacts, only built sooner.

## project.json — runtime memory

`.spec/project.json` is the single non-artifact file: languages, runtime state,
and the usage ledger. Its `state` section holds **only what the filesystem
cannot tell you** — which artifacts exist is derived from `ls`, never duplicated
here.

**One writer.** `project.json` is written only through the coordinator
(`hooks/project_file.py`) — the metrics hook writes `usage`; `/spec` writes
`language` and `state` via the coordinator's CLI. `/spec` **reads** the file
directly (cold start) but **never writes it by hand**: a hand write from stale
context would clobber the hook's `usage` section.

### Shape (the `state` section)

```json
{
  "state": {
    "category": "lean",
    "in_flight": "charter",
    "next_suggested": "domain",
    "captures": [
      {
        "for": "domain",
        "from": "charter",
        "kind": "capture",
        "seed": "Two-sided marketplace; subdomains hinted: matching (core), payments (generic).",
        "status": "pending"
      }
    ]
  }
}
```

`kind` is `capture | impact`; `status` is `pending | consumed | dropped`. `category`
is `lean | full` (absent ⇒ treated as `full` — see _Tracks_).

### Writing it

Every write uses **the coordinator** (SKILL.md, _Plugin scripts_). Keep each call
a **single static command** so the standing `Bash(python3 …/project_file.py *)`
permission matches it and it runs without a prompt: the absolute coordinator path
(already resolved in SKILL.md), the project's **absolute root** as `--project`
(never `.` — the shell's cwd is not guaranteed to be the project, and an absolute
root needs no `cd`), and **no** `$(…)` substitution, shell variables, `cd`, `rm`,
or `echo`. A temp-file + `"$(cat …)"` deposit defeats the permission and prompts
every time.

| Need | Command |
| --- | --- |
| Set languages | `<the coordinator> --project <root> set-language <chat> <artifacts>` |
| Set `in_flight` / `next_suggested` | `<the coordinator> --project <root> set-state <key> <value>` |
| Set the track | `<the coordinator> --project <root> set-category <track>` (`lean` or `full`) |
| Deposit one capture | `<the coordinator> --project <root> add-capture '<json>'` |
| Deposit a batch (preferred) | write the array to `~/.ccosming/spec-inbox/<artifact>-captures.json` (resolve `~` to an absolute path at runtime — the dir is pre-approved for `Write`, never `.spec/`), then `<the coordinator> --project <root> add-captures-file <that path>` — the coordinator deletes the file after a successful deposit |
| Mark a seed consumed/dropped | `<the coordinator> --project <root> update-capture "<seed substring>" <status>` |

### Lifecycle

Every entry is `pending → consumed | dropped`. The moment an artifact bakes a seed
in, mark it `consumed`. If the user declines it, mark `dropped`. A `pending` entry
never expires silently.

### Authority

The artifact always wins. The `state` section is a courier between artifacts,
never a source of truth. If an entry would contradict an accepted artifact, it is
already stale — drop it.

### Cold start

At session start `/spec` reads `project.json`, tells the user where they left off
(`in_flight`, pending items), and proposes `next_suggested`. The user does not
have to remember which artifact is missing.

## Procedural orchestration

Beyond authoring, `/spec` runs these per-artifact procedures, folded in from the
former skills.

### Config

The first bootstrap step — `/spec` sets the languages in `project.json` through
the coordinator (`language` is not a versioned artifact: no frontmatter, no
changelog, no `/audit`).

1. **Pre-flight.** Create `.spec/` if absent (`mkdir -p .spec`). Read the current
   languages: `<the coordinator> --project . get language` (SKILL.md, _Plugin
   scripts_). If they are already set (not the `en`/`en` default with no project
   bootstrapped) → `AskUserQuestion`: **Keep current** (Recommended) |
   **Regenerate**; on Keep, report the languages and stop.
2. **Resolve the language.** The resolved language is the user's request language
   when the invocation carried clear prose; otherwise the detected system locale;
   otherwise `en`. Detect the locale verbatim:

   ```bash
   SYS_LANG=$(defaults read -g AppleLanguages 2>/dev/null | grep -m1 -oE '"[a-z]{2,3}' | tr -d '"'); SYS_LANG=${SYS_LANG:-${LANG%%_*}}; SYS_LANG=${SYS_LANG:-en}; case "$SYS_LANG" in es|en) ;; *) SYS_LANG=en ;; esac; echo "$SYS_LANG"
   ```

3. **Ask once.** A single `AskUserQuestion` carrying both `language.chat` (`en` |
   `es`) and `language.artifacts` (`en` | `es`); Recommended = the resolved
   language for both.
4. **Set the languages** through **the coordinator**:

   ```bash
   <the coordinator> --project . set-language <chat> <artifacts>
   ```

5. **Offer the environment setup (consent, once).** Three opt-in integrations
   that adapt the consumer project to the plugin, all idempotent and merged
   without clobbering the user's files. Preview them dry with **the setup
   script** (SKILL.md, _Plugin scripts_):

   ```bash
   <the setup script> --project . --dry-run
   ```

   Present the preview in prose — **permissions** (read the plugin and invoke
   its skills without per-call prompts), **markdownlint** (a root
   `.markdownlint.json` so a markdownlint editor stops false-flagging generated
   `.spec/` tables; its other rules stay on project-wide), and **prettier**
   (ignore `.spec/`, only when the project already uses prettier) — then
   `AskUserQuestion`: **Configure (Recommended)** | **Skip**. On Configure,
   re-run without `--dry-run` and report what was added and any pre-existing
   setting it left untouched. On Skip, continue — the harness then prompts per
   read/skill, and a markdownlint editor flags generated tables. Run a subset
   with `--only permissions,markdownlint,prettier`.

Only `en` and `es` are supported; anything else falls back to `en`. To change
languages later, re-run `/spec` or use `project_file.py set-language`.

### Ideation entry

On a **fresh** project (no foundation), after config and before the charter,
offer a head start. `AskUserQuestion`:

- **Seed from an existing idea** — only when closed `/ideate` whitepapers exist.
  List them from the user's vault and the project, reading their frontmatter
  `status`:

  ```bash
  ls ~/.ccosming/ideas/*.md .ideas/*.md 2>/dev/null
  ```

  Show the `closed` ones (topic + path) and let the user pick one or more (or
  none). **The user selects** — never read the vault to seed on your own
  (constitution, _Data boundary_).
- **Ideate now** — invoke `/ideate` (`Skill(skill="ideate")`); it asks where to
  save (the global vault is recommended, even here) and inherits the languages.
  When it closes, continue here.
- **Straight to the charter** — skip ideation; start the charter cold.

For each selected (or just-closed) whitepaper, seed the foundation: invoke
`/detector` forked over it, write the returned captures to
`~/.ccosming/spec-inbox/ideate-captures.json` (resolve `~` at runtime), then
deposit from it through **the coordinator** (_Writing it_):

```
Skill(skill="detector", args="source_artifact: <whitepaper path>; from: ideate")
<the coordinator> --project <root> add-captures-file ~/.ccosming/spec-inbox/ideate-captures.json
```

The captures land `pending` for charter/domain/personality/stack/arch/ux
(foundation + design only — never PRD/FEAT). Then proceed to the charter, now
seeded: step 4 of the universal procedure surfaces them. A whitepaper seeds
**hypotheses**; the bar, critics, and gate still rule — nothing is auto-baked.

### Stack

- **Modes:** `bootstrap` (first time) · `update` (add/bump/restructure) ·
  `sync-check` (drift between stack.md and the repo) · `delegated` (a `/code`
  block touches stack-managed surface).
- **Bootstrap is archetype-first and research-backed** (`stack.md`, _Method_):
  pick the archetype from the charter, load its column from `stack-archetypes.md`
  to gate the dimensions, read `arch` for the concrete tools it implies, and run
  scoped `/research` (default-on) for current versions and pertinent base images
  before proposing each `core` dimension.
- **Managed surface** — `/code` delegates any change to these, never edits them
  directly: `package.json`/manifests, lockfiles, `tsconfig`, linter/formatter/test
  configs and their plugin sets, git-hook configs (lefthook/husky/pre-commit),
  monorepo/task-runner configs, version-manager files (`.mise.toml`/`.tool-versions`),
  `docker-compose`/devcontainer files, framework/build/CI configs, the top-level
  folder skeleton, editor/repo config. **Not** stack territory: feature code, its
  tests, FEAT-specific migrations.
- **Contested choice → ADR.** For each tool choice with a genuine alternative,
  author an ADR through the universal loop with the `adr` rubric (the same
  procedure as the PRD _Fan-out_), and link it in `stack.md`'s `adrs:`. A choice
  with no genuine alternative gets only a changelog row.
- After any write: bump SemVer, run sync verification, set `sync_status` +
  `last_verified`.

### Domain

- **Term triage** (the `terms` dimension): scan `charter.md`, PRDs, and FEATs for
  candidates (repeated nouns, capitalized phrases, compounds) and pre-fill.
- **Delegated lookup:** while authoring a PRD, a candidate term is checked against
  `domain.md` (exact / near / none) and the user decides add | reuse | reject —
  one term per turn. This is the bottom-up `new ubiquitous term → domain` trigger,
  resolved inline.
- Term names keep the language they were coined in. Renames flag references; the
  rewrite across artifacts is the cascade's job, not domain's.

## Extending the workflow

To add an artifact, gate, or trigger: add its row to the registry, its edges to
the dependency table and impact graph, and any trigger rows — here, in one file.
A new rubric-backed artifact also needs its **stage skill** under `skills/<name>/`
— a thin SKILL.md following the stage contract, with its dimensions rubric and
template in `references/`; that craft is not centralizable. The cross-cutting
wrapper (prerequisites, critique, gate, detect, advance) and the drafter are
shared, so a new stage adds no orchestration here beyond its registry row and
edges.
