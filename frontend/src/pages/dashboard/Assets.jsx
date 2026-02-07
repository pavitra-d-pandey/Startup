import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../App.module.scss';
import { apiFetch } from '../../api/client';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function Assets() {
  const { tenantSlug } = useParams();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/dashboard/${tenantSlug}/assets`);
      setAssets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug]);

  const addMockAsset = async () => {
    await apiFetch(`/dashboard/${tenantSlug}/assets`, {
      method: 'POST',
      body: JSON.stringify({
        publicId: `logo_${Date.now()}`,
        url: 'https://placehold.co/200x200',
        hash: `${Date.now()}`,
        createdBy: 'system',
      }),
    });
    await load();
  };

  const activate = async (version) => {
    await apiFetch(`/dashboard/${tenantSlug}/assets/activate/${version}`, { method: 'POST' });
    await load();
  };

  if (loading) return <div className={styles.loadingState}>Loading assets…</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.stateBox}>
        <h2>Upload Brand Logo</h2>
        <button onClick={addMockAsset}>Simulate Upload</button>
      </div>
      {assets.length === 0 ? (
        <div className={styles.emptyState}>No logo versions yet.</div>
      ) : (
        <div className={styles.stateBox}>
          <h3>Logo Versions</h3>
          <table width="100%" aria-label="Logo versions">
            <thead>
              <tr>
                <th align="left">Version</th>
                <th align="left">Hash</th>
                <th align="left">Active</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.version}>
                  <td>{asset.version}</td>
                  <td>{asset.hash}</td>
                  <td>{asset.activeVersion ? 'Active' : 'Inactive'}</td>
                  <td>
                    {!asset.activeVersion && (
                      <button onClick={() => setConfirm(asset.version)}>Rollback</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirm !== null}
        title="Rollback Logo?"
        message="This will set the selected version as active."
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await activate(confirm);
          setConfirm(null);
        }}
      />
    </div>
  );
}
