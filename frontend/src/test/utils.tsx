import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import type { ReactElement } from 'react';
import type { AuthResponse, User } from '@/types';

export const testUser: User = {
  id: 1,
  email: 'alice@example.com',
  name: 'Alice Johnson',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const testSession: AuthResponse = {
  user: testUser,
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
};

export function seedAuthUser(user: User = testUser) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface RenderOptions {
  route?: string;
  user?: User;
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {},
): ReturnType<typeof render> & { queryClient: QueryClient } {
  const { route = '/', user } = options;
  if (user) seedAuthUser(user);

  const queryClient = createTestQueryClient();

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );

  return { ...utils, queryClient };
}
