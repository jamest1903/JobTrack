import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, render, renderHook } from '@testing-library/react';
import { logout as logoutApi } from '@/api/auth';
import { AuthProvider, useAuth } from './AuthContext';
import { seedAuthUser, testSession, testUser } from '@/test/utils';
import type { ReactNode } from 'react';

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

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  beforeEach(() => {
    logoutMock.mockClear();
  });

  it('throws when used outside of an AuthProvider', () => {
    function Broken() {
      useAuth();
      return null;
    }

    expect(() => render(<Broken />)).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });

  it('starts unauthenticated when no session is stored', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('restores the stored user on mount', () => {
    seedAuthUser();

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(testUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('setSession stores the session and updates auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.setSession(testSession));

    expect(result.current.user).toEqual(testUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('test-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(testUser);
  });

  it('logout calls the API and clears the session and state', async () => {
    seedAuthUser();

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutMock).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
