import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import ProfilePage from './ProfilePage.jsx';
import authReducer from '../features/auth/authSlice.js';

describe('ProfilePage forms', () => { it('renders profile, password, and settings forms', () => { render(<Provider store={configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: { user: { name: 'Alex', email: 'alex@test.com', role: 'customer' }, status: 'authenticated' } } })}><ProfilePage /></Provider>); expect(screen.getByText('Edit Profile')).toBeInTheDocument(); expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument(); expect(screen.getByText('Theme Settings')).toBeInTheDocument(); }); });
