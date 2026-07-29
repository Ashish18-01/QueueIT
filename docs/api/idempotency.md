# Idempotency

`Idempotency-Key` is required for queue joins, token refresh, payments if introduced later, bulk operations, and external notification retries. Keys are scoped to method, path, authenticated actor, organization, and normalized body hash. Duplicate in-flight requests return `409 IDEMPOTENCY_IN_PROGRESS`; completed duplicates replay the original status/body; mismatched bodies return `422 IDEMPOTENCY_KEY_REUSED`.
