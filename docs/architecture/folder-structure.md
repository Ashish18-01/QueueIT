# Feature-Based Folder Structure

QueueIt should use a monorepo with feature-first modules and shared packages. This keeps related behavior together while preserving Clean Architecture boundaries inside each feature.

```text
apps/
  backend/
    src/
      modules/
        identity/
          presentation/
          application/
          domain/
          infrastructure/
        queues/
          presentation/
          application/
          domain/
          infrastructure/
        notifications/
          presentation/
          application/
          domain/
          infrastructure/
        organizations/
          presentation/
          application/
          domain/
          infrastructure/
        reporting/
          presentation/
          application/
          domain/
          infrastructure/
      shared/
        application/
        domain/
        infrastructure/
      main.ts
    test/
  frontend/
    app/
    features/
      auth/
      queues/
      dashboard/
      notifications/
      settings/
    shared/
      api/
      config/
      hooks/
      styles/
      types/
  workers/
    src/
      jobs/
      processors/
      adapters/
packages/
  shared-contracts/
  eslint-config/
  tsconfig/
  ui-tokens/
docs/
  architecture/
  adr/
infra/
  docker/
  terraform/
  k8s/
scripts/
```

## Folder Rationale

| Folder | Why it exists |
| --- | --- |
| `apps/backend` | Backend deployable API organized by business capability. |
| `apps/frontend` | Web client deployable separated from backend runtime concerns. |
| `apps/workers` | Background job processing can scale independently from request handling. |
| `packages/shared-contracts` | Versioned DTO/schema contracts shared by frontend and backend without sharing domain internals. |
| `packages/eslint-config`, `packages/tsconfig` | Consistent engineering standards across apps. |
| `packages/ui-tokens` | Shared design tokens without forcing shared UI implementation. |
| `docs/architecture` | Phase 2 architecture decision and design documentation. |
| `infra` | Deployment definitions for Docker, cloud infrastructure, and orchestration. |
| `scripts` | Repeatable operational and developer automation. |

## Decision Analysis

| Aspect | Detail |
| --- | --- |
| Why chosen | Feature modules reduce cross-feature coupling and keep changes localized. |
| Alternatives considered | Technical-layer folders only, separate repositories, shared everything package. |
| Advantages | Clear ownership, scalable team structure, easier future service extraction. |
| Disadvantages | Requires naming discipline and duplicate boilerplate across features. |
| Future impact | Feature folders map naturally to bounded contexts and possible microservices. |
