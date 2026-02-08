import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../App.module.scss';
import { apiFetch } from '../../api/client';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function Users() {
  const { tenantSlug } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [message, setMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/dashboard/${tenantSlug}/users`);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tenantSlug]);

  const invite = async () => {
    setMessage(null);
    const res = await apiFetch(`/dashboard/${tenantSlug}/users`, {
      method: 'POST',
      body: JSON.stringify({ email: `user${Date.now()}@example.com`, name: 'New User', role: 'CLIENT_USER' }),
    });
    setMessage(`User created. Temp password: ${res.tempPassword}`);
    await load();
  };

  const disable = async (userId) => {
    await apiFetch(`/dashboard/${tenantSlug}/users/${userId}/disable`, { method: 'PATCH' });
    await load();
  };

  const updateRole = async (userId, role) => {
    await apiFetch(`/dashboard/${tenantSlug}/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    await load();
  };

  const permissionsByRole = {
    CLIENT_ADMIN: [
      'TENANT_READ',
      'TENANT_UPDATE',
      'ASSET_UPLOAD',
      'ASSET_VERSION_ROLLBACK',
      'VERIFICATION_REQUEST',
      'VERIFICATION_APPROVE',
      'LOG_VIEW',
      'LOG_EXPORT',
      'USER_INVITE',
      'USER_DISABLE',
      'USER_ROLE_UPDATE',
    ],
    CLIENT_USER: ['TENANT_READ', 'ASSET_UPLOAD', 'VERIFICATION_REQUEST', 'LOG_VIEW'],
  };

  if (loading) return <div className={styles.loadingState}>Loading users…</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.page}>
      <div className={styles.stateBox}>
        <div className="mono">Simulation Mode</div>
        <p className="muted">User invites generate temporary credentials for demo.</p>
      </div>
      <div className={styles.stateBox}>
        <h2>Users</h2>
        <button onClick={invite}>Invite User</button>
        {message && <div style={{ color: 'green' }}>{message}</div>}
        {users.length === 0 ? (
          <div className={styles.emptyState}>No users yet.</div>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Email</th>
                <th align="left">Role</th>
                <th align="left">Status</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select value={user.role} onChange={(e) => updateRole(user._id, e.target.value)}>
                      <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
                      <option value="CLIENT_USER">CLIENT_USER</option>
                    </select>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {permissionsByRole[user.role]?.join(', ')}
                    </div>
                  </td>
                  <td>{user.status}</td>
                  <td>
                    {user.status === 'active' && (
                      <button onClick={() => setConfirm(user._id)}>Disable</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title="Disable user?"
        message="User will lose access immediately."
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await disable(confirm);
          setConfirm(null);
        }}
      />
    </div>
  );
}
