# Database Overview


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Why MongoDB for QueueIt MERN

MongoDB is selected because QueueIt's operational data is document-shaped, tenant-scoped, high-volume, and frequently read by dashboards and real-time clients. MERN teams can model request/response payloads, persisted queue state, notification metadata, and analytics snapshots without impedance mismatch between JSON in React, Node.js, Socket.IO events, and persisted BSON documents.

MongoDB fits QueueIt better than PostgreSQL for this MERN-specific design because active queue views need fast retrieval of a complete operational document with embedded policy, schedule, counters summary, and denormalized tenant context. Queue entries will reach millions of records and benefit from horizontal partitioning by organization, queue, and time. PostgreSQL remains excellent for strict relational reporting, but QueueIt's queue events, notifications, extensible settings, feature flags, and analytics snapshots evolve quickly and are better served by flexible documents.

## Why Mongoose

Mongoose is preferred as the ODM because it provides centralized validation, casting, hooks, discriminators, timestamps, optimistic concurrency, connection management, and a mature ecosystem for Express/Node teams. The architecture still treats Mongoose as infrastructure: domain rules live outside schema definitions, and this phase deliberately documents data contracts rather than generating schema code.

## Architectural Decisions

| Decision | Why | Trade-off |
| --- | --- | --- |
| Tenant identifier on every tenant-owned document | Enforces isolation and enables shard keys. | More duplicated fields. |
| Reference large/high-growth relationships | Prevents oversized organization, queue, or customer documents. | Requires targeted lookups or aggregation. |
| Embed small immutable subdocuments | Reduces joins for addresses, settings, delivery attempts, and snapshots. | Embedded data may need propagation if mutable. |
| Denormalize names/statuses for read models | Dashboards and audit views avoid excessive lookups. | Requires update discipline. |
| Use transactions for queue-order/token operations | Prevents duplicate tokens and invalid state under concurrency. | Higher latency than single-document writes. |
| Use analytics snapshots | Keeps dashboards fast over millions of entries. | Eventual consistency for reports. |

## Scaling Capabilities

MongoDB replica sets provide high availability, automatic failover, and read replicas for non-critical analytics reads. Sharding should be planned around `organizationId` plus time or hashed `organizationId` for tenant distribution. Queue-entry history can be partitioned by time ranges and archived.

## Workloads

QueueIt is write-heavy during check-ins, state transitions, notifications, and audit logging, and read-heavy for live dashboards, queue boards, customer status screens, and analytics. The design separates hot operational reads (`queues`, active `queueEntries`) from historical analytics (`analyticsSnapshots`, archived queue entries).

## Limitations and SQL Fit

MongoDB has weaker ad hoc relational joins than SQL, requires careful index planning, and can suffer hot-shard or hot-document issues if counters are updated too frequently. SQL would be better if QueueIt required complex cross-tenant financial ledgers, strict foreign-key enforcement for every relationship, or highly normalized regulatory reporting as the dominant workload.
