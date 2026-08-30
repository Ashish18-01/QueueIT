# AI Architecture

## Purpose

The AI capability is additive: QueueIt queue APIs, lifecycle services, MongoDB,
Redis, and Socket.IO remain operational when AI is disabled or a provider fails.

```text
User → React Queue Assistant → Express /api/v1/ai
     → controlled supervisor state machine
     → Queue Data Tool + Knowledge Retrieval Tool
     → QueueIt services/models (read-only) → MongoDB / Redis events
     → optional provider adapter (future)
```

The current supervisor deliberately uses a direct, small JavaScript
orchestration abstraction rather than a framework. It has fixed states
(validate → retrieve queues/knowledge → rank → validate output → respond), no
recursive loops, no dynamic tool selection, and no write-capable tool.

## Provider and prompt boundary

`AI_PROVIDER=disabled` is the safe default. The deterministic response remains
useful without credentials. A future provider adapter must receive the
centralized `queueAssistant.v1` prompt, bounded context, a timeout, and must
return the same schema. It must never receive secrets or raw unrestricted data.

## Estimation

The baseline is transparent: `waiting customers × configured average service
minutes`, with capacity and service-name matching used for ranking. This is not
a predictive model. AI may explain a recommendation only after the deterministic
facts are retrieved and validated.

## Human control

The assistant produces recommendations only. Joining or changing a queue is a
separate authenticated existing API action. Any future state-changing proposal
must be presented for human approval and executed by an authorized business
service, never by an AI tool.
