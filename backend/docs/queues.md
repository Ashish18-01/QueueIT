# Queue Management Module

The Queue Management module implements queue administration plus customer queue entry workflows. It intentionally excludes Socket.IO, notifications, ETA calculation, queue position updates, analytics, and frontend features.

## Queue administration

Queues contain tenant ownership (`organizationId`, `branchId`, `venueId`), optional `counterId` and `queueTemplateId`, display fields, category, token prefix/strategy, capacity, service-time assumptions, operating hours, visibility, lifecycle status, priority flag, and active flag.

Queue names are unique within a venue for non-deleted queues. Queue deletes are soft deletes and lifecycle transitions are enforced by the service layer:

`draft -> active -> paused -> closed -> archived`

Resume transitions a paused queue back to `active`. Restore transitions an archived queue back to `closed` so managers can intentionally reactivate it later.

## Queue entries

Customers join an active queue through `POST /api/v1/queues/{queueId}/join`. The service rejects joins when the queue is paused, closed, archived, inactive, already at active capacity, or when the customer already has a waiting/serving entry in that queue.

Queue entry tokens are generated sequentially per queue using the queue token prefix and a zero-padded number, for example `Q-0001`. FIFO ordering is maintained by sorting entries by `joinedAt` and `tokenNumber`.

Supported queue entry operations:

- `GET /api/v1/queue-entries` for paginated filtering by queue, customer, status, tenant, and token search.
- `GET /api/v1/queue-entries/{entryId}` to read one entry with tenant and ownership checks.
- `POST /api/v1/queue-entries/{entryId}/leave` for a customer to leave an active entry.
- `POST /api/v1/queue-entries/{entryId}/cancel` for managers to cancel an active entry.
- `DELETE /api/v1/queue-entries/{entryId}` for soft deletion.

## Permissions and audit

All routes require authentication. Queue CRUD uses `queues:read` and `queues:write`; customer join and leave are authenticated ownership workflows. Queue management is restricted to Venue Managers, Organization Admins, Super Admins, and built-in administrative roles. Queue entry actions record audit events including join, leave, cancel, and delete.

## Templates

Reusable template defaults are available from `GET /api/v1/queues/templates` and may be applied during creation using `templateKey` values including `hospital_opd`, `bank_counter`, `library_desk`, `college_cafeteria`, and `help_desk`.
