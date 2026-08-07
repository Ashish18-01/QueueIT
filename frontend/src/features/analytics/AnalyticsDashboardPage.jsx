import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { useApiResource } from '../../hooks/useApiResource.js';
import { refreshSettled } from '../../store/realtimeSlice.js';
import { businessApi } from '../../services/businessApi.js';
import { analyticsExportService } from '../../services/analyticsExportService.js';
import { buildAnalytics } from './analyticsUtils.js';
import { cacheAnalytics } from './analyticsSlice.js';

const metricLabels = { totalQueues: 'Total Queues', activeQueues: 'Active Queues', completedQueues: 'Completed Queues', waitingCustomers: 'Waiting Customers', customersServedToday: 'Customers Served Today', averageWaitTime: 'Average Wait Time', averageServiceTime: 'Average Service Time', queueThroughput: 'Queue Throughput', activeCounters: 'Active Counters', onlineEmployees: 'Online Employees' };
const reportOptions = [['daily','Daily Report'], ['weekly','Weekly Report'], ['monthly','Monthly Report'], ['queue','Queue Performance'], ['counter','Counter Performance'], ['employee','Employee Performance']];
const chartOptions = [['activityDaily','Queue Activity (Daily)'], ['activityWeekly','Queue Activity (Weekly)'], ['activityMonthly','Queue Activity (Monthly)'], ['peakHours','Peak Hours'], ['waitTime','Average Wait Time'], ['serviceTime','Average Service Time'], ['completionRate','Queue Completion Rate'], ['counterPerformance','Counter Performance'], ['employeePerformance','Employee Performance'], ['satisfaction','Customer Satisfaction']];
const contains = (value, term) => String(value || '').toLowerCase().includes(term.toLowerCase());

function AnalyticsFilters({ filters, setFilters, queues }) {
  const queueOptions = queues.map((q) => ({ value: q._id || q.id, label: q.name || 'Unnamed queue' }));
  const reset = () => setFilters({ search: '', organization: '', branch: '', venue: '', queue: '', counter: '', startDate: '', endDate: '' });
  return <Card><div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8"><Input label="Search" value={filters.search} onChange={(e)=>setFilters({...filters, search:e.target.value})}/><Input label="Organization" value={filters.organization} onChange={(e)=>setFilters({...filters, organization:e.target.value})}/><Input label="Branch" value={filters.branch} onChange={(e)=>setFilters({...filters, branch:e.target.value})}/><Input label="Venue" value={filters.venue} onChange={(e)=>setFilters({...filters, venue:e.target.value})}/><Select label="Queue" value={filters.queue} onChange={(e)=>setFilters({...filters, queue:e.target.value})}><option value="">All</option>{queueOptions.map((q)=><option key={q.value} value={q.value}>{q.label}</option>)}</Select><Input label="Counter" value={filters.counter} onChange={(e)=>setFilters({...filters, counter:e.target.value})}/><Input label="Start" type="date" value={filters.startDate} onChange={(e)=>setFilters({...filters, startDate:e.target.value})}/><Input label="End" type="date" value={filters.endDate} onChange={(e)=>setFilters({...filters, endDate:e.target.value})}/></div><Button className="mt-4" variant="secondary" onClick={reset}>Reset filters</Button></Card>;
}
function AnalyticsChart({ title, data, kind = 'bar', dataKey = 'total' }) { return <Card><h3 className="font-bold">{title}</h3><div className="mt-4 h-72" data-testid={`chart-${title}`}>{data?.length ? <ResponsiveContainer width="100%" height="100%">{kind === 'line' ? <LineChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey={dataKey} stroke="#4f46e5" strokeWidth={2}/></LineChart> : <BarChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey={dataKey} fill="#4f46e5" radius={[8,8,0,0]}/></BarChart>}</ResponsiveContainer> : <p className="grid h-full place-items-center text-sm text-slate-500">No chart data</p>}</div></Card>; }
function AnalyticsTable({ rows, loading }) { const [search, setSearch] = useState(''); const [sort, setSort] = useState('name:asc'); const filtered = useMemo(()=>rows.filter((r)=>!search || Object.values(r).some((v)=>contains(v, search))).sort((a,b)=>String(a[sort.split(':')[0]]||'').localeCompare(String(b[sort.split(':')[0]]||''))),[rows,search,sort]); const columns = [{key:'name',header:'Name'}, {key:'total',header:'Total'}, {key:'completed',header:'Completed'}, {key:'waiting',header:'Waiting'}, {key:'status',header:'Status'}, {key:'avgWait',header:'Avg Wait'}, {key:'avgService',header:'Avg Service'}, {key:'value',header:'Value'}]; return <DataTable columns={columns} rows={filtered.map((r,i)=>({id:r.id||r.name||i,...r}))} loading={loading} search={search} onSearch={setSearch} sort={sort} onSort={setSort} emptyTitle="No analytics records" />; }

export default function AnalyticsDashboardPage() {
  const dispatch = useDispatch();
  const { queues: liveQueues = {}, entries: liveEntries = {}, presence = {}, lastEventAt } = useSelector((s)=>s.realtime || {});
  const [filters, setFilters] = useState({ search:'', organization:'', branch:'', venue:'', queue:'', counter:'', startDate:'', endDate:'' });
  const [report, setReport] = useState('daily');
  const queuesRes = useApiResource(()=>businessApi.listQueues({ limit: 100 }), []);
  const entriesRes = useApiResource(()=>businessApi.listEntries({ limit: 500 }), []);
  useEffect(()=>{ if (lastEventAt) Promise.all([queuesRes.reload(), entriesRes.reload()]).finally(()=>dispatch(refreshSettled())); }, [lastEventAt]);
  const queues = useMemo(()=>[...(queuesRes.data?.items || queuesRes.data || [])].map((q)=>({ ...q, ...(liveQueues[q._id || q.id] || {}) })), [queuesRes.data, liveQueues]);
  const entries = useMemo(()=>[...(entriesRes.data?.items || entriesRes.data || []), ...Object.values(liveEntries)].filter((e,i,arr)=>arr.findIndex((x)=>(x._id||x.id)===(e._id||e.id))===i), [entriesRes.data, liveEntries]);
  const scopedEntries = useMemo(()=>entries.filter((e)=> (!filters.queue || (e.queueId?._id || e.queueId || e.queue) === filters.queue) && (!filters.counter || contains(e.counterId || e.counterName, filters.counter)) && (!filters.search || Object.values(e).some((v)=>contains(v, filters.search))) && (!filters.startDate || String(e.createdAt || e.joinedAt || '') >= filters.startDate) && (!filters.endDate || String(e.createdAt || e.joinedAt || '') <= `${filters.endDate}T23:59:59`)), [entries, filters]);
  const analytics = useMemo(()=>buildAnalytics({ queues, entries: scopedEntries, presence }), [queues, scopedEntries, presence]);
  useEffect(()=>{ dispatch(cacheAnalytics({ key: JSON.stringify(filters), data: analytics })); }, [analytics, filters, dispatch]);
  const reportRows = analytics.reports[report] || [];
  const tableColumns = ['name','total','completed','waiting','status','avgWait','avgService','value'].map((key)=>({ key, header: key }));
  return <div className="space-y-6"><div><h2 className="text-2xl font-black">Analytics Dashboard</h2><p className="text-slate-500">Role-aware queue analytics, reports, and CSV exports powered by existing queue APIs.</p></div><AnalyticsFilters filters={filters} setFilters={setFilters} queues={queues}/><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Object.entries(metricLabels).map(([key,label])=><StatCard key={key} label={label} value={['averageWaitTime','averageServiceTime'].includes(key) ? `${analytics.metrics[key]} min` : analytics.metrics[key]} />)}</section><section className="grid gap-6 xl:grid-cols-2">{chartOptions.map(([key,title])=><AnalyticsChart key={key} title={title} data={analytics.charts[key]} kind={key.includes('activity') ? 'line' : 'bar'} dataKey={['waitTime','serviceTime','completionRate','satisfaction'].includes(key) ? 'value' : 'total'} />)}</section><Card><div className="flex flex-wrap items-end justify-between gap-4"><Select label="Report" value={report} onChange={(e)=>setReport(e.target.value)}>{reportOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</Select><Button onClick={()=>analyticsExportService.export({ filename: `${report}-analytics`, rows: reportRows, columns: tableColumns })}>Export CSV</Button></div><div className="mt-4"><AnalyticsTable rows={reportRows} loading={queuesRes.loading || entriesRes.loading}/></div></Card></div>;
}
