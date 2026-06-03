# Diagram catalog

A methodological catalog of the diagrams used across the plugin, all rendered in
Mermaid. Orthogonal knowledge — load it on demand when a skill needs to draw.
Which skill draws which diagram is each skill's decision; this file defines only
purpose, fit, and syntax.

Agile principle: draw only the diagram that answers a concrete question. Prefer
one clear view over exhaustive documentation.

## Selection

| Question to answer                                 | Diagram       | Mermaid type      |
| -------------------------------------------------- | ------------- | ----------------- |
| How does the system sit among users and externals? | C4 Context    | `C4Context`       |
| What are the major technical building blocks?      | C4 Container  | `C4Container`     |
| What is inside one container?                      | C4 Component  | `C4Component`     |
| How do containers collaborate at runtime?          | C4 Dynamic    | `C4Dynamic`       |
| What entities exist and how do they relate?        | UML Class     | `classDiagram`    |
| What can each actor do with the system?            | UML Use case  | `flowchart`       |
| How do parts exchange messages over time?          | UML Sequence  | `sequenceDiagram` |
| What is the control flow of a process?             | UML Activity  | `flowchart`       |
| What states does an entity move through?           | UML State     | `stateDiagram-v2` |
| How is the system split into software components?  | UML Component | `flowchart`       |
| What does the user feel across a journey?          | User Journey  | `journey`         |

## C4 family

System architecture across abstraction levels. Each level answers a distinct
question for a distinct audience. Mermaid's C4 support is experimental but
expressive enough for these views.

### C4 Context — the widest view: system + users + external systems

```mermaid
C4Context
  title System Context — <system>
  Person(user, "User", "role")
  System(sys, "<System>", "what it does end to end")
  System_Ext(ext, "External System", "what it provides")
  Rel(user, sys, "uses")
  Rel(sys, ext, "calls", "HTTPS")
```

### C4 Container — the major technical blocks (apps, APIs, stores, workers)

```mermaid
C4Container
  title Containers — <system>
  Person(user, "User", "role")
  System_Boundary(b, "<System>") {
    Container(web, "Web App", "framework", "UI")
    Container(api, "API", "runtime", "business logic")
    ContainerQueue(mq, "Message Queue", "broker", "async work")
    ContainerDb(db, "Database", "engine", "persists X")
  }
  Rel(user, web, "uses", "HTTPS")
  Rel(web, api, "calls", "JSON/HTTPS")
  Rel(api, db, "reads/writes", "SQL")
  Rel(api, mq, "publishes", "events")
```

### C4 Component — the internals of one container

```mermaid
C4Component
  title Components — <container>
  Container_Boundary(api, "API") {
    Component(ctrl, "Controller", "framework", "handles requests")
    Component(svc, "Service", "module", "domain logic")
    Component(repo, "Repository", "module", "data access")
  }
  Rel(ctrl, svc, "uses")
  Rel(svc, repo, "uses")
```

### C4 Dynamic — a runtime interaction across containers (numbered steps)

```mermaid
C4Dynamic
  title Dynamic — <flow>
  Person(user, "User")
  Container(web, "Web App")
  Container(api, "API")
  ContainerDb(db, "Database")
  Rel(user, web, "1. submits form")
  Rel(web, api, "2. POST /resource")
  Rel(api, db, "3. INSERT")
```

## UML family

Structural and behavioral views. Use selectively, where a C4 view does not
answer the question.

### Class — entities, attributes, methods, relations (structural)

Defines the vocabulary and responsibilities. Relations: inheritance,
association, composition, aggregation.

```mermaid
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

A high-level structural view. At the system level prefer C4 Container, which
carries richer semantics; reach for this when a plain dependency sketch
suffices.

```mermaid
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
journey
  title Checkout journey
  section Browse
    Find product: 4: Customer
    Compare options: 3: Customer
  section Buy
    Add to cart: 5: Customer
    Pay: 2: Customer
```
