# Pagination

Default page size is `25`; maximum is `100`. Cursor pagination is preferred for high-growth collections such as queue entries, sessions, notifications, audit logs, and analytics snapshots. Offset pagination is allowed for bounded administrative lists.

- Cursor: `?limit=25&cursor=eyJjcmVhdGVkQXQi...`
- Offset: `?page=2&pageSize=25`
