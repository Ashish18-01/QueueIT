# Final project audit — QueueIt

**Completed:** 2026-08-29

## 1. Executive summary

QueueIt has a passing frontend production build and passing backend/frontend automated test suites.  This audit corrected concrete API configuration, customer authorization, private-queue, token-collision, lifecycle concurrency, and Docker-default issues.  It is **not yet possible to assert that the complete product is working end-to-end**: the environment had no MongoDB/Redis/Docker/browser runtime and the backend lacks CRUD resources required by the advertised branch/venue/counter/employee administrative flow.

## 2. Bugs found and fixed

### Bug: frontend called an unversioned API path

- **Root cause:** The Vite default and example used `/api`; the backend mounts routes at `/api/v1`.
- **Files:** `frontend/src/services/apiClient.js`, `frontend/.env.example`.
- **Fix:** Aligned both values to `/api/v1`.
- **Verification:** Frontend Vitest, ESLint, and production build passed.
- **Status:** Fixed.

### Bug: a customer could request another customer's queue entries

- **Root cause:** The list service passed a caller-controlled `customerId` query through to the repository.
- **Files:** `backend/src/services/queueEntryService.js`, `backend/tests/queueEntry.service.test.js`.
- **Fix:** Customer list queries now overwrite `customerId` with the authenticated account ID; managers retain operational listing.
- **Verification:** Added and passed ownership-list regression test.
- **Status:** Fixed.

### Bug: customers could join non-public queues

- **Root cause:** Join checked only queue activity, not visibility.
- **Files:** `backend/src/services/queueEntryService.js`, `backend/src/services/queueService.js`, corresponding service tests.
- **Fix:** Customer directory/get endpoints restrict results to active public queues and self-service join rejects explicitly non-public queues.
- **Verification:** Added and passed internal-queue and directory-filter regression tests.
- **Status:** Fixed.

### Bug: stale operators could both process one ticket

- **Root cause:** Transition updates did not condition on the entry's current status after reading it.
- **Files:** `backend/src/repositories/queueEntryRepository.js`, `backend/src/services/queueProcessingService.js`, `backend/tests/queueProcessing.service.test.js`.
- **Fix:** Lifecycle update is a status compare-and-set; a lost race returns a conflict.
- **Verification:** Added and passed concurrent-change regression test.
- **Status:** Fixed.

### Bug: generated queue token collision surfaced as a server error

- **Root cause:** Two joins could compute the same sequential number before the unique index rejected one.
- **Files:** `backend/src/services/queueEntryService.js`, `backend/tests/queueEntry.service.test.js`.
- **Fix:** Duplicate-key token generation errors retry up to three times using the unique indexes as authority.
- **Verification:** Added and passed duplicate-token retry regression test.
- **Status:** Fixed / capacity contention still requires real-database validation.

### Bug: Docker deployment default disabled queue feature

- **Root cause:** Compose and root example set `FEATURE_QUEUE_ENABLED` false despite queue being the core application function.
- **Files:** `.env.example`, `docker-compose.yml`.
- **Fix:** Default changed to true.
- **Verification:** Static Compose review only; Docker command unavailable.
- **Status:** Fixed.

## 3. Features verified

- Backend authentication request validation, token middleware, registration/login/refresh/logout, password-reset service behavior, email-verification service behavior, and health routes are covered by passing Jest tests.
- Queue creation rules, duplicate names, allowed queue transitions, joining, duplicate joins, capacity rejection, customer leave/cancel, call/start/complete lifecycle checks, Socket.IO room/event helpers, and organization service behavior are covered by passing Jest tests.
- Frontend routing/protection, auth forms/state, business dashboard, profile, notifications, realtime Redux state, analytics page, and UI components are covered by passing Vitest tests.
- OpenAPI document parsing and frontend production bundling are verified.

## 4. Tests executed

| Command | Result |
| --- | --- |
| `cd backend && npm test` | PASS — 11 suites, 43 tests. |
| `cd backend && npm run lint` | PASS. |
| `cd backend && npm run docs` | PASS — OpenAPI loaded successfully. |
| `cd frontend && npm test` | PASS — 12 files, 20 tests. |
| `cd frontend && npm run lint` | PASS. |
| `cd frontend && npm run build` | PASS — Vite build completed; non-blocking chunk-size warning emitted. |
| `docker compose config` | NOT TESTABLE — `docker` executable is unavailable in this environment. |

## 5. Remaining issues

### Blocking issues

- The full admin journey cannot be completed through the backend because branch, venue, counter, and employee management APIs/models are absent. Frontend pages alone do not persist these resources.

### Non-blocking issues

- Strict capacity safety under simultaneous joins needs a MongoDB-backed concurrency test and, if required by the product guarantee, atomic capacity reservation/transaction design.
- The production bundle reports a size warning, not a build failure.

### Environment limitations

- No MongoDB, Redis, browser automation, or Docker CLI was available; therefore live persistence, Redis adapter behavior, Socket.IO delivery, Docker startup, and the three requested end-to-end journeys were not claimed as verified.
- SMTP and Google OAuth need real configured third-party credentials to verify delivery/callback behavior.

## 6. How to run

### Local backend

```bash
cp backend/.env.example backend/.env
# Set MONGODB_URI and strong JWT_SECRET / REFRESH_TOKEN_SECRET values.
cd backend
npm install
npm run dev
# Production process: npm start
```

### Local frontend

```bash
cp frontend/.env.example frontend/.env
cd frontend
npm install
npm run dev
# Production assets: npm run build
```

Ensure `VITE_API_BASE_URL=http://localhost:5000/api/v1`, start MongoDB at the configured `MONGODB_URI`, and enable Redis only when configuring the optional Socket.IO adapter.

### Docker

```bash
cp .env.example .env
# Replace placeholder JWT secrets and configure CORS origins.
docker compose up --build
```

Docker execution was not possible in this audit environment.

## 7. End-to-end status

**Can a user currently use QueueIt from login → joining queue → being called → service completion?**

**Not verified end-to-end.** The service and UI layers build/test independently and the core lifecycle has automated service tests, but no live MongoDB-backed API plus browser/socket workflow was runnable here.  The broader advertised admin setup flow is also blocked by missing persisted branch/venue/counter/employee resources.
