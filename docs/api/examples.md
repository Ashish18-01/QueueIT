# API Examples

## Create organization

```http
POST /api/v1/organizations HTTP/1.1
Authorization: Bearer eyJ...
Content-Type: application/json
Idempotency-Key: org-create-20260729-001
```

```json
{ "name": "City Health", "timezone": "America/New_York", "status": "active" }
```

## Join queue

```http
POST /api/v1/queues/64f1a0000000000000000100/entries HTTP/1.1
Authorization: Bearer eyJ...
Content-Type: application/json
Idempotency-Key: join-64f1a-64f1c
```

```json
{ "customerId": "64f1a0000000000000000300", "partySize": 1, "notificationChannels": ["in_app", "sms"] }
```

```json
{ "success": true, "data": { "id": "64f1a0000000000000000400", "queueId": "64f1a0000000000000000100", "tokenNumber": "A014", "status": "waiting", "position": 7, "estimatedWaitSeconds": 1260 }, "meta": { "requestId": "req_join_001" } }
```

## Dashboard summary

```http
GET /api/v1/analytics/dashboard-summary?organizationId=64f19f000000000000000001&date=2026-07-29 HTTP/1.1
Authorization: Bearer eyJ...
```

```json
{ "success": true, "data": { "activeQueues": 12, "waitingCustomers": 184, "averageWaitSeconds": 930, "completedToday": 892 }, "meta": { "generatedAt": "2026-07-29T12:00:00Z" } }
```
