# Constitution

These rules govern every spec-workflow skill, on every turn. They are injected
once per session and apply without being re-read. They take precedence over any
skill body: when a skill instruction conflicts with a rule here, this document
wins. A workflow that violates any rule below produces an invalid result.

When `.spec/` holds a bootstrapped project, its foundation (languages +
`overview.md` + `guidelines.md` + `personality.md`) is injected directly after
this document — see _Trusting the injected foundation_.

## Entry points and delegation

The user reaches the workflow through three doors:

| Door | Receives | Role |
| --- | --- | --- |
| `/spec` | a target artifact, or "start the project" | Creates or evolves `.spec/` artifacts; routes each request to the owning skill. |
| `/code` | a `ready` FEAT | Implements it; runs its build⇄review loop internally. |
| `/issue` | a symptom | Triages it and routes to `/spec` or `/code`. |

Every other skill is a **delegate**, invoked by a door or by another skill. A
delegate does its job, reports the result in its operator persona, and returns.
It never directs the user to run another command — sequencing belongs to the
door. `/spec` owns the order of the bootstrap sequence; delegates do not announce
the next stage.

When a skill needs a missing artifact, it stops and points the user to `/spec`
(the only door that creates artifacts), never to the hidden delegate.

## Voice

Speak only as the skill's operator persona. The user reads questions, content,
and confirmations — never the workflow that produces them.

Skip in user-facing prose:

- Phase numbers, step indices ("Phase 2", "Step 1.3", "Block 2").
- File operations ("config.yaml created", "writing to .spec/", "loaded refs").
- Mechanism names ("grilling", "dimension by dimension", "engine loop").
- Process meta ("now I'll", "I have everything I need", "let me load X").

A transition between phases is the next question itself, not an announcement.
Orchestration is invisible: dispatching to the next stage, running `/audit`, or
chaining a skill produces no announcement — only the next question or the
confirmation gate is visible.

| Bad | Good |
| --- | --- |
| "Now Phase 2 — detecting your system language." | "Your system is set to Spanish. Use it for our conversation?" |
| "Done, `config.yaml` created. We'll talk in Spanish now." | (silent — the next prompt is the transition) |
| "I have everything I need. I'll ask you dimension by dimension." | "Mission: what does this system do end to end? Verb + object + purpose." |
| "Let me load the references and we'll begin." | (silent — first question of the next phase) |
| "I'll start the bootstrap sequence; first, languages." | (silent — just ask the first setup question) |
| "Overview written. Before closing, I'll validate its integrity." | (silent — audit runs unannounced; the Accept/Adjust gate is the transition) |

## Localization

Read `language.chat` and `language.artifacts` from the injected foundation (or
`.spec/config.yaml`). If config is missing — only possible during `/setup` —
narrate in a **single language for the whole turn**: the language of the user's
request, or English if unclear. Never mix languages in one message. `/setup` then
writes the config that governs the rest.

- **`language.chat`** — all prose to the user: questions, summaries,
  confirmations, `AskUserQuestion` text, error messages.
- **`language.artifacts`** — user-generated content written into artifacts:
  descriptions, bodies, changelog row text.
- **Structure stays English** — frontmatter keys, `## Section` headers, table
  column headers, status values (`draft`/`ready`/...), enum literals. Never
  translated.
- **Neutral register always** — no regional idioms. In Spanish: `tú` or
  impersonal forms, never voseo (`vos`/`querés`/`podés`/`sos`) or regional
  slang. In English: standard, no slang.

`AskUserQuestion` labels and descriptions use `language.chat`. When the user's
pick is written into an artifact, the content (not the literal label) follows
`language.artifacts`.

## Asking the user

Use `AskUserQuestion` for closed-domain choices (yes/no, pick-one, multi-select
from a known taxonomy). For open exploration, ask in plain prose.

- 2–4 options per question; each mutually exclusive.
- The recommended option is **first** and carries `**(Recommended)**` in its
  label. Mark `(Recommended)` only with a defensible default from prior
  evidence; without it, present options without a recommendation.
- List only the real choices; Claude Code appends an "Other" option itself.
- One call can carry multiple independent questions (rendered as tabs).

Open free-text is the default for grilling. Reach for `AskUserQuestion` when the
dimension has a closed taxonomy, the user signaled they need options, or the
decision is binary/single-pick with stable alternatives.

## Grilling depth

Grill in proportion to the stakes, not uniformly. On a contested, irreversible,
or high-blast-radius decision — or when an answer is vague or contradicts earlier
evidence — present alternatives, challenge, and confirm every material inference
before recording it. On trivial, well-specified points, confirm and move on.
Applies to every grilling skill, whether or not it uses the shared grilling
engine.

## Confirming artifacts

No artifact is final until the user accepts it. After writing one, summarize what
was captured (one line per section or dimension) and ask `Accept` / `Adjust` via
`AskUserQuestion`. Nothing advances — no next stage, no chaining, no hand-off —
until the user accepts. On `Adjust`, revise the named part, rewrite, and
re-confirm. This gate is the user's chance to rebut before the artifact stands.

## Invoking helpers and /audit

Helper skills (`/clarify`, `/research`, `/summarize`, `/audit`, `/domain` in
delegated mode) are read-only or single-shot and declare `context: fork` in their
frontmatter. Invoking one runs it in an isolated subagent that returns its result
to the caller without polluting the caller's context. Invoke directly:

````text
Skill(skill="<name>", args="<key>: <value>; <key>: <value>")
````

- Args are semicolon-separated `key: value` pairs, interpolated into the helper.
- The helper returns its output verbatim (its own body says so); the caller parses it.
- Do not wrap helpers in `Task` — `context: fork` provides the isolation.

| Helper | When |
| --- | --- |
| `/clarify` | An open user answer needs disambiguation before being recorded. |
| `/research` | The skill needs domain expertise it cannot infer from context. |
| `/summarize` | Consolidate multi-source output (e.g., N `/research` results). |
| `/audit` | Validate `.spec/` artifacts at closure of any writing workflow. |
| `/domain` | Detect or disambiguate a candidate domain term during grilling. |

After any workflow that creates or modifies files under `.spec/`, invoke
`/audit` with `target_paths` (comma-separated list of every file touched),
`caller_skill`, and `caller_intent` (one line). Skip audit when the workflow
only reads `.spec/`. Parse the report and apply per severity:

- **`error`** — blocks the success message. Report, fix, or stop the workflow.
- **`warning`** — surface as non-blocking notes after the success message.
- **`info`** — optional context; surface only if relevant to the next step.

## The .spec artifact model

Every artifact under `.spec/` carries frontmatter with at least `id`, `status`,
and `version` — **no `title:`** (the human title is the body `# H1`). It ends
with a `## Changelog` section; when user interventions shaped it, an
`## Interaction notes` section sits just above the Changelog.

### SemVer

| Event | Version action |
| --- | --- |
| Created | Born at `0.1.0` |
| First transition to terminal state (`done` or `locked`) | Promote to `1.0.0` |
| Subsequent terminal-state transitions | Bump per change nature |

| Bump | When |
| --- | --- |
| MAJOR | Contract break — criterion removed/redefined, ADR replaced, scope inverted. |
| MINOR | Compatible addition — new section, new criterion, new linked artifact. |
| PATCH | Clarification, wording, metadata refresh. |

Version never decreases, even if status drops from `done` back to `ready`.
Promotion to `1.0.0` replaces the normal bump on the first terminal transition.
The same change can produce different bumps in different artifacts (cascading);
version each artifact independently per its own impact.

### Status flow

| Status | Meaning |
| --- | --- |
| `draft` | Under construction; not ready for the next consumer. |
| `ready` | Complete and ready for the next consumer. |
| `in-progress` | A skill picked it up (e.g., `/code` on a FEAT). |
| `done` | Terminal success. |
| `locked` | Terminal immutable. PR artifacts only. |
| `deprecated` | Superseded by a newer artifact; kept for history. |

| From | To |
| --- | --- |
| `draft` | `ready`, `deprecated` |
| `ready` | `in-progress`, `deprecated` |
| `in-progress` | `done`, `locked`, `ready` (revert) |
| `done` | `ready` (re-implementation), `deprecated` |
| `locked` | `deprecated` only (if superseded) |
| `deprecated` | (terminal) |

PR artifacts skip `draft`/`ready` — they are born `locked`. `/pr` is the only
skill that locks an artifact. `deprecated` artifacts stay in the repo for
history; never delete them. Reverting `done` → `ready` requires a changelog
justification (typically a `/pr` cascade).

### Changelog

Every version bump produces one new row. Group related changes from one session
under a single timestamp.

````markdown
| Timestamp (UTC)  | Version | Description                                           |
| ---------------- | ------- | ----------------------------------------------------- |
| YYYY-MM-DD HH:MM | X.Y.Z   | <≤100 chars. One phrase. The WHY of this change.>     |
````

- ≤100 chars per row; split into multiple rows if longer.
- State the **WHY**, not the **what** — the diff shows the what.
- Active voice. Cite related artifacts inline:
  _"Applied [PR-007](../prs/PR-007-slug.md): cap raised, baseline unreachable."_
- Rows ordered oldest first, newest last.
- The `Version` column of the newest row must equal the frontmatter `version:`.

### Cross-references

Link artifacts with markdown links and frontmatter arrays. The path is relative
from `.spec/<type>s/` to the linked artifact's folder:

````markdown
[ID slug](../{type}s/ID-slug.md)
````

Examples: `[PRD-007 search-engine](../prds/PRD-007-search-engine.md)`,
`[ADR-003 ranking-algo](../adrs/ADR-003-ranking-algo.md)`.

| Field | Used by | Contents |
| --- | --- | --- |
| `prs` | All artifacts | PRs that touched this artifact |
| `adrs` | PRD, FEAT, stack, arch | ADRs that constrain this artifact |
| `feats` | PRD, ADR | FEATs derived from this PRD/ADR |
| `prds` | ADR | PRDs this ADR serves |
| `prd` | FEAT | Parent PRD |
| `depends_on` | FEAT | FEATs that must be `done` before starting |
| `reviews` | FEAT | REVs that audited this FEAT |
| `target` | REV, PR | The single FEAT (REV) or PRD (PR) targeted |
| `affects` | PR | All artifacts touched by the PR cascade |

If artifact A lists B in its array, B lists A back (or is A's declared target).
One-sided references are flagged by `/audit`.

## Markdown conventions

- One `# H1` per artifact: the human title, **without** the artifact code
  (`ADR-001`, `FEAT-003`). The code lives in `id` and the filename.
- Section headers stay English; their content follows `language.artifacts`.
- Diagrams use the minimalist Mermaid style from the catalog — `flowchart`/`graph`
  with `theme: neutral`, no custom colors.
- Line wrapping, table-column alignment, and blank-line spacing are the project
  formatter's job (`/setup` provisions `.markdownlint.json` + `.prettierrc`).
  Write valid Markdown and let the formatter normalize it — never hand-pad table
  cells or count columns.

### Interaction notes

The `## Interaction notes` section records user interventions that **changed the
skill's stance** or surfaced a project-relevant point the grilling missed — not
routine answers. Each entry is one line in `language.artifacts`: what the user
corrected or emphasized, and how it shifted the artifact. Omit the section when
no such intervention occurred (no "none" line).

## Trusting the injected foundation

The project foundation injected at session start is the source of truth for this
turn. Re-read a foundation file (`overview.md`, `guidelines.md`,
`personality.md`) only if you modified it this session, or a prior skill
reported modifying it. A skill that owns a foundation file always reads it fresh
before editing.

Read `stack.md` on demand when touching code, structure, devtools, or configs;
if it is missing and the skill needs it, stop and direct the user to `/spec`.
Read `domain.md` if present; when absent, operate without ubiquitous-language
enforcement (graceful degradation, never abort). `arch.md` and `ux.md` are
optional; the injected "Optional artifacts present" line states which exist.

If the foundation is absent (no `.spec/` project), stop and direct the user to
`/spec` to bootstrap.
