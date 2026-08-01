import { useDispatch, useSelector } from 'react-redux';import { toggleTheme } from '../store/themeSlice.js';
export function ThemeToggle(){const dispatch=useDispatch();const mode=useSelector(s=>s.theme.mode);return <button aria-label="Toggle theme" onClick={()=>dispatch(toggleTheme())} className="rounded-xl border px-3 py-2 text-sm dark:border-slate-700">{mode==='dark'?'☀️':'🌙'}</button>}
