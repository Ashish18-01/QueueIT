import { forwardRef } from 'react';
export const Select = forwardRef(function Select({label,children,...props}, ref){return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span><select ref={ref} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" {...props}>{children}</select></label>});
