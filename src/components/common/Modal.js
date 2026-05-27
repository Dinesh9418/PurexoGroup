import React from 'react';

export default function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#FFFFFF', borderRadius: 16,
        width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1A1917' }}>{title}</h2>
          <button onClick={onClose} style={{
            border: 'none', background: 'transparent',
            fontSize: 20, color: '#9E9C97', cursor: 'pointer', lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}
