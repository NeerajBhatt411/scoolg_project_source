import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const todayISO = () => new Date().toISOString().split('T')[0];
const fmt = (d) => { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); } catch { return d; } };

const Diary = () => {
  const [classes, setClasses] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ className: '', sectionName: '', subject: '', date: todayISO(), note: '' });

  const load = async () => {
    try {
      const [cls, di] = await Promise.all([
        api.get('/teacher/my-classes'),
        api.get('/teacher/diary'),
      ]);
      setClasses(Array.isArray(cls.data) ? cls.data : []);
      setEntries(Array.isArray(di.data) ? di.data : []);
    } catch (e) { console.error('Diary load failed', e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Cascading options: class -> section -> subject
  const classOptions = [...new Set(classes.map(c => c.className).filter(Boolean))];
  const sectionOptions = [...new Set(classes.filter(c => c.className === form.className).map(c => c.sectionName).filter(Boolean))];
  const classObj = classes.find(c => c.className === form.className);
  const subjects = classObj?.subjects || [];

  const save = async () => {
    if (!form.className) { setError('Please select a class.'); return; }
    if (!form.note.trim()) { setError('Write what you taught.'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.post('/teacher/diary', {
        date: form.date,
        className: form.className,
        sectionName: form.sectionName || 'All',
        subject: form.subject,
        note: form.note.trim(),
      });
      setEntries(prev => [res.data, ...prev]);
      setForm({ className: '', sectionName: '', subject: '', date: todayISO(), note: '' });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const lockEntry = async (id) => {
    if (!window.confirm('Lock this entry? After locking you cannot edit or delete it.')) return;
    try {
      const res = await api.post(`/teacher/diary/${id}/lock`);
      setEntries(prev => prev.map(e => e._id === id ? res.data : e));
    } catch (e) { alert('Failed to lock.'); }
  };
  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/teacher/diary/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete.'); }
  };

  const field = 'h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all';

  return (
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-32 lg:pb-10 space-y-5 max-w-2xl mx-auto">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Daily record</p>
        <h2 className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tight">My Diary</h2>
        <p className="text-sm font-bold text-slate-400">Log what you taught — one line per class.</p>
      </div>

      {/* Add form */}
      <div className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: '', subject: '' })} className={field}>
            <option value="">Class</option>
            {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })} disabled={!form.className} className={`${field} disabled:opacity-50`}>
            <option value="">Section</option>
            {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={!form.className} className={`${field} disabled:opacity-50`}>
            <option value="">Subject</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} className={field} />
        </div>
        <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What did you teach? (one line)" className={`w-full ${field}`} />
        {error && <p className="text-xs font-bold text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
        <button onClick={save} disabled={saving} className="w-full h-12 bg-blue-600 text-white rounded-xl font-black shadow shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60">
          <span className="material-symbols-outlined">add</span> {saving ? 'Saving...' : 'Add to diary'}
        </button>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-[20px] h-20"></div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-3xl text-slate-400">menu_book</span>
          </div>
          <p className="text-sm font-bold text-slate-700">No diary entries yet.</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Add what you taught today above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e._id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
              <div className="w-14 rounded-[14px] bg-blue-50 text-blue-700 text-center py-2 font-black text-[11px] shrink-0">
                {fmt(e.date)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{e.note}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">Class {e.className}-{e.sectionName}{e.subject ? ` · ${e.subject}` : ''}</p>
              </div>
              <div className="shrink-0">
                {e.locked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full"><span className="material-symbols-outlined text-[13px]">lock</span>Locked</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => lockEntry(e._id)} title="Lock" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-300 hover:text-blue-600 grid place-items-center active:scale-90 transition-all"><span className="material-symbols-outlined text-[17px]">lock_open</span></button>
                    <button onClick={() => deleteEntry(e._id)} title="Delete" className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-300 hover:text-rose-500 grid place-items-center active:scale-90 transition-all"><span className="material-symbols-outlined text-[17px]">delete</span></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Diary;
