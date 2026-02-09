import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../App.module.scss';
import { apiFetch } from '../../api/client';

export default function AiGuard() {
  const { tenantSlug } = useParams();
  const [channel, setChannel] = useState('sms');
  const [message, setMessage] = useState('Limited time offer! Click https://example.com to confirm.');
  const [recipientStats, setRecipientStats] = useState({
    complaintRate: 0.02,
    bounceRate: 0.03,
    replyRate: 0.18,
    optInAgeDays: 60,
  });
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [feedbackLabel, setFeedbackLabel] = useState('0');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackState, setFeedbackState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);

  const score = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/dashboard/${tenantSlug}/ai/score`, {
        method: 'POST',
        body: JSON.stringify({
          channel,
          message,
          sendAt: new Date().toISOString(),
          recipientStats,
        }),
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const train = async () => {
    setTraining(true);
    try {
      const data = await apiFetch(`/dashboard/${tenantSlug}/ai/train`, {
        method: 'POST',
        body: JSON.stringify({ iterations: 6000, learningRate: 0.07 }),
      });
      setStatus(data);
    } finally {
      setTraining(false);
    }
  };

  const submitFeedback = async () => {
    if (!result?.features) return;
    setFeedbackState('loading');
    try {
      await apiFetch(`/dashboard/${tenantSlug}/ai/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          features: result.features,
          label: Number(feedbackLabel),
          source: feedbackNote ? `ui:${feedbackNote}` : 'ui',
        }),
      });
      setFeedbackState('success');
    } catch (err) {
      setFeedbackState('error');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.stateBox}>
        <div className="mono">Simulation Mode</div>
        <p className="muted">AI Guard uses synthetic training data to score risk and decide allow/block.</p>
      </div>

      <div className={styles.stateBox}>
        <h2>AI Guard Console</h2>
        <div className={styles.gridTwo}>
          <div className="card" style={{ display: 'grid', gap: 12 }}>
            <label>
              Channel
              <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="voice">Voice</option>
              </select>
            </label>
            <label>
              Message / Script
              <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <button onClick={score} disabled={loading}>
              {loading ? 'Scoring…' : 'Score & Decide'}
            </button>
          </div>

          <div className="card" style={{ display: 'grid', gap: 12 }}>
            <div className="mono">Recipient Stats</div>
            <label>
              Complaint rate
              <input
                type="number"
                step="0.01"
                value={recipientStats.complaintRate}
                onChange={(e) => setRecipientStats({ ...recipientStats, complaintRate: Number(e.target.value) })}
              />
            </label>
            <label>
              Bounce rate
              <input
                type="number"
                step="0.01"
                value={recipientStats.bounceRate}
                onChange={(e) => setRecipientStats({ ...recipientStats, bounceRate: Number(e.target.value) })}
              />
            </label>
            <label>
              Reply rate
              <input
                type="number"
                step="0.01"
                value={recipientStats.replyRate}
                onChange={(e) => setRecipientStats({ ...recipientStats, replyRate: Number(e.target.value) })}
              />
            </label>
            <label>
              Opt-in age (days)
              <input
                type="number"
                value={recipientStats.optInAgeDays}
                onChange={(e) => setRecipientStats({ ...recipientStats, optInAgeDays: Number(e.target.value) })}
              />
            </label>
          </div>
        </div>
      </div>

      <div className={styles.stateBox}>
        <h2>Decision</h2>
        {!result ? (
          <div className="muted">Run a score to see risk, decision, and recommendations.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="card">
              <div className="mono">Risk Score</div>
              <h3>{result.score} / 100</h3>
              <div className="muted">Band: {result.band} · Decision: {result.decision}</div>
            </div>
            <div className="card">
              <div className="mono">Recommendations</div>
              {Array.isArray(result.recommendations) ? (
                <ul>
                  {result.recommendations.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <div className="muted">No recommendations returned.</div>
              )}
            </div>
            <div className="card" style={{ display: 'grid', gap: 10 }}>
              <div className="mono">Feedback Loop</div>
              <div className="muted">Label this outcome so the model learns over time.</div>
              <label>
                Label
                <select value={feedbackLabel} onChange={(e) => setFeedbackLabel(e.target.value)}>
                  <option value="0">Good outcome (allow)</option>
                  <option value="1">Bad outcome (complaint/spam)</option>
                </select>
              </label>
              <label>
                Note (optional)
                <input
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="e.g. customer complained"
                />
              </label>
              <button onClick={submitFeedback} disabled={feedbackState === 'loading'}>
                {feedbackState === 'loading' ? 'Submitting…' : 'Submit Feedback'}
              </button>
              {feedbackState === 'success' && <div className="muted">Feedback received.</div>}
              {feedbackState === 'error' && <div className="muted">Failed to submit feedback.</div>}
            </div>
          </div>
        )}
        {error && <div className="muted">{error}</div>}
      </div>

      <div className={styles.stateBox}>
        <h2>Training</h2>
        <p className="muted">Synthetic training simulates thousands of feedback signals and refreshes weights.</p>
        <button onClick={train} disabled={training}>
          {training ? 'Training…' : 'Run Synthetic Training'}
        </button>
        {status && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="mono">Model Updated</div>
            <div>Version: {status.version}</div>
            <div>Samples: {status.samples}</div>
          </div>
        )}
      </div>
    </div>
  );
}
