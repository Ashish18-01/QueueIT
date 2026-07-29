# Relationship Strategy


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Strategy
Embed one-to-one and bounded one-to-many data such as address, contact methods, schedule windows, queue policy snapshots, notification provider attempts, and audit request metadata. Reference unbounded or independently secured data such as branches, venues, queues, entries, users, roles, notifications, audit logs, and analytics snapshots. Many-to-many relationships, such as users-to-roles and roles-to-permissions, use reference arrays only when bounded; large assignment history moves to join collections.

Embedding is preferred when data is read with the parent, changes together, is small, and does not require independent permissions. Referencing is preferred when data grows without bound, is queried independently, or has separate lifecycle/security concerns. This prevents MongoDB's document-size limit from affecting hot queues and avoids memory amplification on dashboard reads.
