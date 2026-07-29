# Resource Model


## Standard endpoint contract
Unless an endpoint explicitly overrides this contract, clients send `Accept: application/json`, mutation requests send `Content-Type: application/json`, authenticated endpoints send `Authorization: Bearer <accessToken>`, and tenant-scoped endpoints send `X-Organization-Id` when the token contains access to more than one organization. Successful responses use `{ "success": true, "data": ..., "meta": ... }`; errors use the standard error envelope from `error-handling.md`. IDs are MongoDB ObjectId-compatible strings. Mutations require optimistic concurrency with `If-Match` when an `etag` was previously returned.

## Organization

- **Purpose:** Manage organization records used by QueueIt operations.
- **Ownership:** Platform.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `super_admin` plus scoped permission such as `organizations:read` or `organizations:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Branch

- **Purpose:** Manage branch records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `org_admin` plus scoped permission such as `branches:read` or `branches:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Venue

- **Purpose:** Manage venue records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `venue_manager` plus scoped permission such as `venues:read` or `venues:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Counter

- **Purpose:** Manage counter records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `venue_manager` plus scoped permission such as `counters:read` or `counters:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Queue Template

- **Purpose:** Manage queue template records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `venue_manager` plus scoped permission such as `queue-templates:read` or `queue-templates:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Queue

- **Purpose:** Manage queue records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `venue_manager` plus scoped permission such as `queues:read` or `queues:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Queue Entry

- **Purpose:** Manage queue entry records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `operator` plus scoped permission such as `queue-entries:read` or `queue-entries:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Customer

- **Purpose:** Manage customer records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `org_admin` plus scoped permission such as `customers:read` or `customers:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Employee

- **Purpose:** Manage employee records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `org_admin` plus scoped permission such as `employees:read` or `employees:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## User

- **Purpose:** Manage user records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `org_admin` plus scoped permission such as `users:read` or `users:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Role

- **Purpose:** Manage role records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `org_admin` plus scoped permission such as `roles:read` or `roles:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Permission

- **Purpose:** Manage permission records used by QueueIt operations.
- **Ownership:** Platform.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `super_admin` plus scoped permission such as `permissions:read` or `permissions:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Session

- **Purpose:** Manage session records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `user` plus scoped permission such as `sessions:read` or `sessions:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Refresh Token

- **Purpose:** Manage refresh token records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `user` plus scoped permission such as `refresh-tokens:read` or `refresh-tokens:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Notification

- **Purpose:** Manage notification records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `user` plus scoped permission such as `notifications:read` or `notifications:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Feedback

- **Purpose:** Manage feedback records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `customer` plus scoped permission such as `feedback:read` or `feedback:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Analytics Snapshot

- **Purpose:** Manage analytics snapshot records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `manager` plus scoped permission such as `analytics:read` or `analytics:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Audit Log

- **Purpose:** Manage audit log records used by QueueIt operations.
- **Ownership:** Organization tenant.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `org_admin` plus scoped permission such as `audit-logs:read` or `audit-logs:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## Feature Flag

- **Purpose:** Manage feature flag records used by QueueIt operations.
- **Ownership:** Platform.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `super_admin` plus scoped permission such as `feature-flags:read` or `feature-flags:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.

## System Setting

- **Purpose:** Manage system setting records used by QueueIt operations.
- **Ownership:** Platform.
- **Relationships:** Uses `organizationId`; branch/venue/counter/queue resources additionally reference their parent operational scope.
- **Supported operations:** List, retrieve, create, replace, patch, soft delete, archive, restore, search, filter, sort, paginate, view history/statistics, and bulk create/update where safe.
- **Access permissions:** Minimum role `super_admin` plus scoped permission such as `system-settings:read` or `system-settings:write`.
- **Lifecycle:** draft/active/paused/suspended/archived/deleted as applicable; audit logs and analytics are append-only snapshots.
