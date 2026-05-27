import React from 'react';
import { useMessContext } from '../../context/MessContext';
import StatCard from '../common/StatCard';
import { formatCurrency } from '../../utils/helpers';

export default function DashboardPage() {
  const { stats, students, getDaysLeft, getPlanLabel, getPlanPrice } = useMessContext();

  const expiring = students.filter(s => getDaysLeft(s.endDate) <= 7).sort((a,b) => getDaysLeft(a.endDate) - getDaysLeft(b.endDate));

  const planCounts = {
    both: students.filter(s=>s.plan==='both').length,
    lunch: students.filter(s=>s.plan==='lunch').length,
    dinner: students.filter(s=>s.plan==='dinner').length,
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
        <StatCard label="Total students" value={stats.total} icon="◎" sub="enrolled this month" />
        <StatCard label="Expected revenue" value={formatCurrency(stats.expectedRevenue)} icon="₹" sub="this month" />
        <StatCard label="Paid" value={stats.paid} icon="✓" sub={formatCurrency(stats.collectedRevenue) + ' received'} valueColor="#0F6E56" />
        <StatCard label="Pending" value={stats.pending} icon="⚠" sub={formatCurrency(stats.expectedRevenue - stats.collectedRevenue) + ' outstanding'} valueColor="#854F0B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '20px 24px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1917', marginBottom: 16 }}>Renewals this week</h3>
          {expiring.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9E9C97' }}>No renewals due this week.</p>
          ) : expiring.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1917' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#9E9C97', marginTop: 2 }}>
                  {getDaysLeft(s.endDate) <= 0 ? 'Expired' : `${getDaysLeft(s.endDate)} days left`} · {getPlanLabel(s.plan)}
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0F6E56' }}>{formatCurrency(getPlanPrice(s.plan))}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 14, padding: '20px 24px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1A1917', marginBottom: 16 }}>Plan breakdown</h3>
          {[
            { key: 'both', label: 'Lunch + Dinner (₹3,200)', color: '#1D9E75' },
            { key: 'lunch', label: 'Lunch only (₹1,800)', color: '#185FA5' },
            { key: 'dinner', label: 'Dinner only (₹1,800)', color: '#534AB7' },
          ].map(p => {
            const pct = stats.total ? Math.round((planCounts[p.key] / stats.total) * 100) : 0;
            return (
              <div key={p.key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#6B6860' }}>{p.label}</span>
                  <span style={{ fontWeight: 500, color: '#1A1917' }}>{planCounts[p.key]} students</span>
                </div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: pct + '%', height: '100%', background: p.color, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#6B6860' }}>Biometric registered</span>
              <span style={{ fontWeight: 600, color: '#0F6E56' }}>{stats.bioRegistered} / {stats.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
