import React from 'react';
import { Avatar, formatDate, formatCurrency } from '../../utils/helpers';
import { useMessContext } from '../../context/MessContext';
import Button from '../common/Button';

export default function StudentDetail({ student }) {
  const { getPlanLabel, getPlanPrice, getDaysLeft, markPayment, registerBiometric, removeBiometric, deleteStudent } = useMessContext();

  if (!student) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9E9C97', fontSize: 13 }}>
      Select a student to view details
    </div>
  );

  const daysLeft = getDaysLeft(student.endDate);
  const barColor = daysLeft <= 3 ? '#E24B4A' : daysLeft <= 7 ? '#EF9F27' : '#1D9E75';
  const barPct = Math.min(100, Math.round(((31 - daysLeft) / 31) * 100));
  const amount = getPlanPrice(student.plan);

  return (
    <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '24px', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <Avatar initials={student.initials} color={student.avatar} size={56} fontSize={18} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1A1917' }}>{student.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B6860', background: '#F3F2EF', padding: '2px 8px', borderRadius: 5 }}>{student.id}</span>
            <span style={{ fontSize: 11, color: '#9E9C97' }}>{student.address}</span>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={() => { if(window.confirm('Delete student?')) deleteStudent(student.id); }}>Delete</Button>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Meal plan', value: getPlanLabel(student.plan) },
          { label: 'Monthly fee', value: formatCurrency(amount) },
          { label: 'Start date', value: formatDate(student.startDate) },
          { label: 'End date', value: formatDate(student.endDate) },
          { label: 'Phone', value: student.phone || '—' },
          { label: 'Email', value: student.email || '—' },
        ].map(item => (
          <div key={item.label} style={{ background: '#F3F2EF', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#9E9C97', marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1917' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Duration */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: '#6B6860' }}>Duration progress</span>
          <span style={{ fontWeight: 600, color: barColor }}>{daysLeft} days remaining</span>
        </div>
        <div style={{ height: 7, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: barPct + '%', height: '100%', background: barColor, borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Payment */}
      <div style={{ marginBottom: 20, padding: '16px', background: '#F3F2EF', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1917' }}>Payment status</div>
            <div style={{ fontSize: 12, color: '#6B6860', marginTop: 2 }}>{student.paid ? 'Payment received' : `${formatCurrency(amount)} due`}</div>
          </div>
          {student.paid ? (
            <span style={{ background: '#EAF3DE', color: '#3B6D11', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 6 }}>✓ Paid</span>
          ) : (
            <Button variant="primary" size="sm" onClick={() => markPayment(student.id)}>Mark as paid</Button>
          )}
        </div>
      </div>

      {/* Biometric */}
      <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1917', marginBottom: 12 }}>Biometric access</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12, flexShrink: 0,
            background: student.bioRegistered ? '#E1F5EE' : '#F3F2EF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>❋</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1917' }}>
              {student.bioRegistered ? 'Fingerprint registered' : 'No biometric enrolled'}
            </div>
            <div style={{ fontSize: 12, color: '#9E9C97', marginTop: 3 }}>
              {student.bioRegistered ? 'Student can check in via fingerprint scanner.' : 'Enroll to enable biometric meal check-in.'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {student.bioRegistered ? (
                <>
                  <Button size="sm" onClick={() => {}}>Re-enroll</Button>
                  <Button size="sm" variant="danger" onClick={() => removeBiometric(student.id)}>Remove</Button>
                </>
              ) : (
                <Button size="sm" variant="primary" onClick={() => registerBiometric(student.id)}>Enroll fingerprint</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
