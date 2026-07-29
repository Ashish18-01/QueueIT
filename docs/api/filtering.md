# Filtering

Filters use exact query parameters for common fields and bracket operators for ranges: `status=active`, `organizationId=...`, `branchId=...`, `createdAt[gte]=2026-07-01T00:00:00Z`, `createdAt[lte]=2026-07-29T23:59:59Z`, `isRead=false`, `metadata.source=walk-in`. Nested filters must map to indexed fields approved by database design.
