# Component Diagram

```mermaid
flowchart TB
    subgraph Frontend
      Web[Next.js Web App]
      ClientState[Client State + API SDK]
    end
    subgraph BackendAPI
      Controllers[REST Controllers]
      Realtime[Realtime Gateway]
      AuthGuard[Auth/RBAC Guards]
      AppServices[Application Services]
      Domain[Domain Layer]
      RepoPorts[Repository Ports]
    end
    subgraph Infrastructure
      PgRepos[PostgreSQL Repositories]
      RedisAdapter[Redis Cache/Locks]
      MQAdapter[Message Queue Adapter]
      EmailAdapter[Email/SMS Adapter]
      StorageAdapter[Object Storage Adapter]
      Logger[Structured Logger]
      Metrics[Metrics/Tracing]
    end
    DB[(PostgreSQL)]
    Redis[(Redis)]
    MQ[(Message Queue)]
    Email[Email/SMS Provider]
    Storage[(Object Storage)]
    Observability[Logging + Monitoring]

    Web --> ClientState --> Controllers
    Web --> Realtime
    Controllers --> AuthGuard --> AppServices --> Domain
    AppServices --> RepoPorts
    RepoPorts --> PgRepos --> DB
    AppServices --> RedisAdapter --> Redis
    AppServices --> MQAdapter --> MQ
    MQ --> EmailAdapter --> Email
    Controllers --> StorageAdapter --> Storage
    Controllers --> Logger --> Observability
    AppServices --> Metrics --> Observability
```

## Decision Analysis

| Aspect | Detail |
| --- | --- |
| Why chosen | Components align runtime dependencies with Clean Architecture modules. |
| Alternatives considered | Direct controller-to-database access, frontend direct database access, all side effects inline. |
| Advantages | Testable boundaries, asynchronous resilience, centralized observability. |
| Disadvantages | More moving parts than a minimal CRUD application. |
| Future impact | Message and repository adapters can be replaced without changing domain rules. |
