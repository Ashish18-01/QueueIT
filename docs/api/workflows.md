# API Workflows

## User Registration
```mermaid
sequenceDiagram
Client->>API: POST /api/v1/auth/register
API->>DB: Create user pending verification
API->>Notification: Send verification email
API-->>Client: 201 Created
```

## User Login
```mermaid
sequenceDiagram
Client->>API: POST /api/v1/auth/login
API->>DB: Validate credentials and create session
API-->>Client: 200 Access and refresh tokens
```

## Queue Creation
```mermaid
sequenceDiagram
Manager->>API: POST /api/v1/queues
API->>DB: Validate venue/template and persist queue
API->>Audit: Record QueueCreated
API-->>Manager: 201 Queue
```

## Join Queue
```mermaid
sequenceDiagram
Customer->>API: POST /api/v1/queues/{queueId}/entries
API->>Redis: Acquire queue token lock
API->>DB: Create queue entry with unique token
API->>Notification: QueueEntryJoined
API-->>Customer: 201 Entry with position and ETA
```

## Leave Queue
```mermaid
sequenceDiagram
Customer->>API: POST /api/v1/queue-entries/{queueEntryId}/cancel
API->>DB: Transition waiting entry to cancelled
API->>Notification: Confirm cancellation
API-->>Customer: 200 Updated entry
```

## Call Next Customer
```mermaid
sequenceDiagram
Operator->>API: POST /api/v1/queues/{queueId}/call-next
API->>DB: Select next waiting entry atomically
API->>Notification: Notify called customer
API-->>Operator: 200 Called entry
```

## Serve Customer
```mermaid
sequenceDiagram
Operator->>API: POST /api/v1/queue-entries/{queueEntryId}/serve
API->>DB: Transition called entry to inService
API-->>Operator: 200 Entry
Operator->>API: POST /api/v1/queue-entries/{queueEntryId}/complete
API->>DB: Complete service and update metrics
API-->>Operator: 200 Entry
```

## Notification Delivery
```mermaid
sequenceDiagram
API->>Notification: POST /api/v1/notifications
Notification->>Provider: Send email/SMS/push/in-app
Provider-->>Notification: Delivery status
Notification->>DB: Store attempts and status
```

## Password Reset
```mermaid
sequenceDiagram
Client->>API: POST /api/v1/auth/forgot-password
API->>Notification: Send reset link
Client->>API: POST /api/v1/auth/reset-password
API->>DB: Update password and revoke sessions
API-->>Client: 204 No Content
```

## Token Refresh
```mermaid
sequenceDiagram
Client->>API: POST /api/v1/auth/refresh
API->>DB: Validate current refresh token family
API->>DB: Rotate refresh token
API-->>Client: 200 New token pair
```

## Analytics Generation
```mermaid
sequenceDiagram
Scheduler->>API: Internal analytics job trigger
API->>DB: Aggregate queue, counter, employee metrics
API->>DB: Store analytics snapshot
Manager->>API: GET /api/v1/analytics/dashboard-summary
API-->>Manager: 200 Summary
```
