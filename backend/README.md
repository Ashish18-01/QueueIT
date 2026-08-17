# QueueIt Backend

Express/MongoDB backend foundation for QueueIt.

## Authentication architecture

The authentication module is mounted at `/api/v1/auth` and keeps controllers thin: request validation runs in `src/validators`, orchestration lives in `src/services/authService.js`, persistent state uses Mongoose models, and route protection uses `src/middlewares/auth.js`.

Core collections:

- `users`: normalized email identity, bcrypt password hash, Google account link, verification status, role names, login history, and password history.
- `sessions`: one refresh-token session per device, storing only a SHA-256 hash of the refresh token, expiration, revocation state, and activity metadata.
- `authtokens`: hashed one-time email verification and password reset tokens with TTL expiry.
- `roles`: RBAC roles with permissions, inheritance, hierarchy level, and system/organization/branch/venue scope.
- `auditlogs`: security-relevant events such as registration, login, logout, password resets, verification, session revocation, and RBAC changes.

## JWT and refresh-token lifecycle

Login creates a short-lived JWT access token and a long-lived opaque refresh token. The access token contains the user id in `sub` and the current role names. The refresh token is stored in the client as an HTTP-only cookie and in MongoDB only as a hash.

Refresh calls validate the session, reject revoked or expired sessions, rotate the refresh token, update session activity, and issue a new JWT. If a reused/invalidated refresh token is detected for a known family, the family is revoked to reduce replay risk.

Logout revokes the current refresh-token session. Logout-all revokes every active session for the authenticated user and clears cookies.

## Cookie strategy and CSRF considerations

`accessToken` and `refreshToken` cookies are HTTP-only, `SameSite=Lax`, and `Secure` in production. API clients may also send the access token with `Authorization: Bearer <token>`. Because cookie credentials are supported, state-changing browser integrations should add a CSRF token/header at the edge or frontend integration layer before enabling broad cross-site origins.

## Password and email flows

Passwords must be at least 12 characters and include lowercase, uppercase, numeric, and special characters. bcrypt hashes passwords with 12 rounds. Password history prevents reuse during reset/change flows, and password metadata supports expiration policies.

Registration returns a development-friendly verification token. Forgot-password generates a one-time reset token, sends a reset link by SMTP when `SMTP_HOST` is configured, and returns only the anti-enumeration `{ sent: true }` response. Local automated tests mock email delivery and do not send real email.

## RBAC model

Users have `roleNames`. Roles define permission strings, optional inherited roles, hierarchy level, and scope (`system`, `organization`, `branch`, `venue`). Authorization middleware supports role checks, permission checks, ownership checks, and authenticated-user injection as `req.user`.

Permission checks support exact permissions, wildcard `*`, and scoped variants such as `queues:read:organization`, `queues:read:branch`, and `queues:read:venue` when matching route parameters are present. Queue business endpoints are intentionally not implemented in this phase.

## Environment variables

Required in production:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (default `15m`)
- `REFRESH_TOKEN_SECRET` (reserved for deployments that use signed refresh tokens)
- `REFRESH_TOKEN_EXPIRES_IN` (default `7d`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` for Google OAuth integrations
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and provider credentials (`SMTP_USER` / `SMTP_PASSWORD`) for password-reset email delivery
- `PASSWORD_RESET_URL` pointing at the frontend reset-password route, for example `https://app.example.com/reset-password`
- `CORS_ORIGIN` and `CORS_CREDENTIALS`

## Setup

```bash
npm install
cp .env.example .env
npm run lint
npm test
npm run docs
npm run dev
```

## Real-time Socket.IO API

QueueIt exposes a Socket.IO server on the same HTTP server as the REST API. Clients authenticate during the Socket.IO handshake with the existing JWT access token:

```js
io(API_URL, { auth: { token: accessToken, counterId: optionalCounterId } });
```

Unauthorized sockets are rejected before connection. Authenticated sockets are automatically joined to authorized organization, branch, venue, customer, employee, and admin rooms. Clients can request additional authorized rooms with `room:join` and leave them with `room:leave`; both events support acknowledgements in the shape `{ ok, room, error }`.

### Redis adapter

Set `REDIS_ENABLED=true` and `REDIS_URL=redis://host:6379` to enable the Socket.IO Redis adapter for horizontally scaled backend instances. When disabled, Socket.IO uses the in-memory adapter for a single instance.

### Reliability and presence

The server configures Socket.IO heartbeat, connection timeout, and broadcast acknowledgement timeouts through `SOCKET_PING_TIMEOUT_MS`, `SOCKET_PING_INTERVAL_MS`, `SOCKET_CONNECT_TIMEOUT_MS`, and `SOCKET_ACK_TIMEOUT_MS`. Broadcast payloads include an `eventId`; repeated event IDs are ignored briefly to prevent duplicate broadcasts. Presence updates are emitted to the `admin` room with connected customer, employee, admin, and active counter counts.

### Emitted events

| Event | Payload | Sender | Receiver |
| --- | --- | --- | --- |
| `queue:created` | Queue document | Queue service | Organization, branch, venue, queue, admin rooms |
| `queue:updated` | Queue document | Queue service | Organization, branch, venue, queue, admin rooms |
| `queue:activated` | Queue document | Queue service | Organization, branch, venue, queue, admin rooms |
| `queue:paused` | Queue document | Queue service | Organization, branch, venue, queue, admin rooms |
| `queue:resumed` | Queue document | Queue service | Organization, branch, venue, queue, admin rooms |
| `queue:closed` | Queue document | Queue service | Organization, branch, venue, queue, admin rooms |
| `queue:deleted` | Queue document | Queue service | Organization, branch, venue, queue, admin rooms |
| `queue-entry:customer-joined` | Queue entry document | Queue entry service | Organization, branch, venue, queue, customer, admin rooms |
| `queue-entry:customer-left` | Queue entry document | Queue entry service | Organization, branch, venue, queue, customer, admin rooms |
| `queue-entry:cancelled` | Queue entry document | Queue entry service | Organization, branch, venue, queue, customer, admin rooms |
| `queue-entry:transferred` | Queue entry document | Queue entry service | Queue entry service integrations | Organization, branch, venue, queue, customer, admin rooms |
| `queue-entry:token-generated` | Queue entry token payload | Queue entry service | Queue and customer rooms |
| `queue-processing:customer-called` | Queue entry document | Queue processing service | Organization, branch, venue, queue, counter, customer, admin rooms |
| `queue-processing:customer-recalled` | Queue entry document | Queue processing service | Organization, branch, venue, queue, counter, customer, admin rooms |
| `queue-processing:customer-skipped` | Queue entry document | Queue processing service | Organization, branch, venue, queue, counter, customer, admin rooms |
| `queue-processing:service-started` | Queue entry document | Queue processing service | Organization, branch, venue, queue, counter, customer, admin rooms |
| `queue-processing:service-completed` | Queue entry document | Queue processing service | Organization, branch, venue, queue, counter, customer, admin rooms |
| `queue-processing:no-show` | Queue entry document | Queue processing service | Organization, branch, venue, queue, counter, customer, admin rooms |
| `queue:live-update` | Queue length, current serving token, waiting count, status, statistics | Queue processing service | Organization, branch, venue, queue, admin rooms |
| `presence:updated` | Connected customers, employees, admins, active counters | Socket server | Admin room |
