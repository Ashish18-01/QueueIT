import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import authReducer from './authSlice.js';
import { LoginPage, RegisterPage, ResetPasswordPage } from './AuthForms.jsx';
import { passwordRules } from '../../utils/validation.js';
import { authApi } from './authApi.js';

vi.mock('./authApi.js', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderAuthRoute(element, { route = '/' } = {}) {
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={<><LocationProbe />{element}</>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe('authentication forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('login validates required fields before submitting', async () => {
    const user = userEvent.setup();
    renderAuthRoute(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  test('login submits credentials, persists tokens, and navigates to dashboard', async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({
      data: { data: { user: { id: 'user-1', email: 'user@example.com' }, accessToken: 'access', refreshToken: 'refresh' } },
    });
    renderAuthRoute(<LoginPage />, { route: '/login' });

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'StrongerPass1!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(authApi.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'StrongerPass1!' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/dashboard'));
    expect(JSON.parse(localStorage.getItem('queueit-auth'))).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
  });

  test('registration password rules mirror the backend strength policy', () => {
    expect(passwordRules.minLength.value).toBe(12);
    expect(passwordRules.pattern.value.test('StrongerPass1!')).toBe(true);
    expect(passwordRules.pattern.value.test('weakpassword')).toBe(false);
  });

  test('register submits valid account details and returns to login', async () => {
    const user = userEvent.setup();
    authApi.register.mockResolvedValue({ data: { data: { user: { email: 'new@example.com' } } } });
    renderAuthRoute(<RegisterPage />, { route: '/register' });

    await user.type(screen.getByLabelText(/name/i), 'New User');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), 'StrongerPass1!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(authApi.register).toHaveBeenCalledWith({ name: 'New User', email: 'new@example.com', accountType: 'customer', password: 'StrongerPass1!' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'));
  });

  test('reset password prefills the token query param and submits the form', async () => {
    const user = userEvent.setup();
    authApi.resetPassword.mockResolvedValue({ data: { data: null } });
    renderAuthRoute(<ResetPasswordPage />, { route: '/reset-password?token=reset-token' });

    expect(screen.getByLabelText(/token/i)).toHaveValue('reset-token');
    await user.type(screen.getByLabelText(/new password/i), 'StrongerPass1!');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => expect(authApi.resetPassword).toHaveBeenCalledWith({ token: 'reset-token', password: 'StrongerPass1!' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/login'));
  });
});
