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

Registration returns a development-friendly verification token. Production deployments should deliver that token through email. Forgot-password similarly returns a reset token for test/dev integration and should be wired to SMTP before public launch.

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
