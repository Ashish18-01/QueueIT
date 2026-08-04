import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable } from './DataTable.jsx';

describe('DataTable', () => { it('renders rows and search control', () => { render(<DataTable columns={[{ key: 'name', header: 'Name' }]} rows={[{ id: '1', name: 'Main Queue' }]} loading={false} search="" />); expect(screen.getByLabelText(/search/i)).toBeInTheDocument(); expect(screen.getByText('Main Queue')).toBeInTheDocument(); }); it('renders empty state', () => { render(<DataTable columns={[]} rows={[]} loading={false} emptyTitle="No queues found" />); expect(screen.getByText('No queues found')).toBeInTheDocument(); }); });
