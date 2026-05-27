---
name: create-skill
description: >
  Interactive guide for creating a new Claude Code skill in this repository.
  Interviews you about the skill's purpose, triggers, tools, and workflow steps,
  then generates the folder and SKILL.md with correct frontmatter and body.
  Use when building a new skill, adding a new slash command, or scaffolding a skill template.
  Say "create a skill", "new skill", "add a command", or invoke with an optional name: /create-skill my-skill-name.
license: MIT
argument-hint: "[skill-name]"
allowed-tools: Bash, Read, Write, AskUserQuestion
disable-model-invocation: true
---

# Create Skill

Interactive wizard for creating a well-structured Claude Code skill in this repo.

## Behavior

If `$ARGUMENTS` is non-empty, use it as the proposed skill name (convert to kebab-case).
Otherwise, derive the name from the user's answers.

Run the interview in **three rounds**. Do not generate any files until round 3 is complete.

---

## Round 1 — Purpose and scope

Use `AskUserQuestion` with **these exact questions**:

**Question 1:** "What should this skill do? Describe the goal in one or two sentences."
- Header: "Purpose"
- Options: offer none (free text via Other)

Wait. Do not proceed until answered.

**Question 2:** "What type of skill is this?"
- Header: "Type"
- Options:
  - **Workflow** — Multi-step process with sequential steps, approval gates, or side effects (commit, deploy, publish)
  - **Knowledge** — Best practices, style guide, or conventions Claude should apply automatically
  - **Automation** — Runs a script or tool chain with minimal interaction. Triggered by user only.
  - **Hybrid** — Combines knowledge context with an explicit workflow

**Question 3 (multi-select):** "Which tools will this skill need? Select all that apply."
- Header: "Tools"
- Options:
  - Bash — run shell commands
  - Read / Write / Edit — work with files
  - Grep / Glob — search codebase
  - AskUserQuestion — ask the user questions during execution

---

## Round 2 — Invocation and triggers

After round 1, use `AskUserQuestion` with:

**Question 4:** "What phrases would a user say to trigger this skill? Give 2–4 examples of natural requests."
- Header: "Triggers"
- Options: offer none (free text)

**Question 5:** "Should Claude auto-invoke this skill, or should only the user invoke it manually?"
- Header: "Invocation"
- Options:
  - **Auto + manual** — Claude loads it when the request matches the description (default)
  - **Manual only** — Only runs when user explicitly types `/ccosming:skill-name`. Use for side-effect operations.
  - **Claude only, hidden** — Claude applies it automatically but it's hidden from the `/` menu. Use for background knowledge.

**Question 6:** "Does this skill take arguments? (e.g., a filename, issue number, or keyword)"
- Header: "Arguments"
- Options:
  - No arguments
  - Yes — one argument (describe it)
  - Yes — multiple named arguments (describe them)

---

## Round 3 — Workflow design

After round 2, ask:

**Question 7 (multi-select):** "Which of these does the skill need to handle?"
- Header: "Edge cases"
- Options:
  - Abort conditions (when to stop and tell the user)
  - Error handling (common failure modes with solutions)
  - Approval gate (propose → wait for user confirmation → execute)
  - Secrets / safety check before executing

**Question 8:** "Walk me through the main steps of this skill in order. List them briefly (one per line or comma-separated)."
- Header: "Steps"
- Options: offer none (free text)

---

## Generation — after all 8 questions are answered

### 1. Determine skill name

- If `$ARGUMENTS` is non-empty → use as `SKILL_NAME` (convert spaces to dashes, lowercase).
- Otherwise → derive a kebab-case name from the purpose answer (max 3 words).

Confirm: "I'll name this skill `{SKILL_NAME}`. The command will be `/ccosming:{SKILL_NAME}`. Continue?"
Wait for approval. Adjust name if user requests.

### 2. Build frontmatter

Construct YAML frontmatter:

```yaml
---
name: {SKILL_NAME}
description: >
  {What it does — one sentence}. {When to use it — include 2-3 trigger phrases from Q4}.
  {Key capability or output}.
license: MIT
allowed-tools: {comma-separated tools from Q3}
argument-hint: "{hint from Q6, if applicable}"
arguments: [{arg1}, {arg2}]          # only if Q6 said multiple args
disable-model-invocation: true        # only if Q5 = "Manual only"
user-invocable: false                 # only if Q5 = "Claude only, hidden"
---
```

Rules:
- `description` ≤ 1024 characters. Must include trigger phrases from Q4.
- `allowed-tools` only if tools were selected in Q3.
- Omit `argument-hint` and `arguments` if Q6 = "No arguments".
- Omit `disable-model-invocation` and `user-invocable` unless explicitly required.

### 3. Build body

Generate the SKILL.md body in this structure:

```markdown
# {Skill Display Name}

{One-sentence summary of what this skill does and for whom.}

## Instructions

### Step 1: {First step title from Q8}

{Clear, imperative instructions. Be specific: name the exact commands to run
or exact questions to ask. Avoid vague verbs like "check" or "validate" without
specifying how.}

### Step 2: {Second step title}

...

{If Q7 selected "Abort conditions":}
## Abort conditions

Stop and report to the user if:
- {condition 1}
- {condition 2}

{If Q7 selected "Approval gate":}
## Approval gate

Before executing, present this proposal to the user:

```
## Proposed action

**{Key field}**: {value}
**{Key field 2}**: {value}

Approve? Reply `yes` to execute or describe changes.
```

Wait for approval. Do not proceed until user confirms.

{If Q7 selected "Error handling":}
## Common issues

**{Error scenario}**
Cause: {why it happens}
Solution: {how to fix it}

{If Q7 selected "Secrets / safety check":}
## Safety check

Before executing, scan for:
- Sensitive filenames: `*.env`, `*.pem`, `*.key`, `*secret*`, `*token*`
- Sensitive content in diff: `API_KEY=`, `-----BEGIN PRIVATE KEY-----`, `password=`

If any hit, pause and surface the finding before continuing.
```

### 4. Create files

```bash
mkdir -p /Users/ccosming/Github/ccosming/skills/skills/{SKILL_NAME}
```

Write the full SKILL.md to:
`/Users/ccosming/Github/ccosming/skills/skills/{SKILL_NAME}/SKILL.md`

### 5. Confirm and show next steps

After creating the files, report:

```
Skill created: skills/{SKILL_NAME}/SKILL.md
Command:       /ccosming:{SKILL_NAME}

Next steps:
1. Test it: open a new Claude Code session and try the trigger phrases.
2. If it doesn't auto-invoke: make the description more specific (add more trigger phrases).
3. If it triggers too often: add negative triggers ("Do NOT use for X") to the description.
4. Commit: /ccosming:commit
```

---

## Quality checklist (run before writing files)

- [ ] `name` is kebab-case, matches folder name
- [ ] `description` ≤ 1024 chars and includes 2–3 trigger phrases from Q4
- [ ] Steps are numbered and imperative ("Run X", "Ask Y", not "You should run X")
- [ ] Abort conditions defined if the skill has side effects
- [ ] `disable-model-invocation: true` if the skill deploys, commits, sends, or publishes
- [ ] No README.md will be created inside the skill folder

---

## Inviolable rules

- Do not create any files until round 3 is complete and the user has approved the skill name.
- Do not skip any of the 8 questions.
- Do not use vague instructions like "validate things properly" — be specific.
- Do not exceed 1024 characters in the `description` field.
