# QueueIt REST API Contract

Phase 4 defines the external REST contract for QueueIt without adding implementation code. The contract is aligned to the Phase 1 SRS, Phase 2 clean MERN architecture, and Phase 3 MongoDB/Redis database design.

## Documents

- [API overview](api-overview.md)
- [Resource model](resource-model.md)
- [Authentication](authentication.md)
- [Authorization](authorization.md)
- [Request and response format](request-response-format.md)
- [Error handling](error-handling.md)
- [Pagination](pagination.md)
- [Filtering](filtering.md)
- [Sorting](sorting.md)
- [Search](search.md)
- [Versioning](versioning.md)
- [Rate limiting](rate-limiting.md)
- [Idempotency](idempotency.md)
- [Security](security.md)
- [Workflows](workflows.md)
- [OpenAPI 3.1](openapi.yaml)
- [Examples](examples.md)
- [Architecture decision records](adr/)

## Base URL

All endpoints are rooted at `/api/v1`. Future versions use a new URI prefix and keep `/api/v1` backward compatible during the deprecation window.
