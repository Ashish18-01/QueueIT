# Authorization

QueueIt uses RBAC plus permission checks scoped by organization, branch, venue, and resource ownership. Roles grant permissions such as `queues:read`, `queues:write`, `queue-entries:operate`, `analytics:read`, and `system-settings:write`. Super administrators can cross tenant boundaries; organization administrators are limited to their organization; venue managers are limited to assigned branches/venues; counter operators can operate assigned counters; customers can access their own queue entries, notifications, and feedback.
