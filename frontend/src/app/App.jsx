import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { router } from '../routes/router.jsx';
import { hydrateTheme } from '../store/themeSlice.js';
import { refreshSession } from '../features/auth/authSlice.js';
import { useRealtimeSocket } from '../hooks/useRealtimeSocket.js';
import { ErrorBoundary } from '../components/errors/ErrorBoundary.jsx';

export default function App(){
  const dispatch = useDispatch();
  const theme = useSelector((s)=>s.theme.mode);
  useRealtimeSocket();
  useEffect(()=>{dispatch(hydrateTheme());dispatch(refreshSession());},[dispatch]);
  useEffect(()=>{document.documentElement.classList.toggle('dark', theme === 'dark');localStorage.setItem('queueit-theme', theme);},[theme]);
  return <ErrorBoundary><RouterProvider router={router} /></ErrorBoundary>;
}
