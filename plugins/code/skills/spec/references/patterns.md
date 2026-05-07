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

## i18n strategies

| Strategy                                | When to apply                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| localized path prefix (`/en/`, `/es/`)  | default for SEO-driven multilingual sites; one domain, one deploy, easy to share links   |
| subdomain per locale (`en.site.com`)    | when locales need separate caching, ops, or content teams; SEO acceptable                |
| domain per locale (`site.com` vs `.es`) | when each market has a distinct brand or strong country signal needs                     |
| content negotiation (`Accept-Language`) | when locale is inferred per request and URLs stay locale-agnostic; weaker for SEO        |
| single language with toggle             | when secondary locale is partial or experimental and full localization is not yet a goal |

## Security controls

| Layer           | Control                                                                           | When to apply                                                                                |
| --------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| application     | input validation against XSS, CSRF, SQL injection, command injection              | every web/API project; validate at boundaries with zod/pydantic                              |
| application     | prompt injection mitigation                                                       | any flow where user input reaches an LLM (system prompt protection, output filtering)        |
| application     | upload validation (type, size, scanning)                                          | whenever the app accepts user uploads, even from authenticated users                         |
| application     | output encoding and security headers (CSP, HSTS, X-Frame-Options, X-Content-Type) | every web app that renders HTML or serves over HTTPS                                         |
| edge / network  | rate limiting on auth, forms, and abuse-prone endpoints                           | every public app; mandatory if there are signups, DMs, or forms                              |
| edge / network  | bot mitigation / CAPTCHA on signup and abuse-prone endpoints                      | when user-generated input or DMs are exposed to anonymous traffic                            |
| edge / network  | DDoS protection via CDN/WAF                                                       | any public site whose downtime is a problem; usually free tier of the CDN suffices           |
| edge / network  | TLS everywhere + HSTS preload                                                     | always; non-negotiable for any public surface                                                |
| authn / authz   | MFA (at least for admin)                                                          | whenever there is an admin surface, regardless of user count                                 |
| authn / authz   | secure session cookies (`Secure`, `HttpOnly`, `SameSite`), expiration, rotation   | every app with sessions                                                                      |
| authn / authz   | RBAC / least privilege                                                            | whenever there is more than one user role or any privileged action                           |
| authn / authz   | password policies (length, breach checks)                                         | only when passwords are managed locally; skip if delegating to an identity provider          |
| data protection | encryption at rest                                                                | for any persistent store holding user or content data                                        |
| data protection | secrets management (vault, secret manager, no secrets in code)                    | always; even small projects                                                                  |
| data protection | PII minimization and retention policy                                             | whenever the app stores user data; mandatory under GDPR/CCPA                                 |
| operational     | audit logs for auth events and admin actions                                      | whenever there is an admin surface or sensitive resources                                    |
| operational     | dependency scanning (Dependabot, Renovate, Snyk)                                  | every project; integrate in CI                                                               |
| operational     | secret scanning in CI                                                             | every project; cheap to add and high payoff                                                  |
| operational     | encrypted backups and tested DR plan                                              | whenever data loss has real cost; even personal projects benefit from encrypted backups      |
| operational     | incident response plan                                                            | whenever the project has paying users, contractual SLAs, or regulated data                   |
| compliance      | GDPR                                                                              | when serving EU users or processing their personal data                                      |
| compliance      | CCPA                                                                              | when serving California consumers                                                            |
| compliance      | SOC 2                                                                             | B2B SaaS targeting enterprise customers                                                      |
| compliance      | HIPAA                                                                             | when handling protected health information in the US                                         |
| compliance      | PCI-DSS                                                                           | when storing or processing card data; usually offload to a PSP (Stripe, etc.) to avoid scope |

## Anti-patterns (always avoid)

| Pattern               | Why avoid                                         |
| --------------------- | ------------------------------------------------- |
| god object            | scatters responsibilities                         |
| service locator       | use explicit DI instead                           |
| premature abstraction | refactor when 3rd duplication appears, not before |
| anemic domain model   | exception: acceptable for transport DTOs only     |
