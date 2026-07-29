# Software Requirements Specification: QueueIt

## 1. Document Control

| Field | Value |
| --- | --- |
| Product | QueueIt |
| Document Type | Software Requirements Specification |
| Phase | Phase 1 |
| Status | Baseline draft for stakeholder approval |
| Target Platform | Multi-tenant SaaS web platform |
| Primary Users | Customers, counter operators, venue managers, organization administrators, super administrators |

## 2. Executive Summary

QueueIt is an enterprise virtual queue management platform for organizations that need to replace physical waiting lines with intelligent, real-time digital queues. The system must support multiple tenants, branches, venues, counters, queue lifecycles, notifications, analytics, auditability, and secure role-based operations at scale.

The Phase 1 objective is to define the product and engineering requirements before implementation. This prevents premature coding, establishes system boundaries, identifies critical business rules, and creates a stable foundation for architecture, database design, backend services, frontend applications, real-time communication, testing, and deployment.

## 3. Architecture Decision Rationale for Phase 1

### 3.1 Why requirements are documented before implementation

QueueIt contains high-risk domains: concurrent queue token generation, multi-tenant authorization, customer identity, audit logs, notifications, analytics, and real-time state synchronization. These concerns directly affect correctness, security, and user trust. Requirements are documented first so engineering decisions can be validated against explicit business and operational needs.

### 3.2 Why phased delivery is required

A production SaaS platform cannot be safely generated as one large code drop. QueueIt will be delivered through controlled phases to preserve clean architecture boundaries, maintain security review points, and avoid coupling application logic to infrastructure details too early.

### 3.3 Why clean architecture is mandatory

QueueIt business rules must outlive frameworks, hosting providers, and database implementation details. Clean architecture separates presentation, application, domain, and infrastructure concerns so queue lifecycle rules, authorization decisions, and tenancy constraints remain testable and reusable.

## 4. Product Vision

QueueIt enables organizations to manage customer flow digitally by allowing customers to join queues remotely or onsite, receive live status updates, and be served by counter operators through controlled queue workflows. Managers and administrators receive operational dashboards and analytics to optimize staffing, reduce wait times, and improve service quality.

## 5. Goals

- Replace physical queues with reliable virtual queues.
- Support multi-tenant organizations with strict data isolation.
- Provide real-time queue visibility for customers and staff.
- Prevent duplicate token generation under concurrent load.
- Enable configurable queue capacity, scheduling, and lifecycle policies.
- Provide analytics for wait time, service time, throughput, abandonment, and satisfaction.
- Deliver secure authentication, authorization, audit logging, and session management.
- Support cloud deployment, horizontal scalability, observability, and CI/CD.

## 6. Non-Goals for Initial Phases

- Native mobile applications are not part of the initial implementation.
- Offline-first queue operation is not part of the initial implementation.
- Payment processing is not part of the initial implementation.
- Machine-learning-based optimization is not part of the initial implementation.
- White-label mobile app publishing is not part of the initial implementation.

## 7. Stakeholders and User Roles

| Role | Description | Primary Responsibilities |
| --- | --- | --- |
| Customer | End user joining a queue | Join queue, monitor status, receive notifications, provide feedback |
| Counter Operator | Staff serving customers | Call, serve, complete, skip, recall, or transfer queue entries |
| Venue Manager | Manager of a venue | Configure queues, counters, capacity, schedules, and monitor operations |
| Organization Admin | Tenant administrator | Manage branches, venues, users, roles, permissions, and reports |
| Super Admin | Platform operator | Manage tenants, platform health, global configuration, and support operations |

## 8. Domain Model Overview

QueueIt uses a normalized domain model to preserve data integrity, support auditability, and enable tenant-level isolation.

| Entity | Purpose |
| --- | --- |
| Organization | Tenant root that owns branches, users, roles, policies, and billing boundaries |
| Branch | Operational location belonging to one organization |
| Venue | Service area belonging to one branch |
| Counter | Service point inside a venue |
| Queue | Configurable waiting line attached to exactly one venue |
| QueueEntry | Customer's participation record in a queue |
| User | Authenticated platform identity |
| Role | Named authorization role |
| Permission | Fine-grained action capability |
| Notification | Message delivered through in-app, email, SMS, or push channels |
| AuditLog | Immutable record of sensitive actions and system events |
| Feedback | Customer satisfaction and service feedback |
| AnalyticsSnapshot | Precomputed operational metrics for dashboards and reports |
| Session | User login session metadata |
| RefreshToken | Rotating credential used to renew access tokens |

## 9. Functional Requirements

### 9.1 Organization Management

- The system shall allow super administrators to create, update, suspend, and soft-delete organizations.
- The system shall enforce organization-level data isolation for all tenant-owned resources.
- The system shall support organization-level configuration for queue policies, branding, notification defaults, and allowed concurrent active queues per customer.

### 9.2 Branch Management

- The system shall allow organization administrators to create, update, suspend, and soft-delete branches.
- Each branch shall belong to exactly one organization.
- Branch data shall include operating hours, timezone, address, contact information, and status.

### 9.3 Venue Management

- The system shall allow authorized users to create and manage venues inside branches.
- Each venue shall belong to exactly one branch.
- Each venue shall support queue configuration, capacity rules, counter assignment, and operational status.

### 9.4 Counter Management

- The system shall allow venue managers to create and configure counters for a venue.
- Counters shall have statuses such as active, inactive, busy, paused, and closed.
- Counter operators shall only operate counters assigned to authorized venues unless granted broader permissions.

### 9.5 Queue Management

- The system shall allow authorized users to create, update, open, pause, resume, and close queues.
- Each queue shall belong to exactly one venue.
- Queue capacity shall be configurable.
- Queue schedules shall define allowed join windows.
- Closed queues shall reject new queue entries.
- Paused queues shall preserve customer order and reject or hold joins based on configured policy.
- Queue history shall never be hard deleted.

### 9.6 Queue Entry Management

- Customers shall be able to join an eligible queue as authenticated users, guests, or walk-ins.
- Each customer may join only one active queue at a time unless the organization explicitly allows multiple active queues.
- Queue entries shall progress through created, waiting, called, in service, completed, skipped, cancelled, expired, recalled, no show, transferred, or rejected states.
- Skipped users may be recalled if not expired.
- Expired users shall not be recalled.
- Token numbers shall restart daily or according to queue configuration.
- Concurrent join requests shall never generate duplicate tokens.
- Queue entry transitions shall be validated against lifecycle rules.

### 9.7 Authentication and Account Management

- The system shall support JWT access tokens.
- The system shall support refresh token rotation.
- The system shall support Google OAuth.
- The system shall support email verification.
- The system shall support forgot password and reset password flows.
- Passwords shall be hashed using a secure adaptive hashing algorithm.
- Accounts shall support lockout after configurable failed login attempts.
- User sessions shall be tracked and revocable.

### 9.8 Authorization

- The system shall support role-based access control.
- The system shall support permission-based access control.
- Authorization shall consider tenant, branch, venue, and resource ownership scope.
- Controllers shall not contain authorization business rules beyond invoking middleware or policies.

### 9.9 Real-Time Features

- The system shall provide Socket.IO-based live queue updates.
- The system shall provide live ETA updates.
- The system shall provide live dashboard updates.
- The system shall provide live notifications.
- The system shall track queue status, counter status, and user presence where appropriate.

### 9.10 Notifications

- The system shall support in-app, email, SMS, and push notification channels.
- The system shall emit notifications for queue joined, top five, top three, now serving, skipped, queue closed, queue paused, queue resumed, and feedback reminder events.
- Notification delivery shall be asynchronous where possible to preserve API latency.

### 9.11 Analytics and Reporting

- The system shall provide average wait time, average service time, peak hours, queue length, throughput, counter performance, venue performance, employee performance, satisfaction, abandonment rate, no-show rate, and service efficiency metrics.
- The system shall support daily, weekly, monthly, and yearly reports.
- Reports shall support filtering, sorting, pagination, and export.

### 9.12 Feedback

- Customers shall be able to submit feedback after service completion.
- Feedback shall be associated with the relevant queue entry, queue, venue, branch, and organization.
- Feedback shall support analytics aggregation without exposing unnecessary personal data.

### 9.13 Audit Logs

- Sensitive actions shall produce audit logs.
- Audit logs shall include actor, action, resource, tenant scope, timestamp, correlation ID, request metadata, and before/after summaries where safe.
- Audit logs shall be immutable from normal application workflows.

### 9.14 Search, Filtering, Sorting, and Pagination

- List endpoints shall support pagination.
- Administrative resources shall support filtering and sorting by approved fields.
- Searchable resources shall use indexed text search or optimized query patterns.
- Unbounded list responses shall not be allowed.

### 9.15 Frontend Experience

- The frontend shall use React, Vite, Redux Toolkit, React Query, React Router, and TailwindCSS.
- The UI shall be responsive and support dark mode.
- Protected routes shall enforce authentication and authorization state.
- The UI shall include reusable components, skeleton loaders, optimistic UI where safe, accessibility considerations, and toast notifications.

## 10. Queue Business Rules

| Rule ID | Requirement |
| --- | --- |
| QBR-001 | Each queue belongs to exactly one venue. |
| QBR-002 | Each venue belongs to exactly one branch. |
| QBR-003 | Each branch belongs to exactly one organization. |
| QBR-004 | A customer may join only one active queue at a time unless organization policy allows otherwise. |
| QBR-005 | Token numbers restart daily or according to queue-level token reset configuration. |
| QBR-006 | Queue capacity must be enforced before accepting new entries. |
| QBR-007 | Closed queues cannot accept new users. |
| QBR-008 | Paused queues preserve customer order. |
| QBR-009 | Skipped users can be recalled only while still eligible. |
| QBR-010 | Expired users cannot be recalled. |
| QBR-011 | Average wait time updates automatically after queue state changes. |
| QBR-012 | ETA recalculates whenever queue state changes. |
| QBR-013 | Queue history must never be hard deleted. |
| QBR-014 | Queue operations that modify queue order, token sequence, or lifecycle state must be atomic. |
| QBR-015 | Concurrent join requests must never generate duplicate tokens. |
| QBR-016 | MongoDB transactions must be used when consistency spans multiple documents. |
| QBR-017 | Invalid lifecycle transitions must be rejected with deterministic error codes. |

## 11. Non-Functional Requirements

| Category | Requirement |
| --- | --- |
| Scalability | Support 1000+ concurrent users, 100+ active queues, and 10000+ queue entries. |
| Performance | Common API requests should complete within sub-second latency under expected load. |
| Availability | Backend services shall be stateless and horizontally scalable. |
| Reliability | Queue state mutations shall be atomic and resilient to retry-safe workflows. |
| Security | Security shall be enabled by default through headers, validation, rate limits, tenant isolation, audit logs, and secret management. |
| Maintainability | Code shall follow clean architecture, SOLID principles, reusable modules, and strict folder boundaries. |
| Observability | Services shall emit structured logs, request IDs, correlation IDs, health checks, metrics, and error telemetry. |
| Deployability | The system shall be Docker-ready, CI/CD-ready, and suitable for cloud deployment. |
| Accessibility | Customer and staff UI workflows shall consider WCAG-aligned accessibility practices. |

## 12. API Requirements

Every endpoint shall define:

- Purpose.
- Authentication requirements.
- Authorization requirements.
- Request validation schema.
- Request body.
- Response body.
- HTTP status codes.
- Application error codes.
- Swagger documentation.
- Example request.
- Example response.
- Pagination, filtering, sorting, and searching behavior where applicable.
- API version.

All responses shall use the standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {},
  "errors": []
}
```

## 13. Security Requirements

- Use Helmet for security headers.
- Apply rate limiting to authentication and sensitive endpoints.
- Configure CORS using explicit allowed origins.
- Protect against XSS and MongoDB injection.
- Validate all requests before reaching services.
- Sanitize responses to avoid leaking secrets or internal metadata.
- Store configuration in environment variables.
- Use secure cookies if cookie-based refresh token transport is selected.
- Apply CSRF protection if cookies are used for browser credential transport.
- Enforce HTTPS in production deployments.
- Maintain audit logs for sensitive operations.
- Use centralized error handling without exposing stack traces in production.

## 14. Data Requirements

- Use MongoDB with Mongoose.
- Use normalized collections for organizations, branches, venues, counters, queues, queue entries, users, roles, permissions, notifications, audit logs, feedback, analytics snapshots, sessions, and refresh tokens.
- Use soft delete fields including `deletedAt` where deletion is supported.
- Include `createdAt` and `updatedAt` timestamps.
- Use optimistic concurrency where applicable.
- Use unique, compound, TTL, and text indexes where required.
- Use aggregation pipelines for analytics and reporting.
- Optimize query paths for tenant-scoped reads and queue mutation workflows.

## 15. Observability Requirements

- Use structured Winston logs.
- Use Morgan or equivalent HTTP request logging in development and compatible structured request logs in production.
- Include request IDs and correlation IDs.
- Log API latency and database operation failures.
- Provide health, readiness, and liveness endpoints.
- Emit metrics for queue operations, authentication failures, notification delivery, and API performance.

## 16. Testing Requirements

- Unit tests for domain and application services.
- Repository tests for database access patterns.
- Integration tests for API workflows.
- Authentication and authorization tests.
- Socket.IO real-time event tests.
- External services shall be mocked in automated tests.
- Test database seeding shall be deterministic.
- Minimum target coverage is 80% once implementation begins.
- A Postman collection shall be generated for API validation.

## 17. DevOps Requirements

- Provide Docker and Docker Compose support.
- Use a multi-stage backend Dockerfile.
- Provide Nginx reverse proxy configuration for production deployment patterns.
- Use GitHub Actions for linting, testing, and build validation.
- Support development, staging, and production environment configurations.
- Provide deployment documentation for Vercel, Render, Railway, AWS EC2, MongoDB Atlas, HTTPS, SSL, custom domains, environment variables, secrets, and cloud logging.

## 18. Acceptance Criteria for Phase 1

- The SRS defines product scope, stakeholders, roles, functional requirements, non-functional requirements, queue business rules, security requirements, API standards, data expectations, testing expectations, and DevOps expectations.
- The SRS explains why requirements-first and phased delivery were selected.
- The repository contains a documentation index and an ADR for incremental delivery.
- No application implementation is introduced before stakeholder approval of Phase 1.

## 19. Phase 1 Folder Structure

```text
QueueIT/
├── README.md
└── docs/
    ├── README.md
    ├── adr/
    │   └── 0001-incremental-enterprise-delivery.md
    └── srs/
        └── software-requirements-specification.md
```

## 20. Phase 1 Trade-offs

- Documenting requirements before code slows initial visible implementation but reduces architectural rework.
- Deferring implementation avoids premature technical decisions until the architecture and database phases validate boundaries and consistency needs.
- A formal SRS introduces more review overhead but improves traceability and enterprise readiness.

## 21. Approval Gate

Implementation must not proceed to Phase 2 until Phase 1 is reviewed and approved by the product owner or authorized stakeholder.
