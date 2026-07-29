# Validation Strategy


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

## Validation Rules

Required fields are validated at application and MongoDB collection-validator layers. Enums include organization status `trial|active|suspended|deleted`, queue status `draft|open|paused|closed|archived`, queue-entry status `created|waiting|called|in_service|completed|skipped|cancelled|expired|recalled|no_show|transferred|rejected`, notification status `pending|sent|failed|expired`, and token status `active|rotated|revoked|expired`. Emails are normalized and regex-validated; phone numbers use E.164; slugs use lowercase alphanumeric hyphens; names have practical length limits. Cross-field rules validate schedule windows, expiry after creation, deleted status with `deletedAt`, and completed entries with service timestamps.
