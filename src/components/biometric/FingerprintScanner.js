import React, { useState, useRef } from 'react';
import { useMessContext } from '../../context/MessContext';
import { Avatar } from '../../utils/helpers';

const STATES = { idle: 'idle', scanning: 'scanning', success: 'success', fail: 'fail' };

export default function FingerprintScanner() {
  const { students, addAttendanceEntry } = useMessContext();
  const [state, setState] = useState(STATES.idle);
  const [progress, setProgress] = useState(0);
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [meal, setMeal] = useState('Lunch');
  const intervalRef = useRef(null);

  const registered = students.filter(s => s.bioRegistered && s.status !== 'inactive');

  const startScan = () => {
    if (state === STATES.scanning) return;
    setState(STATES.scanning);
    setProgress(0);
    setMatchedStudent(null);

    let pct = 0;
    intervalRef.current = setInterval(() => {
      pct += 3;
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current);
        const s = registered[Math.floor(Math.random() * registered.length)];
        if (s) {
          setMatchedStudent(s);
          setState(STATES.success);
          addAttendanceEntry({
            studentId: s.id, studentName: s.name,
            initials: s.initials, avatar: s.avatar,
            meal, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            date: '2026-05-26', method: 'biometric',
          });
        } else {
          setState(STATES.fail);
        }
        setTimeout(reset, 4000);
      }
    }, 40);
  };

  const reset = () => {
    setState(STATES.idle);
    setProgress(0);
    setMatchedStudent(null);
  };

  const iconColor = state === STATES.idle ? '#9E9C97' : state === STATES.scanning ? '#185FA5' : state === STATES.success ? '#0F6E56' : '#A32D2D';
  const bgColor = state === STATES.idle ? '#F3F2EF' : state === STATES.scanning ? '#E6F1FB' : state === STATES.success ? '#E1F5EE' : '#FCEBEB';

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span style={{ fontSize: 16 }}>❋</span>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1917' }}>Live fingerprint scanner</h3>
      </div>

      {/* Meal selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['Lunch', 'Dinner'].map(m => (
          <button key={m} onClick={() => setMeal(m)} style={{
            flex: 1, padding: '8px', fontSize: 13, fontWeight: 500,
            borderRadius: 8, border: '1px solid',
            borderColor: meal === m ? '#1D9E75' : 'rgba(0,0,0,0.1)',
            background: meal === m ? '#E1F5EE' : 'transparent',
            color: meal === m ? '#0F6E56' : '#6B6860', cursor: 'pointer',
          }}>{m}</button>
        ))}
      </div>

      {/* Scanner */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '32px 24px', background: '#F3F2EF',
        borderRadius: 14, border: '1px dashed rgba(0,0,0,0.12)',
      }}>
        <div onClick={startScan} style={{
          width: 100, height: 100, borderRadius: '50%',
          background: bgColor,
          border: `2px solid ${state === STATES.idle ? 'rgba(0,0,0,0.08)' : iconColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 42, cursor: 'pointer', transition: 'all 0.2s',
          marginBottom: 16,
        }}>❋</div>

        <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1917', marginBottom: 4 }}>
          {state === STATES.idle ? 'Tap to scan' :
           state === STATES.scanning ? 'Scanning…' :
           state === STATES.success ? 'Match found!' : 'No match found'}
        </div>
        <div style={{ fontSize: 12, color: '#9E9C97', marginBottom: 16 }}>
          {state === STATES.idle ? 'Place finger on the sensor' :
           state === STATES.scanning ? 'Hold still, please' :
           state === STATES.success ? 'Meal recorded successfully' : 'Try again or use manual entry'}
        </div>

        {/* Progress */}
        {state === STATES.scanning && (
          <div style={{ width: '100%', maxWidth: 260, height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: progress + '%', height: '100%', background: '#185FA5', borderRadius: 99, transition: 'width 0.04s' }} />
          </div>
        )}

        {/* Result */}
        {state === STATES.success && matchedStudent && (
          <div style={{
            width: '100%', marginTop: 16,
            background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Avatar initials={matchedStudent.initials} color={matchedStudent.avatar} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1917' }}>{matchedStudent.name}</div>
              <div style={{ fontSize: 11, color: '#9E9C97', marginTop: 1 }}>{matchedStudent.id} · {meal}</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#0F6E56',
            }}>✓</div>
          </div>
        )}
      </div>
    </div>
  );
}
