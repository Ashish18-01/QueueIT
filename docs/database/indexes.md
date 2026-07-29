# MongoDB Indexing Strategy


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Index Catalogue

| Collection | Recommended indexes | Why |
| --- | --- | --- |
| organizations | unique `slug`, `{status, createdAt}` | Tenant lookup and admin filtering. |
| branches | `{organizationId, status, name}`, unique `{organizationId, slug}` partial active | Tenant-scoped branch lists. |
| venues | `{organizationId, branchId, status}`, unique `{branchId, slug}` | Venue navigation. |
| counters | `{organizationId, venueId, status}`, `{assignedEmployeeId, status}` | Live counter boards. |
| queues | `{organizationId, venueId, status, openedAt}`, unique `{venueId, code, businessDate}` | Current queue lookup. |
| queueEntries | unique `{queueId, tokenNumber, tokenResetKey}`, `{queueId, status, priority, position}`, `{customerId, status}`, `{organizationId, createdAt}` | Call-next, customer active queue, history. |
| users | unique `emailNormalized` partial, `{organizationIds, status}` | Login and admin search. |
| refreshTokens | unique `tokenHash`, TTL `expiresAt`, `{userId, sessionId, status}` | Rotation and cleanup. |
| notifications | `{status, nextAttemptAt}`, TTL `expiresAt`, `{recipientUserId, createdAt}` | Worker polling and inbox. |
| auditLogs | `{organizationId, createdAt}`, `{resource.type, resource.id}` | Compliance views. |
| analyticsSnapshots | unique `{organizationId, scope.type, scope.id, period.type, period.start}` | Dashboard reads. |

Indexes improve reads but add write overhead. Queue-entry indexes must be limited to proven query patterns and reviewed with slow-query logs. Use partial indexes for active documents, TTL indexes for expirable security/notification records, text indexes for controlled admin search, and hashed indexes for future sharding by tenant.
