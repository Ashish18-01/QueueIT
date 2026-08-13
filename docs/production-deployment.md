# Production Deployment and Live Verification Runbook

Phase 13 inspection result: QueueIt ships a provider-neutral Docker Compose production path. The repository does not define a cloud provider, container registry, remote host, production domain, TLS certificate, or deployment credentials. Therefore, this environment cannot perform or verify a real production deployment without external infrastructure and secret values supplied by an operator.

Do not add provider-specific values or secrets to the repository. Supply every secret and environment-specific value through the selected deployment platform's secret or environment-variable system.

## Existing deployment configuration

- Dockerfiles:
  - `backend/Dockerfile` builds the Node.js backend image.
  - `frontend/Dockerfile` builds the Vite frontend and serves the static build with Nginx.
- Compose files:
  - `docker-compose.yml` defines MongoDB, Redis, backend, frontend, and Nginx services for the full stack.
  - `docker-compose.prod.yml` adds production overrides and requires production secrets through Compose interpolation.
- Nginx:
  - `nginx/nginx.conf` routes `/` to the frontend, `/api/` to the backend, `/socket.io/` to the backend with WebSocket upgrade headers, and `/healthz` to backend readiness.
  - `frontend/nginx.conf` serves the compiled SPA and falls back to `index.html` for client-side routes.
- CI/CD:
  - `.github/workflows/ci.yml` runs backend tests, frontend tests, backend lint, frontend lint, frontend build, production Compose validation, and Docker image builds on pushes to `main` and pull requests.
  - No deployment job or provider-specific release workflow is configured.
- Environment examples:
  - `.env.example` documents Compose-level defaults.
  - `backend/.env.example` documents backend environment variables.
  - `frontend/.env.example` documents frontend build-time variables.
- Health checks:
  - MongoDB uses `mongosh db.adminCommand('ping')`.
  - Redis uses `redis-cli ping`.
  - Backend container health calls `http://127.0.0.1:5000/api/v1/ready`.
  - Nginx exposes `/healthz`, which proxies to `/api/v1/ready`.

## Deployment architecture

The existing production path is:

```text
Internet / load balancer / TLS terminator
  -> QueueIt Nginx container
    -> frontend container for static SPA files
    -> backend container for REST API and Socket.IO
      -> production MongoDB service or secured MongoDB instance
      -> production Redis service or secured Redis instance
```

Run public HTTPS at the external load balancer or reverse proxy unless the selected platform provides another TLS termination layer. Preserve `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto` headers because production Compose enables backend proxy trust.

## Required production environment variables

Set these in the deployment platform, host environment, or secret manager before rendering the production Compose stack. Never commit real values.

| Variable | Required | Purpose | Production requirement |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | Backend database connection string. | Use a managed MongoDB service or secured MongoDB instance with authentication, private networking or restricted network access, backups, and TLS where required by the provider. Include the intended database name in the URI path or provider options. |
| `REDIS_URL` | Yes | Redis connection string for Redis-enabled runtime behavior and Socket.IO scaling support. | Use a managed Redis service or secured Redis instance with authentication, private networking or restricted network access, and TLS where required by the provider. |
| `JWT_SECRET` | Yes | Access-token signing secret. | Use a long random secret unique to production. |
| `JWT_EXPIRES_IN` | No | Access-token lifetime. | Defaults to `15m`; tune through deployment configuration if required. |
| `REFRESH_TOKEN_SECRET` | Yes | Refresh-token signing secret. | Use a long random secret distinct from `JWT_SECRET`. |
| `REFRESH_TOKEN_EXPIRES_IN` | No | Refresh-token lifetime. | Defaults to `7d`; tune through deployment configuration if required. |
| `CORS_ORIGIN` | Yes | Allowed browser origin for REST API requests. | Set to the exact public HTTPS frontend origin; do not use `*` with credentials. |
| `CORS_CREDENTIALS` | No | Enables credentialed CORS. | Defaults to `true`; if true, `CORS_ORIGIN` must be an exact origin. |
| `SOCKET_CORS_ORIGIN` | Yes | Allowed browser origin for Socket.IO. | Set to the exact public HTTPS frontend origin; normally matches `CORS_ORIGIN`. |
| `VITE_API_BASE_URL` | Yes for frontend build | Browser API base URL. | Use `/api/v1` for same-origin Nginx routing or the public backend URL when split-host deployment is intentionally configured. |
| `VITE_SOCKET_URL` | Yes for frontend build | Browser Socket.IO endpoint origin. | Use the public HTTPS application origin. |
| `APP_NAME` / `APP_VERSION` | No | API metadata. | Optional metadata values. |
| `LOG_LEVEL` / `LOG_TO_FILE` | No | Logging behavior. | Prefer platform log collection; keep `LOG_TO_FILE=false` for containers unless persistent log volumes are intentionally configured. |
| `FEATURE_REGISTRATION_ENABLED` | No | Enables or disables public registration. | Defaults to `false` in production Compose; enable only if public self-registration is intended. |
| `FEATURE_QUEUE_ENABLED` | No | Feature flag reserved by the app. | Keep the desired existing value; do not treat this as a deployment feature change. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Only if Google OAuth is enabled by operators | Google OAuth integration. | Configure through the provider secret system and make callback URL match the public backend route. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Only if email sending is enabled by operators | Email delivery. | Configure through the provider secret system; do not commit credentials. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Only if external media notification/storage integration is enabled by operators | Cloudinary-backed media or notification assets. | Configure through the provider secret system; do not commit credentials. |
| `SOCKET_PING_TIMEOUT_MS`, `SOCKET_PING_INTERVAL_MS`, `SOCKET_CONNECT_TIMEOUT_MS`, `SOCKET_ACK_TIMEOUT_MS` | No | Socket.IO timing. | Defaults are defined by backend configuration; tune only for a known production network requirement. |

## Database requirements

Production must not expose an unauthenticated local MongoDB container to the public internet. Before deployment, verify with the selected provider or host configuration:

1. The `MONGODB_URI` points to the production database and includes the expected database name.
2. Authentication is enabled and credentials are supplied only through secrets.
3. Network access is restricted to the application runtime, private network, or approved egress addresses.
4. TLS is enabled where the provider requires or supports it.
5. Backups and restore testing exist outside this repository.
6. No destructive migration, seed, drop, or reset command is run as part of deployment.

The included MongoDB Compose service is suitable only for private, secured hosts with durable volumes, backups, and no public database port exposure. It is not a substitute for a managed production database unless the operator explicitly accepts the operational responsibility.

## Redis requirements

Production must not expose an unsecured Redis instance to the public internet. Before deployment, verify:

1. The `REDIS_URL` points to the production Redis endpoint.
2. Authentication is enabled when supported by the provider.
3. Network access is restricted to the application runtime, private network, or approved egress addresses.
4. TLS is enabled where the provider requires or supports it, using a `rediss://` URL when applicable.
5. Persistence, eviction policy, monitoring, and backup expectations are set by the selected Redis provider or host.

The included Redis Compose service is suitable only for private, secured hosts with durable volumes and no public Redis port exposure.

## Validate configuration before deployment

Render the final Compose model before deployment:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

This must fail if required production secrets or origins are missing. Never bypass this by committing placeholder secrets.

## Deploy with the existing configuration

Use these steps only after the production host, domain, TLS termination, MongoDB, Redis, and secret configuration exist.

1. Build and validate images on the target host or CI runner:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml config
   docker compose -f docker-compose.yml -f docker-compose.prod.yml build backend frontend
   ```

2. Start or update the stack:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```

3. Confirm service health:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
   docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 backend
   docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 nginx
   ```

If the environment uses an external TLS load balancer or reverse proxy, route HTTPS traffic to the Nginx service and preserve `X-Forwarded-Proto` so the backend can trust the proxy in production.

## Production health checks

After startup, verify:

```bash
curl -fsS https://<public-host>/healthz
curl -fsS https://<public-host>/api/v1/ready
curl -fsS https://<public-host>/api/v1/live
curl -fsS https://<public-host>/api/v1/version
```

`/healthz` is an Nginx-level public readiness check that proxies to the backend readiness endpoint. `/api/v1/ready` must show the database as ready before production traffic is accepted.

## Live verification checklist

Only mark a check as passed after it has been tested against the actual production URL. Only run data-mutating checks in an environment where test accounts and queues can be safely cleaned up.

### Frontend

1. Open `https://<public-host>/` and confirm the frontend loads.
2. Confirm static JavaScript and CSS assets return successful responses.
3. Navigate directly to a nested SPA route and confirm `index.html` fallback works.
4. Confirm HTTPS is valid when configured.

### Backend

1. Confirm `https://<public-host>/api/v1/ready` responds successfully.
2. Confirm `https://<public-host>/api/v1/live` responds successfully.
3. Confirm `/api/v1/version` returns the expected application metadata without secrets.
4. Confirm backend logs show successful MongoDB connection and no missing environment variables.
5. Confirm Redis-related logs do not show connection or authentication failures when Redis is enabled.

### Authentication

1. Register a temporary user only if production registration is intentionally enabled.
2. Log in with an approved test account.
3. Confirm protected routes reject anonymous users.
4. Confirm protected routes load for authenticated users with the required role.
5. Log out and confirm tokens are cleared and protected routes are inaccessible.

### Queue system

1. Create a temporary queue with an authorized account.
2. List queues and verify the temporary queue appears.
3. Join the queue as a customer.
4. Confirm token generation and displayed queue position.
5. Leave the queue and verify the entry is removed or marked left.
6. Rejoin if needed, then verify Call Next, Recall, Skip, and Complete Service from an authorized business/admin account.
7. Clean up the temporary queue if supported by the current application behavior.

### Real-time behavior

1. Keep two browser sessions open and confirm the Socket.IO connection succeeds.
2. Confirm queue updates appear without manual refresh.
3. Confirm counter and customer updates appear without manual refresh.
4. Temporarily interrupt one browser session and confirm reconnection handling.

### Notifications

1. Trigger an in-app notification through normal queue actions.
2. Confirm notification history loads.
3. Confirm read and unread state changes persist.
4. Test browser notifications only if browser notification support is configured and permission is granted.

### Analytics

1. Open the analytics dashboard with an authorized account.
2. Confirm queue statistics load.
3. Confirm filters work.
4. Confirm reports load.

## Production health review

Review runtime health before declaring production ready:

- Container/service health is healthy or equivalent in the selected platform.
- Backend, frontend, and Nginx logs do not show deployment-blocking errors.
- Nginx routes `/`, `/api/`, `/socket.io/`, and `/healthz` correctly.
- API requests do not show unexpected 4xx or any 5xx responses during verification.
- Browser console does not show CORS errors.
- Socket.IO does not show connection, transport, or CORS errors.
- MongoDB and Redis connections are authenticated and stable.
- GitHub Actions CI is passing for the deployed commit.

## Security review

Before production traffic is enabled, verify:

- No real secrets are committed to the repository.
- Runtime logs do not print database credentials, Redis credentials, JWT secrets, OAuth secrets, SMTP passwords, or API keys.
- Public API responses do not expose debug stacks or internal error details in production.
- CORS origins are exact production origins, not wildcards, when credentials are enabled.
- Cookies and proxy headers are compatible with the HTTPS termination layer.
- MongoDB and Redis ports are not publicly exposed.
- Any cloud dashboard, registry, or host access is protected by least privilege and multi-factor authentication where available.

## Rollback procedure

Because no provider-specific deployment target is configured in this repository, use the rollback mechanism for the selected platform. For the Docker Compose path, the generic rollback is:

1. Identify the last known good commit or image tag.
2. Restore the previous image or checkout the previous commit on the deployment host.
3. Re-render the production Compose config with the same production secrets.
4. Restart the stack:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```

5. Re-run the health checks and live verification checks relevant to the incident.
6. Do not roll back the database destructively. Restore database backups only through the provider-approved recovery process.

## Troubleshooting

- Missing variable during `docker compose config`: set the required variable in the platform secret store or host environment; do not edit Compose with real values.
- `/healthz` fails: inspect backend readiness and Nginx logs; verify MongoDB connectivity first.
- `/api/v1/ready` reports database down: verify `MONGODB_URI`, network allowlists, credentials, TLS options, and provider status.
- Redis connection errors: verify `REDIS_URL`, authentication, TLS scheme, network allowlists, and provider status.
- Browser CORS errors: verify `CORS_ORIGIN`, `SOCKET_CORS_ORIGIN`, public URL scheme, and proxy headers.
- Socket.IO connection errors: verify `/socket.io/` Nginx routing, WebSocket upgrade headers, `VITE_SOCKET_URL`, and `SOCKET_CORS_ORIGIN`.
- Static assets fail: verify frontend image build args, Nginx routing, and any CDN or cache configuration outside this repository.
- CI/CD failure: inspect `.github/workflows/ci.yml` logs for the failing test, lint, build, Compose validation, or Docker build step.

## Phase 13 status

Deployment was not performed from this environment because no accessible production provider, host, domain, TLS configuration, MongoDB service, Redis service, or production secrets were provided in the repository or runtime environment. The repository is ready for an operator to deploy with the existing provider-neutral Docker Compose path once those external requirements are supplied.
