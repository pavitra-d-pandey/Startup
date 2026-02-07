import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../App.module.scss';
import { apiFetch } from '../../api/client';

export default function Settings() {
  const { tenantSlug } = useParams();
  const [theme, setTheme] = useState({ primary: '#0B5FFF', accent: '#00BFA6', mode: 'light' });
  const [state, setState] = useState('idle');

  const save = async () => {
    setState('loading');
    await apiFetch(`/dashboard/${tenantSlug}/settings/branding`, {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    });
    setState('success');
  };

  return (
    <div className={styles.page}>
      <div className={styles.stateBox}>
        <h2>Branding Theme</h2>
        <label>
          Primary
          <input value={theme.primary} onChange={(e) => setTheme({ ...theme, primary: e.target.value })} />
        </label>
        <label>
          Accent
          <input value={theme.accent} onChange={(e) => setTheme({ ...theme, accent: e.target.value })} />
        </label>
        <label>
          Mode
          <select value={theme.mode} onChange={(e) => setTheme({ ...theme, mode: e.target.value })}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <button onClick={save}>{state === 'loading' ? 'Saving…' : 'Save'}</button>
        {state === 'success' && <div>Saved</div>}
      </div>
    </div>
  );
}
