import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage.jsx';
import authReducer from '../../features/auth/authSlice.js';

vi.mock('../../services/businessApi.js', () => ({ businessApi: { listQueues: vi.fn(async () => ({ data: { items: [] } })) } }));
const renderWithRole = (role) => render(<Provider store={configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: { user: { role, email: 'a@b.com' }, status: 'authenticated' } } })}><DashboardPage /></Provider>);
describe('DashboardPage', () => { it('renders role-based dashboard cards', async () => { renderWithRole('venue_manager'); expect(await screen.findByText('Venue Manager Dashboard')).toBeInTheDocument(); expect(screen.getByText('Active Queues')).toBeInTheDocument(); expect(screen.getByText('Employees')).toBeInTheDocument(); }); });
