import { EmptyState } from './EmptyState.jsx';
import { ErrorState } from './ErrorState.jsx';
import { Input } from './Input.jsx';
import { Loader } from './Loader.jsx';
import { Pagination } from './Pagination.jsx';
import { Select } from './Select.jsx';

export function DataTable({ columns = [], rows = [], meta, loading, error, search = '', onSearch, filters = [], sort = 'createdAt:desc', onSort, onPageChange, emptyTitle = 'No records found' }) {
  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-4">
      <Input label="Search" value={search} onChange={(e) => onSearch?.(e.target.value)} placeholder="Search records" />
      {filters.map((filter) => <Select key={filter.key} label={filter.label} value={filter.value} onChange={(e) => filter.onChange(e.target.value)}><option value="">All</option>{filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>)}
      {onSort && <Select label="Sort" value={sort} onChange={(e) => onSort(e.target.value)}><option value="createdAt:desc">Newest</option><option value="createdAt:asc">Oldest</option><option value="name:asc">Name A-Z</option><option value="status:asc">Status</option></Select>}
    </div>
    {error && <ErrorState message={error} />}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {loading ? <div className="grid place-items-center p-10"><Loader /></div> : rows.length === 0 ? <EmptyState title={emptyTitle} description="Try changing search or filter criteria." /> : <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><tr>{columns.map((column) => <th key={column.key} className="p-3 font-semibold">{column.header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row._id || row.id} className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">{columns.map((column) => <td key={column.key} className="p-3 align-top">{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody></table>}
    </div>
    {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />}
  </div>;
}
