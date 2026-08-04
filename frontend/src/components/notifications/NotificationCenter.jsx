import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markNotificationsRead } from '../../store/realtimeSlice.js';
import { Badge } from '../ui/Badge.jsx';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { notifications = [], unreadCount = 0 } = useSelector((s) => s.realtime || {});
  return <div className="relative"><button type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} className="relative rounded-xl border px-3 py-2 text-sm font-semibold dark:border-slate-700" onClick={() => { setOpen((v) => !v); dispatch(markNotificationsRead()); }}>Notifications{unreadCount > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-2 py-0.5 text-xs text-white" aria-live="polite">{unreadCount}</span>}</button>{open && <section role="dialog" aria-label="Notification center" className="absolute right-0 mt-2 max-h-96 w-80 overflow-auto rounded-2xl border bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold">Notifications</h2><div className="mt-3 grid gap-2">{notifications.length === 0 ? <p className="text-sm text-slate-500">No real-time notifications yet.</p> : notifications.map((n) => <article key={n.id} className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800"><div className="flex items-center justify-between gap-2"><strong>{n.title}</strong><Badge>{n.type.split(':').pop()}</Badge></div><p className="mt-1 text-slate-600 dark:text-slate-300">{n.message}</p><time className="mt-1 block text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</time></article>)}</div></section>}</div>;
}
