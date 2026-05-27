import React from 'react';
import { Avatar, PlanPill, StatusBadge, BioDot } from '../../utils/helpers';
import { useMessContext } from '../../context/MessContext';

export default function StudentCard({ student, selected, onClick }) {
  const { getDaysLeft } = useMessContext();
  const daysLeft = getDaysLeft(student.endDate);
  const barColor = daysLeft <= 3 ? '#E24B4A' : daysLeft <= 7 ? '#EF9F27' : '#1D9E75';
  const barPct = Math.min(100, Math.round(((31 - daysLeft) / 31) * 100));

  return (
    <div onClick={onClick} style={{
      background: '#FFFFFF',
      border: selected ? '2px solid #1D9E75' : '1px solid rgba(0,0,0,0.08)',
      borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
      transition: 'border-color 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Avatar initials={student.initials} color={student.avatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
          <div style={{ fontSize: 11, color: '#9E9C97', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>{student.id}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <PlanPill plan={student.plan} />
        <BioDot registered={student.bioRegistered} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9E9C97', marginBottom: 4 }}>
          <span>Duration</span>
          <span style={{ fontWeight: 500, color: barColor }}>{daysLeft}d left</span>
        </div>
        <div style={{ height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: barPct + '%', height: '100%', background: barColor, borderRadius: 99 }} />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <StatusBadge paid={student.paid} />
      </div>
    </div>
  );
}
