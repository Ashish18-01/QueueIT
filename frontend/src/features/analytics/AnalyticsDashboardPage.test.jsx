import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';
import AnalyticsDashboardPage from './AnalyticsDashboardPage.jsx';
import analytics from './analyticsSlice.js';
import realtime from '../../store/realtimeSlice.js';
import auth from '../auth/authSlice.js';
import { businessApi } from '../../services/businessApi.js';

vi.mock('recharts', async () => ({ ResponsiveContainer: ({ children }) => <div>{children}</div>, BarChart: ({ children }) => <div>{children}</div>, LineChart: ({ children }) => <div>{children}</div>, Bar: () => <div />, Line: () => <div />, CartesianGrid: () => <div />, XAxis: () => <div />, YAxis: () => <div />, Tooltip: () => <div /> }));
vi.mock('../../services/businessApi.js', () => ({ businessApi: { listQueues: vi.fn(), listEntries: vi.fn() } }));

const store = () => configureStore({ reducer: { auth, realtime, analytics }, preloadedState: { auth: { user: { role: 'organization_admin' }, accessToken: 't' }, realtime: { queues: {}, entries: {}, presence: { counters: ['c1'], employees: ['e1'], activeUsers: 1 }, connected: true }, analytics: { cache: {}, updatedAt: null } } });

describe('AnalyticsDashboardPage', () => {
  it('renders dashboard metrics, charts, filters, reports, and CSV export', async () => {
    businessApi.listQueues.mockResolvedValue({ data: [{ _id: 'q1', name: 'Main Queue', status: 'active', statistics: { currentQueueLength: 2 } }] });
    businessApi.listEntries.mockResolvedValue({ data: [{ _id: 'e1', queueId: 'q1', status: 'completed', createdAt: '2026-08-07T10:00:00Z', completedAt: '2026-08-07T10:10:00Z' }] });
    render(<Provider store={store()}><AnalyticsDashboardPage /></Provider>);
    expect(await screen.findByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Queues')).toBeInTheDocument();
    expect(screen.getByText('Queue Activity (Daily)')).toBeInTheDocument();
    expect(screen.getByLabelText('Report')).toBeInTheDocument();
    await userEvent.type(screen.getAllByLabelText('Search')[0], 'Main');
    await waitFor(() => expect(screen.getByText('Main Queue')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });
});
