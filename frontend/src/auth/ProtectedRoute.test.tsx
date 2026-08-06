import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { renderWithProviders, testUser } from '@/test/utils';

function renderProtected(options?: { user?: typeof testUser }) {
  return renderWithProviders(
    <Routes>
      <Route
        path="/protected"
        element={
          <ProtectedRoute>
            <div>Secret page</div>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<div>Login page</div>} />
    </Routes>,
    { route: '/protected', ...options },
  );
}

describe('ProtectedRoute', () => {
  it('renders children for authenticated users', () => {
    renderProtected({ user: testUser });

    expect(screen.getByText('Secret page')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    renderProtected();

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret page')).not.toBeInTheDocument();
  });
});
