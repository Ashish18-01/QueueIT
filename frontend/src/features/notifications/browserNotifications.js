export const isBrowserNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window;
export const permissionStatus = () => isBrowserNotificationSupported() ? window.Notification.permission : 'unsupported';
export async function requestBrowserPermission() {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  if (window.Notification.permission !== 'default') return window.Notification.permission;
  return window.Notification.requestPermission();
}
export function showBrowserNotification({ title, message, data }, onClick) {
  if (permissionStatus() !== 'granted') return null;
  const notification = new window.Notification(title, { body: message, tag: data?.id || title, data });
  notification.onclick = () => { window.focus?.(); onClick?.(data); notification.close(); };
  notification.onclose = () => undefined;
  return notification;
}
