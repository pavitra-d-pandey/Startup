import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../App.module.scss';
import { apiFetch } from '../../api/client';

export default function Reputation() {
  const { tenantSlug } = useParams();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/dashboard/${tenantSlug}/reputation`);
      setFlags(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug]);

  const recheck = async () => {
    await apiFetch(`/dashboard/${tenantSlug}/reputation/recheck`, { method: 'POST' });
    await load();
  };

  if (loading) return <div className={styles.loadingState}>Loading reputation…</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.stateBox}>
        <h2>Flagged Numbers</h2>
        <button onClick={recheck}>Recheck Now</button>
        {flags.length === 0 ? (
          <div className={styles.emptyState}>No flags yet.</div>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                <th align="left">Number</th>
                <th align="left">Status</th>
                <th align="left">Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag._id}>
                  <td>{flag.phoneNumber}</td>
                  <td>{flag.status}</td>
                  <td>{new Date(flag.lastCheckedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
