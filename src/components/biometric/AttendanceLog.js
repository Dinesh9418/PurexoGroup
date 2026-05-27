import React from 'react';
import { useMessContext } from '../../context/MessContext';
import { Avatar } from '../../utils/helpers';

export default function AttendanceLog() {
  const { attendance } = useMessContext();

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1917' }}>Attendance log</h3>
        <span style={{ fontSize: 11, background: '#E6F1FB', color: '#185FA5', padding: '3px 10px', borderRadius: 6, fontWeight: 500 }}>Today — May 26, 2026</span>
      </div>

      {attendance.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9E9C97', fontSize: 13, padding: 40 }}>No entries yet today</div>
      ) : attendance.map(entry => (
        <div key={entry.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <Avatar initials={entry.initials} color={entry.avatar} size={34} fontSize={11} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1917' }}>{entry.studentName}</div>
            <div style={{ fontSize: 11, color: '#9E9C97', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>{entry.studentId}</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            padding: '2px 8px', borderRadius: 5,
            background: entry.meal === 'Lunch' ? '#E6F1FB' : '#EEEDFE',
            color: entry.meal === 'Lunch' ? '#185FA5' : '#534AB7',
          }}>{entry.meal}</span>
          <span style={{ fontSize: 11, color: '#9E9C97', minWidth: 60, textAlign: 'right' }}>{entry.time}</span>
        </div>
      ))}
    </div>
  );
}
