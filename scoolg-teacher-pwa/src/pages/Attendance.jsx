import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import TopHeader from '@/components/TopHeader';
import { CheckCircle2, Send, Users, ChevronDown } from 'lucide-react';

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
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      <TopHeader title="Attendance" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">

        {/* Compact Controls */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_8px_20px_rgba(120,113,108,0.04)] border border-stone-200">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <select 
                value={selected ? selected.sectionId : ''} 
                onChange={(e) => setSelected(classes.find(c => c.sectionId === e.target.value))}
                className="w-full appearance-none h-10 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
              >
                {classes.length === 0 && <option value="">No classes</option>}
                {classes.map(c => <option key={c.sectionId} value={c.sectionId}>Class {c.className}-{c.sectionName}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative flex-1">
               <input 
                 type="date" 
                 value={date} 
                 max={new Date().toISOString().split('T')[0]} 
                 onChange={(e) => setDate(e.target.value)} 
                 className="w-full appearance-none h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
               />
            </div>
          </div>
          
          {students.length > 0 && (
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-xs font-bold text-slate-600">Total: {students.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-emerald-600">P: {presentCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-xs font-bold text-rose-600">A: {absentCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[68px] w-full rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
              <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No students in this class</h3>
              <p className="text-slate-500 text-sm">Please select a different class or check back later.</p>
            </div>
        ) : (
          <div className="bg-white rounded-[32px] overflow-hidden border border-stone-200/60 shadow-sm">
            <div className="divide-y divide-slate-100">
              {students.map((s, i) => {
                const mark = marks[s._id] || 'P';
                return (
                  <div key={s._id} className={`flex items-center gap-3 px-3 sm:px-6 py-3.5 transition-colors ${mark === 'A' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                    <div className="w-9 sm:w-10 h-9 sm:h-10 shrink-0 rounded-[14px] bg-[#faf9f6] text-stone-600 font-black flex items-center justify-center text-xs sm:text-sm border border-stone-200/60 shadow-inner">
                      {s.rollNumber || i + 1}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-[14px] sm:text-[15px] font-bold truncate ${mark === 'A' ? 'text-red-900' : 'text-slate-900'}`}>{s.firstName} {s.lastName}</p>
                    </div>
                    <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-inner gap-1 shrink-0">
                      <button 
                        onClick={() => setMark(s._id, 'P')} 
                        className={`h-8 w-12 sm:w-14 rounded-[10px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all ${mark === 'P' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        Pres
                      </button>
                      <button 
                        onClick={() => setMark(s._id, 'A')} 
                        className={`h-8 w-12 sm:w-14 rounded-[10px] text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all ${mark === 'A' ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                      >
                        Abs
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save bar */}
        {students.length > 0 && (
          <div className="fixed bottom-20 lg:bottom-6 left-0 lg:left-[280px] right-0 px-4 lg:px-8 z-40">
            <div className="max-w-7xl mx-auto">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className={`w-full h-[52px] rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all ${saved ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {saved ? <CheckCircle2 className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                {saving ? 'SAVING...' : saved ? 'SAVED SUCCESSFULLY' : 'SUBMIT ATTENDANCE'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
