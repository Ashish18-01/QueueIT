import { forwardRef } from 'react';
export const Checkbox = forwardRef(function Checkbox({label,...props}, ref){return <label className="flex items-center gap-2 text-sm"><input ref={ref} type="checkbox" className="size-4 rounded border-slate-300" {...props}/>{label}</label>});
