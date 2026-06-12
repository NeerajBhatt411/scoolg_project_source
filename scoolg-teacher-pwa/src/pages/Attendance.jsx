import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { PageHead, Card, Empty, Icon, Avatar } from '@/components/designkit';

const fieldCls = 'w-full h-11 pl-3.5 pr-9 rounded-[10px] bg-line-soft border border-line text-ink font-600 text-[14px] outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-400 appearance-none transition-all';
const inputCls = 'w-full h-11 px-3.5 rounded-[10px] bg-line-soft border border-line text-ink font-600 text-[14px] outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-400 transition-all';

const todayLabel = () => {
  const d = new Date();
  return `${d.toLocaleDateString('en-GB', { weekday: 'long' })}, ${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'long' })} ${d.getFullYear()}`;
};

const Attendance = () => {
  const location = useLocation();
  const prefill = location.state || null;

  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(prefill || null); // {className, sectionName, sectionId, classId}
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentId -> 'P' | 'A'
  const [initialMarks, setInitialMarks] = useState({});
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
        if (active) { setMarks(initial); setInitialMarks(initial); }
      } catch (e) {
        console.error('Attendance load failed', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selected, date]);

  // Class / Section selectors derived from real classes list
  const classOptions = [...new Set(classes.map(c => c.className))];
  const sectionsFor = selected ? classes.filter(c => c.className === selected.className) : [];
  const onClassChange = (v) => {
    const first = classes.find(c => c.className === v);
    if (first) setSelected(first);
  };
  const onSectionChange = (v) => {
    const match = classes.find(c => c.className === selected?.className && c.sectionName === v);
    if (match) setSelected(match);
  };

  const setMark = (id, status) => { setMarks(m => ({ ...m, [id]: status })); setSaved(false); };
  const setAllPresent = () => { const m = {}; students.forEach(s => { m[s._id] = 'P'; }); setMarks(m); setSaved(false); };
  const reset = () => { setMarks({ ...initialMarks }); setSaved(false); };

  const presentCount = Object.values(marks).filter(s => s === 'P').length;
  const absentCount = students.length - presentCount;
  const pct = students.length ? Math.round((presentCount / students.length) * 100) : 0;

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
    <div className="p-4 pb-32 lg:p-6 max-w-[780px] mx-auto space-y-5 fade-up">
      <PageHead eyebrow="Daily register" title="Take Attendance" sub={todayLabel()} />

      {/* Class / Section / Date selectors */}
      <Card className="shadow-card p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-600 text-ink-soft mb-1.5 block">Class</label>
            <div className="relative">
              <select value={selected?.className || ''} onChange={e => onClassChange(e.target.value)} className={fieldCls}>
                {classOptions.length === 0 && <option value="">No classes</option>}
                {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <Icon name="chevron-down" size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-600 text-ink-soft mb-1.5 block">Section</label>
            <div className="relative">
              <select value={selected?.sectionName || ''} onChange={e => onSectionChange(e.target.value)} className={fieldCls}>
                {sectionsFor.length === 0 && <option value="">No sections</option>}
                {sectionsFor.map(c => <option key={c.sectionId} value={c.sectionName}>Section {c.sectionName}</option>)}
              </select>
              <Icon name="chevron-down" size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-[12px] font-600 text-ink-soft mb-1.5 block">Date</label>
          <input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} className={inputCls} />
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-line-soft rounded-xl h-14" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card className="shadow-card">
          <Empty icon="users" title="No students in this class" sub="Pick another class or section to mark its register." />
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card className="shadow-card p-5">
            <div className="flex items-end justify-between mb-3.5">
              <div>
                <p className="text-[12px] font-600 text-ink-soft">Marked present</p>
                <p className="font-800 text-ink text-[26px] tnum leading-none mt-1">{presentCount}<span className="text-ink-faint text-[15px] font-700"> / {students.length}</span></p>
              </div>
              <span className="text-[13px] font-700 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full tnum">{pct}% present</span>
            </div>
            <div className="h-2.5 rounded-full bg-rose-100 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: pct + '%' }}></div>
            </div>
            <div className="flex items-center gap-5 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-600 text-ink-soft"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Present {presentCount}</span>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-600 text-ink-soft"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Absent {absentCount}</span>
            </div>
          </Card>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-0.5">
            <p className="text-[13px] font-600 text-ink-soft">{students.length} students</p>
            <div className="flex gap-2">
              <button onClick={setAllPresent} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-50 text-emerald-600 text-[12.5px] font-600 hover:bg-emerald-100 transition-colors"><Icon name="check" size={15} strokeWidth={2.25} />All present</button>
              <button onClick={reset} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-line-soft text-ink-soft text-[12.5px] font-600 hover:bg-line transition-colors"><Icon name="rotate-ccw" size={14} strokeWidth={2.25} />Reset</button>
            </div>
          </div>

          {/* Roster */}
          <div className="space-y-2">
            {students.map((s, i) => {
              const mark = marks[s._id] || 'P';
              const roll = s.rollNumber || i + 1;
              return (
                <div key={s._id} className="bg-white rounded-xl border border-line shadow-card p-2.5 pr-3 flex items-center gap-3">
                  <span className="w-6 text-center text-[12px] font-700 text-ink-faint tnum shrink-0">{roll}</span>
                  <Avatar src={s.profileImageUrl} name={`${s.firstName || ''} ${s.lastName || ''}`.trim()} size={36} className="rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-ink text-[14px] truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-[11.5px] text-ink-faint">Roll {roll}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => setMark(s._id, 'P')} className={`w-9 h-9 rounded-lg font-700 text-[13.5px] border transition-colors ${mark === 'P' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-ink-faint border-line hover:border-emerald-300'}`}>P</button>
                    <button onClick={() => setMark(s._id, 'A')} className={`w-9 h-9 rounded-lg font-700 text-[13.5px] border transition-colors ${mark === 'A' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-ink-faint border-line hover:border-rose-300'}`}>A</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save bar */}
          <div className="fixed left-0 right-0 bottom-[72px] px-4 z-30 lg:static lg:px-0">
            <div className="max-w-[780px] mx-auto">
              <button onClick={handleSave} disabled={saving} className={`w-full h-[50px] rounded-[12px] font-700 text-[14.5px] inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-70 ${saved ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-card-lg'}`}>
                <Icon name={saved ? 'check-circle' : 'save'} size={19} strokeWidth={2} />
                {saving ? 'Saving…' : saved ? 'Attendance saved' : `Save attendance · ${presentCount}/${students.length} present`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
