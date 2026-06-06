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
  const [form, setForm] = useState({ classKey: '', subject: '', date: todayISO(), note: '' });

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

  const selectedClass = classes.find(c => `${c.className}|${c.sectionName}` === form.classKey);
  const subjects = selectedClass?.subjects || [];

  const save = async () => {
    if (!form.classKey) { setError('Please select a class.'); return; }
    if (!form.note.trim()) { setError('Write what you taught.'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.post('/teacher/diary', {
        date: form.date,
        className: selectedClass.className,
        sectionName: selectedClass.sectionName,
        subject: form.subject,
        note: form.note.trim(),
      });
      setEntries(prev => [res.data, ...prev]);
      setForm({ classKey: '', subject: '', date: todayISO(), note: '' });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const field = 'h-12 px-4 rounded-2xl bg-surface-container-low border border-surface-container font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all';

  return (
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-32 lg:pb-10 space-y-5 max-w-2xl mx-auto">
      <div className="space-y-1">
        <p className="text-label-md font-label-md text-secondary uppercase tracking-widest">Daily record</p>
        <h2 className="text-display-lg font-display-lg text-on-surface">My Diary</h2>
        <p className="text-body-md text-on-surface-variant">Log what you taught — one line per class.</p>
      </div>

      {/* Add form */}
      <div className="bg-white border border-surface-container rounded-3xl p-5 space-y-3 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.18)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={form.classKey} onChange={(e) => setForm({ ...form, classKey: e.target.value, subject: '' })} className={field}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c.sectionId} value={`${c.className}|${c.sectionName}`}>Class {c.className}-{c.sectionName}</option>)}
          </select>
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={field}>
            <option value="">Subject</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} className={field} />
        </div>
        <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What did you teach? (one line)" className={`w-full ${field}`} />
        {error && <p className="text-label-md font-bold text-error bg-error/10 rounded-xl px-3 py-2">{error}</p>}
        <button onClick={save} disabled={saving} className="w-full h-12 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60">
          <span className="material-symbols-outlined">add</span> {saving ? 'Saving...' : 'Add to diary'}
        </button>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex justify-center py-12 text-primary"><div className="animate-spin w-8 h-8 border-4 border-current border-t-transparent rounded-full"></div></div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-dashed border-surface-container-high rounded-3xl p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30 mb-2">menu_book</span>
          <p className="text-body-md font-bold">No diary entries yet.</p>
          <p className="text-label-md mt-1">Add what you taught today above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e._id} className="bg-white border border-surface-container rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-12 text-center shrink-0">
                <p className="text-label-md font-extrabold text-primary leading-none">{fmt(e.date)}</p>
              </div>
              <div className="w-px self-stretch bg-surface-container-high"></div>
              <div className="flex-1 min-w-0">
                <p className="text-body-md font-bold text-on-surface">{e.note}</p>
                <p className="text-label-md text-on-surface-variant mt-0.5">Class {e.className}-{e.sectionName}{e.subject ? ` · ${e.subject}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Diary;
