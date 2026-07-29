# QueueIt Software Architecture Documentation

Phase 2 defines the production-oriented software architecture for QueueIt before implementation begins. The design follows Clean Architecture, applies Domain-Driven Design to queue-management concepts, and is intended to support cloud deployment, maintainability, security, and future scale.

## Documentation Map

| Document | Purpose |
| --- | --- |
| [System Overview](./system-overview.md) | High-level architecture, relationships, and data flow. |
| [Clean Architecture](./clean-architecture.md) | Layering, responsibilities, and dependency direction. |
| [Folder Structure](./folder-structure.md) | Proposed feature-based monorepo layout. |
| [Domain Model](./domain-model.md) | Entities, value objects, aggregates, repositories, services, and events. |
| [Database Design](./database-design.md) | ER model, tables, constraints, indexes, audit fields, and migrations. |
| [Authentication](./authentication.md) | Registration, login, JWT, refresh tokens, RBAC, and account recovery. |
| [Queue Lifecycle](./queue-lifecycle.md) | Queue-entry states, transitions, priority, appointments, and failures. |
| [Component Diagram](./component-diagram.md) | Runtime component relationships. |
| [Sequence Diagrams](./sequence-diagrams.md) | Key behavior flows. |
| [Deployment](./deployment.md) | Production cloud deployment, CI/CD, observability, and recovery. |
| [Technology Decisions](./technology-decisions.md) | Major platform and tool choices. |
| [Trade-offs](./tradeoffs.md) | Comparison tables for architectural choices. |
| [Scalability](./scalability.md) | Scaling, caching, background work, and future migration strategy. |
| [Security](./security.md) | Threat model and security controls. |
| [ADRs](./adr/) | Architecture Decision Records for major decisions. |

## Documentation Checklist

- [x] High-Level System Architecture
- [x] Clean Architecture
- [x] Feature-Based Folder Structure
- [x] Domain Model
- [x] Database Architecture
- [x] Authentication Architecture
- [x] Queue Lifecycle
- [x] Component Diagram
- [x] Sequence Diagrams
- [x] Deployment Architecture
- [x] Technology Decisions
- [x] Trade-off Analysis
- [x] Scalability Strategy
- [x] Security Architecture
- [x] Architecture Decision Records

Phase 2 stops at architecture documentation. No application code, API implementation, or UI component implementation is included.
