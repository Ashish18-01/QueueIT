# Queue Lifecycle

Queue entries move through a controlled state machine. Invalid transitions are rejected by the domain layer.

## States

- `Waiting`: customer is in line.
- `Calling`: staff has called the customer.
- `Serving`: staff is actively serving the customer.
- `Completed`: service finished.
- `Cancelled`: customer or staff cancelled.
- `NoShow`: customer did not respond within the call window.
- `Transferred`: entry moved to another queue.

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Waiting: join queue / appointment admitted
    Waiting --> Calling: call next
    Calling --> Serving: customer arrives
    Calling --> NoShow: timeout
    Waiting --> Cancelled: customer/staff cancel
    Calling --> Cancelled: cancel
    Serving --> Completed: finish service
    Waiting --> Transferred: transfer
    Calling --> Transferred: transfer
    Transferred --> Waiting: target queue accepts
    NoShow --> Waiting: restore within grace period
    Completed --> [*]
    Cancelled --> [*]
```

## Join Queue Sequence

```mermaid
sequenceDiagram
    actor Customer
    participant Client
    participant API
    participant QueueService
    participant QueueAggregate
    participant DB
    participant Events
    Customer->>Client: Join queue
    Client->>API: Join request
    API->>QueueService: validate and execute use case
    QueueService->>QueueAggregate: add entry
    QueueAggregate-->>QueueService: QueueEntryJoined
    QueueService->>DB: commit entry + outbox event
    QueueService->>Events: publish after commit
    API-->>Client: queue position and ETA
```

## Priority, Walk-ins, and Appointments

Priority queues use `PriorityLevel` plus join time to preserve fairness within each priority band. Walk-ins create entries immediately if capacity and operating-hour policies allow. Appointments reserve a time window and are admitted to the live queue near arrival time according to branch policy.

## Failure Scenarios and Retry Strategy

| Scenario | Handling |
| --- | --- |
| Duplicate join request | Idempotency key prevents duplicate active entries. |
| Call-next race | Transactional lock or Redis lock plus database verification. |
| Notification provider failure | Retry with exponential backoff and dead-letter queue. |
| Client disconnect | Queue state remains durable; client resyncs from API. |
| Worker crash | Outbox event remains pending and is retried. |
| Transfer target unavailable | Reject transition or keep original entry unchanged. |

## Decision Analysis

| Aspect | Detail |
| --- | --- |
| Why chosen | Explicit states prevent ambiguous queue behavior and simplify testing. |
| Alternatives considered | Free-form status updates, event sourcing from day one. |
| Advantages | Predictable operations, clear audit trail, easy UI status mapping. |
| Disadvantages | New operational cases require deliberate transition design. |
| Future impact | The state machine can later be backed by workflow tooling or event sourcing if needed. |
