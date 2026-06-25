import React, { useState } from 'react';
import { useMessContext } from '../context/MessContext';
import StudentCard from '../components/students/StudentCard';
import StudentDetail from '../components/students/StudentDetail';
import AddStudentModal from '../components/students/AddStudentModal';
import Button from '../components/common/Button';

const FILTERS = ['All', 'Active', 'Paid', 'Pending', 'Expiring soon', 'Expired', 'No biometric', 'Inactive'];

export default function StudentsPage() {
  const { students, getDaysLeft, getPaymentStatus } = useMessContext();
  const [selected, setSelected] = useState(students[0]?.id || null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    const active = s.status !== 'inactive';
    const daysLeft = getDaysLeft(s.endDate);
    const payStatus = getPaymentStatus(s);
    const matchFilter =
      filter === 'All' ? active :
      filter === 'Active' ? active :
      filter === 'Paid' ? active && payStatus === 'paid' :
      filter === 'Pending' ? active && payStatus !== 'paid' :
      filter === 'Expiring soon' ? active && daysLeft <= 7 && daysLeft > 0 :
      filter === 'Expired' ? active && daysLeft <= 0 :
      filter === 'No biometric' ? active && !s.bioRegistered :
      filter === 'Inactive' ? !active : true;
    return matchSearch && matchFilter;
  });

  const selectedStudent = students.find(s => s.id === selected);

  return (
    <div className="page-padded" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div className="filters-row" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 500,
              borderRadius: 7, border: '1px solid',
              borderColor: filter === f ? '#1D9E75' : 'rgba(0,0,0,0.09)',
              background: filter === f ? '#E1F5EE' : 'transparent',
              color: filter === f ? '#0F6E56' : '#6B6860', cursor: 'pointer',
            }}>{f}</button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or ID…"
          style={{
            padding: '7px 12px', fontSize: 12, borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)', background: '#F3F2EF',
            outline: 'none', width: 180, flexShrink: 0,
          }} />
        <Button variant="dark" onClick={() => setShowAdd(true)}>+ Add student</Button>
      </div>

      {/* Body */}
      <div className="students-body" style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0, flexWrap: 'wrap' }}>
        {/* Grid */}
        <div className="students-grid" style={{ width: 360, flexShrink: 0, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start', maxHeight: '70vh' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9E9C97', fontSize: 13, padding: 40 }}>No students found</div>
          ) : filtered.map(s => (
            <StudentCard key={s.id} student={s} selected={s.id === selected} onClick={() => setSelected(s.id)} />
          ))}
        </div>
        {/* Detail */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <StudentDetail student={selectedStudent} />
        </div>
      </div>

      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
