import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../test/utils';
import LoginPage from './LoginPage';

function Home() {
  return <div>Home Page</div>;
}

function renderLoginFlow() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Home />} />
    </Routes>,
    { route: '/login' }
  );
}

describe('LoginPage', () => {
  test('logs in with valid credentials and redirects home', async () => {
    const user = userEvent.setup();
    renderLoginFlow();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  test('shows an error message for invalid credentials and stays on the page', async () => {
    const user = userEvent.setup();
    renderLoginFlow();

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials.');
    expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
  });
});