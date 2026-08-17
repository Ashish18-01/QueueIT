import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../../components/ui/Card.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { businessApi } from '../../services/businessApi.js';
import { useApiResource } from '../../hooks/useApiResource.js';
import { refreshSettled } from '../../store/realtimeSlice.js';

const titles = { customer: 'Customer Dashboard', user: 'Customer Dashboard', counter_operator: 'Counter Dashboard', venue_manager: 'Venue Manager Dashboard', organization_admin: 'Organization Admin Dashboard', admin: 'Organization Admin Dashboard', super_admin: 'Organization Admin Dashboard' };
const isCustomer = (role) => ['customer', 'user'].includes(role);
const isCounter = (role) => role === 'counter_operator';
const isVenue = (role) => ['venue_manager', 'organization_admin', 'admin', 'super_admin'].includes(role);

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { queues: liveQueues = {}, entries = {}, presence = {}, connected = false, lastEventAt = null } = useSelector((s) => s.realtime || {});
  const role = user?.role || user?.roleNames?.[0] || 'customer';
  const canReadQueues = !isCustomer(role);
  const { data, loading, error, reload } = useApiResource(() => (canReadQueues ? businessApi.listQueues({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }) : Promise.resolve({ data: [] })), [canReadQueues]);
  useEffect(() => { if (lastEventAt) reload().finally(() => dispatch(refreshSettled())); }, [lastEventAt, reload, dispatch]);
  const restQueues = data?.items || data || [];
  const queues = useMemo(() => restQueues.map((q) => ({ ...q, ...(liveQueues[q._id || q.id] || {}) })).concat(Object.values(liveQueues).filter((q) => !restQueues.some((r) => (r._id || r.id) === (q._id || q.id)))), [restQueues, liveQueues]);
  const active = queues.filter((q) => q.status === 'active').length;
  const waiting = queues.reduce((sum, q) => sum + (q.statistics?.currentQueueLength || q.waitingCount || 0), 0);
  const currentToken = queues.find((q) => q.currentServingToken)?.currentServingToken || Object.values(entries).find((e) => ['called', 'recalled', 'in_service'].includes(e.status))?.token || '—';
  const personalEntry = Object.values(entries).find((e) => e.customerId === user?._id || e.customerId === user?.id) || Object.values(entries)[0];
  if (loading && queues.length === 0) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Skeleton className="h-28"/><Skeleton className="h-28"/><Skeleton className="h-28"/></div>;
  return <div className="space-y-6" aria-busy={loading}><div><h2 className="text-2xl font-black">{titles[role] || 'Dashboard'}</h2><p className="text-slate-500">Real-time overview synchronized with QueueIt live events.</p>{error && <p className="mt-2 text-sm text-rose-600">Unable to refresh dashboard: {error}</p>}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {isVenue(role) && <><StatCard label="Active Queues" value={active} hint={connected ? 'Live' : 'Offline cache'} /><StatCard label="Queue Length" value={waiting}/><StatCard label="Counter Status" value={presence.counters?.length || 0}/><StatCard label="Employees" value={presence.activeUsers || presence.employees?.length || 0}/></>}
    {isCounter(role) && <><StatCard label="Current Customer" value={currentToken}/><StatCard label="Next Customer" value={Object.values(entries).find((e) => e.status === 'waiting')?.token || '—'}/><StatCard label="Waiting Customers" value={waiting}/><StatCard label="Queue Status" value={queues[0]?.status || '—'}/></>}
    {isCustomer(role) && <><StatCard label="Queue Position" value={personalEntry?.position ?? '—'}/><StatCard label="Current Serving Token" value={currentToken}/><StatCard label="Queue Length" value={waiting}/><StatCard label="Queue Status" value={queues[0]?.status || '—'}/><StatCard label="Estimated Waiting Time" value={personalEntry?.estimatedWaitMinutes != null ? `${personalEntry.estimatedWaitMinutes} min` : '—'}/><StatCard label="Personal Queue Status" value={personalEntry?.status || '—'}/></>}
  </div><Card><h3 className="font-bold">Live activity</h3><p className="mt-2 text-sm text-slate-500">Dashboard cards, queue tables, badges, and notifications refresh automatically when socket events arrive.</p></Card></div>;
}
