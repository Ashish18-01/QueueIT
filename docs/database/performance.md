# Performance Strategy


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Performance Strategy

Use bounded connection pools per Node process, majority write concern for critical queue transitions, primary reads for state-changing workflows, and secondary reads only for stale-tolerant analytics. Redis caches queue boards, permissions, feature flags, and dashboard snapshots but is never authoritative. Use cursor pagination, bulk writes for notification/audit archival, projection-heavy reads, and hot-document prevention by not incrementing a single organization counter on every queue event. Future sharding should use tenant-aware shard keys and time-based archival for queue entries, notifications, and audit logs. Monitor p95 query latency, index misses, lock percentage, replication lag, working-set size, and document growth.
