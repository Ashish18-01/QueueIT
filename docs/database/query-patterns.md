# Query Pattern Analysis


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Major Features

Queue boards read active queues and waiting/called entries every few seconds or through Socket.IO invalidation; writes occur on joins and state transitions. Admin management is read-heavy with cursor pagination by `_id` or `createdAt`. Analytics dashboards read materialized snapshots first and run raw aggregations only for bounded recent windows. Notification workers poll pending notifications by `status,nextAttemptAt` and update attempts in bulk. Audit searches filter by organization, actor, resource, and date range. Target operational reads should complete under 100 ms from indexed queries; analytics snapshot reads under 300 ms; bounded aggregations under 2 seconds. Bottlenecks include hot queue-entry ranges, over-broad regex search, unbounded skips, and dashboard fan-out.
