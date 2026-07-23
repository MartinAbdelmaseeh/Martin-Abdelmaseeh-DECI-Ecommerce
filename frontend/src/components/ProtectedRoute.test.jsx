import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { setMockUser } from '../test/mocks/handlers';
import { makeUser } from '../test/mocks/fixtures';
import { renderWithProviders } from '../test/utils';
import ProtectedRoute from './ProtectedRoute';

function renderGuarded() {
  return renderWithProviders(
    <Routes>
      <Route
        path="/protected"
        element={
          <ProtectedRoute>
            <div>Secret content</div>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>,
    { route: '/protected' }
  );
}

describe('ProtectedRoute', () => {
  test('redirects unauthenticated users to /login', async () => {
    renderGuarded();
    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  test('renders children once the user is authenticated', async () => {
    setMockUser(makeUser());
    renderGuarded();
    expect(await screen.findByText('Secret content')).toBeInTheDocument();
  });
});