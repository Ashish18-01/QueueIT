# Trade-off Analysis

## Monolith vs Microservices

| Option | Benefits | Costs | Decision |
| --- | --- | --- | --- |
| Modular monolith | Simple deployment, strong consistency, faster delivery. | Requires discipline to preserve boundaries. | Chosen for Phase 2. |
| Microservices | Independent scaling and ownership. | Distributed transactions, observability, operational overhead. | Future option. |

## REST vs GraphQL

| Option | Benefits | Costs | Decision |
| --- | --- | --- | --- |
| REST | Simple, cacheable, familiar, clear resource boundaries. | Can over/under-fetch. | Chosen initial API style. |
| GraphQL | Flexible client queries. | Security, caching, and complexity. | Consider for complex dashboards later. |

## SQL vs NoSQL

| Option | Benefits | Costs | Decision |
| --- | --- | --- | --- |
| SQL/PostgreSQL | Transactions, constraints, reporting. | Harder massive write sharding. | Chosen. |
| NoSQL | Flexible scale patterns. | Weaker relational modeling and joins. | Not primary store. |

## JWT vs Sessions

| Option | Benefits | Costs | Decision |
| --- | --- | --- | --- |
| JWT access + refresh sessions | Scalable short-lived auth plus revocation. | Rotation complexity. | Chosen. |
| Server sessions only | Simple revocation. | Central session dependency for every request. | Alternative for browser-only apps. |

## Redis vs Database Cache

| Option | Benefits | Costs | Decision |
| --- | --- | --- | --- |
| Redis | Fast shared cache and locks. | Extra infrastructure. | Chosen. |
| Database cache | Fewer components. | More load on primary DB. | Limited use. |

## Docker vs VM

| Option | Benefits | Costs | Decision |
| --- | --- | --- | --- |
| Docker | Portable immutable deployments. | Orchestration required. | Chosen. |
| VM | Familiar operations. | Configuration drift. | Not preferred. |

## Serverless vs Containers

| Option | Benefits | Costs | Decision |
| --- | --- | --- | --- |
| Containers | Long-lived API/realtime, predictable behavior. | Cluster/platform management. | Chosen. |
| Serverless | Low ops for bursty workloads. | Cold starts, websocket complexity, vendor constraints. | Useful for isolated jobs later. |
