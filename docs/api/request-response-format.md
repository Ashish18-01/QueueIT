# Request and Response Format

All timestamps are ISO 8601 UTC strings. JSON keys use camelCase. Object identifiers are strings.

## Success envelope
```json
{ "success": true, "data": { "id": "64f1a0000000000000000001" }, "meta": { "requestId": "req_123", "etag": "W/\"7\"" } }
```

## List envelope
```json
{ "success": true, "data": [{ "id": "64f1a0000000000000000001", "name": "Main Queue" }], "meta": { "pagination": { "limit": 25, "nextCursor": "eyJpZCI6...", "hasNext": true }, "sort": ["-createdAt"] } }
```
