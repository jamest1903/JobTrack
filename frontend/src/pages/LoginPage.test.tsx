import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { login } from '@/api/auth';
import { LoginPage } from './LoginPage';
import { useAuth } from '@/auth/AuthContext';
import { renderWithProviders, testSession } from '@/test/utils';
import type { AuthResponse } from '@/types';

vi.mock('@/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/auth')>();
  return { ...actual, login: vi.fn() };
});

const loginMock = vi.mocked(login);

function DashboardProbe() {
  const { user } = useAuth();
  return <div>Dashboard page for {user?.name}</div>;
}

function renderLoginPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardProbe />} />
    </Routes>,
    { route: '/login' },
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renders the login form', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'JobTrack' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('shows validation errors and does not call the API for an empty submit', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('shows validation errors for an invalid email and short password', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('clears a field error when the user fixes the field', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email'), 'alice@example.com');

    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('logs in successfully, stores the session, and navigates to the dashboard', async () => {
    loginMock.mockResolvedValue(testSession);
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Dashboard page for Alice Johnson'),
    ).toBeInTheDocument();
    expect(loginMock.mock.calls[0][0]).toEqual({
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(localStorage.getItem('accessToken')).toBe('test-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(
      testSession.user,
    );
  });

  it('shows a pending state while the request is in flight', async () => {
    let resolveRequest!: (value: AuthResponse) => void;
    loginMock.mockImplementation(
      () => new Promise<AuthResponse>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('button', { name: /Signing in/ }),
    ).toBeDisabled();

    resolveRequest(testSession);

    expect(
      await screen.findByText('Dashboard page for Alice Johnson'),
    ).toBeInTheDocument();
  });

  it('shows an error message when the API rejects', async () => {
    loginMock.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    );
    expect(screen.queryByText(/Dashboard page/)).not.toBeInTheDocument();
  });
});
