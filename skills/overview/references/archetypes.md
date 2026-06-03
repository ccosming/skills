# Archetypes

Used by the archetype dimension (ranks top 3 from this list based on mission +
roles) and the context dimension (iterates over the chosen archetype's probes).

## Catalog

| Archetype                          | Context probes (dimensions for Context grilling)                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| **Custom software for business**   | business area, stakeholders, current pain, legacy integrations, governance/approvals      |
| **B2B digital product**            | buyer vs user, decision maker, competitive landscape, sales cycle, typical client stack   |
| **B2C digital product**            | positioning, brand tone, target emotion, usage context, direct competition                |
| **Internal product** (own team)    | team workflow, productivity pain, integration with existing internal tools                |
| **Library / framework / package**  | target dev consumer, unique angle vs alternatives, philosophy, ecosystem fit              |
| **CLI / dev tool**                 | terminal UX, scriptability, integration with other dev tools                              |
| **AI agent / LLM-powered app**     | prompts/models choice, eval strategy, token economics, alignment guarantees               |
| **Personal project**               | motivation, learning goal, intended audience (self / friends / public)                    |
| **Open source**                    | governance, community model, contributor experience, project brand                        |
| **Non-profit / mission-driven**    | beneficiaries, donor accountability, ethical constraints                                  |
| **Academic / research**            | reproducibility, publication targets, datasets, citations                                 |
| **Educational platform**           | learner profile, learning outcomes, content pipeline                                      |

## Inference signals

Match mission + roles content against these signals to rank top-3 candidates.

| Signal in mission/roles                       | Likely archetype                            |
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
- [Top 1 archetype] (Recommended) — matched "[signal]" in your mission
- [Top 2 archetype] — matched "[signal]"
- [Top 3 archetype] — partial match on "[signal]"
- Other (specify)
```

If the user picks **Other**, the context dimension runs as free-form grilling
instead of archetype-driven probes.
