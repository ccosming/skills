# Stacks

Reference for the `code` plugin's spec interview. Encodes the user's preferences for the technologies that run in production. The skill consults this file when proposing or filtering options.

**Anything not listed in this file is implicitly avoid.**

## Languages

| Tech       | Version | Notes                                     |
| ---------- | ------- | ----------------------------------------- |
| TypeScript | >=6     | always strict mode                        |
| Python     | >=3.12  | only for ML/data                          |
| Rust       | stable  | only for systems projects                 |
| Go         | latest  | networking, protocols, perf-critical CLIs |
| C          | C99     | embedded or low-level algorithms          |

## Runtimes

| Tech | Version | Notes                          |
| ---- | ------- | ------------------------------ |
| bun  | latest  | for performance                |
| node | >=24    | for production / critical apps |

## Compilers

| Tech  | Version | Notes    |
| ----- | ------- | -------- |
| cargo | latest  | for Rust |
| go    | latest  | for Go   |
| clang | latest  | for C    |

## Frameworks & libraries

### Frontend UI

| Tech     | Version | Notes              |
| -------- | ------- | ------------------ |
| React    | >=19    | default UI library |
| Tailwind | >=4     | utility-first CSS  |
| shadcn   | >=4     | copy-in components |

### Frontend meta-framework

| Tech    | Version | Notes                                           |
| ------- | ------- | ----------------------------------------------- |
| Next.js | >=16    | default React meta-framework (SSR/SSG, routing) |

### Backend HTTP / RPC

| Tech   | Version | Notes                               |
| ------ | ------- | ----------------------------------- |
| Hono   | latest  | default for lightweight HTTP / edge |
| NestJS | latest  | very modular and complex apps       |
| oRPC   | latest  | OpenAPI + RPC                       |

### Mobile

| Tech | Version | Notes                                          |
| ---- | ------- | ---------------------------------------------- |
| Expo | >=55    | default for cross-platform mobile (managed RN) |

### Data manipulation

| Tech   | Version | Notes                                |
| ------ | ------- | ------------------------------------ |
| polars | latest  | preferred over pandas (faster, lazy) |

### ORM / Query builder

| Tech    | Version | Notes                             |
| ------- | ------- | --------------------------------- |
| drizzle | latest  | TypeScript-native, schema-as-code |

### Validation

| Tech     | Version | Notes                     |
| -------- | ------- | ------------------------- |
| zod      | latest  | for TypeScript validation |
| pydantic | latest  | for Python validation     |

## Data stores

| Category    | Tech        | Version | Notes                                                |
| ----------- | ----------- | ------- | ---------------------------------------------------- |
| Relational  | PostgreSQL  | latest  | default relational DB                                |
| Cache/KV    | Valkey      | latest  | Redis-compatible (open-source fork)                  |
| Queue       | Kafka       | latest  | default event streaming                              |
| Queue       | Pulsar      | latest  | alternative to Kafka (multi-tenant, geo-replication) |
| Blob        | MinIO       | latest  | S3-compatible                                        |
| Vector      | pgvector    | latest  | runs on top of PostgreSQL                            |
| Time series | TimescaleDB | latest  | runs on top of PostgreSQL                            |

## Infrastructure

| Category                | Tech     | Version | Notes                                       |
| ----------------------- | -------- | ------- | ------------------------------------------- |
| Container/orchestration | Dokploy  | latest  | for projects with many services             |
| Hosting / PaaS          | Railway  | latest  | for projects that do NOT need many services |
| BaaS                    | Supabase | latest  | paired with Railway                         |
| VPS / IaaS              | Contabo  | -       | when $/RAM matters                          |
| VPS / IaaS              | GCP      | -       | managed services or o multi-region          |
| IaC                     | Pulumi   | latest  |                                             |
