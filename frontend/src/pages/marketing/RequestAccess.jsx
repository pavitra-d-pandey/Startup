import React, { useState } from 'react';
import MarketingLayout from '../../components/layouts/MarketingLayout';
import { apiFetch } from '../../api/client';

export default function RequestAccess() {
  const [form, setForm] = useState({
    company: '',
    domain: '',
    phone: '',
    email: '',
    industry: '',
    volume: '',
    reason: '',
  });
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setState('loading');
    setError(null);
    try {
      await apiFetch('/request-access', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setState('success');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  };

  return (
    <MarketingLayout>
      <section className="page-section">
        <div className="container">
          <h1>Request Access</h1>
          {state === 'success' ? (
            <div className="card">Thanks! Your request has been submitted.</div>
          ) : (
            <form onSubmit={submit} className="card" style={{ display: 'grid', gap: 12 }}>
              <input
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
              />
              <input
                placeholder="Domain"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                required
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <input
                placeholder="Work Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                placeholder="Industry"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                required
              />
              <input
                placeholder="Volume"
                value={form.volume}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                required
              />
              <textarea
                placeholder="Reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              />
              <button type="submit" disabled={state === 'loading'}>
                {state === 'loading' ? 'Submitting…' : 'Submit'}
              </button>
              {state === 'error' && <div style={{ color: 'red' }}>{error}</div>}
            </form>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
