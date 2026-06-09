# Archetypes

Used by the archetype dimension (ranks top 3 from this list based on solution +
roles) and to seed `domain` and `non-functional-requirements` inference: the
chosen archetype hints at the likely **generic** subdomains and the quality bars
that usually bind.

## Catalog

| Archetype                          | Likely generic subdomains              | Quality bars that usually bind (ISO 25010)          |
| ---------------------------------- | -------------------------------------- | --------------------------------------------------- |
| **Custom software for business**   | auth/access, audit trail               | security, reliability, compliance (→ constraint)    |
| **B2B digital product**            | auth/access, billing, notifications    | security, reliability, compatibility                |
| **B2C digital product**            | auth/access, payments, notifications   | performance, usability, reliability                 |
| **Internal product** (own team)    | auth/access, integrations              | maintainability, reliability                        |
| **Library / framework / package**  | packaging/versioning                   | compatibility, maintainability, usability (DX)      |
| **CLI / dev tool**                 | config/IO                              | usability (terminal UX), performance, compatibility |
| **AI agent / LLM-powered app**     | auth/access, the model/eval loop (often core) | safety, security, performance/cost           |
| **Personal project**              | auth/access, storage                   | maintainability (one operator), portability         |
| **Open source**                    | packaging, CI                          | maintainability, compatibility, usability           |
| **Non-profit / mission-driven**    | auth/access, donations                 | security, reliability, accessibility                |
| **Academic / research**            | data storage, compute                  | reproducibility, maintainability                    |
| **Educational platform**           | auth/access, payments, content delivery | usability, reliability, performance                |

A row's hints are **candidates to propose, not slots to fill**: surface them
during `domain` and `non-functional-requirements` grilling, then confirm or drop
each with the user. The user's actual answers always win.

## Inference signals

Match solution + roles content against these signals to rank top-3 candidates.

| Signal in solution/roles                      | Likely archetype                            |
| --------------------------------------------- | ------------------------------------------- |
| "for my company", "internal process"          | Custom software for business OR Internal product |
| "SaaS", "subscription", "tenant", "client"    | B2B digital product                         |
| "consumers", "audience", "users at scale"     | B2C digital product                         |
| "developers", "API", "SDK", "import"          | Library / framework / package               |
| "command line", "terminal", "shell"           | CLI / dev tool                              |
| "LLM", "agent", "RAG", "prompts"              | AI agent / LLM-powered app                  |
| "for me", "my notes", "personal"              | Personal project                            |
| "community", "contributors", "GitHub"         | Open source                                 |
| "non-profit", "donors", "beneficiaries"       | Non-profit / mission-driven                 |
| "research", "paper", "dataset", "experiment"  | Academic / research                         |
| "course", "learners", "students", "lessons"   | Educational platform                        |

If no signal matches with confidence, present top 3 by partial match plus
**Other (specify)** as the last option.

## Presentation

Single-select AskUserQuestion. Top inferred = **(Recommended)**. Each option
includes a one-line rationale citing the matched signal:

```text
- [Top 1 archetype] (Recommended) — matched "[signal]" in your solution
- [Top 2 archetype] — matched "[signal]"
- [Top 3 archetype] — partial match on "[signal]"
- Other (specify)
```

If the user picks **Other**, `domain` and `non-functional-requirements`
inference run from the solution + roles content alone, without archetype hints.
