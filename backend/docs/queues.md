# Queue Foundation Module

The Queue Foundation module implements administrative queue CRUD and lifecycle operations only. It intentionally excludes queue entries, token generation, queue positions, ETA calculations, counters, Socket.IO, notifications, analytics, and frontend features.

## Configuration

Queues contain tenant ownership (`organizationId`, `branchId`, `venueId`), optional `counterId` and `queueTemplateId`, display fields, category, token prefix/strategy, capacity, service-time assumptions, operating hours, visibility, lifecycle status, priority flag, and active flag.

## Lifecycle

Approved transitions are enforced by the service layer:

`draft -> active -> paused -> closed -> archived`

Resume transitions a paused queue back to `active`. Restore transitions an archived queue back to `closed` so managers can intentionally reactivate it later.

## Permissions

All routes require authentication. `queues:read` protects read/template/search/list endpoints and `queues:write` protects mutations. Queue management is restricted to Venue Managers, Organization Admins, Super Admins, and built-in administrative roles.

## Templates

Reusable template defaults are available from `GET /api/v1/queues/templates` and may be applied during creation using `templateKey` values including `hospital_opd`, `bank_counter`, `library_desk`, `college_cafeteria`, and `help_desk`.
