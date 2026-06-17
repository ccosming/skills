---
name: commit
description: Draft a Conventional Commit message in English, get explicit user approval, then commit; never bypasses hooks. Use when asked to "commit", "make a commit", "stage and commit", or "write a commit message".
license: MIT
allowed-tools: Bash, Read, Grep, AskUserQuestion
---

# Git commit with approval

Creates a commit following [Conventional Commits](https://www.conventionalcommits.org/). Message **in English**, no `Co-Authored-By` line, no `--no-verify`, no `--amend` to "rescue" a failed commit.

## Workflow

### 1. Inspect state

Run these in **parallel** (single assistant turn, multiple `Bash` tool calls):

```bash
git status
git diff --stat
git diff --staged --stat
git log -5 --pretty=format:'%h %s%n%b%n---'
```

**Abort conditions** — report and stop, do not continue:

- Working tree clean and nothing staged → "No changes to commit."
- Files in conflict (`UU` rows in `git status`) → "Conflicts present; resolve before committing."
- Nothing staged but unstaged changes exist → list the unstaged files and ask the user which ones to stage before continuing.

### 2. Detect potential secrets

Before drafting, audit the staged surface:

| Check | How |
|---|---|
| Sensitive filenames | Inspect staged file list for: `*.env`, `*.pem`, `*.key`, `id_rsa*`, `credentials*`, `*secret*`, `*token*` |
| Sensitive content | Scan `git diff --staged` output for: `AWS_SECRET`, `API_KEY=`, `-----BEGIN .* PRIVATE KEY-----`, `password=`, long opaque base64/hex tokens |

If any hit, **pause**: surface the finding to the user in the proposal turn (step 4) and require explicit acknowledgement before executing.

### 3. Draft the message

**Caller context (e.g. from `/code`):** when another skill invokes this one with a
suggested scope/subject in its args (e.g. `suggested_scope: FEAT-007; subject:
pure validation logic`), seed the draft with it. Steps 1, 2, and 4 still run in
full — the suggestion never skips the secrets check or the approval gate. Direct
user invocations carry no such args; draft from the diff.

Determine:

- **Type** — one of: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`, `ci`, `build`.
- **Scope** (optional) — affected area, e.g. `feat(extensions)`, `fix(commit)`, `chore(toolchain)`. Pick the narrowest accurate scope.
- **Subject** — imperative mood, lowercase after `type(scope):`, ≤ 72 chars, no trailing period.
- **Body** — atomic bullets prefixed with `-`. One change per bullet. No prose narrative, no "this commit…" framing.
- **No internal references** — the message describes the change on its own terms. Never cite internal process labels (phase names, finding/resolution IDs) or gitignored working notes (e.g. `notes/`); those are private to the workflow, not part of the repository.

Format:

```
type(scope): concise subject line

- bullet capturing change 1
- bullet capturing change 2
```

If the change set spans unrelated concerns, **propose splitting** into multiple commits instead of one fat message.

### 4. Propose and confirm via AskUserQuestion

Present the proposal as text:

```
## Proposed commit

**Files**:
- path/one
- path/two

**Message**:
type(scope): subject

- bullet 1
- bullet 2

**Secrets check**: clean | <list findings>
```

Then collect approval with **`AskUserQuestion`** — never open free-text:

- One question, options **Approve** | **Adjust**.
- The user's "Other" free-text or **Adjust** = a change request: revise the draft and repeat step 4.
- Commit only when the user picks **Approve** → step 5.
- If a secrets finding surfaced, state it in the proposal and require an explicit Approve that acknowledges it before executing.

### 5. Execute

1. Stage **only** the files listed in the proposal:

   ```bash
   git add path/one path/two
   ```

   **Never** use `git add -A`, `git add .`, or wildcards beyond what was approved.

2. Commit using a HEREDOC to preserve newlines:

   ```bash
   git commit -m "$(cat <<'EOF'
   type(scope): subject

   - bullet 1
   - bullet 2
   EOF
   )"
   ```

3. Verify and report:

   ```bash
   git status
   git log -1 --pretty=format:'%h %s'
   ```

   Output the resulting commit hash to the user.

### Hook failures

If the pre-commit or commit-msg hook fails (lefthook reports a non-zero exit), report the **verbatim** error to the user and stop.

- **Do not** retry with `--no-verify`.
- **Do not** retry with `--amend` — the commit did **not** happen; `--amend` would rewrite a different (previous) commit.
- Wait for instructions. Typical fixes: run `pnpm format`, `pnpm lint --fix`, fix typecheck errors, then re-invoke `/factory:commit`.

## Common issues

**Hook fails with lint or format errors**
Cause: pre-commit hook ran formatters or linters that found violations.
Solution: run the formatter/linter manually (`pnpm format`, `pnpm lint --fix`, etc.), fix any remaining errors, then re-invoke `/ccosming:commit`.

**Commit lands but message is wrong**
Cause: shell quoting stripped newlines from the body.
Solution: always use the HEREDOC form in step 5. Never use `git commit -m "..."` with a multiline string.

**Nothing staged after `git add`**
Cause: path mismatch or file was already staged and then modified again.
Solution: run `git status` and `git diff --staged` to confirm what is staged before running `git commit`.

## Inviolable rules

- No `Co-Authored-By` trailer.
- No `--no-verify`, no `--no-gpg-sign`.
- No `git add -A` nor `git add .`.
- No commits without explicit user approval in the same conversation via AskUserQuestion.
- No `--amend` unless the user explicitly requests amending the previous commit (different intent than this skill).
