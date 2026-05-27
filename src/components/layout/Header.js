import React from 'react';
import { useMessContext } from '../../context/MessContext';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Overview of your mess operations' },
  students:  { title: 'Students & IDs', sub: 'Manage student profiles and unique IDs' },
  biometric: { title: 'Biometric Scanner', sub: 'Fingerprint-based meal check-in' },
  payments:  { title: 'Payments', sub: 'Track fees and dues' },
};

export default function Header() {
  const { activeTab } = useMessContext();
  const page = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;

  return (
    <header style={{
      height: 64, background: '#FFFFFF',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1A1917', lineHeight: 1.3 }}>{page.title}</h1>
        <p style={{ fontSize: 12, color: '#9E9C97', marginTop: 1 }}>{page.sub}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 12, background: '#E1F5EE', color: '#0F6E56',
          padding: '4px 12px', borderRadius: 6, fontWeight: 500,
        }}>● Active session</span>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: '#1D9E75', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600,
        }}>M</div>
      </div>
    </header>
  );
}
