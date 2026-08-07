import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, setNotificationFilters, markNotificationRead, clearNotifications, savePreferences, fetchPreferences } from '../../features/notifications/notificationsSlice.js';
import { requestBrowserPermission, permissionStatus } from '../../features/notifications/browserNotifications.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';

const TYPES = ['', 'queue.created', 'queue.updated', 'queue.paused', 'queue.resumed', 'queue.closed', 'customer.joined', 'customer.entry_cancelled', 'customer.entry_transferred', 'processing.turn_near', 'processing.token_called', 'processing.token_recalled', 'processing.service_started', 'processing.service_completed', 'processing.no_show', 'system.login', 'system.password_changed', 'system.profile_updated', 'system.account_status_changed', 'admin.queue_created', 'admin.queue_deleted', 'admin.employee_assigned', 'admin.counter_activated', 'admin.counter_offline'];

export default function NotificationHistoryPage() {
  const dispatch = useDispatch();
  const { items, filters, pagination, preferences, unreadCount, loading } = useSelector((s) => s.notifications);
  useEffect(() => { dispatch(fetchPreferences()); }, [dispatch]);
  useEffect(() => { dispatch(fetchNotifications({ ...filters, page: pagination.page })); }, [dispatch, filters, pagination.page]);
  const update = (patch) => dispatch(setNotificationFilters(patch));
  const togglePreference = async (key) => {
    let browserAllowed = preferences.browser;
    if (key === 'browser' && !preferences.browser) browserAllowed = await requestBrowserPermission() === 'granted';
    if (key === 'browser' && !browserAllowed) toast.error('Browser notification permission was not granted.');
    dispatch(savePreferences({ ...preferences, [key]: key === 'browser' ? browserAllowed : !preferences[key] }));
  };
  return <div className="grid gap-6">
    <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black">Notification History</h2><p className="text-sm text-slate-500">Search, filter, and manage every QueueIt notification. {unreadCount} unread.</p></div><Button onClick={() => dispatch(clearNotifications())}>Clear all</Button></div>
      <div className="mt-4 grid gap-3 md:grid-cols-6"><Input aria-label="Search notifications" placeholder="Search" value={filters.search} onChange={(e) => update({ search: e.target.value })} /><Select aria-label="Type" value={filters.type} onChange={(e) => update({ type: e.target.value })}>{TYPES.map((type) => <option key={type} value={type}>{type || 'All types'}</option>)}</Select><Select aria-label="Status" value={filters.status} onChange={(e) => update({ status: e.target.value })}><option value="">All status</option><option value="unread">Unread</option><option value="read">Read</option></Select><Input type="date" aria-label="From date" value={filters.from} onChange={(e) => update({ from: e.target.value })} /><Input type="date" aria-label="To date" value={filters.to} onChange={(e) => update({ to: e.target.value })} /><Select aria-label="Sort" value={filters.sortOrder} onChange={(e) => update({ sortOrder: e.target.value })}><option value="desc">Newest first</option><option value="asc">Oldest first</option></Select></div>
      <div className="mt-4 grid gap-3" aria-live="polite">{loading ? <p>Loading…</p> : items.map((n) => <article key={n.id || n._id} tabIndex="0" className="rounded-2xl border p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{n.title}</h3><p className="text-sm text-slate-600 dark:text-slate-300">{n.message}</p><p className="mt-1 text-xs text-slate-500">{n.type} · {new Date(n.createdAt).toLocaleString()}</p></div><Button onClick={() => dispatch(markNotificationRead(n.id || n._id))} disabled={n.read}>{n.read ? 'Read' : 'Mark read'}</Button></div></article>)}</div>
    </section>
    <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="text-xl font-black">Notification Preferences</h2><p className="text-sm text-slate-500">Browser permission: {permissionStatus()}</p><div className="mt-4 grid gap-3 md:grid-cols-4">{['queue', 'account', 'system', 'browser'].map((key) => <button key={key} className={`rounded-2xl border p-4 text-left font-semibold dark:border-slate-800 ${preferences[key] ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100' : 'bg-slate-50 dark:bg-slate-800'}`} onClick={() => togglePreference(key)}>{key[0].toUpperCase() + key.slice(1)} notifications<br /><span className="text-xs">{preferences[key] ? 'Enabled' : 'Disabled'}</span></button>)}</div></section>
  </div>;
}
