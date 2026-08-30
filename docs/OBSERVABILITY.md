# Observability

Existing request IDs, Winston JSON logs, Morgan HTTP logging, readiness/liveness
probes, and Socket.IO connection/broadcast logs remain in place. The AI telemetry
abstraction records assistant latency, outcome, provider invocation, model label,
queue-tool use, and retrieval-result count. `GET /api/v1/ai/metrics` exposes a
bounded process-local operational view to authorized administrators.

This is an OpenTelemetry-ready boundary: a future exporter can consume the same
events without changing assistant behavior. Token usage and estimated cost remain
unavailable until a real provider adapter returns provider usage metadata.
