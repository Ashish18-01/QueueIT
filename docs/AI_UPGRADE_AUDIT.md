# QueueIt AI Upgrade Audit

## Scope and method

This audit was completed before introducing application changes. It reviews the
Node/Express API, React/Vite client, MongoDB schemas, Redis-backed Socket.IO
deployment, Docker/Nginx configuration, tests, and current documentation.

## 1. Current architecture

QueueIt is a JavaScript monorepo with two deployable applications:

- **Frontend:** a React 19/Vite single-page application using Redux Toolkit,
  React Router, React Hook Form, Tailwind CSS, Axios, Socket.IO client, and
  Vitest.
- **Backend:** an Express 4 REST API on Node.js 20+, with Mongoose, JWT-based
  authentication, Express Validator, Winston logging, Socket.IO, Redis, and
  Jest/Supertest.
- **Data and edge:** MongoDB 7 stores operational data; Redis 7 supports the
  Socket.IO adapter; Nginx proxies browser, REST, websocket, and readiness
  traffic. Docker Compose defines the local/production-shaped stack.

The API is mounted at `/api/v1`, uses a common success/error envelope, and
retains a health/readiness/liveness surface. The client accesses it through a
central `businessApi` service.

## 2. Existing functionality

- Registration, login, token refresh/logout, password lifecycle, email
  verification, session controls, and Google sign-in endpoints are present.
- Role- and permission-protected organization creation/listing/dashboard APIs
  are present.
- Queues support templates, create/read/update/delete, searching/listing,
  activation, pause/resume, close, archive, restore, public visibility, daily
  capacity, operating windows, and an average service duration.
- Queue entries support join, leave/cancel, call-next, recall, skip,
  start/complete service, no-show, expiry, positions, tokens, and deterministic
  waiting-time fields.
- Customer, counter, venue-manager, and organization-admin dashboard variants,
  queue pages, current/history entry tables, notifications, analytics, and
  organization screens already exist in the frontend.

## 3. Existing APIs

The principal API families are:

| Area | Base path | Examples |
| --- | --- | --- |
| Platform health | `/api/v1` | `GET /health`, `/ready`, `/live`, `/version`, `/info` |
| Authentication | `/api/v1/auth` | register, login, refresh, logout, password reset, verification, sessions |
| Organizations | `/api/v1/organizations` | list/create, get, dashboard |
| Queues | `/api/v1/queues` | list/search, templates, CRUD, join, lifecycle actions, call-next |
| Queue entries | `/api/v1/queue-entries` | list/search/get, leave/cancel, service-processing actions |
| Notifications/RBAC | `/api/v1/notifications`, `/api/v1/rbac` | notification and authorization management |

The existing OpenAPI document is the source for the detailed contracts.

## 4. Existing database models

- `User`, `Role`, `Session`, and `AuthToken` support identities, roles,
  sessions, and authentication flows.
- `Organization` owns the tenant identity and administrator references.
- `Queue` carries organization, branch, venue, capacity, operating hours,
  lifecycle status, aggregate statistics, and average service duration.
- `QueueEntry` carries tenant scope, queue/customer linkage, token, status,
  position, estimated wait, and service timestamps.
- `AuditLog` preserves business audit activity; `Notification` and
  `NotificationPreference` handle user notifications.

No knowledge-document, chunk, embedding, AI request, AI insight, or
evaluation-result collection exists today.

## 5. Existing real-time architecture

Socket.IO authenticates the same bearer token model as REST, assigns users to
tenant/resource/role rooms, and broadcasts queue and queue-entry lifecycle
events. A Redis adapter is configured when Redis is enabled. The React client
keeps a Redux real-time slice synchronized with these broadcasts. This is a
suitable source for *thresholded* operational insight triggers, but it should
not call an LLM for each event.

## 6. Existing authentication and authorization

`authenticate` verifies JWTs and reloads the active user. Permission checks
delegate to the RBAC service, while business services further constrain tenant
scope and queue visibility. Queue service logic keeps customer access to public
active queues only. Socket room membership is also checked against user scope.

The AI layer must reuse this request identity and scope; it must not accept a
tenant identifier from the model as an authority or issue database queries
outside controlled services.

## 7. Existing Docker architecture

`docker-compose.yml` runs MongoDB, Redis, backend, frontend, and Nginx on an
isolated bridge network. MongoDB, Redis, and backend have health checks; Nginx
exposes `/healthz` by proxying API readiness. `docker-compose.prod.yml`
requires production secrets and public origins. The backend and frontend have
separate Dockerfiles.

## 8. Existing observability

Winston emits structured JSON in production, HTTP access logs flow through
Morgan/Winston, request IDs are installed, and health/readiness/liveness probes
exist. Socket connection/room/broadcast events are logged. There is no dedicated
metrics abstraction, traces, AI latency/token/cost tracking, retrieval timing,
or tool success/failure telemetry.

## 9. Existing testing and delivery automation

Backend Jest coverage includes authentication, health, queue, queue-entry,
queue-processing, organization, and Socket.IO units. Frontend Vitest coverage
includes routes, auth forms/state, dashboard layout, analytics, notifications,
and UI components. The repository includes a GitHub Actions workflow, lint and
build scripts, an OpenAPI validation script, Docker manifests, and a local
seed flow.

## 10. Gaps against the target engineering profile

| Capability | Current state | Gap |
| --- | --- | --- |
| LLM/RAG/embeddings | Not present | Provider abstraction, grounded retrieval, and tenant-scoped chunks are needed. |
| Structured AI workflow | Not present | Controlled, validated read-only tool workflow is needed. |
| Queue optimization | Queue fields support a baseline | Need a transparent recommender and confidence policy. |
| Knowledge management | Not present | Need document/chunk ingestion and admin controls. |
| Guardrails | General API security exists | AI-specific injection, output, tool, and sensitive-data protections are needed. |
| AI observability/evaluation | Not present | Need genuine request/tool/retrieval metrics and an unevaluated dataset. |
| AI UI | Not present | Need a native queue recommendation surface and admin insights. |
| Event-driven AI | Queue events exist | Need debounced, deterministic insight candidates rather than per-event LLM work. |

## 11. Recommended implementation order

1. Add configuration, telemetry, prompt, provider, schema, and guardrail
   primitives that fail closed and leave core workflows independent of AI.
2. Implement a tenant-scoped knowledge-document/chunk model and deterministic
   in-process lexical retrieval abstraction. Keep an embedding-provider/vector
   adapter boundary for MongoDB Atlas Vector Search or another store later.
3. Implement a read-only state-machine supervisor with explicit queue and
   knowledge tools plus a deterministic queue recommendation baseline.
4. Expose guarded assistant, admin insight, knowledge-base, and metrics APIs;
   add tests for scope isolation, injection, invalid output, timeouts, and
   provider unavailability.
5. Add focused frontend panels to existing queue/admin dashboards and document
   operations, evaluation, CI/CD, and JD traceability.
6. Validate lint/tests/builds/Compose configuration. Runtime health checks
   requiring MongoDB/Redis/containers should be reported separately if the
   environment is unavailable.
