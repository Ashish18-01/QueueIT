import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead, deleteNotification } from '../../features/notifications/notificationsSlice.js';
import { Badge } from '../ui/Badge.jsx';

const labelFor = (type = '') => type.split('.').pop()?.replaceAll('_', ' ') || 'update';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { items = [], unreadCount = 0, loading } = useSelector((s) => s.notifications || {});
  useEffect(() => { dispatch(fetchNotifications({ limit: 8 })); }, [dispatch]);
  const unreadLabel = useMemo(() => unreadCount ? `${unreadCount} unread notifications` : 'No unread notifications', [unreadCount]);
  return <div className="relative">
    <button type="button" aria-label={unreadLabel} aria-expanded={open} className="relative rounded-xl border px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:hover:bg-slate-800" onClick={() => setOpen((v) => !v)}>
      Notifications{unreadCount > 0 && <span className="absolute -right-2 -top-2 animate-pulse rounded-full bg-rose-600 px-2 py-0.5 text-xs text-white" aria-live="polite">{unreadCount}</span>}
    </button>
    {open && <section role="dialog" aria-label="Notification center" className="absolute right-0 mt-2 max-h-[32rem] w-96 overflow-auto rounded-2xl border bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2"><h2 className="font-bold">Notifications</h2><button className="text-xs font-semibold text-indigo-600 dark:text-indigo-300" onClick={() => dispatch(markAllNotificationsRead())}>Mark all read</button></div>
      <div className="mt-3 grid gap-2">{loading ? <p className="text-sm text-slate-500">Loading notifications…</p> : items.length === 0 ? <p className="text-sm text-slate-500">No notifications yet.</p> : items.slice(0, 8).map((n) => <article key={n.id || n._id} className={`rounded-xl p-3 text-sm ${n.read ? 'bg-slate-50 dark:bg-slate-800' : 'bg-indigo-50 ring-1 ring-indigo-100 dark:bg-indigo-950/40 dark:ring-indigo-900'}`}>
        <div className="flex items-center justify-between gap-2"><strong>{n.title}</strong><Badge>{labelFor(n.type)}</Badge></div><p className="mt-1 text-slate-600 dark:text-slate-300">{n.message}</p><time className="mt-1 block text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</time>
        <div className="mt-2 flex gap-3 text-xs font-semibold"><button onClick={() => dispatch(markNotificationRead(n.id || n._id))}>Mark read</button><button onClick={() => dispatch(deleteNotification(n.id || n._id))}>Delete</button></div>
      </article>)}</div>
      <Link className="mt-3 block rounded-xl bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white dark:bg-white dark:text-slate-950" to="/dashboard/notifications" onClick={() => setOpen(false)}>View history and preferences</Link>
    </section>}
  </div>;
}
