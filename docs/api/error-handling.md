# Error Handling

Errors use a stable code, human-readable message, optional field errors, and request metadata.

| Status | Purpose | Typical causes | Client action |
|---|---|---|---|
| 400 | Bad request | Malformed JSON/query | Correct syntax |
| 401 | Unauthorized | Missing/expired token | Authenticate/refresh |
| 403 | Forbidden | Insufficient role/scope | Hide action or request access |
| 404 | Not found | Missing or out-of-scope resource | Stop retrying |
| 409 | Conflict | Duplicate token/name/state race | Refresh state and retry safely |
| 410 | Gone | Expired reset token or removed public link | Restart flow |
| 412 | Precondition failed | Stale `If-Match` | Refetch and retry |
| 415 | Unsupported media type | Non-JSON mutation | Send JSON |
| 422 | Validation failed | Business rule violation | Show field/domain errors |
| 429 | Too many requests | Rate limit exceeded | Back off until reset |
| 500 | Server error | Unexpected failure | Retry later/contact support |
| 503 | Service unavailable | Dependency outage/maintenance | Retry with backoff |

```json
{ "success": false, "error": { "code": "QUEUE_CLOSED", "message": "Queue is closed for new entries.", "details": [{ "field": "queueId", "reason": "status must be open" }] }, "meta": { "requestId": "req_123" } }
```
