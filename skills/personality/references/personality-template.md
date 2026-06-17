# Personality template

The artifact template for the `personality` stage — loaded by the `drafting` subagent to transcribe the decision ledger into the artifact body, not during grilling.

## Template

```markdown
---
id: personality
status: ready
version: 0.1.0
prs: []
---

# Personality

## Persona

<2–3 paragraphs from `persona`. Personality sketch, not a list of skills.
What this engineer does when faced with ambiguity, bad code, disagreement.>

## Seniority

[Level]. [What this level owns].

## Decision style

[Style]. [When to ask] vs [when to act].

## Communication

[Style]. [Default verbosity baseline].

## Optimization priority

**Primary**: [pick].

**Secondary order**: [next] → [next] → [last].

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                |
| ---------------- | ------- | ---------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | <Max ~100 chars. One phrase. The WHY of this version.>     |
```
