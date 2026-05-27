import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useMessContext } from '../../context/MessContext';
import { formatCurrency } from '../../utils/helpers';

export default function AddPaymentModal({ student, onClose }) {
  const { addPayment, getPlanPrice, getRemaining } = useMessContext();
  const total     = getPlanPrice(student.plan);
  const remaining = getRemaining(student);
  const [amount, setAmount] = useState('');
  const [note, setNote]     = useState('');
  const [error, setError]   = useState('');

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: 13,
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8,
    outline: 'none', background: '#FAFAF8', color: '#1A1917',
  };

  const handleSubmit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0)        { setError('Enter a valid amount'); return; }
    if (amt > remaining)         { setError(`Max payable is ${formatCurrency(remaining)}`); return; }
    addPayment(student.id, amt, note);
    onClose();
  };

  const pct = Math.round(((total - remaining) / total) * 100);

  return (
    <Modal title={`Add payment — ${student.name}`} onClose={onClose}>
      {/* Summary bar */}
      <div style={{ background: '#F3F2EF', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: '#6B6860' }}>Total fee</span>
          <span style={{ fontWeight: 600, color: '#1A1917' }}>{formatCurrency(total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
          <span style={{ color: '#6B6860' }}>Already paid</span>
          <span style={{ fontWeight: 600, color: '#0F6E56' }}>{formatCurrency(student.paidAmount || 0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
          <span style={{ color: '#6B6860' }}>Remaining</span>
          <span style={{ fontWeight: 700, color: remaining > 0 ? '#A32D2D' : '#0F6E56' }}>{formatCurrency(remaining)}</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 7, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: pct + '%', height: '100%', background: pct === 100 ? '#1D9E75' : '#EF9F27', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 10, color: '#9E9C97', marginTop: 5, textAlign: 'right' }}>{pct}% paid</div>
      </div>

      {/* Quick-fill buttons */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: '#6B6860', marginBottom: 8 }}>Quick fill</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[remaining, Math.floor(remaining/2), 500, 1000].filter((v,i,a) => v > 0 && a.indexOf(v) === i).map(v => (
            <button key={v} onClick={() => setAmount(String(v))} style={{
              padding: '5px 12px', fontSize: 12, borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.1)', background: '#F3F2EF',
              color: '#1A1917', cursor: 'pointer', fontWeight: 500,
            }}>{formatCurrency(v)}</button>
          ))}
        </div>
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: '#6B6860', display: 'block', marginBottom: 5 }}>Payment amount (₹) *</label>
        <input
          type="number" min="1" max={remaining}
          style={{ ...inputStyle, borderColor: error ? '#E24B4A' : 'rgba(0,0,0,0.12)' }}
          value={amount}
          onChange={e => { setAmount(e.target.value); setError(''); }}
          placeholder={`Max: ${formatCurrency(remaining)}`}
        />
        {error && <div style={{ fontSize: 11, color: '#A32D2D', marginTop: 4 }}>{error}</div>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: '#6B6860', display: 'block', marginBottom: 5 }}>Note (optional)</label>
        <input style={inputStyle} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Cash payment, UPI, etc." />
      </div>

      {Number(amount) === remaining && (
        <div style={{ background: '#E1F5EE', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#0F6E56', fontWeight: 500 }}>
          ✓ This will mark the student as fully paid
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Record payment</Button>
      </div>
    </Modal>
  );
}
