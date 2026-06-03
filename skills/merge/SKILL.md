---
name: merge
description: >
  Git merge with strategy selection and approval. Picks between fast-forward,
  no-ff merge commit, and squash based on the branch shape, previews the
  resulting history and the merge commit message, and refuses to execute until
  the user approves. Use when the user asks to merge a feature branch into main
  and wants visibility into how the history will look afterwards.
disable-model-invocation: true
allowed-tools: Bash, AskUserQuestion
argument-hint: >
  '[--strategy=ff|no-ff|squash] [--into <branch>] [--from <branch>] [--remote
  <name>]'
---

# Git merge with strategy preview and approval

Merges the current feature branch into `main` after presenting the proposed
strategy (`ff` / `no-ff` / `squash`) and the resulting history. Message **in
English**, no `Co-Authored-By` line, no `--no-verify`, no `--amend`.

This skill is invoked explicitly via `/skill:merge`. It runs five sequential
steps; the model **must not** skip any of them.

## Arguments

All optional. When omitted, the skill defaults to _current branch_ → `main` and
recommends a strategy from the inspection in step 2.

| Flag                                                       | Effect                                                                                                                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--strategy=ff` / `--strategy=no-ff` / `--strategy=squash` | Skip the strategy recommendation and use the given one. The approval gate in step 4 still runs.                                          |
| `--into <branch>`                                          | Target branch other than `main`. All references to `main` and `<remote>/main` in the workflow become `<branch>` and `<remote>/<branch>`. |
| `--from <branch>`                                          | Source branch other than `HEAD`. The "current branch is main" abort still applies; `--from main` is rejected.                            |
| `--remote <name>`                                          | Force a specific remote name. Skips the auto-detection in step 1. Use when multiple remotes exist and `origin` is not the right one.     |

Unknown flags abort with the verbatim arg list and a one-line explanation; the
skill does not guess.

## Remote resolution

The skill never hardcodes `origin`. It picks `<remote>` once and uses it
everywhere (fetch, comparison ranges, pull command, error messages). Resolution
order:

1. **`--remote <name>` flag** present → use it. Abort if that remote does not
   exist in `git remote`.
2. **`git remote` lists exactly one name** → use it.
3. **`git remote` lists multiple names and `origin` is one of them** → use
   `origin`.
4. **`git remote` lists multiple names and `origin` is absent** → abort with the
   list and tell the user to re-invoke with `--remote <name>`.
5. **`git remote` is empty** → operate in offline mode. Compare against local
   `main` only and surface "no remote configured" in the proposal. Step 5 still
   works locally but skips the pull.

Throughout the rest of this document, `<remote>` is a placeholder for the
resolved name; the skill substitutes it before running any command.

## Merge strategies at a glance

| Strategy     | Command                             | History shape                                          | When to choose                                                                        |
| ------------ | ----------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Fast-forward | `git merge --ff-only`               | Linear, no merge commit                                | Branch holds one (or a few) atomic commits _and_ `main` has not diverged.             |
| Merge commit | `git merge --no-ff`                 | Branch preserved, plus a merge commit with two parents | Branch is a coherent unit that should remain visible as a group in `git log --graph`. |
| Squash       | `git merge --squash` + `git commit` | One new commit on `main`; branch history dropped       | Branch has WIP / exploratory commits whose granular history adds no value to `main`.  |

## Workflow

### 1. Inspect state

Inspection has two sub-stages because the remote name is dynamic.

**1a. Detect remote and basic state** (run in parallel):

```bash
git rev-parse --abbrev-ref HEAD     # current branch
git status --short                  # working tree state
git remote                          # configured remote names
```

Resolve `<remote>` per the [Remote resolution](#remote-resolution) rules above
before continuing.

**1b. Fetch and compare** (run in parallel using the resolved `<remote>`):

```bash
git fetch <remote> --quiet                          # refresh remote refs (skip if no remote)
git log --oneline --reverse <remote>/main..HEAD     # commits to merge
git log --oneline HEAD..<remote>/main               # commits in main not in branch
```

When operating in offline mode (no remote), substitute `main` for
`<remote>/main` and skip the fetch.

**Abort conditions** — report and stop, do not continue:

- Current branch is `main` → "Already on main; switch to your feature branch
  first."
- Working tree has staged or unstaged modifications (rows other than `??` in
  `git status --short`) → "Working tree must be clean before merging; commit or
  stash first." Untracked files are tolerated.
- Comparison range (`<remote>/main..HEAD` or `main..HEAD` offline) is empty →
  "Branch has no commits ahead of main."
- `git fetch <remote>` fails after a remote was resolved → stop with the
  verbatim error; do not silently fall back to offline mode (the user picked a
  remote that does not respond and should know).

### 2. Choose strategy

Decide a recommendation from the inspection, then state it with a one-line
rationale. The user always has the final say.

| Signal                                                                                   | Recommendation                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch has 1 commit, no divergence                                                       | `ff`                                                                                                                                                                                                      |
| Branch has 2-10 atomic conventional commits, no divergence                               | `no-ff` (preserves the group visibly)                                                                                                                                                                     |
| Branch has 11+ atomic conventional commits, no divergence                                | `no-ff` _or_ `ff` — both are valid; recommend `no-ff` for traceability, but flag in the rationale that `ff` is equally acceptable for a long, well-formed branch and the user may prefer the linear shape |
| Branch contains WIP markers (`wip`, `fixup!`, `squash!`, "asdf", reverted intermediates) | `squash`                                                                                                                                                                                                  |
| `HEAD..<remote>/main` is non-empty (main moved)                                          | `no-ff` _or_ suggest `git rebase <remote>/main` first; `ff` is not possible                                                                                                                               |

Surface the divergence fact explicitly when `HEAD..<remote>/main` is non-empty
so the user can decide whether to rebase before merging.

### 3. Draft the merge commit message

Skip this step entirely when the chosen strategy is `ff`. Fast-forward creates
no commit.

Format for `no-ff` / `squash`:

```text
chore: merge <branch> into main

- bullet 1
- bullet 2
```

Rules:

- **Type** — usually `chore` (housekeeping). If the branch is dominated by one
  type (e.g. all `feat(*)`), `feat` or `refactor` are acceptable.
- **No scope** unless the branch maps cleanly to a single area.
- **Body bullets** — one line per logical change, in chronological order.
  Source: `git log --oneline --reverse <remote>/main..HEAD` (or `main..HEAD` in
  offline mode). If the branch has many small commits, group by area instead of
  one bullet per commit. Each bullet ≤ 100 chars (commitlint
  `body-max-line-length`).
- Subject ≤ 72 chars, lowercase after the colon, no trailing period.

Note: `@commitlint/config-conventional` has `defaultIgnores: true`, so the stock
`Merge branch 'X'` message would pass the hook unchanged. We still write a
conventional message so `git log --oneline` on `main` tells the reader what the
merge brought without expanding the graph.

### 4. Propose and wait for approval

This step has two sub-actions: print the preview, then ask via
`AskUserQuestion`.

**4a. Print the preview** as a plain markdown block (no tool calls in this
sub-step):

```text

## Proposed merge

**From**: <branch>
**Into**: main
**Remote**: <remote> (or "none — offline mode" when no remote is configured)
**Strategy**: ff | no-ff | squash
**Rationale**: <one line>

**Commits to merge** (`<remote>/main..HEAD`):
- abc1234 feat(x): ...
- def5678 fix(y): ...

**Main moved since branch** (`HEAD..<remote>/main`): none | <count + list>

**Resulting commit** (only for no-ff / squash):
chore: merge <branch> into main

- bullet 1
- bullet 2

**Commands that will run**:
1. git checkout main
2. git pull --ff-only <remote> main   (skipped in offline mode)
3. <merge command for chosen strategy>
4. git log --oneline --graph -10
```

**4b. Ask via `AskUserQuestion`** with these arguments:

```text
question: "Approve this merge?"
header:   "Approve merge"
options:
  - label: "Yes, execute now"
    description: "Run the commands above as listed."
  - label: "Change strategy"
    description: "Pick a different merge strategy (ff / no-ff / squash)."
  - label: "Edit commit message"
    description: "Adjust the subject or body of the merge commit before executing."
```

Route the answer:

- **Yes, execute now** → step 5.
- **Change strategy** → call `AskUserQuestion` again with
  `question: "Which strategy?"`, `header: "Strategy"`, and options
  `Fast-forward (ff)` / `Merge commit (no-ff)` / `Squash`. Omit `Fast-forward`
  from the options when `HEAD..<remote>/main` is non-empty (ff is impossible).
  After the user picks, re-run step 3 if needed, then loop back to step 4a.
- **Edit commit message** → ask one open question for the new subject/body
  (free-form, single `AskUserQuestion` is not the right shape here; emit the
  question as plain text and let the user reply). Re-run step 3 with the edits,
  then loop back to step 4a.
- **Other** (custom user reply) → interpret it and loop back to the appropriate
  step.

### 5. Execute

Run sequentially:

1. **Switch to main and bring it up to date with the remote**:

   ```bash
   git checkout main
   git pull --ff-only <remote> main   # skip this line in offline mode
   ```

   If `pull --ff-only` fails (local `main` diverged from `<remote>/main`), stop
   and surface the error verbatim. Do not reconcile automatically.

2. **Merge** using the approved strategy.
   - `ff`:

     ```bash
     git merge --ff-only <branch>
     ```

   - `no-ff` (HEREDOC keeps newlines intact):

     ```bash
     git merge --no-ff <branch> -m "$(cat <<'EOF'
     chore: merge <branch> into main

     - bullet 1
     - bullet 2
     EOF
     )"
     ```

   - `squash`:

     ```bash
     git merge --squash <branch>
     git commit -m "$(cat <<'EOF'
     chore: merge <branch> into main

     - bullet 1
     - bullet 2
     EOF
     )"
     ```

3. **Verify and report**:

   ```bash
   git status
   git log --oneline --graph -10
   ```

   Output the resulting `main` tip hash and the graph snippet so the user can
   confirm shape and message.

4. **Do not push** and **do not delete the source branch** from this skill.
   Mention both as optional next steps the user can run manually:

   ```text
   # Optional follow-ups (run manually if desired):
   git push <remote> main
   git branch -d <branch>
   git push <remote> --delete <branch>
   ```

### Hook failures

If the `pre-merge-commit`, `commit-msg`, or `pre-commit` hook fails (lefthook
reports non-zero), report the **verbatim** error to the user and stop.

- **Do not** retry with `--no-verify`.
- **Do not** retry with `--amend` or `--abort` to "rescue" the merge unless the
  user instructs it.
- Typical fixes: run `pnpm format`, `pnpm lint --fix`, resolve typecheck errors
  on `main`, then re-invoke `/skill:merge`.

### Conflict handling

If `git merge` reports conflicts, **stop**. Report the conflicted file list
verbatim and wait. Do not edit conflict markers, do not pick a side, and do not
run `git merge --abort` without explicit instruction.

## Inviolable rules

- No push to `<remote>/main` from this skill; the user does it manually.
- No source-branch deletion from this skill; the user does it manually.
- No `--no-verify`, no `--no-gpg-sign`.
- No `git reset --hard`, no `git push --force`, no `git checkout .`.
- No `git rebase -i`, no `git add -i` — interactive flags are not supported by
  the harness.
- No `Co-Authored-By` trailer in the merge commit message.
- No execution without explicit user approval in the same conversation.
