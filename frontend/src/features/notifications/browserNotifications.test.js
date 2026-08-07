import { describe, expect, it, vi } from 'vitest';
import { isBrowserNotificationSupported, permissionStatus, showBrowserNotification } from './browserNotifications.js';

describe('browserNotifications', () => {
  it('reports support and displays notifications when granted', () => {
    const NotificationMock = vi.fn(function Notification(title, options) { this.title = title; this.options = options; this.close = vi.fn(); });
    NotificationMock.permission = 'granted';
    vi.stubGlobal('Notification', NotificationMock);
    expect(isBrowserNotificationSupported()).toBe(true);
    expect(permissionStatus()).toBe('granted');
    expect(showBrowserNotification({ title: 'Ready', message: 'Token called', data: { id: '1' } })).toBeTruthy();
  });
});
