# Controlled Agent Workflow

The Queue Supervisor is a fixed state machine, not an autonomous executor.

1. **Guardrail state:** validates question size and rejects injection/secrets or
   arbitrary-command/database-query requests.
2. **Queue Data Agent:** reads only eligible active public queues and their
   stored capacity/service metrics.
3. **Knowledge Agent:** retrieves only tenant-scoped verified chunks.
4. **Recommendation Agent:** applies the deterministic waiting-time baseline.
5. **Validation state:** validates the structured result before the controller
   can send it.

Explicit tools are read-only. There is no shell, HTTP, arbitrary database query,
or queue-write tool. Analytics insights are deterministic capacity observations;
future Socket.IO-triggered insight work must debounce and batch events.
