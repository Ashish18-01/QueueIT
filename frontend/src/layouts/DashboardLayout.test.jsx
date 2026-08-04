import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DashboardLayout from './DashboardLayout.jsx';
import authReducer from '../features/auth/authSlice.js';
import themeReducer from '../store/themeSlice.js';

function renderLayout(role) { return render(<Provider store={configureStore({ reducer: { auth: authReducer, theme: themeReducer }, preloadedState: { auth: { user: { role, email: 'user@test.com' }, status: 'authenticated' } } })}><MemoryRouter initialEntries={['/dashboard']}><Routes><Route path="/dashboard" element={<DashboardLayout />} /></Routes></MemoryRouter></Provider>); }
describe('DashboardLayout navigation', () => { it('shows counter navigation for counter operators', () => { renderLayout('counter_operator'); expect(screen.getByRole('link', { name: /current queue/i })).toBeInTheDocument(); expect(screen.getByRole('link', { name: /queue status/i })).toBeInTheDocument(); }); });
