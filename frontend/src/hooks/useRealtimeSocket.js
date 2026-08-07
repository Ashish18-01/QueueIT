import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket } from '../socket/client.js';
import { receiveSocketEvent, presenceUpdated, socketConnected, socketDisconnected, socketError, SOCKET_EVENTS } from '../store/realtimeSlice.js';
import { notificationReceived } from '../features/notifications/notificationsSlice.js';
import { showBrowserNotification } from '../features/notifications/browserNotifications.js';

const EVENTS = Object.values(SOCKET_EVENTS).filter((eventName) => ![SOCKET_EVENTS.PRESENCE_UPDATED, SOCKET_EVENTS.ERROR].includes(eventName));
const toastEvents = new Set([SOCKET_EVENTS.QUEUE_PAUSED, SOCKET_EVENTS.QUEUE_RESUMED, SOCKET_EVENTS.QUEUE_CLOSED, SOCKET_EVENTS.CUSTOMER_CALLED, SOCKET_EVENTS.CUSTOMER_RECALLED, SOCKET_EVENTS.CUSTOMER_COMPLETED, SOCKET_EVENTS.ENTRY_CANCELLED]);
const eventLabels = { [SOCKET_EVENTS.QUEUE_PAUSED]: 'Queue paused', [SOCKET_EVENTS.QUEUE_RESUMED]: 'Queue resumed', [SOCKET_EVENTS.QUEUE_CLOSED]: 'Queue closed', [SOCKET_EVENTS.CUSTOMER_CALLED]: 'Token called', [SOCKET_EVENTS.CUSTOMER_RECALLED]: 'Token recalled', [SOCKET_EVENTS.CUSTOMER_COMPLETED]: 'Service completed', [SOCKET_EVENTS.ENTRY_CANCELLED]: 'Queue entry cancelled' };

export function useRealtimeSocket() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.accessToken);
  const preferences = useSelector((s) => s.notifications?.preferences || {});
  useEffect(() => {
    if (!token) return undefined;
    const socket = getSocket();
    const onConnect = () => dispatch(socketConnected());
    const onDisconnect = (reason) => { dispatch(socketDisconnected(reason)); toast.error('Live updates disconnected. Reconnecting…'); };
    const onError = (error) => { dispatch(socketError(error?.message || error?.error || 'Socket error')); toast.error('Live updates are temporarily unavailable.'); };
    socket.on('connect', onConnect); socket.on('disconnect', onDisconnect); socket.on('connect_error', onError); socket.on(SOCKET_EVENTS.ERROR, onError); socket.on(SOCKET_EVENTS.PRESENCE_UPDATED, (payload) => dispatch(presenceUpdated(payload)));
    EVENTS.forEach((eventName) => socket.on(eventName, (payload) => {
      dispatch(receiveSocketEvent({ eventName, payload }));
      const title = eventLabels[eventName] || eventName.replaceAll(':', ' ');
      const notification = { id: payload?.notificationId || `${eventName}-${Date.now()}`, type: eventName.replace(':', '.'), title, message: payload?.message || payload?.name || payload?.token || 'New QueueIt update received.', data: payload };
      dispatch(notificationReceived(notification));
      if (preferences.browser) showBrowserNotification(notification, () => window.location.assign('/dashboard/notifications'));
      if (toastEvents.has(eventName)) toast(eventLabels[eventName]);
    }));
    socket.connect();
    return () => { EVENTS.forEach((eventName) => socket.off(eventName)); socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); socket.off('connect_error', onError); socket.off(SOCKET_EVENTS.ERROR, onError); socket.off(SOCKET_EVENTS.PRESENCE_UPDATED); };
  }, [dispatch, token, preferences.browser]);
}
