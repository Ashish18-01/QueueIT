# Sequence Diagrams

## User Registration

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API
    participant Auth as Auth Application Service
    participant DB
    participant Worker
    User->>FE: Register
    FE->>API: POST /auth/register
    API->>Auth: RegisterUser
    Auth->>DB: Save user + verification event
    DB-->>Auth: Commit
    Auth-->>API: Accepted
    Worker->>DB: Read outbox
    Worker-->>User: Send verification email
```

## User Login

```mermaid
sequenceDiagram
    actor User
    participant FE
    participant API
    participant Auth
    participant DB
    User->>FE: Submit credentials
    FE->>API: POST /auth/login
    API->>Auth: Authenticate
    Auth->>DB: Load user and create session
    Auth-->>API: Access token + refresh token
    API-->>FE: Authenticated response
```

## Join Queue

```mermaid
sequenceDiagram
    actor Customer
    participant FE
    participant API
    participant QueueApp
    participant DB
    participant Redis
    Customer->>FE: Join queue
    FE->>API: POST /queues/{id}/entries
    API->>QueueApp: JoinQueue
    QueueApp->>Redis: Acquire short lock
    QueueApp->>DB: Insert queue entry and event
    QueueApp->>Redis: Update status cache and release lock
    API-->>FE: Position and ETA
```

## Call Next Customer

```mermaid
sequenceDiagram
    actor Staff
    participant FE
    participant API
    participant QueueApp
    participant DB
    participant Worker
    Staff->>FE: Call next
    FE->>API: POST /queues/{id}/call-next
    API->>QueueApp: CallNextCustomer
    QueueApp->>DB: Select next active entry with lock
    QueueApp->>DB: Update status to Calling + event
    API-->>FE: Called entry
    Worker-->>Customer: Send notification
```

## Queue Status Update

```mermaid
sequenceDiagram
    participant API
    participant DB
    participant Redis
    participant Realtime
    participant FE
    API->>DB: Commit queue change
    API->>Redis: Refresh queue summary
    API->>Realtime: Publish status event
    Realtime-->>FE: Push updated queue status
```

## Notification

```mermaid
sequenceDiagram
    participant Outbox
    participant Worker
    participant Provider
    participant DB
    Outbox->>Worker: NotificationRequested
    Worker->>Provider: Send email/SMS
    Provider-->>Worker: Delivery result
    Worker->>DB: Record attempt and status
```

## Admin Dashboard

```mermaid
sequenceDiagram
    actor Admin
    participant FE
    participant API
    participant Reporting
    participant DB
    participant Redis
    Admin->>FE: Open dashboard
    FE->>API: GET dashboard metrics
    API->>Reporting: Query tenant metrics
    Reporting->>Redis: Read hot metrics
    Reporting->>DB: Query authoritative aggregates if needed
    API-->>FE: Dashboard data
```

## Password Reset

```mermaid
sequenceDiagram
    actor User
    participant FE
    participant API
    participant Auth
    participant DB
    participant Mail
    User->>FE: Forgot password
    FE->>API: POST forgot password
    API->>Auth: Create reset token
    Auth->>DB: Store hashed token
    Auth->>Mail: Enqueue email
    User->>FE: Submit reset token and password
    FE->>API: POST reset password
    API->>Auth: Validate token and update password
    Auth->>DB: Revoke sessions
```

## Token Refresh

```mermaid
sequenceDiagram
    participant FE
    participant API
    participant Auth
    participant DB
    FE->>API: POST /auth/refresh
    API->>Auth: Validate refresh token
    Auth->>DB: Verify hash, rotation family, expiry
    Auth->>DB: Revoke old token and store new hash
    Auth-->>API: New access and refresh tokens
    API-->>FE: Tokens
```
