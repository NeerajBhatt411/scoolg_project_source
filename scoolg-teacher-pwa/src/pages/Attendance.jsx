import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Select from '../components/Select';

const Attendance = () => {
  const location = useLocation();
  const prefill = location.state || null;

  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(prefill || null); // {className, sectionName, sectionId, classId}
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentId -> 'P' | 'A'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load class list
  useEffect(() => {
    api.get('/teacher/my-classes')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setClasses(list);
        if (!selected && list.length > 0) setSelected(list[0]);
      })
      .catch(e => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load students + existing attendance when class/date changes
  useEffect(() => {
    if (!selected) return;
    let active = true;
    setLoading(true);
    setSaved(false);
    (async () => {
      try {
        const stuRes = await api.get(`/teacher/students?className=${encodeURIComponent(selected.className)}&sectionName=${encodeURIComponent(selected.sectionName)}`);
        const list = Array.isArray(stuRes.data) ? stuRes.data : [];
        if (!active) return;
        setStudents(list);

        const attRes = await api.get(`/teacher/attendance?sectionId=${selected.sectionId}&date=${date}`);
        const existing = {};
        (attRes.data?.records || []).forEach(r => { if (r.studentId) existing[r.studentId] = r.status; });
        const initial = {};
        list.forEach(s => { initial[s._id] = existing[s._id] || 'P'; });
        if (active) setMarks(initial);
      } catch (e) {
        console.error('Attendance load failed', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selected, date]);

  const setMark = (id, status) => setMarks(m => ({ ...m, [id]: status }));
  const presentCount = Object.values(marks).filter(s => s === 'P').length;
  const absentCount = students.length - presentCount;

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const records = students.map(s => ({ studentId: s._id, status: marks[s._id] || 'P' }));
      await api.post('/teacher/attendance', {
        classId: selected.classId,
        sectionId: selected.sectionId,
        date,
        records,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Save failed', e);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-40 lg:pb-10 space-y-5 max-w-3xl mx-auto">
      <div className="space-y-1">
        <p className="text-label-md font-label-md text-secondary uppercase tracking-widest">Daily Register</p>
        <h2 className="text-display-lg font-display-lg text-on-surface">Take Attendance</h2>
      </div>

      {/* Controls */}
      <div className="bg-white border border-surface-container rounded-3xl p-5 space-y-4 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.18)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-label-md font-bold text-on-surface-variant ml-1 mb-1 block">Class</label>
            <Select value={selected ? selected.sectionId : ''} onChange={(e) => setSelected(classes.find(c => c.sectionId === e.target.value))}>
              {classes.length === 0 && <option value="">No classes</option>}
              {classes.map(c => <option key={c.sectionId} value={c.sectionId}>Class {c.className}-{c.sectionName}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-label-md font-bold text-on-surface-variant ml-1 mb-1 block">Date</label>
            <input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-surface-container-low border border-surface-container font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" />
          </div>
        </div>
        {students.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="rounded-2xl bg-surface-container-low p-3 text-center">
              <p className="text-[22px] font-manrope font-extrabold text-on-surface leading-none">{students.length}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">Total</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-3 text-center">
              <p className="text-[22px] font-manrope font-extrabold text-green-600 leading-none">{presentCount}</p>
              <p className="text-[10px] font-bold text-green-700/70 uppercase tracking-wider mt-1">Present</p>
            </div>
            <div className="rounded-2xl bg-error/10 p-3 text-center">
              <p className="text-[22px] font-manrope font-extrabold text-error leading-none">{absentCount}</p>
              <p className="text-[10px] font-bold text-error/70 uppercase tracking-wider mt-1">Absent</p>
            </div>
          </div>
        )}
      </div>

      {/* Student list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-primary">
          <div className="animate-spin w-9 h-9 border-4 border-current border-t-transparent rounded-full"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white border border-dashed border-surface-container-high rounded-3xl p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30 mb-2">person_off</span>
          <p className="text-body-md font-bold">No students in this class.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => {
            const mark = marks[s._id] || 'P';
            return (
              <div key={s._id} className="bg-white border border-surface-container rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-label-md font-bold text-on-surface-variant shrink-0">
                  {s.rollNumber || i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-bold text-on-surface truncate">{s.firstName} {s.lastName}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setMark(s._id, 'P')} className={`w-10 h-10 rounded-xl font-black text-label-md transition-all ${mark === 'P' ? 'bg-green-500 text-white shadow-md shadow-green-500/30' : 'bg-surface-container-low text-on-surface-variant'}`}>P</button>
                  <button onClick={() => setMark(s._id, 'A')} className={`w-10 h-10 rounded-xl font-black text-label-md transition-all ${mark === 'A' ? 'bg-error text-white shadow-md shadow-error/30' : 'bg-surface-container-low text-on-surface-variant'}`}>A</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save bar */}
      {students.length > 0 && (
        <div className="fixed bottom-24 lg:bottom-6 left-0 lg:left-64 right-0 px-container-margin lg:px-8 z-40">
          <div className="max-w-3xl mx-auto">
            <button onClick={handleSave} disabled={saving}
              className={`w-full h-[52px] rounded-2xl font-title-lg text-title-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${saved ? 'bg-green-600 text-white' : 'bg-primary text-on-primary'} disabled:opacity-60`}>
              <span className="material-symbols-outlined">{saved ? 'check_circle' : 'save'}</span>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
