# Patterns

Reference for the `code` plugin's spec interview. Encodes the user's preferences for architectural and design patterns. Patterns are not binary use/avoid; they apply by context. The skill consults this file when proposing or filtering options for `architecture.style`, `architecture.patterns`, and `architecture.cross_cutting`.

**Anything not listed in this file is implicitly avoid.** Anti-patterns at the bottom are always avoided.

## Architectural styles

| Pattern                      | When to apply                                                             |
| ---------------------------- | ------------------------------------------------------------------------- |
| modular monolith             | default for new products; clear module boundaries, single deployment      |
| hexagonal / ports & adapters | complex domain with multiple I/O integrations (DB, queues, external APIs) |
| clean architecture           | business rules are core and must be isolated from frameworks/IO           |
| layered (n-tier)             | content-driven apps, simple CRUD, blogs                                   |
| microservices                | when team size and independent scaling/deployment justify the complexity  |
| event-driven                 | async decoupling, long-running workflows, fan-out integrations            |
| CQRS                         | read and write models have significantly different shapes or scale        |
| event sourcing               | audit trail or temporal queries are first-class requirements              |

## Domain modeling

| Pattern        | When to apply                                                                  |
| -------------- | ------------------------------------------------------------------------------ |
| DDD aggregates | complex domain with multi-entity invariants; skip for content/data-driven apps |
| value objects  | when primitive obsession would erode types; cheap to apply, broad use          |
| repositories   | when persistence must be abstracted from domain logic                          |

## Code-level

| Pattern                             | When to apply                                                  |
| ----------------------------------- | -------------------------------------------------------------- |
| Result/Option types                 | failures that are expected and part of the API contract        |
| dependency injection by composition | always; prefer constructor/function args over service locators |
| pipeline / composition              | data transformations (polars, RxJS-style flows)                |
| factory                             | construction is non-trivial or has multiple variants           |
| strategy                            | behavior varies by context and selection happens at runtime    |

## Cross-cutting

| Pattern                  | When to apply                                                               |
| ------------------------ | --------------------------------------------------------------------------- |
| exceptions               | unrecoverable errors only (bugs, infra failures), not expected control flow |
| validation at boundaries | zod/pydantic at I/O edges; trust internal types                             |

## Anti-patterns (always avoid)

| Pattern               | Why avoid                                         |
| --------------------- | ------------------------------------------------- |
| god object            | scatters responsibilities                         |
| service locator       | use explicit DI instead                           |
| premature abstraction | refactor when 3rd duplication appears, not before |
| anemic domain model   | exception: acceptable for transport DTOs only     |
