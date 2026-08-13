# Production Deployment and Live Verification Runbook

QueueIt currently ships with a provider-neutral Docker Compose production path. No repository files define a cloud provider, registry, remote host, or deployment credentials. Do not add provider-specific values or secrets to the repository; provide them through the deployment environment.

## Required production configuration

Create a production `.env` file or secret set with these values before rendering the production Compose stack:

| Variable | Required value |
| --- | --- |
| `JWT_SECRET` | Long, random production access-token signing secret. |
| `REFRESH_TOKEN_SECRET` | Long, random production refresh-token signing secret distinct from `JWT_SECRET`. |
| `MONGODB_URI` | Production MongoDB connection URI, preferably a managed MongoDB service with backups. |
| `REDIS_URL` | Production Redis connection URI used by Socket.IO scaling and cache/rate-limit support. |
| `CORS_ORIGIN` | Exact public HTTPS frontend origin, for example `https://queueit.example.com`. |
| `SOCKET_CORS_ORIGIN` | Exact public HTTPS Socket.IO origin; normally matches `CORS_ORIGIN`. |
| `VITE_API_BASE_URL` | Browser API base URL; use `/api/v1` for same-origin Nginx routing. |
| `VITE_SOCKET_URL` | Public HTTPS application origin used by Socket.IO clients. |
| `NGINX_PORT` | Host port for Nginx; usually `80` behind a TLS-terminating load balancer. |

Optional production values include `JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`, `LOG_LEVEL`, `LOG_TO_FILE`, `FEATURE_REGISTRATION_ENABLED`, `MONGODB_*` timeout/pool settings, and Socket.IO timeout settings.

## Validate configuration

Render the final Compose model before deployment:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

This must fail if required production secrets or origins are missing. Never bypass this by committing placeholder secrets.

## Deploy with the existing configuration

When the production host or CI/CD runner already has the required secrets and Docker access, run:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

If the environment uses an external TLS load balancer or reverse proxy, route HTTPS traffic to the Nginx service and preserve `X-Forwarded-Proto` so the backend can trust the proxy in production.

## Production health checks

After startup, verify containers and health endpoints:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 nginx
curl -fsS https://<public-host>/healthz
curl -fsS https://<public-host>/api/v1/ready
curl -fsS https://<public-host>/api/v1/live
```

`/healthz` is an Nginx-level public readiness check that proxies to the backend readiness endpoint.

## Live verification checklist

Only run data-mutating checks in an environment where test accounts and queues can be safely cleaned up.

1. Open `https://<public-host>/` and confirm the frontend loads.
2. Confirm `https://<public-host>/api/v1/ready` reports readiness.
3. Register a temporary user only if production registration is intentionally enabled.
4. Log in with an approved test account.
5. Confirm protected pages redirect anonymous users and load for authenticated users.
6. Create a temporary queue, then delete or archive it after verification if cleanup is supported.
7. Join the temporary queue as a customer.
8. Leave the queue and verify the entry is removed or marked left.
9. Rejoin as needed, then verify Call Next and Complete Service from a business/admin account.
10. Keep two browser sessions open to confirm real-time Socket.IO queue updates.
11. Verify notifications appear and notification history loads.
12. Verify analytics pages load for an authorized user.
13. Log out and confirm tokens are cleared and protected pages are no longer accessible.
14. Navigate to an unknown route and confirm the error/not-found page loads.

## Manual steps still required for first production launch

Because the repository is provider-neutral, an operator must supply:

- The production domain and HTTPS/TLS termination layer.
- The production MongoDB service or a decision to run the included MongoDB container with durable backups.
- The production Redis service or a decision to run the included Redis container with durable persistence.
- Secret values in the target environment.
- Any container registry, remote host, or cloud-specific deployment credentials.
- A rollback procedure and backup/restore verification appropriate to the selected provider.
