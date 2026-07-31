# QueueIt Backend

Foundational Node.js, Express, MongoDB, and Mongoose backend for QueueIt. This phase configures infrastructure only: no authentication, authorization, queue, or business modules are implemented.

## Structure

- `src/config` environment and Swagger configuration.
- `src/database` MongoDB/Mongoose connection lifecycle and health utilities.
- `src/middlewares` Express cross-cutting middleware.
- `src/errors` centralized application errors.
- `src/validators` reusable validation helpers.
- `src/routes` versioned API routing.
- `src/controllers` thin infrastructure controllers.
- `src/utils` response, date, ID, pagination, async, and logging helpers.
- `tests` Jest/Supertest setup and foundation tests.
- `logs`, `public`, and `uploads` runtime directories.

## Getting started

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Environment

`.env.example` documents application, MongoDB, Redis, JWT, refresh token, Google OAuth, SMTP, Cloudinary, Socket.IO, logging, CORS, rate limiting, and feature flag variables. Production requires strong JWT secrets and `MONGODB_URI`.

## Scripts

- `npm start` runs the production server.
- `npm run dev` runs Nodemon.
- `npm run lint` checks ESLint rules.
- `npm run format:check` checks Prettier formatting.
- `npm test` runs Jest/Supertest.
- `npm run docs` validates that the Phase 4 OpenAPI document loads.

## Endpoints

- `GET /api/v1/health`
- `GET /api/v1/ready`
- `GET /api/v1/live`
- `GET /api/v1/version`
- `GET /api/v1/info`
- `GET /api/v1/docs`

## Development standards

Keep routes declarative, controllers thin, business logic in future services, persistence in repositories, and shared cross-cutting concerns in `shared` or `utils`. Use async/await, centralized errors, structured logging, environment-backed configuration, and reusable validators.
