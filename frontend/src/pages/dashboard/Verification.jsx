import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../App.module.scss';
import { apiFetch } from '../../api/client';

export default function Verification() {
  const { tenantSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch(`/dashboard/${tenantSlug}/verification`);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug]);

  const addItem = async (type, value) => {
    await apiFetch(`/dashboard/${tenantSlug}/verification/${type}`, {
      method: 'POST',
      body: JSON.stringify(type === 'phone' ? { number: value } : type === 'email' ? { domain: value } : { sender: value }),
    });
    await load();
  };

  const setStatus = async (type, index, status) => {
    await apiFetch(`/dashboard/${tenantSlug}/verification/${type}/${index}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await load();
  };

  if (loading) return <div className={styles.loadingState}>Loading verification…</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;
  if (!data) return <div className={styles.emptyState}>No verification data</div>;

  return (
    <div className={styles.page}>
      <div className={styles.stateBox}>
        <h2>Phone Numbers</h2>
        <button onClick={() => addItem('phone', '+1-212-555-0101')}>Request Verification</button>
        <ul>
          {data.phoneNumbers?.map((p, idx) => (
            <li key={idx}>
              {p.number} — {p.status}{' '}
              {p.status === 'pending' && (
                <>
                  <button onClick={() => setStatus('phone', idx, 'verified')}>Approve</button>{' '}
                  <button onClick={() => setStatus('phone', idx, 'rejected')}>Reject</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.stateBox}>
        <h2>Email Domains</h2>
        <button onClick={() => addItem('email', 'acme.com')}>Request Verification</button>
        <ul>
          {data.emailDomains?.map((p, idx) => (
            <li key={idx}>
              {p.domain} — {p.status}{' '}
              {p.status === 'pending' && (
                <>
                  <button onClick={() => setStatus('email', idx, 'verified')}>Approve</button>{' '}
                  <button onClick={() => setStatus('email', idx, 'rejected')}>Reject</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.stateBox}>
        <h2>Sender Identities</h2>
        <button onClick={() => addItem('sender', 'Acme Support')}>Request Verification</button>
        <ul>
          {data.senderIdentities?.map((p, idx) => (
            <li key={idx}>
              {p.sender} — {p.status}{' '}
              {p.status === 'pending' && (
                <>
                  <button onClick={() => setStatus('sender', idx, 'verified')}>Approve</button>{' '}
                  <button onClick={() => setStatus('sender', idx, 'rejected')}>Reject</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
