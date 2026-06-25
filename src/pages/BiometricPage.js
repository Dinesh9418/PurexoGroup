import React from 'react';
import { useMessContext } from '../context/MessContext';
import FingerprintScanner from '../components/biometric/FingerprintScanner';
import AttendanceLog from '../components/biometric/AttendanceLog';
import StatCard from '../components/common/StatCard';

export default function BiometricPage() {
  const { stats, attendance } = useMessContext();
  const todayScans = attendance.filter(a => a.date === '2026-05-26').length;

  return (
    <div className="page-padded" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="grid-4">
        <StatCard label="Bio registered" value={stats.bioRegistered} icon="❋" sub={`of ${stats.total} students`} valueColor="#0F6E56" />
        <StatCard label="Today's scans" value={todayScans} icon="◉" sub="fingerprint entries" />
        <StatCard label="Meals served" value={todayScans} icon="🍽" sub="successfully logged" />
        <StatCard label="Not registered" value={stats.total - stats.bioRegistered} icon="⚠" sub="need enrollment" valueColor="#A32D2D" />
      </div>

      <div className="grid-2" style={{ flex: 1, minHeight: 360 }}>
        <FingerprintScanner />
        <AttendanceLog />
      </div>
    </div>
  );
}
