import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../App.module.scss';
import { apiFetch } from '../../api/client';

export default function Overview() {
  const { tenantSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/dashboard/${tenantSlug}/overview`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  if (loading) return <div className={styles.loadingState}>Loading overview…</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.stateBox}>
        <div className="mono">Simulation Mode</div>
        <p className="muted">Synthetic signals emulate carrier + inbox feedback loops for demo purposes.</p>
      </div>
      <div className={styles.stateBox}>
        <h2>Verification Summary</h2>
        <p>Phone verified: {data?.verification?.phone?.verified} / {data?.verification?.phone?.total}</p>
        <p>Email verified: {data?.verification?.email?.verified} / {data?.verification?.email?.total}</p>
        <p>Sender verified: {data?.verification?.sender?.verified} / {data?.verification?.sender?.total}</p>
      </div>
      <div className={styles.stateBox}>
        <h2>Reputation Health</h2>
        <p>Flagged numbers: {data?.reputation?.flaggedCount}</p>
      </div>
      <div className={styles.stateBox}>
        <h2>Communications KPIs</h2>
        <p>Total logs: {data?.communications?.total}</p>
        <p>Avg spam score: {data?.communications?.avgSpamScore}</p>
        <p>Avg answer rate: {data?.communications?.avgAnswerRate}</p>
      </div>
      <div className={styles.stateBox}>
        <h2>Recent Activity</h2>
        <p>No activity yet.</p>
      </div>
    </div>
  );
}
