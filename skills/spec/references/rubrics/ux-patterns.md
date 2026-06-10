# Experience patterns

The methodology `ux` applies when grilling toward `ux.md`. Load on demand. The
goal is a source of truth for experience that humans and coding agents both
consume — surface-agnostic at its core, testable at its edges.

## 1. Intent vs rendering — the core split

Describe *what the experience must be* separately from *how a surface draws it*.
The W3C Model-Based UI / CAMELEON framework formalizes this: the **Abstract UI**
layer is independent of modality (graphical, vocal, terminal, haptic); the
Concrete and Final UI layers are downstream. `ux.md` lives at the Abstract UI
layer. Visual mockups (Figma, `.pen`, Bubble Tea views) are downstream and
optional — never the source of truth.

Practical rule: interactions and qualities never name a widget. Only the UI
layer and explicit rendering notes reference a surface.

## 2. The interaction loop — the atomic unit

Norman's action cycle is modality-agnostic by construction. Describe each key
interaction as one loop:

```text
intent    → what the user wants to achieve
action    → abstract role: input | select | filter | trigger | confirm | navigate (+ params)
response  → what the system does (a state transition)
feedback  → what the system signals, and within what time budget
```

A GUI click, a CLI command, a voice turn, and an agent tool-call are the same
loop. Stateful interactions add a statechart (`stateDiagram-v2`, see
`../../references/diagrams.md`): states, events, transitions, guards.

## 3. The verifiable triple — qualities as engineering, not vibes

Every experience quality is written as **TRIGGER → OBSERVABLE → THRESHOLD** so
`/code` implements it and `/rev` checks it. A quality without an observable and a
threshold is rejected.

| Vague (reject) | Verifiable triple |
| --- | --- |
| "responsive" | any op >1 s shows progress; first feedback ≤100 ms |
| "clear errors" | every non-zero exit prints a cause line and a remedy line |
| "accessible" | every themed fg/bg pair computes ≥4.5:1 (≥3:1 large/non-text) |

### Standard budgets (attach by default; authors opt out, not forget)

| Concern | Number | Source |
| --- | --- | --- |
| Acknowledge input / first feedback | ≤100 ms | clig.dev · RAIL · NN/g |
| Unbroken flow of thought | ≤1 s | NN/g |
| Limit of held attention (show progress, allow task-switch) | ≤10 s | NN/g |
| Animation / TUI redraw frame | ≤16 ms (60 fps) | RAIL |
| Text contrast | ≥4.5:1 (≥3:1 large) | WCAG 2.2 1.4.3 |
| Non-text / focus contrast | ≥3:1 | WCAG 2.2 1.4.11 / 2.4.11 |
| Target size | ≥24×24 px (reinterpret as min cell region for TUI) | WCAG 2.2 2.5.8 |

## 4. Structured encodings — make it machine-readable

| Layer | Encoding | What an agent verifies |
| --- | --- | --- |
| Tokens (color/type/space/motion) | DTCG `$type`/`$value` JSON — inline or `.spec/ux.tokens.json` | token→theme parity, contrast |
| Stateful interaction | statechart (`stateDiagram-v2` / XState-serializable) | states reachable, transitions wired |
| Acceptance | Gherkin (Given/When/Then with thresholds) | scenarios pass as tests |
| User-facing copy | message catalog (ICU keys) | no hardcoded strings, valid placeholders |
| Flows / journeys | Mermaid (`journey`, `flowchart`, `stateDiagram`) | flow↔router parity |

Prose only for principles and intent that resist formalization — mark it
non-verifiable.

## 5. Surface lenses

One shared core (loops + qualities); each surface adds concerns. Activate a lens
only when that surface is in scope.

### Agent / conversational

Probabilistic, autonomous, streaming systems break GUI assumptions: same input ≠
same output, intent is guessed (so interaction is iterative), and the interface
may be generated at runtime. First-class concerns:

| Concern | What to specify | Source |
| --- | --- | --- |
| Persona & disclosure | name, voice, how AI-generated content is marked | IBM Carbon for AI · Shape of AI |
| Capability framing | what it can/can't do, set up front | Microsoft HAX G1–G2 · Google PAIR |
| Conversation model | turn-taking, grounding, repair; confirm vs ask vs act | conversational design |
| Transparency | citations (distinct, adjacent, deep-linked, meaningful labels); reasoning display | NN/g Explainable AI |
| Trust calibration | mitigate overtrust; disclaimers near input; confidence; disclosure | NN/g · PAIR |
| Control / human-in-the-loop | undo, pause mid-stream, checkpoints before irreversible actions, escalation | Anthropic · HAX G8–G11 |
| Latency & generation | acknowledge, stream, partial results, a "thinking" state | RAIL · streaming UX |
| Errors | hallucination handling, "no answer", disambiguation, graceful failure | PAIR Errors |
| Iteration | multistep refine (accordion), regenerate/variations, fragment reuse | NN/g |
| Generative UI | the permitted component catalog the agent may render (schema-bound) | Vercel AI SDK |

### CLI / TUI

A terminal is a user interface; design for humans first, machines second.

- **Discoverability**: `-h`/`--help` everywhere; lead with examples; suggest the
  next command; "did you mean" on typos (never auto-run). (clig.dev)
- **Feedback**: print within 100 ms; progress for ops over a few seconds; if you
  change state, say so.
- **Progressive disclosure**: concise by default, depth behind `--verbose`.
- **Composability**: stdout = data, stderr = logs; exit 0/non-zero; `--json`,
  `-` for stdin/stdout; honor `NO_COLOR`, non-TTY.
- **Human-first defaults, still scriptable**: flags over positional; never take
  secrets via flags; tiered confirmation for dangerous ops.
- **TUI**: a unidirectional Model–Update–View loop (Elm/Bubble Tea) makes
  behavior deterministically testable; separate style from logic. (Charm)

### Voice (brief)

Implicit confirmation for low-risk, explicit yes/no for irreversible; short
reparative flows; constrained vocabularies for critical slots; keep
conversation state for follow-ups. Degrades into the same feedback/error model
as CLI confirmation tiers.

## Sources

- W3C MBUI — Abstract User Interface: <https://www.w3.org/TR/abstract-ui/>
- W3C — CAMELEON Reference Framework: <https://www.w3.org/community/uad/wiki/Cameleon_Reference_Framework>
- Norman — Human Action Cycle / Gulfs of Execution & Evaluation
- DTCG Design Tokens Format Module (stable 2025.10): <https://www.designtokens.org/tr/drafts/format/>
- W3C SCXML: <https://www.w3.org/TR/scxml/> · XState: <https://stately.ai/docs/machines>
- Microsoft HAX guidelines: <https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/>
- Google PAIR People + AI Guidebook: <https://pair.withgoogle.com/guidebook-v2/patterns>
- IBM Carbon for AI: <https://carbondesignsystem.com/guidelines/carbon-for-ai/>
- Shape of AI (Emily Campbell): <https://www.shapeof.ai/>
- NN/g — Explainable AI in Chat: <https://www.nngroup.com/articles/explainable-ai/>
- NN/g — Response Times (3 limits): <https://www.nngroup.com/articles/response-times-3-important-limits/>
- clig.dev — Command Line Interface Guidelines: <https://clig.dev/>
- Charm / Bubble Tea: <https://github.com/charmbracelet/bubbletea>
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/> · RAIL: <https://web.dev/articles/rail>
- Anthropic — Building Effective Agents: <https://www.anthropic.com/research/building-effective-agents>
