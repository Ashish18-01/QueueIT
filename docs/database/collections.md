# Collection Design


> Phase 3 scope: database architecture and backend data design only. This document intentionally contains no Express routes, controllers, services, middleware, Mongoose schema code, TypeScript interfaces, React code, or API endpoint definitions. Phase 3 adapts the approved QueueIt requirements to the requested MERN persistence architecture, with MongoDB as the durable system of record and Redis as a non-authoritative cache/coordination layer.

All tenant-owned collections include `organizationId`, `createdAt`, `updatedAt`, optional `deletedAt`, `schemaVersion`, and audit actor references unless noted. Object references use MongoDB `ObjectId`; timestamps use BSON `Date`; money-like future fields use `Decimal128`; flexible metadata uses `Object`.

## `organizations`

**Purpose:** Stores organizations records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example organizations",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `branches`

**Purpose:** Stores branches records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example branches",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `venues`

**Purpose:** Stores venues records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example venues",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `counters`

**Purpose:** Stores counters records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example counters",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `queues`

**Purpose:** Stores queues records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example queues",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `queueTemplates`

**Purpose:** Stores queueTemplates records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example queueTemplates",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `queueEntries`

**Purpose:** Stores queueEntries records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** very high; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example queueEntries",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `customers`

**Purpose:** Stores customers records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example customers",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `employees`

**Purpose:** Stores employees records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example employees",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `users`

**Purpose:** Stores users records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example users",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `roles`

**Purpose:** Stores roles records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example roles",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `permissions`

**Purpose:** Stores permissions records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example permissions",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `sessions`

**Purpose:** Stores sessions records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** very high; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example sessions",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `refreshTokens`

**Purpose:** Stores refreshTokens records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** very high; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example refreshTokens",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `notifications`

**Purpose:** Stores notifications records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** very high; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example notifications",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `auditLogs`

**Purpose:** Stores auditLogs records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** very high; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example auditLogs",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `feedback`

**Purpose:** Stores feedback records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example feedback",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `analyticsSnapshots`

**Purpose:** Stores analyticsSnapshots records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example analyticsSnapshots",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `featureFlags`

**Purpose:** Stores featureFlags records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example featureFlags",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

## `systemSettings`

**Purpose:** Stores systemSettings records for QueueIt. **Required fields:** `_id`, `schemaVersion`, status fields, ownership references, `createdAt`, `updatedAt`. **Optional fields:** metadata, soft-delete fields, external references, notes. **Validation:** enforce enum status, maximum display-name lengths, tenant scope, and referential existence in application/domain validation. **Relationships:** referenced from parent/child collections; embed only small settings, address/contact, delivery attempts, counters summary, or immutable historical snapshots. **Indexes:** `_id`, tenant/status lookups, unique natural keys where applicable, and compound indexes matching feature queries. **Growth:** medium; avoid unbounded arrays. **Versioning:** increment `schemaVersion` on incompatible shape changes and use additive migrations.

```json
{
  "_id": { "$oid": "64f1a0000000000000000001" },
  "organizationId": { "$oid": "64f19f000000000000000001" },
  "status": "active",
  "name": "Example systemSettings",
  "metadata": { "source": "phase3-design" },
  "schemaVersion": 1,
  "createdAt": { "$date": "2026-07-29T09:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-29T09:00:00.000Z" }
}
```

