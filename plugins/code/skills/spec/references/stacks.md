# Stacks

Reference for the `code` plugin's spec interview. Encodes the user's preferences for the technologies that run in production. The skill consults this file when proposing or filtering options. Each entry's "When to apply" decides whether to offer it for the current project.

**Anything not listed in this file is implicitly avoid.**

## Languages

| Tech       | Version | When to apply                                                             |
| ---------- | ------- | ------------------------------------------------------------------------- |
| TypeScript | >=6     | default for web, services, CLIs; always strict mode                       |
| Python     | >=3.12  | ML, data science, scientific computing                                    |
| Rust       | stable  | systems-level: parsers, runtimes, perf-critical libraries                 |
| Go         | latest  | networking, protocols, perf-critical CLIs, distributed systems            |
| C          | C99     | embedded targets, low-level algorithms when neither Rust nor Go is viable |

## Runtimes

| Tech | Version | When to apply                                                                   |
| ---- | ------- | ------------------------------------------------------------------------------- |
| bun  | latest  | default for new TypeScript projects; best startup and runtime performance       |
| node | >=24    | when bun is not viable (LTS requirement, missing native module, ops constraint) |

## Compilers

| Tech  | Version | When to apply      |
| ----- | ------- | ------------------ |
| cargo | latest  | every Rust project |
| go    | latest  | every Go project   |
| clang | latest  | every C project    |

## Frameworks & libraries

### Frontend UI

| Tech     | Version | When to apply                                               |
| -------- | ------- | ----------------------------------------------------------- |
| React    | >=19    | every web UI                                                |
| Tailwind | >=4     | every web UI; utility-first CSS                             |
| shadcn   | >=4     | when you want copy-in components on top of Tailwind / Radix |

### Frontend meta-framework

| Tech    | Version | When to apply                                                     |
| ------- | ------- | ----------------------------------------------------------------- |
| Next.js | >=16    | default for React apps that need SSR/SSG, routing, edge rendering |

### Backend HTTP / RPC

| Tech   | Version | When to apply                                          |
| ------ | ------- | ------------------------------------------------------ |
| Hono   | latest  | lightweight HTTP and edge workloads                    |
| NestJS | latest  | very modular and complex backends with strong DI needs |
| oRPC   | latest  | typed RPC with OpenAPI generation                      |

### Mobile

| Tech | Version | When to apply                                                 |
| ---- | ------- | ------------------------------------------------------------- |
| Expo | >=55    | cross-platform mobile (iOS + Android) on managed React Native |

### Data manipulation

| Tech   | Version | When to apply                                                      |
| ------ | ------- | ------------------------------------------------------------------ |
| polars | latest  | dataframe and ETL work; preferred over pandas for speed and memory |

### ORM / Query builder

| Tech    | Version | When to apply                                       |
| ------- | ------- | --------------------------------------------------- |
| drizzle | latest  | when you need an ORM or query builder in TypeScript |

### Validation

| Tech     | Version | When to apply                              |
| -------- | ------- | ------------------------------------------ |
| zod      | latest  | every TypeScript project at I/O boundaries |
| pydantic | latest  | every Python project at I/O boundaries     |

## Data stores

| Category    | Tech        | Version | When to apply                                                               |
| ----------- | ----------- | ------- | --------------------------------------------------------------------------- |
| Relational  | PostgreSQL  | latest  | default relational store; offer for any persistent app                      |
| Cache / KV  | Valkey      | latest  | when you need a cache, session store, rate-limit counters, or pub/sub       |
| Queue       | Kafka       | latest  | event streaming, log compaction, large-volume async processing              |
| Queue       | Pulsar      | latest  | alternative to Kafka when multi-tenant or geo-replication matter            |
| Blob        | MinIO       | latest  | S3-compatible blob storage when self-hosted; otherwise use the BaaS storage |
| Vector      | pgvector    | latest  | only when the project has AI features: semantic search, embeddings, RAG     |
| Time series | TimescaleDB | latest  | only when the project ingests time-stamped data (metrics, telemetry, IoT)   |

## Infrastructure

| Category                | Tech     | Version | When to apply                                                                 |
| ----------------------- | -------- | ------- | ----------------------------------------------------------------------------- |
| Container/orchestration | Dokploy  | latest  | when the project has many services or a self-hosted container fleet           |
| Hosting / PaaS          | Railway  | latest  | default for projects with one or two apps; no service fleet                   |
| BaaS                    | Supabase | latest  | when you want managed Postgres + Auth + Storage; pairs naturally with Railway |
| VPS / IaaS              | Contabo  | -       | when budget per RAM/CPU matters more than managed services                    |
| VPS / IaaS              | GCP      | -       | when you need managed services or multi-region deployments                    |
| IaC                     | Pulumi   | latest  | when infrastructure must be versioned, reviewed, and reproducible             |
