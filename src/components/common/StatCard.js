import React from 'react';

export default function StatCard({ label, value, sub, icon, valueColor }) {
  return (
    <div style={{
      background: '#F3F2EF', borderRadius: 12,
      padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B6860', marginBottom: 8 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: valueColor || '#1A1917', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#9E9C97', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}
