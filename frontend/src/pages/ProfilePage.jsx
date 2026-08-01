import { useSelector } from 'react-redux';import { Card } from '../components/ui/Card.jsx';
export default function ProfilePage(){const {user}=useSelector(s=>s.auth);return <Card><h2 className="text-2xl font-bold">Profile</h2><pre className="mt-4 overflow-auto rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800">{JSON.stringify(user||{},null,2)}</pre></Card>}
