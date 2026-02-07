import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingLayout from '../../components/layouts/MarketingLayout';
import { useAuth } from '../../components/common/AuthProvider';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await auth.login(email, password);
      if (user?.tenantSlug) {
        navigate(`/dashboard/${user.tenantSlug}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <h1>Sign In</h1>
          <form onSubmit={submit} className="card" style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign In</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
