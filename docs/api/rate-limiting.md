# Rate Limiting

Recommended limits: anonymous `60/min/IP`; authenticated `600/min/user`; administrative mutations `120/min/user`; auth endpoints `10/min/IP` and `5/min/email`; search `120/min/user`; analytics `60/min/user`; bulk operations `20/min/user`. Limits protect hot queue operations, credential endpoints, and analytics workloads while preserving normal dashboard usage. Responses include `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and `Retry-After`.
