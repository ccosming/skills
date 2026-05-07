---
name: spec
description: Conduct an exhaustive technical interview with the user and write the project's spec.yaml. Covers identity, goals, constraints, domain, architecture, stack, practices, risks, and metadata. No-op if the project already has a spec.
user-invocable: true
disable-model-invocation: true
allowed-tools: Bash AskUserQuestion Read Glob Write
---

# Drill the project's technical specification

Conducts an exhaustive technical interview and writes `.project/spec.yaml`. The plugin owns `.project/`; never write or edit files there directly — always go through the artifact-writer CLI.

## Pre-flight

1. **Load interaction style.** Read `${CLAUDE_PLUGIN_ROOT}/shared/interaction.md` and apply its rules (language variant, tone, format) throughout this skill.

2. **Detect existing spec.** If `.project/spec.yaml` exists, stop and tell the user (in the configured interaction language) that the project already has a spec. Do not start the interview.

3. **Load config.** Read `.project/config.yaml`. If it does not exist, stop and tell the user to run `/code:setup` first. From the config:
   - `interaction_language` controls the language used to talk to the user during the interview.
   - `artifact_language` controls the language used in the values written to `spec.yaml`. If different from the interaction language, translate the user's answers before persisting.

4. **Load references.** Read every `.md` file under `${CLAUDE_SKILL_DIR}/references/` (use Glob if needed). These files encode the user's preferred stacks, patterns, tooling, and principles. Treat their content as authoritative:
   - Never propose technologies, patterns, or practices that are explicitly excluded by the references.
   - Prefer choices the references endorse when offering options.
   - If the references are silent on a topic, ask the user instead of assuming.

## Interview style

The interview is a **black box** for the user. The user is having a conversation, not filling a form. They never see field names, section names, the schema, or words like "required", "optional", "list", "enum", "at least 1 item", "(YYYY-MM-DD)". Internally you map every answer to the schema; externally you ask natural questions.

- **One question per turn.** Each turn asks ONE focused question and waits for the response. Never present a numbered list of questions in a single message. Never ask the user to "respond to all of the following".
- **Translate schema needs to natural language.** Reformulate any field requirement into a conversational question. Avoid wording like "Out of scope (required, at least 1 item): list capabilities explicitly excluded." Use instead "¿Hay algo que conscientemente quieras dejar afuera de este proyecto?".
- **Infer aggressively from rich answers.** When the user gives a long answer, extract every field you can map and silently fill them. Acknowledge in one sentence what you understood, then ask the next missing thing — never re-ask what was already said.
- **No progress trackers visible to the user.** Do not call TaskCreate/TaskUpdate to render section checklists or progress bars. Do not say "Sección 1 de 9", "ahora vamos con identity", or any phrase that exposes the internal section structure.
- **AskUserQuestion only for closed enums.** Use it for the project type, architectural style, branching model, priority levels, boundary direction. Translate raw enum values into user-friendly labels in the options. Never show the user strings like `modular-monolith` or `event-driven` verbatim — phrase them as natural concepts ("monolito modular", "arquitectura orientada a eventos") with a short clarifier.
- **Absolute wording.** Every value written to `spec.yaml` describes the system as it is, not as it is becoming. Reformulate or push back on relative phrasing. Replace "Por ahora usamos bun" with "El runtime es bun". Move "Inicialmente sin auth" to the out-of-scope list. Keep "Vamos a migrar a postgres" as an open question, not as a fact.
- **Exhaustive but invisible.** Cover every required field, but exhaustiveness is your job, not the user's. They just answer the current question.
- **Confirm casually, in plain language.** When a section is complete, summarize what you understood without naming it: "Entendí esto: ... ¿es así?". Avoid headings, bullet labels, or schema-style phrasing in the recap.
- **No assumptions.** When a response is vague, ask a precise follow-up. Do not infer goals, constraints, or stack choices from the codebase or context.

## Internal coverage map (never expose to user)

The schema at `${CLAUDE_PLUGIN_ROOT}/schemas/spec.schema.json` is the source of truth for shape, types, and enum values. Below is the internal order in which to drive the conversation. The user must never see this list, hear the names, or know which section is active.

1. identity — what the project is, what it's called, what it solves, who it's for, what's deliberately out
2. goals — what success looks like; what quality attributes matter most
3. constraints — anything imposed (legal, compliance, technical) that must be respected
4. domain — only if the project has a non-trivial domain model
5. architecture — overall style, patterns, relevant cross-cutting concerns, integration boundaries
6. stack — what runs in production
7. practices — how the team works (testing strategy, branching, releases)
8. risks — known risks with mitigations, accepted tradeoffs, open questions
9. metadata — spec version and today's date (fill these silently, no questions)

If a response covers fields from a later section, capture them and skip those questions later.

## Field mapping guidance (internal)

These clarifications are not encoded in the schema. Apply them when filling the payload:

- **`metadata.spec_version` for a new spec is `0.1.0`.** Reserve `1.0.0` for the moment the project ships its first major version.
- **`stack.frameworks` vs `stack.tooling`.** Frameworks are runtime/build-time application dependencies (web frameworks, UI libraries, ORMs, validation libraries, state managers). Tooling is strictly how the team builds, tests, lints, formats, ships (build tools, test runners, linters, package managers, monorepo orchestrators, CI/CD, version managers, container runtimes). Concrete examples:
  - ORMs (drizzle, prisma, sqlalchemy) → `frameworks`
  - Validation libraries (zod, pydantic) → `frameworks`
  - Build tools (tsup, vite, rollup) → `tooling`
  - Test runners (vitest, pytest, playwright) → `tooling`
  - Linters and formatters (eslint, prettier, ruff) → `tooling`
  - Monorepo orchestrators (moonrepo, turborepo, nx) → `tooling`
- **Cross-cutting references must point to concrete stack entries.** When `architecture.cross_cutting.<concern>` mentions an external service (e.g., "complemented with an external observability backend", "cached in Redis"), the concrete service must also appear in the matching `stack.*` array. If the user has not specified which service, ask explicitly before finishing.
- **`architecture.patterns` may mix levels.** Patterns can be architectural (layered, hexagonal), domain modeling (DDD aggregates, repositories), code-level (Result types, factory), or cross-cutting (validation at boundaries). The schema accepts free strings; for readability, group entries of the same level together in the array.

## Final write

When all sections are collected and confirmed, write the artifact:

1. Build a single JSON object whose keys match the schema exactly. Omit optional sections that the user opted to skip.
2. Save the JSON to a temp file (use `Write` to create a file under `/tmp/` or similar). Pass it to the writer:

   ```bash
   bun "${CLAUDE_PLUGIN_ROOT}/bin/artifact-writer.js" write spec --payload-file /tmp/spec-payload.json
   ```

3. If the CLI exits non-zero, surface its stderr to the user. If the failure is a validation error, identify the offending section, correct it with the user, and retry. Do not silently re-attempt with guessed values.

4. On success, delete the temp file.

## Confirm and propose next step

Tell the user:

- `.project/spec.yaml` was created.
- Suggest the next step: run `/code:epic` to define the first epic.

## Rules

- Never write to `.project/` directly. Always use the artifact-writer CLI.
- Never invent fields or values. Every field name and enum value must match the schema.
- Never proceed if config is missing — require `/code:setup` first.
- Never accept relative wording in any value. Reformulate or ask for an absolute phrasing.
- Never finish the interview while a required field is empty.
- Never ask more than one question per turn.
- Never expose schema field names, section names, enum raw values, or words like "required", "optional", "(at least 1)", "(YYYY-MM-DD)" to the user.
- Never use TaskCreate/TaskUpdate to display interview progress to the user.
