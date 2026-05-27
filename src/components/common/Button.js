import React from 'react';

const variants = {
  primary:   { bg: '#1D9E75', color: '#fff', border: 'none' },
  secondary: { bg: 'transparent', color: '#6B6860', border: '1px solid rgba(0,0,0,0.12)' },
  danger:    { bg: 'transparent', color: '#A32D2D', border: '1px solid #F09595' },
  dark:      { bg: '#1A1917', color: '#fff', border: 'none' },
};

export default function Button({ children, onClick, variant = 'secondary', size = 'md', style = {} }) {
  const v = variants[variant] || variants.secondary;
  const pad = size === 'sm' ? '6px 12px' : '9px 18px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: pad, fontSize: fs, fontWeight: 500,
      borderRadius: 8, cursor: 'pointer',
      background: v.bg, color: v.color, border: v.border,
      transition: 'opacity 0.15s',
      ...style,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >{children}</button>
  );
}
