# CI/CD Readiness

GitHub Actions installs locked backend/frontend dependencies, runs tests and
linting, builds the frontend, validates production Compose interpolation, and
builds Docker images. AI unit tests execute as part of backend Jest. A deployment
pipeline should additionally run migrations/index checks, an isolated knowledge
tenant evaluation fixture, image scanning, secret scanning, and post-deploy
`GET /api/v1/ready` verification.

No AI key is required for CI because the provider is disabled by default and the
deterministic assistant path is testable offline.
