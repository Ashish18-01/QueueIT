# ER Diagram


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.
# ER Diagram


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

```mermaid
erDiagram
organizations ||--o{ branches : owns
branches ||--o{ venues : contains
venues ||--o{ counters : has
venues ||--o{ queues : hosts
queueTemplates ||--o{ queues : configures
queues ||--o{ queueEntries : contains
customers ||--o{ queueEntries : joins
users ||--o{ sessions : owns
sessions ||--o{ refreshTokens : rotates
users }o--o{ roles : assigned
roles }o--o{ permissions : grants
queueEntries ||--o{ notifications : triggers
queueEntries ||--o| feedback : receives
organizations ||--o{ auditLogs : records
organizations ||--o{ analyticsSnapshots : summarizes
organizations ||--o{ featureFlags : targets
organizations ||--o{ systemSettings : configures
```
