# Docker Guide

This guide describes how to run the QueueIt MERN application with Docker Compose. The Compose stack contains the React/Vite frontend, Express/Socket.IO backend, MongoDB, Redis, and an edge Nginx reverse proxy.

## Prerequisites

- Docker Engine with the Docker Compose plugin.
- Available local port `80`, or set `NGINX_PORT` in `.env` to another host port.
- A local `.env` file created from `.env.example`.

## Environment setup

From the repository root:

```bash
cp .env.example .env
```

Update `.env` before production use:

- Replace `JWT_SECRET` and `REFRESH_TOKEN_SECRET` with long, random values.
- Keep `MONGODB_URI` managed by Compose unless using an external database.
- Keep `REDIS_ENABLED=true` to enable the Socket.IO Redis adapter in the container stack.
- Use same-origin frontend defaults (`VITE_API_BASE_URL=/api/v1`) so browser API traffic flows through Nginx.
- Set `CORS_ORIGIN` and `SOCKET_CORS_ORIGIN` to the public origin serving the app.

Do not commit real secrets in `.env` files.

## Build and start

```bash
docker compose up --build
```

Open the application at `http://localhost` when using the default `NGINX_PORT=80`. If you changed the port, use `http://localhost:<NGINX_PORT>`.

## Run in the background

```bash
docker compose up --build -d
```

## Stop

```bash
docker compose down
```

To remove persisted MongoDB and Redis data as well:

```bash
docker compose down -v
```

## Services

| Service    | Purpose                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `nginx`    | Public entry point; proxies `/api/*` and `/socket.io/*`, and forwards frontend routes to the frontend container. |
| `frontend` | Builds React/Vite production assets and serves them from Nginx.                                                  |
| `backend`  | Runs the Node.js API and Socket.IO server as a non-root user.                                                    |
| `mongodb`  | Stores QueueIt application data in the `mongodb_data` named volume.                                              |
| `redis`    | Provides Redis persistence and Socket.IO adapter support through the `redis_data` named volume.                  |

## Health checks

- Backend: `GET /api/v1/ready` through an internal Node.js health check.
- MongoDB: `db.adminCommand('ping')` through `mongosh`.
- Redis: `redis-cli ping`.

Check status with:

```bash
docker compose ps
```

## Troubleshooting

### Port 80 is already in use

Set another host port in `.env`:

```bash
NGINX_PORT=8080
```

Then run `docker compose up --build` and open `http://localhost:8080`.

### Backend is unhealthy

View backend logs:

```bash
docker compose logs backend
```

Common causes are invalid secrets, MongoDB connection issues, or CORS origins that do not match the browser origin.

### MongoDB or Redis data needs a clean reset

Stop the stack and remove named volumes:

```bash
docker compose down -v
```

Then rebuild and start again.

### Frontend API calls fail

Verify these values in `.env` for the Compose stack:

```bash
VITE_API_BASE_URL=/api/v1
VITE_SOCKET_URL=http://localhost
CORS_ORIGIN=http://localhost
SOCKET_CORS_ORIGIN=http://localhost
```

Rebuild the frontend after changing any `VITE_*` variable because Vite embeds those values at build time:

```bash
docker compose up --build frontend nginx
```
