import React from 'react';

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 40,
      }}
    >
      <div style={{ background: '#fff', padding: 24, borderRadius: 10, width: 360 }}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} style={{ background: '#dc2626', color: '#fff' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
