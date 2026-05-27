import React, { useState } from 'react';
import { useMessContext } from '../context/MessContext';
import { Avatar, formatCurrency, formatDate } from '../utils/helpers';
import Button from '../components/common/Button';
import StatCard from '../components/common/StatCard';

export default function PaymentsPage() {
  const { students, markPayment, getPlanPrice, getPlanLabel, stats } = useMessContext();
  const [filter, setFilter] = useState('All');

  const filtered = students.filter(s =>
    filter === 'All' ? true : filter === 'Paid' ? s.paid : !s.paid
  );

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total expected" value={formatCurrency(stats.expectedRevenue)} icon="₹" />
        <StatCard label="Collected" value={formatCurrency(stats.collectedRevenue)} icon="✓" valueColor="#0F6E56" />
        <StatCard label="Outstanding" value={formatCurrency(stats.expectedRevenue - stats.collectedRevenue)} icon="⚠" valueColor="#854F0B" />
        <StatCard label="Collection rate" value={stats.total ? Math.round((stats.paid/stats.total)*100) + '%' : '0%'} icon="◎" />
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1917' }}>Payment records</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            {['All','Paid','Pending'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 12px', fontSize: 12, borderRadius: 6, border: '1px solid',
                borderColor: filter === f ? '#1D9E75' : 'rgba(0,0,0,0.09)',
                background: filter === f ? '#E1F5EE' : 'transparent',
                color: filter === f ? '#0F6E56' : '#6B6860', cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F3F2EF' }}>
              {['Student','Student ID','Plan','Amount','Period','Status','Action'].map(h => (
                <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#9E9C97', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initials={s.initials} color={s.avatar} size={32} fontSize={11} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1917' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#9E9C97' }}>{s.room}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6860', background: '#F3F2EF', padding: '2px 7px', borderRadius: 4 }}>{s.id}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B6860' }}>{getPlanLabel(s.plan)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1A1917' }}>{formatCurrency(getPlanPrice(s.plan))}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#9E9C97' }}>{formatDate(s.startDate)} – {formatDate(s.endDate)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                    background: s.paid ? '#EAF3DE' : '#FAEEDA',
                    color: s.paid ? '#3B6D11' : '#854F0B',
                  }}>{s.paid ? '✓ Paid' : 'Pending'}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {!s.paid && <Button size="sm" variant="primary" onClick={() => markPayment(s.id)}>Mark paid</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
