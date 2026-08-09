# Production Deployment Guide

This guide prepares QueueIt for production using the repository's existing Docker, Nginx, and GitHub Actions setup. It does not perform a cloud deployment and intentionally avoids provider-specific values.

## 1. Infrastructure requirements

- A Linux host or container platform capable of running Docker Engine and the Docker Compose plugin.
- A private container network for the `backend`, `frontend`, and `nginx` services.
- A managed MongoDB service, such as MongoDB Atlas, or an equivalent secured MongoDB deployment that is not exposed publicly.
- A managed Redis service or a secured private Redis deployment for Socket.IO adapter support.
- HTTPS termination through a load balancer, ingress controller, or reverse proxy in front of the repository's Nginx container.
- A secret manager or deployment environment variable store for all credentials.
- Persistent storage only for managed backing services. The production application containers should be replaceable.

## 2. Required environment variables

Start from `.env.example`, store production values outside Git, and pass them as deployment secrets or an uncommitted `.env.production` file.

### Backend

| Variable                                 | Production guidance                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `NODE_ENV`                               | Set to `production`.                                                     |
| `APP_NAME`, `APP_VERSION`                | Human-readable service metadata.                                         |
| `PORT`, `HOST`                           | Keep `5000` and `0.0.0.0` for the container unless the image is changed. |
| `TRUST_PROXY`                            | Set to `true` behind Nginx or a load balancer.                           |
| `API_PREFIX`, `API_VERSION`              | Defaults are `/api` and `v1`, producing `/api/v1`.                       |
| `LOG_LEVEL`                              | Use `info` for normal production operation.                              |
| `LOG_TO_FILE`                            | Prefer `false` in containers so logs go to stdout/stderr.                |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | Tune to match expected production traffic.                               |

### Frontend

| Variable            | Production guidance                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Prefer `/api/v1` so browser traffic uses same-origin Nginx routing.                       |
| `VITE_SOCKET_URL`   | Set to the public HTTPS application origin. Rebuild the frontend image after changing it. |

### MongoDB

| Variable                                                  | Production guidance                                                                       |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `MONGODB_URI`                                             | Required. Use a managed MongoDB connection string with credentials supplied from secrets. |
| `MONGODB_CONNECT_TIMEOUT_MS`, `MONGODB_SOCKET_TIMEOUT_MS` | Keep defaults unless your provider requires different timeouts.                           |
| `MONGODB_MAX_POOL_SIZE`, `MONGODB_MIN_POOL_SIZE`          | Size for expected API replica count and database limits.                                  |
| `MONGODB_RETRY_ATTEMPTS`, `MONGODB_RETRY_DELAY_MS`        | Startup retry behavior.                                                                   |

### Redis

| Variable        | Production guidance                                                                     |
| --------------- | --------------------------------------------------------------------------------------- |
| `REDIS_ENABLED` | Set to `true` when Redis is available.                                                  |
| `REDIS_URL`     | Required for multi-instance realtime support. Prefer `rediss://` when TLS is available. |

### JWT, OAuth, notifications, and CORS

| Area          | Variables                                                                          | Production guidance                                                                                   |
| ------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| JWT           | `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRES_IN` | Use unique high-entropy secrets. Rotate through the deployment secret store.                          |
| Cookies       | `ACCESS_TOKEN_COOKIE_NAME`, `REFRESH_TOKEN_COOKIE_NAME`                            | Cookies are secure when `NODE_ENV=production`; serve only over HTTPS.                                 |
| OAuth         | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`                  | Configure only if OAuth is used; callback must match the public HTTPS URL.                            |
| Notifications | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`                | Leave blank if not used; keep credentials in secrets.                                                 |
| Media         | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`             | Leave blank if not used; keep credentials in secrets.                                                 |
| CORS          | `CORS_ORIGIN`, `CORS_CREDENTIALS`, `SOCKET_CORS_ORIGIN`                            | Set origins to the exact public HTTPS frontend origin. Do not use `*` with credentials in production. |

## 3. Database setup

1. Create a production MongoDB database with a dedicated QueueIt application user.
2. Grant only the privileges the application needs for its database.
3. Restrict network access to the application runtime, private network, or approved egress addresses.
4. Enable provider backups and define retention, point-in-time recovery, and restore-test schedules.
5. Store the connection string in `MONGODB_URI` through the deployment secret store.
6. Do not expose a local MongoDB container publicly. The Compose `mongodb` service is for local evaluation unless explicitly isolated and secured.

## 4. Redis setup

1. Create a managed Redis instance or secured private Redis deployment.
2. Require authentication and restrict access to the application runtime network.
3. Prefer TLS and a `rediss://` URL when supported by the Redis provider.
4. Set `REDIS_ENABLED=true` and store the authenticated Redis URL in `REDIS_URL`.
5. Monitor memory, evictions, connection count, and latency because Redis supports realtime Socket.IO coordination.

## 5. Container startup

Build and start the production-facing services with the production overlay:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up --build -d backend frontend nginx
```

The `docker-compose.prod.yml` overlay makes managed `MONGODB_URI` and `REDIS_URL` explicit, removes backend startup dependence on local MongoDB/Redis containers, and leaves the local `mongodb` and `redis` services behind a `local-dependencies` profile.

For local evaluation with bundled MongoDB and Redis, use the base Compose file instead:

```bash
docker compose up --build
```

## 6. Nginx configuration

The edge Nginx configuration in `nginx/nginx.conf`:

- Proxies `/api/` requests to the backend container.
- Proxies `/socket.io/` with HTTP/1.1 upgrade headers and buffering disabled for realtime traffic.
- Proxies all other paths to the frontend container, where `frontend/nginx.conf` applies SPA fallback with `try_files ... /index.html`.
- Enables gzip compression for text, JSON, JavaScript, XML, and SVG responses.
- Adds security-conscious response headers and disables Nginx version tokens.

No production domain is hardcoded. Configure the domain at the external load balancer, ingress, DNS, or TLS-terminating reverse proxy.

## 7. HTTPS and domain configuration

- Point DNS to the production load balancer or host.
- Terminate TLS before traffic reaches this repository's port-80 Nginx container, or add an external HTTPS-capable reverse proxy.
- Forward `X-Forwarded-Proto`, `X-Forwarded-For`, and `Host` headers to Nginx/backend.
- Set `CORS_ORIGIN`, `SOCKET_CORS_ORIGIN`, and `VITE_SOCKET_URL` to the exact public HTTPS origin.
- Verify secure cookies by running with `NODE_ENV=production` over HTTPS.

## 8. Health checks

- Backend container health check: `GET /api/v1/live` from inside the backend image.
- Compose backend readiness check: `GET /api/v1/ready` from inside the Compose network.
- Frontend container health check: HTTP GET `/` inside the frontend image.
- MongoDB local profile health check: `db.adminCommand('ping')`.
- Redis local profile health check: `redis-cli ping`.

Useful commands:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production ps
curl -fsS http://localhost:${NGINX_PORT:-80}/api/v1/live
```

## 9. Logs

Use container logs or the platform log collector:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production logs -f nginx backend frontend
```

Keep `LOG_TO_FILE=false` in production containers unless a mounted, rotated log volume is intentionally configured.

## 10. Rollback procedure

1. Identify the previously known-good image tag or Git commit.
2. Rebuild or pull that version of the backend and frontend images.
3. Restart only the application services:

   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --no-deps backend frontend nginx
   ```

4. Confirm health checks and critical user flows.
5. If data was changed by a failed release, follow the managed MongoDB restore process and document the recovery point used.

## 11. Troubleshooting

| Symptom                      | Checks                                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend is unhealthy         | Verify `MONGODB_URI`, `REDIS_URL`, JWT secrets, and `/api/v1/ready` logs.                                                                       |
| API calls fail from browser  | Confirm `VITE_API_BASE_URL=/api/v1`, Nginx is reachable, and `CORS_ORIGIN` matches the browser origin.                                          |
| Socket.IO fails              | Confirm `/socket.io/` reaches Nginx, upgrade headers are preserved by any upstream proxy, and `SOCKET_CORS_ORIGIN` matches the frontend origin. |
| Login cookies are not stored | Confirm HTTPS is enabled and `NODE_ENV=production`; secure cookies require HTTPS.                                                               |
| MongoDB connection denied    | Check database user credentials, IP/private-network allowlist, TLS requirements, and database name.                                             |
| Redis connection denied      | Check Redis password, TLS scheme, private network rules, and provider connection limits.                                                        |
| Frontend still uses old URLs | Rebuild the frontend image because `VITE_*` values are build-time variables.                                                                    |

## CI/CD note

GitHub Actions currently runs tests, linting, frontend build, and Docker image builds. Automatic production deployment is intentionally not enabled. Any future deployment workflow should use `workflow_dispatch`, protected environments, or required approvals before pushing production changes.
