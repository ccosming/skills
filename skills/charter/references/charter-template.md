# Charter template

The artifact template for the `charter` stage — loaded by the `drafting` subagent to transcribe the decision ledger into the artifact body, not during grilling.

## Template

````markdown
---
id: charter
status: ready
version: 0.1.0
prs: []
---

# Charter

## Problem

<One paragraph. The status quo this replaces and where it breaks — the pain that
justifies building this. Omit only if there is genuinely no prior way.>

## Solution

<One paragraph, max 2 sentences. Shape: [the name the user gave, else "the
system"] [verb phrase] [object] [purpose]. The end-to-end answer to the Problem
— not a feature list (naming: constitution, _Data boundary_). Example: "The
system captures research and notes as raw material and transforms them into
editorial content distributed across channels.">

## Domain

<The problem space this lives in: the domain in one line, then its subdomains,
each classified core (the differentiator — build it best), supporting (needed,
not special), or generic (off-the-shelf — adopt, don't build). One line each. No
glossary, entities, or bounded contexts — those live in domain.md.>

**Domain**: [the domain in one line].

| Subdomain | Class                          | Intent                       |
| --------- | ------------------------------ | ---------------------------- |
| [name]    | core \| supporting \| generic  | [one-line responsibility]    |

## Users

<Each role: bold name + one-line description. Distinguish primary | served.
Skip "served" if only the operator exists.>

**[Role]** (primary | served): [how they engage with the system].

## Functional requirements

<What the system must do — capability statements, one line each, each anchored to
a subdomain. Capability-altitude: stable across many features, no acceptance
criteria (a PRD elaborates each via derives-from). Each carries a stable FR-NN
id. Omit the section only if the solution names nothing concrete yet.>

| ID    | Capability                  | Subdomain   |
| ----- | --------------------------- | ----------- |
| FR-01 | [verb + object, end-to-end] | [subdomain] |

## Non-functional requirements

<How well it must do it — the quality bars that bind. Each tagged by ISO-25010
category, stated as a directional fit criterion (testable in principle; the exact
threshold and measurement window are elaborated in the PRD/FEAT). Skip categories
that impose no real constraint. Omit the section if none binds yet.>

| ID     | Category    | Fit criterion (directional) | Applies to |
| ------ | ----------- | --------------------------- | ---------- |
| NFR-01 | [category]  | [the directional bar]       | [scope]    |

## Success metrics

<The handful of directional signals that show the requirements work. Each tagged
by altitude — traction (it gets used), product (leading: user behavior/quality),
business (lagging: adoption/audience/revenue) — with a direction and a rough
horizon, linked to the functional requirement it measures by its exact id or name
(verbatim, never a paraphrase). Precise baseline → target and measurement window
live in the PRD, not here. Omit the section only if no measurable signal exists
yet.>

| Signal       | Altitude                        | Direction                       | Horizon         | Requirement   |
| ------------ | ------------------------------- | ------------------------------- | --------------- | ------------- |
| [what moves] | traction \| product \| business | increase \| reduce \| establish | [rough horizon] | [FR id / name] |

## Out of scope

<Only items the user explicitly excluded. Omit section if none.>

- **[Excluded item]**: [why excluded].

## Non-negotiable constraints

<Only externally-imposed givens the user actively picked — budget, compliance,
deadline, vendor lock-in, legal. Quality targets the product chooses live under
Non-functional requirements, not here. Omit section if only "No hard constraints"
was selected.>

- **[Constraint type]**: [specific value or boundary].

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                |
| ---------------- | ------- | ---------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | <Max ~100 chars. One phrase. The WHY of this version.>     |
````
