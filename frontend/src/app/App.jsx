import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { router } from '../routes/router.jsx';
import { hydrateTheme } from '../store/themeSlice.js';
import { refreshSession } from '../features/auth/authSlice.js';

export default function App(){
  const dispatch = useDispatch();
  const theme = useSelector((s)=>s.theme.mode);
  useEffect(()=>{dispatch(hydrateTheme());dispatch(refreshSession());},[dispatch]);
  useEffect(()=>{document.documentElement.classList.toggle('dark', theme === 'dark');localStorage.setItem('queueit-theme', theme);},[theme]);
  return <RouterProvider router={router} />;
}
