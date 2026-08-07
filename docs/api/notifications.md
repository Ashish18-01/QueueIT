# Notification API and Events

QueueIt notifications cover queue lifecycle, customer queue-entry actions, token processing, account/system events, and admin operations. Supported type identifiers include `queue.created`, `queue.updated`, `queue.paused`, `queue.resumed`, `queue.closed`, `customer.joined`, `customer.entry_cancelled`, `customer.entry_transferred`, `processing.turn_near`, `processing.token_called`, `processing.token_recalled`, `processing.service_started`, `processing.service_completed`, `processing.no_show`, `system.login`, `system.password_changed`, `system.profile_updated`, `system.account_status_changed`, `admin.queue_created`, `admin.queue_deleted`, `admin.employee_assigned`, `admin.counter_activated`, and `admin.counter_offline`.

## REST flow

Authenticated clients use `/api/v1/notifications` to load notification history with pagination, search, type/status/date filters, and sorting. Read state is managed with `PATCH /api/v1/notifications/:id/read` and `PATCH /api/v1/notifications/read-all`. Users can delete one notification with `DELETE /api/v1/notifications/:id` or clear their history with `DELETE /api/v1/notifications/clear`.

Preferences are stored per user at `/api/v1/notifications/preferences`. The available switches are queue, account, system, and browser notifications.

## Real-time flow

The frontend reuses the existing Socket.IO connection and listens to supported queue and processing events. Incoming socket events are normalized into the Redux notification state, displayed in the notification drawer, reflected in the unread badge, and optionally shown through the Web Notification API when the user has enabled browser notifications.

## Browser setup

Browser notifications require a secure context in production and explicit user permission. If permission is denied or unsupported, QueueIt keeps in-app notifications enabled and shows a friendly fallback in the notification preferences page.
