# MongoDB Transactions


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Transaction Boundaries

Use MongoDB multi-document transactions for create organization, create branch with default settings, create queue from template, join queue, leave queue when counters change, transfer queue entry, call next customer, complete service, cancel queue, assign employee, and delete organization soft-delete cascades. These operations affect token counters, queue entries, queue summaries, counters, notifications, audit logs, and analytics event staging.

Atomicity is required when duplicate tokens, incorrect positions, lost audit records, or mismatched counter state would harm trust. Use retryable writes, idempotency keys for customer commands, optimistic `version` fields, and deterministic transition validation. Do not use transactions for pure reads, notification delivery attempts that can be retried, analytics snapshot recomputation, or audit export jobs because eventual consistency is acceptable and transactions would reduce throughput.
