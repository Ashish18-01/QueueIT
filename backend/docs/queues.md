# Queue Management Module

The Queue Management module implements queue administration plus customer queue entry workflows. It intentionally excludes Socket.IO, notifications, analytics dashboard features, and frontend features.

## Queue administration

Queues contain tenant ownership (`organizationId`, `branchId`, `venueId`), optional `counterId` and `queueTemplateId`, display fields, category, token prefix/strategy, capacity, service-time assumptions, operating hours, visibility, lifecycle status, priority flag, and active flag.

Queue names are unique within a venue for non-deleted queues. Queue deletes are soft deletes and lifecycle transitions are enforced by the service layer:

`draft -> active -> paused -> closed -> archived`

Resume transitions a paused queue back to `active`. Restore transitions an archived queue back to `closed` so managers can intentionally reactivate it later.

## Queue entries

Customers join an active queue through `POST /api/v1/queues/{queueId}/join`. The service rejects joins when the queue is paused, closed, archived, inactive, already at active capacity, or when the customer already has an active entry in that queue.

Queue entry tokens are generated sequentially per queue using the queue token prefix and a zero-padded number, for example `Q-0001`. FIFO ordering is maintained by automatic `position` values and `tokenNumber`; positions and ETA fields (`estimatedWaitMinutes`, `estimatedServiceAt`) are recalculated after every queue-changing operation.

Supported queue entry operations:

- `GET /api/v1/queue-entries` for paginated filtering by queue, customer, status, tenant, and token search.
- `GET /api/v1/queue-entries/{entryId}` to read one entry with tenant and ownership checks.
- `POST /api/v1/queue-entries/{entryId}/leave` for a customer to leave an active entry.
- `POST /api/v1/queue-entries/{entryId}/cancel` for managers to cancel an active entry.
- `POST /api/v1/queues/{queueId}/call-next` to call the next waiting customer.
- `POST /api/v1/queue-entries/{entryId}/recall` to recall a called customer.
- `POST /api/v1/queue-entries/{entryId}/skip` to skip a waiting, called, or recalled customer.
- `POST /api/v1/queue-entries/{entryId}/start-service` to move a called or recalled customer into service and stamp `serviceStartedAt`.
- `POST /api/v1/queue-entries/{entryId}/complete-service` to complete service and stamp `serviceCompletedAt`.
- `POST /api/v1/queue-entries/{entryId}/no-show` to mark a called, recalled, or in-service customer as no show.
- `POST /api/v1/queue-entries/{entryId}/expire` to expire stale active entries.
- `DELETE /api/v1/queue-entries/{entryId}` for soft deletion.

The supported processing lifecycle is `waiting -> called -> in_service -> completed`, with `recalled`, `skipped`, `cancelled`, `no_show`, and `expired` side states guarded by service-level transition validation. Queue statistics on the queue document track current active length, completed customers, average wait time in minutes, and last calculation time.

## Permissions and audit

All routes require authentication. Queue CRUD uses `queues:read` and `queues:write`; customer join and leave are authenticated ownership workflows. Queue management is restricted to Venue Managers, Organization Admins, Super Admins, and built-in administrative roles. Queue processing is restricted to Counter Operators, Venue Managers, Organization Admins, and Super Admins. Queue entry actions record audit events for join, leave, cancel, delete, and processing transitions.

## Templates

Reusable template defaults are available from `GET /api/v1/queues/templates` and may be applied during creation using `templateKey` values including `hospital_opd`, `bank_counter`, `library_desk`, `college_cafeteria`, and `help_desk`.
