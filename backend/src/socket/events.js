module.exports = Object.freeze({
  QUEUE_CREATED: 'queue:created', QUEUE_UPDATED: 'queue:updated', QUEUE_ACTIVATED: 'queue:activated', QUEUE_PAUSED: 'queue:paused', QUEUE_RESUMED: 'queue:resumed', QUEUE_CLOSED: 'queue:closed', QUEUE_DELETED: 'queue:deleted',
  CUSTOMER_JOINED: 'queue-entry:customer-joined', CUSTOMER_LEFT: 'queue-entry:customer-left', ENTRY_CANCELLED: 'queue-entry:cancelled', ENTRY_TRANSFERRED: 'queue-entry:transferred', TOKEN_GENERATED: 'queue-entry:token-generated',
  CUSTOMER_CALLED: 'queue-processing:customer-called', CUSTOMER_RECALLED: 'queue-processing:customer-recalled', CUSTOMER_SKIPPED: 'queue-processing:customer-skipped', SERVICE_STARTED: 'queue-processing:service-started', SERVICE_COMPLETED: 'queue-processing:service-completed', NO_SHOW: 'queue-processing:no-show',
  LIVE_QUEUE_UPDATE: 'queue:live-update', PRESENCE_UPDATED: 'presence:updated', ERROR: 'socket:error', ACK: 'socket:ack',
});
