import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useMessContext } from '../../context/MessContext';
import { formatCurrency } from '../../utils/helpers';

const PLAN_OPTIONS = [
  { value: 'both',   label: 'Lunch + Dinner' },
  { value: 'lunch',  label: 'Lunch only' },
  { value: 'dinner', label: 'Dinner only' },
];

export default function RenewModal({ student, onClose }) {
  const { renewStudent, getPlanPrice, getPlanLabel, getDaysLeft } = useMessContext();
  const [plan, setPlan] = useState(student.plan);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8,
    outline: 'none', background: '#FAFAF8', color: '#1A1917',
  };

  const labelStyle = { fontSize: 12, color: '#6B6860', display: 'block', marginBottom: 5 };

  const newFee = getPlanPrice(plan);
  const daysLeft = getDaysLeft(student.endDate);
  const alreadyExpired = daysLeft <= 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    await renewStudent(student.id, { plan, startDate });
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal title={`Renew mess — ${student.name}`} onClose={onClose}>
      {/* Current cycle summary */}
      <div style={{ background: '#F3F2EF', borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: '#9E9C97', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Current cycle
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: '#6B6860' }}>Plan</span>
          <span style={{ fontWeight: 500, color: '#1A1917' }}>{getPlanLabel(student.plan)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: '#6B6860' }}>Status</span>
          <span style={{ fontWeight: 600, color: alreadyExpired ? '#A32D2D' : '#854F0B' }}>
            {alreadyExpired ? `Expired ${Math.abs(daysLeft) === 0 ? 'today' : `${Math.abs(daysLeft)}d ago`}` : `${daysLeft}d left`}
          </span>
        </div>
      </div>

      <div style={{ background: '#E1F5EE', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: '#0F6E56' }}>
        This starts a fresh billing cycle. The current cycle's payment history will be archived, not deleted.
      </div>

      {/* New plan selection */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Meal plan for new cycle *</label>
        <select style={inputStyle} value={plan} onChange={e => setPlan(e.target.value)}>
          {PLAN_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* New start date */}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>New cycle start date *</label>
        <input
          type="date" style={inputStyle}
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
      </div>

      {/* Fee summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#FEF3DC', borderRadius: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: '#854F0B', fontWeight: 500 }}>New cycle fee due</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#854F0B' }}>{formatCurrency(newFee)}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Renewing…' : 'Confirm renewal'}
        </Button>
      </div>
    </Modal>
  );
}
