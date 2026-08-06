import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logout as logoutApi } from '@/api/auth';
import { Sidebar } from './Sidebar';
import { renderWithProviders, testUser } from '@/test/utils';

vi.mock('@/api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/auth')>();
  return {
    ...actual,
    logout: vi.fn(async () => {
      actual.clearSession();
    }),
  };
});

const logoutMock = vi.mocked(logoutApi);

function renderSidebar(options?: { user?: typeof testUser }) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<Sidebar isOpen onClose={vi.fn()} />} />
      <Route path="/login" element={<div>Login page</div>} />
    </Routes>,
    { route: '/', ...options },
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    logoutMock.mockClear();
  });

  it('shows the logged out state when there is no user', () => {
    renderSidebar();

    expect(screen.getByText('Not logged in')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
  });

  it('shows the user details and log out button when authenticated', () => {
    renderSidebar({ user: testUser });

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('logs out, clears the session, and navigates to /login', async () => {
    renderSidebar({ user: testUser });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(logoutMock).toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
