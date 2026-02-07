import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../App.module.scss';
import { apiFetch } from '../../api/client';

export default function Logs() {
  const { tenantSlug } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channel, setChannel] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = channel ? `?channel=${channel}` : '';
      const data = await apiFetch(`/dashboard/${tenantSlug}/logs${query}`);
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug, channel]);

  if (loading) return <div className={styles.loadingState}>Loading logs…</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.stateBox}>
        <h2>Communication Logs</h2>
        <label>
          Filter by channel
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="">All</option>
            <option value="voice">Voice</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>
        </label>
        {logs.length === 0 ? (
          <div className={styles.emptyState}>No logs yet.</div>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                <th align="left">Channel</th>
                <th align="left">Recipient</th>
                <th align="left">Spam Score</th>
                <th align="left">Occurred</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.channel}</td>
                  <td>{log.recipient}</td>
                  <td>{log.spamScore ?? '—'}</td>
                  <td>{new Date(log.occurredAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
