# Diagram catalog

A methodological catalog of the diagrams used across the plugin, all rendered in
Mermaid. Orthogonal knowledge — load it on demand when a skill needs to draw.
Which skill draws which diagram is each skill's decision; this file defines only
purpose, fit, and syntax.

Agile principle: draw only the diagram that answers a concrete question. Prefer
one clear view over exhaustive documentation.

## Rendering

Every diagram is monochrome and minimalist:

- Set the neutral theme as the first line of the block:
  `%%{init: {'theme':'neutral'}}%%`. Never apply custom fills or `style`/`classDef`
  colors.
- Architecture views (the former C4 family) render as `flowchart`, not the C4
  shapes — C4's fixed styling ignores the neutral theme. The C4 semantics survive
  as `«person»` / `«system»` / `«external»` / `«container»` / `«component»`
  stereotype labels and `subgraph` boundaries.

## Selection

| Question to answer                                 | Diagram       | Mermaid type      |
| -------------------------------------------------- | ------------- | ----------------- |
| How does the system sit among users and externals? | System context | `flowchart`      |
| What are the major technical building blocks?      | Containers    | `flowchart`       |
| What is inside one container?                      | Components    | `flowchart`       |
| How do containers collaborate at runtime?          | Runtime flow  | `flowchart`       |
| What entities exist and how do they relate?        | UML Class     | `classDiagram`    |
| What can each actor do with the system?            | UML Use case  | `flowchart`       |
| How do parts exchange messages over time?          | UML Sequence  | `sequenceDiagram` |
| What is the control flow of a process?             | UML Activity  | `flowchart`       |
| What states does an entity move through?           | UML State     | `stateDiagram-v2` |
| How is the system split into software components?  | UML Component | `flowchart`       |
| What does the user feel across a journey?          | User Journey  | `journey`         |

## Architecture family (C4 views as flowcharts)

System architecture across abstraction levels. Each level answers a distinct
question for a distinct audience. The C4 semantics are kept as stereotype labels
and `subgraph` boundaries, rendered through `flowchart` so the neutral theme
applies.

### System context — the widest view: system + users + external systems

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart TD
  user["«person» User<br/>role"]
  sys["«system» System<br/>what it does end to end"]
  ext["«external» External System<br/>what it provides"]
  user -->|uses| sys
  sys -->|"calls · HTTPS"| ext
```

### Containers — the major technical blocks (apps, APIs, stores, workers)

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart TD
  user["«person» User<br/>role"]
  subgraph sys["«system» System"]
    web["«container» Web App<br/>framework · UI"]
    api["«container» API<br/>runtime · business logic"]
    mq["«queue» Message Queue<br/>broker · async work"]
    db[("«store» Database<br/>engine · persists X")]
  end
  user -->|"uses · HTTPS"| web
  web -->|"JSON/HTTPS"| api
  api -->|SQL| db
  api -->|"publishes events"| mq
```

### Components — the internals of one container

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart TD
  subgraph api["«container» API"]
    ctrl["«component» Controller<br/>handles requests"]
    svc["«component» Service<br/>domain logic"]
    repo["«component» Repository<br/>data access"]
  end
  ctrl --> svc --> repo
```

### Runtime flow — a runtime interaction across containers (numbered steps)

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart TD
  user["«person» User"]
  web["«container» Web App"]
  api["«container» API"]
  db[("«store» Database")]
  user -->|"1 · submits form"| web
  web -->|"2 · POST /resource"| api
  api -->|"3 · INSERT"| db
```

## UML family

Structural and behavioral views. Use selectively, where an architecture view does
not answer the question.

### Class — entities, attributes, methods, relations (structural)

Defines the vocabulary and responsibilities. Relations: inheritance,
association, composition, aggregation.

```mermaid
%%{init: {'theme':'neutral'}}%%
classDiagram
  class User {
    +String name
    +String email
    +signIn()
  }
  class Order {
    +int id
    +Date date
    +total()
  }
  class Product {
    +String name
    +float price
  }
  User "1" --> "*" Order : places
  Order "*" --> "*" Product : contains
```

### Use case — actors and the functionality they reach (behavioral)

High-level scope agreement. The "what" from the user's perspective, never the
"how". Mermaid has no native use-case diagram; model actors and use cases as
nodes.

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart LR
  customer([Customer])
  admin([Administrator])
  customer --> uc1([Place order])
  customer --> uc2([Search product])
  admin --> uc2
  admin --> uc3([Manage inventory])
```

### Sequence — messages between participants over time (behavioral)

The temporal dimension of one scenario. Ideal for APIs, protocols, debugging a
concrete flow.

```mermaid
%%{init: {'theme':'neutral'}}%%
sequenceDiagram
  actor C as Client
  participant S as Server
  participant DB as Database
  C->>S: signIn(user, secret)
  S->>DB: verifyCredentials()
  DB-->>S: result
  alt valid
    S-->>C: sessionToken
  else invalid
    S-->>C: authError
  end
```

### Activity — control flow of a process, with decisions and parallelism

Process logic end to end. Surfaces bottlenecks and business rules.

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart TD
  Start([Start]) --> A[Receive order]
  A --> D{In stock?}
  D -->|Yes| P[Process payment] --> Ship[Ship product] --> End([End])
  D -->|No| N[Notify out of stock] --> End
```

### State — the lifecycle of one entity and its transitions (behavioral)

Captures valid states and the events that move between them; prevents invalid
states. For event-driven logic and state machines.

```mermaid
%%{init: {'theme':'neutral'}}%%
stateDiagram-v2
  [*] --> Pending
  Pending --> Paid: confirmPayment()
  Pending --> Cancelled: cancel()
  Paid --> Shipped: dispatch()
  Shipped --> Delivered: confirmReceipt()
  Delivered --> [*]
  Cancelled --> [*]
```

### Component — software components and their dependencies (structural)

A high-level structural view. At the system level prefer the Containers view,
which carries richer semantics; reach for this when a plain dependency sketch
suffices.

```mermaid
%%{init: {'theme':'neutral'}}%%
flowchart LR
  web[Web UI] --> api[REST API]
  api --> auth[Auth Service]
  api --> logic[Business Logic]
  logic --> db[(Database)]
  logic --> mq[Message Queue]
```

### User journey — phases, steps, and sentiment (experience)

Maps the experience over time with a sentiment score (1–5) per step. Descriptive
context, not behaviorally enforceable; pair it with testable quality criteria.

```mermaid
%%{init: {'theme':'neutral'}}%%
journey
  title Checkout journey
  section Browse
    Find product: 4: Customer
    Compare options: 3: Customer
  section Buy
    Add to cart: 5: Customer
    Pay: 2: Customer
```
