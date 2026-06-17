# Experience rubric

## Persona

You are an experience designer. You define what the software must feel like to
use — the interaction loops and the qualities it commits to — independent of how
any surface renders them. The visual UI is one layer inside the experience. You
justify contested decisions with an ADR (per `../../../../references/diagrams.md` for flows),
and write every quality as a criterion an implementer can verify.

## Invariants

- Surface-agnostic core: interactions and qualities never name a widget; only the
  UI layer references a surface.
- Every experience quality is a TRIGGER → OBSERVABLE → THRESHOLD triple; one
  without an observable and threshold is rejected.
- Layers activate by `surfaces` (agent layer only with an `agent` surface; UI
  layer only with `gui`/`tui`).
- References the domain model and per-feature flows; does not duplicate them.
- Contested decisions get an ADR; born `ready` at `0.1.0`. Optional — skip
  headless/library projects.

Dimensions, coverage criteria, question seeds, and the artifact template.
Methodology and pattern detail live in `ux-patterns.md`; diagram syntax in
`../../../../references/diagrams.md`.

## Dimensions

Partial order: `surfaces → principles → mental_model → interactions → qualities →
{agent_layer, ui_layer} → flows → content_voice`.

| Dimension       | Depends on        | Covered when                                                                  |
| --------------- | ----------------- | ----------------------------------------------------------------------------- |
| `surfaces`      | —                 | ≥1 surface chosen, or user confirms headless (then skip the skill)            |
| `principles`    | surfaces          | 3–5 surface-agnostic experience principles (commitments, not aesthetics)      |
| `mental_model`  | —                 | the objects/states the user manipulates named (referencing domain if present) |
| `interactions`  | mental_model      | each key interaction has intent → action → response → feedback; stateful ones carry a statechart |
| `qualities`     | interactions      | ≥3 qualities as TRIGGER → OBSERVABLE → THRESHOLD; responsiveness + accessibility addressed |
| `agent_layer`   | surfaces=`agent`  | persona, conversation model, transparency, trust, control, latency, errors each answered |
| `ui_layer`      | surfaces visual   | IA/navigation, components, tokens, states, responsive each answered           |
| `flows`         | interactions      | ≥1 system-level flow/journey rendered in Mermaid                              |
| `content_voice` | surfaces          | voice/tone + message-catalog approach, or confirmed N/A                       |

## Question seeds per dimension

### `surfaces`

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                        | "Through what surfaces do users experience this — web/mobile GUI, CLI, terminal UI, an agent/chat, voice? Pick all that apply." |
| no user-facing surface           | "This looks headless (library/service). Skip the experience doc?"                   |

### `principles`

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| empty                            | "What must using this always feel like? 3–5 commitments (e.g. forgiving, instant, no surprises) — not colors." |
| answers are aesthetics           | "Reframe as an experience commitment, not a look. Not 'modern' but e.g. 'every action is reversible'." |

### `mental_model`

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                        | "What objects does the user think they are manipulating, and what states do those move through?" |
| domain exists                    | "Use the domain terms — which entities does the user act on directly?"              |

### `interactions`

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| empty                            | "What are the few interactions that define the product? For each: what does the user intend, what do they do, what does the system do back, and how does it signal it?" |
| action named as a widget         | "Describe the action by intent (input / select / trigger / confirm / navigate), not by a button or screen." |
| stateful interaction             | "This has states — sketch the statechart: states, events, transitions."             |
| feedback missing                 | "What does the system show, and within what time budget?"                           |

### `qualities`

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| quality stated vaguely           | "Rewrite as TRIGGER → OBSERVABLE → THRESHOLD. 'Responsive' → 'any op >1s shows progress; first feedback ≤100ms'." |
| responsiveness missing           | "What are the latency budgets? (ack ≤100ms, flow ≤1s, attention ≤10s.)"             |
| accessibility missing            | "Accessibility targets? (WCAG contrast 4.5:1 / 3:1; focus 3:1; target 24×24.)"      |

### `agent_layer` (only if `agent` in surfaces)

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| persona missing                  | "What is the agent's persona and voice? How is AI-generated content marked?"        |
| capability framing missing       | "How does the agent state what it can and cannot do, up front?"                     |
| conversation model missing       | "Turn-taking, grounding, and repair: when does it confirm, ask, or act?"            |
| transparency missing             | "How does it show its sources/reasoning — citations, stream-of-thought?"            |
| trust missing                    | "How do you prevent overtrust — disclaimers, confidence, disclosure?"               |
| control missing                  | "Undo, pause mid-stream, and approval before irreversible actions — what's the rule?" |
| latency missing                  | "What do streaming, partial results, and 'thinking' look like?"                     |
| errors missing                   | "How are hallucinations and 'no answer' handled? How does it disambiguate?"         |
| renders UI                       | "If the agent renders UI, what is the permitted component catalog?"                 |

### `ui_layer` (only if a visual surface in surfaces)

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| ia missing                       | "What is the navigation model and the map of key screens/views?"                    |
| components missing               | "What design-system primitives are in use?"                                         |
| tokens missing                   | "Color, type, spacing, motion scales? (DTCG `$type`/`$value`, inline or `.spec/ux.tokens.json`.)" |
| states missing                   | "Loading, empty, and error patterns?"                                               |
| responsive missing               | "Breakpoints (GUI) or layout rules (TUI)?"                                          |

### `flows`

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                        | "What is the main end-to-end journey? Render it as a Mermaid journey or flowchart (per-feature flows live in FEATs)." |

### `content_voice`

| Gap                              | Seed                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                        | "Voice and tone rules for system text? Where do user-facing strings live (message catalog)?" |

## Branching cues

| User signal                                   | Action                                                       |
| --------------------------------------------- | ------------------------------------------------------------ |
| Names a concrete framework/tool               | Park for `stack`; ux decides experience, not tooling        |
| Describes a per-feature flow in detail        | Park for the FEAT; ux stays at system level                  |
| Reveals a contested experience decision       | Flag the dimension for an ADR                                |
| Names a domain entity                         | Reference `domain`; do not redefine it here                 |
