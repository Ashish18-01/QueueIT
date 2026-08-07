const toDate = (value) => (value ? new Date(value) : null);
const dayKey = (value) => toDate(value)?.toISOString().slice(0, 10) || 'Unknown';
const hourKey = (value) => `${String(toDate(value)?.getHours() ?? 0).padStart(2, '0')}:00`;
const minutesBetween = (start, end) => {
  const a = toDate(start); const b = toDate(end);
  return a && b && b >= a ? Math.round((b - a) / 60000) : 0;
};
const avg = (values) => values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0;
const groupCount = (rows, keyFn) => Object.values(rows.reduce((acc, row) => { const key = keyFn(row); acc[key] = acc[key] || { name: key, total: 0, completed: 0, waiting: 0 }; acc[key].total += 1; if (['completed', 'served'].includes(row.status)) acc[key].completed += 1; if (row.status === 'waiting') acc[key].waiting += 1; return acc; }, {}));

export function buildAnalytics({ queues = [], entries = [], presence = {} }) {
  const completed = entries.filter((e) => ['completed', 'served'].includes(e.status));
  const waiting = entries.filter((e) => e.status === 'waiting');
  const today = new Date().toISOString().slice(0, 10);
  const waitTimes = completed.map((e) => e.waitTimeMinutes ?? minutesBetween(e.joinedAt || e.createdAt, e.serviceStartedAt || e.calledAt || e.updatedAt)).filter(Boolean);
  const serviceTimes = completed.map((e) => e.serviceTimeMinutes ?? minutesBetween(e.serviceStartedAt || e.calledAt, e.completedAt || e.updatedAt)).filter(Boolean);
  const queueRows = queues.map((q) => ({
    id: q._id || q.id, name: q.name || 'Unnamed queue', status: q.status || 'unknown',
    waiting: q.statistics?.currentQueueLength ?? q.waitingCount ?? entries.filter((e) => (e.queueId?._id || e.queueId || e.queue) === (q._id || q.id) && e.status === 'waiting').length,
    completed: q.statistics?.totalServed ?? entries.filter((e) => (e.queueId?._id || e.queueId || e.queue) === (q._id || q.id) && ['completed', 'served'].includes(e.status)).length,
    avgWait: q.statistics?.averageWaitTimeMinutes ?? avg(waitTimes), avgService: q.averageServiceTimeMinutes ?? q.statistics?.averageServiceTimeMinutes ?? avg(serviceTimes), throughput: q.statistics?.throughputPerHour ?? 0,
  }));
  const metrics = {
    totalQueues: queues.length, activeQueues: queues.filter((q) => q.status === 'active').length, completedQueues: queues.filter((q) => ['closed', 'archived', 'completed'].includes(q.status)).length,
    waitingCustomers: waiting.length || queueRows.reduce((s, q) => s + q.waiting, 0), customersServedToday: completed.filter((e) => dayKey(e.completedAt || e.updatedAt) === today).length,
    averageWaitTime: avg(waitTimes), averageServiceTime: avg(serviceTimes), queueThroughput: completed.length, activeCounters: presence.activeCounters ?? presence.counters?.length ?? 0, onlineEmployees: presence.connectedEmployees ?? presence.activeUsers ?? presence.employees?.length ?? 0,
  };
  const activityDaily = groupCount(entries, (e) => dayKey(e.createdAt || e.joinedAt));
  const peakHours = groupCount(entries, (e) => hourKey(e.createdAt || e.joinedAt));
  return { metrics, charts: { activityDaily, activityWeekly: activityDaily.slice(-7), activityMonthly: activityDaily.slice(-30), peakHours, waitTime: queueRows.map((q) => ({ name: q.name, value: q.avgWait })), serviceTime: queueRows.map((q) => ({ name: q.name, value: q.avgService })), completionRate: queueRows.map((q) => ({ name: q.name, value: q.completed + q.waiting ? Math.round((q.completed / (q.completed + q.waiting)) * 100) : 0 })), counterPerformance: groupCount(entries, (e) => e.counterName || e.counterId || 'Unassigned'), employeePerformance: groupCount(entries, (e) => e.operatorName || e.employeeName || e.servedBy || 'Unassigned'), satisfaction: queueRows.map((q) => ({ name: q.name, value: q.satisfaction || 0 })) }, reports: { daily: activityDaily, weekly: activityDaily.slice(-7), monthly: activityDaily.slice(-30), queue: queueRows, counter: groupCount(entries, (e) => e.counterName || e.counterId || 'Unassigned'), employee: groupCount(entries, (e) => e.operatorName || e.employeeName || e.servedBy || 'Unassigned') } };
}
