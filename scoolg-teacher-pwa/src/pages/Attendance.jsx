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
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Daily Register</p>
        <h2 className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tight">Take Attendance</h2>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] uppercase font-bold tracking-widest text-slate-400 ml-1 mb-1.5 block">Class</label>
            <Select value={selected ? selected.sectionId : ''} onChange={(e) => setSelected(classes.find(c => c.sectionId === e.target.value))}>
              {classes.length === 0 && <option value="">No classes</option>}
              {classes.map(c => <option key={c.sectionId} value={c.sectionId}>Class {c.className}-{c.sectionName}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase font-bold tracking-widest text-slate-400 ml-1 mb-1.5 block">Date</label>
            <input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" />
          </div>
        </div>
        {students.length > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="rounded-[20px] bg-slate-50 border border-slate-100 p-3 text-center">
              <p className="text-[22px] font-black text-slate-900 tracking-tighter leading-none">{students.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</p>
            </div>
            <div className="rounded-[20px] bg-emerald-50 border border-emerald-100 p-3 text-center">
              <p className="text-[22px] font-black text-emerald-600 tracking-tighter leading-none">{presentCount}</p>
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Present</p>
            </div>
            <div className="rounded-[20px] bg-red-50 border border-red-100 p-3 text-center">
              <p className="text-[22px] font-black text-red-600 tracking-tighter leading-none">{absentCount}</p>
              <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mt-1">Absent</p>
            </div>
          </div>
        )}
      </div>

      {/* Student list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-[20px] h-16"></div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-3xl text-slate-300">person_off</span>
          </div>
          <p className="text-sm font-bold text-slate-700">No students in this class.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => {
            const mark = marks[s._id] || 'P';
            return (
              <div key={s._id} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="min-w-[2rem] h-8 px-2 rounded-full bg-blue-600 text-white text-[13px] font-black inline-flex items-center justify-center shrink-0">
                  {s.rollNumber || i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm tracking-tight truncate">{s.firstName} {s.lastName}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setMark(s._id, 'P')} className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${mark === 'P' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>P</button>
                  <button onClick={() => setMark(s._id, 'A')} className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${mark === 'A' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>A</button>
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
              className={`w-full h-[54px] rounded-2xl font-black shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${saved ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-blue-600 text-white shadow-blue-600/30'} disabled:opacity-60`}>
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
