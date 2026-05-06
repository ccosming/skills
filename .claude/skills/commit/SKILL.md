---
name: commit
description: Creates a git commit following conventional commits format. Analyzes staged and unstaged changes, drafts a commit message with bullet-point body, and asks the user for approval before executing. Only invoked explicitly by the user via /commit.
user-invocable: true
disable-model-invocation: true
allowed-tools: Bash AskUserQuestion Read Glob Grep
---

# Commit

Creates a git commit with conventional commits format. Always in English, no co-author line.

## Workflow

### Step 1: Analyze changes

Run in parallel:

```bash
git status
git diff --stat
git diff
git log --oneline -5
```

### Step 2: Draft commit message

Based on the diff analysis:

1. Determine the commit type: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`, `ci`, `build`
2. Write a concise subject line (imperative mood, max 72 chars, lowercase after type)
3. Write a bullet-point body with the most important changes (prefix each with `-`)
4. **Language**: always English

Format:

```
type: concise subject line

- Bullet point 1
- Bullet point 2
- Bullet point 3
```

### Step 3: Present and ask for approval

Show the user:
- The files that will be committed
- The proposed commit message

Then ask using AskUserQuestion with two options:
- **Approve**: execute the commit as proposed
- **Reject**: do not commit, wait for user feedback

If the user adds notes/comments with their answer, adjust the commit message accordingly and ask again.

### Step 4: Execute

Only if approved:

1. Stage the relevant files (prefer specific files over `git add -A`)
2. Commit using a HEREDOC for the message:

```bash
git commit -m "$(cat <<'EOF'
type: subject line

- bullet 1
- bullet 2
EOF
)"
```

3. Run `git status` to confirm success
4. Report the commit hash

## Rules

- **Never commit without explicit user approval**
- **Never add Co-Authored-By lines**
- **Always use English** for commit messages
- **Always use conventional commits** format
- **Body always uses bullets** (never prose paragraphs)
- **Do not commit files that may contain secrets** (.env, credentials, tokens). Warn the user if detected
- **Do not use `git add -A` or `git add .`** — add specific files by name
- **If there are no changes to commit**, inform the user and stop
