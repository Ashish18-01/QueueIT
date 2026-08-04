import { Card } from '../../components/ui/Card.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';

const placeholderRows = [];
function PlaceholderManagement({ title, description, columns }) { return <Card><h2 className="text-2xl font-black">{title}</h2><p className="mt-2 text-sm text-slate-500">{description}</p><div className="mt-6"><DataTable columns={columns} rows={placeholderRows} loading={false} emptyTitle={`${title} records are not available yet`} /></div></Card>; }
export function CounterManagementPage() { return <PlaceholderManagement title="Counter Management" description="Manage service counters once counter backend APIs are available." columns={[{key:'name',header:'Counter'}, {key:'status',header:'Status'}, {key:'operator',header:'Operator'}]} />; }
export function EmployeeManagementPage() { return <PlaceholderManagement title="Employee Management" description="Review and assign employees for this venue." columns={[{key:'name',header:'Employee'}, {key:'role',header:'Role'}, {key:'status',header:'Status'}]} />; }
export function BranchManagementPage() { return <PlaceholderManagement title="Branch Management" description="Organization branches will be connected when branch APIs are exposed." columns={[{key:'name',header:'Branch'}, {key:'city',header:'City'}, {key:'status',header:'Status'}]} />; }
export function VenueManagementPage() { return <PlaceholderManagement title="Venue Management" description="Create and maintain venues for queue operations." columns={[{key:'name',header:'Venue'}, {key:'branch',header:'Branch'}, {key:'status',header:'Status'}]} />; }
export function UserManagementPage() { return <PlaceholderManagement title="User Management" description="User directory tools for admins." columns={[{key:'name',header:'Name'}, {key:'email',header:'Email'}, {key:'role',header:'Role'}]} />; }
export function RoleManagementPage() { return <PlaceholderManagement title="Role Management" description="Role assignment and permission review." columns={[{key:'name',header:'Role'}, {key:'permissions',header:'Permissions'}, {key:'users',header:'Users'}]} />; }
export function QueueStatusPage() { return <PlaceholderManagement title="Queue Status" description="Monitor queues through existing queue list APIs." columns={[{key:'name',header:'Queue'}, {key:'status',header:'Status'}, {key:'length',header:'Length'}]} />; }
