# Aggregation Framework Design


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Pipelines

Average wait time filters completed entries by tenant/date/status, projects `calledAt - joinedAt`, groups by queue/venue/branch, and writes to `analyticsSnapshots`. Peak hours truncates `joinedAt` to hour and groups counts. Queue trends group by business date and status. Counter and employee performance group completed entries by `counterId` or `servedByEmployeeId` with average service duration. Customer satisfaction joins bounded feedback by `queueEntryId` or pre-embeds rating snapshot. No-show analysis groups no-show/called counts. Future revenue analytics should consume payment events into snapshots rather than scan queue history.

Pipelines must start with indexed `$match`, project only needed fields, avoid unbounded `$lookup`, and materialize daily/weekly/monthly snapshots. Cache expensive report results in Redis with tenant/date/scope keys and invalidate through queue lifecycle events.
