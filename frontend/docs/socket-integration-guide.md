# Socket Integration Guide

Phase 9C uses the existing `src/socket/client.js` Socket.IO client. `useRealtimeSocket` starts one authenticated client session from the app root, subscribes to backend queue and queue-entry events, and cleans listeners on unmount to avoid duplicated subscriptions.

Events are dispatched into `src/store/realtimeSlice.js`:

- `queue:*` events upsert or remove queue records.
- `queue:live-update` patches queue length, status, statistics, and current serving token.
- `queue-entry:*` and `queue-processing:*` events upsert queue entry records.
- `presence:updated` refreshes counters, employees, and active user metrics.
- disconnect and error events update connection state and show friendly toast messages.

Views should continue to load initial data with REST APIs, then merge matching Redux live records by `_id`, `id`, or `queueId`. This keeps server pagination and authorization behavior intact while allowing instant UI updates.
