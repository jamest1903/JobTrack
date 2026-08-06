import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { register } from '@/api/auth';
import { RegisterPage } from './RegisterPage';
import { useAuth } from '@/auth/AuthContext';
import { renderWithProviders, testSession } from '@/test/utils';

vi.mock('@/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/auth')>();
  return { ...actual, register: vi.fn() };
});

const registerMock = vi.mocked(register);

function DashboardProbe() {
  const { user } = useAuth();
  return <div>Dashboard page for {user?.name}</div>;
}

function renderRegisterPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardProbe />} />
    </Routes>,
    { route: '/register' },
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    registerMock.mockReset();
  });

  it('renders the registration form', () => {
    renderRegisterPage();

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create account' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows validation errors and does not call the API for an empty submit', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('rejects passwords that do not match', async () => {
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Name'), 'Alice Johnson');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'different123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('registers successfully, stores the session, and navigates to the dashboard', async () => {
    registerMock.mockResolvedValue(testSession);
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Name'), 'Alice Johnson');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('Dashboard page for Alice Johnson'),
    ).toBeInTheDocument();
    expect(registerMock.mock.calls[0][0]).toEqual({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(localStorage.getItem('accessToken')).toBe('test-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(
      testSession.user,
    );
  });

  it('shows an error message when the API rejects', async () => {
    registerMock.mockRejectedValue({
      response: {
        data: { message: 'Email already in use' },
      },
    });
    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByLabelText('Name'), 'Alice Johnson');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email already in use',
    );
    expect(screen.queryByText(/Dashboard page/)).not.toBeInTheDocument();
  });
});
