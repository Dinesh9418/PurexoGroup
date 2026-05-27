export const AVATAR_COLORS = {
  teal:   { bg: '#E1F5EE', text: '#0F6E56' },
  blue:   { bg: '#E6F1FB', text: '#185FA5' },
  coral:  { bg: '#FAECE7', text: '#993C1D' },
  purple: { bg: '#EEEDFE', text: '#534AB7' },
  amber:  { bg: '#FAEEDA', text: '#854F0B' },
};

export const Avatar = ({ initials, color = 'teal', size = 40, fontSize = 13 }) => {
  const c = AVATAR_COLORS[color] || AVATAR_COLORS.teal;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.bg, color: c.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 500, flexShrink: 0,
    }}>{initials}</div>
  );
};

export const PlanPill = ({ plan }) => {
  const styles = {
    both:   { bg: '#E1F5EE', text: '#0F6E56', label: 'L + D' },
    lunch:  { bg: '#E6F1FB', text: '#185FA5', label: 'Lunch' },
    dinner: { bg: '#EEEDFE', text: '#534AB7', label: 'Dinner' },
  };
  const s = styles[plan] || styles.both;
  return (
    <span style={{
      background: s.bg, color: s.text,
      fontSize: 11, fontWeight: 500,
      padding: '3px 10px', borderRadius: 6,
    }}>{s.label}</span>
  );
};

export const StatusBadge = ({ paid }) => (
  <span style={{
    background: paid ? '#EAF3DE' : '#FAEEDA',
    color: paid ? '#3B6D11' : '#854F0B',
    fontSize: 11, fontWeight: 500,
    padding: '3px 10px', borderRadius: 6,
  }}>{paid ? 'Paid' : 'Pending'}</span>
);

export const BioDot = ({ registered }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    <div style={{
      width: 7, height: 7, borderRadius: '50%',
      background: registered ? '#1D9E75' : '#E24B4A',
      flexShrink: 0,
    }} />
    <span style={{ fontSize: 11, color: '#6B6860' }}>
      {registered ? 'Bio reg.' : 'No bio'}
    </span>
  </div>
);

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatCurrency = (amount) =>
  '₹' + amount.toLocaleString('en-IN');
