import React, { useEffect, useState } from 'react';
import MarketingLayout from '../../components/layouts/MarketingLayout';
import { apiFetch } from '../../api/client';

const ADMIN_TOKEN_KEY = 'sb_admin_token';

export default function SecretAdmin() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await apiFetch('/secret-admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadRequests = async () => {
    if (!token) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4100/api'}/admin/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to load requests');
    setRequests(json.data || []);
  };

  useEffect(() => {
    loadRequests().catch((err) => setError(err.message));
  }, [token]);

  const approve = async (requestId) => {
    setMessage(null);
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4100/api'}/admin/requests/${requestId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ planTier: 'starter' }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Approve failed');
    setMessage(
      `Approved. Tenant: ${json.data.tenantSlug} | Admin: ${json.data.adminEmail} | Phone: ${json.data.contactPhone || 'N/A'} | Temp Password: ${json.data.tempPassword}`
    );
    await loadRequests();
  };

  const reject = async (requestId) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4100/api'}/admin/requests/${requestId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Not a fit' }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Reject failed');
    await loadRequests();
  };

  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <h1>Secret Admin</h1>
          {!token ? (
            <form onSubmit={login} className="card" style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
              <input
                placeholder="Admin password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Enter</button>
              {error && <div style={{ color: 'red' }}>{error}</div>}
            </form>
          ) : (
            <div className="card" style={{ display: 'grid', gap: 12 }}>
              <h3>Access Requests</h3>
              {message && <div style={{ color: 'green' }}>{message}</div>}
              {requests.length === 0 ? (
                <div>No requests</div>
              ) : (
                <table width="100%">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Domain</th>
                      <th>Status</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td>{r.company}</td>
                        <td>{r.email}</td>
                        <td>{r.domain}</td>
                        <td>{r.reviewStatus}</td>
                        <td>{r.phone}</td>
                        <td>
                          {r.reviewStatus === 'new' && (
                            <>
                              <button onClick={() => approve(r._id)}>Approve</button>{' '}
                              <button onClick={() => reject(r._id)}>Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
