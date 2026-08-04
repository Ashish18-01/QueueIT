import { Card } from './Card.jsx';
export function StatCard({ label, value = '—', hint }) { return <Card className="transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-black">{value}</p>{hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}</Card>; }
