# QueueIt project health check

**Audit date:** 2026-08-29.  Statuses below are evidence-based: automated checks were run locally; MongoDB, Redis, browser, and Docker daemon integration were not available in this environment.

| Area | Status | Evidence / scope |
| --- | --- | --- |
| Overall project | PARTIAL | Backend and frontend static checks pass, but the full infrastructure-backed journey was not executable here. |
| Frontend | PASS | Vitest (20 tests), ESLint, and Vite production build pass. |
| Backend | PASS | Jest (43 tests), ESLint, and OpenAPI validation pass. |
| Database | NOT TESTABLE | Mongoose schemas, indexes, and repository queries were statically reviewed; no MongoDB service was available. |
| Authentication | PARTIAL | Registration, login, refresh, logout, password reset, verification, middleware, and API error paths are covered by unit/API tests; SMTP and Google token verification require external services. |
| Authorization | PARTIAL | Role/permission middleware and customer ticket ownership are tested.  Resource assignments for branches, venues, counters, and employees do not have persisted backend resources. |
| API | PARTIAL | Versioned backend routes and OpenAPI parse correctly; the documented administrative resources are incomplete. |
| Socket.IO | PARTIAL | Room/event unit tests pass and event wiring was reviewed; no live authenticated browser/socket server run occurred. |
| Redis | NOT TESTABLE | Optional adapter has failure logging, but no Redis instance was available. |
| Queue management | PARTIAL | Service tests cover join, capacity, duplicate join, transitions, processing, and concurrency compare-and-set. Capacity contention requires a real MongoDB concurrency test. |
| Dashboards | PARTIAL | Frontend builds and component tests pass; several administration pages have no corresponding backend CRUD API. |
| Validation and errors | PARTIAL | Express validators, central errors, and invalid authentication request tests pass; end-to-end form/server error display was not browser-tested. |
| Security | PARTIAL | Password hashes, JWT/session rotation, sanitization, CORS, and ownership checks exist. Customer directory/ticket exposure and private-queue joining were corrected in this audit. |
| Production build | PASS | `frontend npm run build` passes. Backend is interpreted JavaScript and validates with lint/tests/OpenAPI. |
| Docker | NOT TESTABLE | Compose was statically inspected; the Docker CLI/daemon is not installed. |

## Issues fixed in this audit

1. **Frontend API version mismatch — fixed.** The fallback and example pointed at `/api`, while Express mounts APIs at `/api/v1`; both now use `/api/v1`.
2. **Customer data exposure — fixed.** Customer queue-entry list calls now force `customerId` to the authenticated user rather than accepting an arbitrary query value.
3. **Private queue self-service — fixed.** Non-management users cannot join queues marked `internal` or `private`; the customer directory is limited to active public queues.
4. **Concurrent lifecycle update — fixed.** Queue-entry changes now use the current status as an atomic compare-and-set condition, so a stale second operator gets a conflict instead of performing a duplicate call/transition.
5. **Duplicate token collision — mitigated.** Token creation retries MongoDB duplicate-key collisions, relying on the existing unique queue/token indexes.
6. **Docker queue feature disabled by default — fixed.** Compose and root environment examples now enable the queue feature by default.

## Remaining material gaps

### Critical / blocking for the claimed full product

- Branches, venues, counters, and employee assignment are represented by IDs in queue schemas and frontend routes, but there are no models, controllers, services, or CRUD routes for them.  Consequently the full administrator flow cannot be verified or completed using only the exposed backend API.
- No MongoDB-backed integration/E2E test suite is present, so persistence, capacity contention, and multi-user lifecycle behavior are not proven against a running database.

### Medium

- Queue capacity is checked before creation and token collisions are retried, but strict maximum-capacity enforcement under simultaneous joins still needs a transaction or a conditional atomic capacity reservation, validated on the target MongoDB deployment.
- Browser UI/API/Socket.IO end-to-end testing remains outstanding because no browser/server/database stack was available.

### Minor

- Vite reports a non-blocking main chunk-size warning during production build.
