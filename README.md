# QueueIt

QueueIt is an enterprise-grade, multi-tenant virtual queue management platform for replacing physical waiting lines with secure, real-time, analytics-driven digital queues. It supports customer self-service, counter operations, venue and organization administration, live queue updates, notifications, and operational reporting.

## Features

- Multi-role access for customers, counter operators, venue managers, organization admins, and super admins.
- JWT authentication with refresh-token sessions, secure cookies, password reset, email verification, and RBAC authorization.
- Queue lifecycle management, queue-entry processing, token generation, and operator workflows.
- Real-time Socket.IO updates for queue status, customer calls, queue-entry changes, presence, and notifications.
- Responsive React dashboard with protected routing, reusable UI components, theme support, notification center, and analytics views.
- API documentation, OpenAPI validation, architecture records, database design notes, and testing guidance.

## Technology Stack

| Area          | Technology                                                                   |
| ------------- | ---------------------------------------------------------------------------- |
| Backend       | Node.js, Express, Mongoose, MongoDB, Socket.IO                               |
| Frontend      | React, Vite, Redux Toolkit, React Router, Tailwind CSS                       |
| Realtime      | Socket.IO with optional Redis adapter                                        |
| Security      | Helmet, CORS, rate limiting, Mongo sanitization, HPP protection, bcrypt, JWT |
| Testing       | Jest, Supertest, Vitest, React Testing Library                               |
| Documentation | Markdown guides and OpenAPI YAML                                             |

## Architecture Summary

QueueIt uses a MERN-style architecture with a REST API and Socket.IO server sharing the backend HTTP server. Controllers validate and normalize requests, services contain application workflows, repositories/models encapsulate persistence, middleware handles authentication and authorization, and socket modules manage realtime room membership and event delivery. The frontend consumes REST endpoints through shared API services and subscribes to realtime updates through a single Socket.IO client integrated with Redux state.

## Folder Structure

```text
QueueIT/
  backend/                 Express API, Socket.IO server, models, services, tests
  docs/                    Product, architecture, API, and database documentation
  frontend/                React/Vite application, UI components, routes, tests
  README.md                Repository overview and setup entry point
```

## Installation

Prerequisites:

- Node.js 20 or newer.
- npm.
- MongoDB for local backend development.
- Redis only when testing horizontally scaled Socket.IO deployments.

Install each application from its own workspace:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Copy each example file before running locally:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key backend variables include `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRES_IN`, `CORS_ORIGIN`, `CORS_CREDENTIALS`, and optional Redis/Socket.IO settings. Key frontend variables include `VITE_API_BASE_URL` and `VITE_SOCKET_URL`.

See the backend and frontend README files for workspace-specific configuration details.

## Backend Setup

```bash
cd backend
npm install
npm run lint
npm test
npm run docs
npm run dev
```

The backend mounts versioned API routes under `/api/v1`, serves Swagger documentation from the configured OpenAPI file, and hosts Socket.IO on the same HTTP server.

## Frontend Setup

```bash
cd frontend
npm install
npm run lint
npm test
npm run build
npm run dev
```

The frontend expects the backend API and Socket.IO origins to be configured through Vite environment variables.

## Docker Setup

QueueIt includes Docker Compose support for the frontend, backend, MongoDB, Redis, and Nginx.

```bash
cp .env.example .env
docker compose up --build
```

The application is served through Nginx at `http://localhost` by default. Stop the stack with:

```bash
docker compose down
```

See [docs/docker/README.md](docs/docker/README.md) for Docker prerequisites, environment setup, build/start/stop commands, health checks, and troubleshooting.

## Testing

- Backend: `cd backend && npm test` runs Jest/Supertest coverage for API, authentication, queues, and socket behavior.
- Frontend: `cd frontend && npm test` runs Vitest and React Testing Library tests for UI, routing, Redux, analytics, and notifications.
- API documentation validation: `cd backend && npm run docs` validates the OpenAPI specification.

## API Documentation

- API documentation index: [docs/api/README.md](docs/api/README.md)
- API overview: [docs/api/api-overview.md](docs/api/api-overview.md)
- OpenAPI specification: [docs/api/openapi.yaml](docs/api/openapi.yaml)
- Socket.IO integration guide: [frontend/docs/socket-integration-guide.md](frontend/docs/socket-integration-guide.md)

## Deployment Overview

Production deployments should run the backend and frontend as separate deployable units. Build the frontend with `npm run build` and serve the generated static assets through the chosen hosting platform. Run the backend with production environment variables, MongoDB connectivity, secure JWT secrets, restricted CORS origins, HTTPS-enabled cookies, log retention, and Redis enabled when multiple backend instances need shared Socket.IO rooms.

Additional deployment and architecture notes are available in [docs/architecture/deployment.md](docs/architecture/deployment.md) and [docs/architecture/README.md](docs/architecture/README.md).

## License

No license file is currently included. Add an explicit license before public distribution.
