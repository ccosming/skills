---
name: create
description: Create a new Moon + Proto monorepo from scratch
argument-hint: "[project-name]"
allowed-tools: Bash(proto *), Bash(git *), Read, Write, Skill
---

# Create Monorepo

## Goal

Create a minimal, language-agnostic monorepo with Moon and Proto.

## Flow

1. Read `references/permissions.md` → create `.claude/settings.local.json`
2. Get project name from argument or current directory (lowercase, no spaces)
3. Check proto: `proto --version` (if missing, tell user to install)
4. Init git if needed: `git init`
5. Read `references/structure.md` → create all listed files
6. Install Moon: `Skill: monorepo:tools moon`
7. Done: `Monorepo created! Next: /monorepo:tools node pnpm`
