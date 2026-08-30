# AI Guardrails

- JWT authentication and existing RBAC protect every AI endpoint.
- Knowledge ingestion/removal requires organization write permission; retrieval
  filters on the authenticated organization, not model-provided IDs.
- Injection patterns, secret requests, command execution, and database-query
  requests are rejected before retrieval.
- The prompt declares read-only scope and grounded-only behavior.
- Strict question, document, response, context, token, timeout, and AI request
  rate-limit configuration prevents unbounded work.
- Structured output is validated before it reaches a response or business path.
- Recommendation endpoints have no mutation tools; existing join/lifecycle APIs
  retain their own authorization and human click/confirmation.
- Telemetry records operational metadata only; it does not store prompts,
  tokens, credentials, or raw private document contents.
