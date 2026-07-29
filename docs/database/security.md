# Security Architecture


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Security Controls

Store password hashes with bcrypt using a calibrated cost factor and per-password salts. JWT access tokens are not stored server-side except optional denylist metadata; refresh tokens are stored only as hashes with rotation, reuse detection, TTL expiry, and session linkage. Encrypt sensitive PII fields where required, keep secrets in a managed secret store, and grant least-privilege MongoDB roles per application, worker, migration, and analytics user. Audit sensitive changes, redact secrets from logs, encrypt backups, validate query operators to prevent injection, and minimize PII in analytics snapshots.
