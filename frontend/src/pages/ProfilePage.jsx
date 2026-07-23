import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import ErrorBanner from '../components/ErrorBanner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Only send fields that actually changed (plus password, only if the
    // person typed a new one) — matches the backend treating each field as
    // independently optional, and avoids a no-op "email already in use"
    // rejection when the email field is just left as-is.
    const updates = {};
    if (name !== user.name) updates.name = name;
    if (email !== user.email) updates.email = email;
    if (password) updates.password = password;

    if (Object.keys(updates).length === 0) {
      setError('No changes to save.');
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile(updates);
      setPassword('');
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update your profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <span className="eyebrow">Account</span>
      <h1 style={{ marginBottom: 8 }}>My profile</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
        Update your name, email, or password. Leave the password field blank to keep your current one.
      </p>

      <div className="card auth-page" style={{ margin: 0 }}>
        <ErrorBanner message={error} />
        {success && (
          <div className="alert" style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)', background: 'rgba(95, 216, 160, 0.08)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              placeholder="Leave blank to keep current password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
