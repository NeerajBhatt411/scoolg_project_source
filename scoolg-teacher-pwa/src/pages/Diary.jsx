import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { PageHead, Card, Empty, Icon, Button } from '@/components/designkit';

const todayISO = () => new Date().toISOString().split('T')[0];
const fmt = (d) => { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); } catch { return d; } };

const fieldCls = 'w-full h-11 pl-3.5 pr-9 rounded-[10px] bg-line-soft border border-line text-ink font-600 text-[14px] outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-400 appearance-none transition-all disabled:opacity-50';
const inputCls = 'w-full h-11 px-3.5 rounded-[10px] bg-line-soft border border-line text-ink font-600 text-[14px] outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-400 transition-all placeholder:text-ink-faint placeholder:font-500';

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

  return (
    <div className="p-4 pb-8 lg:p-6 max-w-[780px] mx-auto space-y-5 fade-up">
      <PageHead eyebrow="Teaching record" title="My Diary" sub="What you taught, day by day." />

      {/* Add entry */}
      <Card className="shadow-card p-4 space-y-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[12px] font-600 text-ink-soft mb-1.5 block">Class</label>
            <div className="relative">
              <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: '', subject: '' })} className={fieldCls}>
                <option value="">Class</option>
                {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
              <Icon name="chevron-down" size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-600 text-ink-soft mb-1.5 block">Section</label>
            <div className="relative">
              <select value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })} disabled={!form.className} className={fieldCls}>
                <option value="">Section</option>
                {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Icon name="chevron-down" size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-600 text-ink-soft mb-1.5 block">Subject</label>
            <div className="relative">
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={!form.className} className={fieldCls}>
                <option value="">Subject</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Icon name="chevron-down" size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-600 text-ink-soft mb-1.5 block">Date</label>
            <input type="date" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} />
          </div>
        </div>
        <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What did you teach? (one line)" className={inputCls} />
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-600 text-rose-600">{error}</p>}
        <Button onClick={save} disabled={saving} icon="plus" className="w-full">
          {saving ? 'Saving…' : 'Add entry'}
        </Button>
      </Card>

      {/* Entries */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-line-soft rounded-xl h-14" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="shadow-card">
          <Empty icon="book-open" title="No entries yet" sub="Add what you taught today using the form above." />
        </Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          {entries.map(e => (
            <div key={e._id} className="border-t border-line first:border-0 px-5 py-3.5 flex items-center gap-3">
              <span className="w-[58px] shrink-0 text-[12px] font-700 text-blue-700 tnum">{fmt(e.date)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-600 text-ink text-[14px]">{e.note}</p>
                <p className="text-[12.5px] text-ink-soft tnum mt-0.5">Class {e.className}-{e.sectionName}{e.subject ? ` · ${e.subject}` : ''}</p>
              </div>
              {e.locked ? (
                <span title="Locked" className="shrink-0 text-amber-500"><Icon name="lock" size={14} strokeWidth={2.25} /></span>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <button title="Lock" onClick={() => lockEntry(e._id)} className="w-8 h-8 rounded-lg grid place-items-center text-ink-faint hover:bg-line-soft hover:text-ink transition-colors">
                    <Icon name="lock" size={16} />
                  </button>
                  <button title="Delete" onClick={() => deleteEntry(e._id)} className="w-8 h-8 rounded-lg grid place-items-center text-ink-faint hover:bg-rose-50 hover:text-rose-600 transition-colors">
                    <Icon name="trash-2" size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default Diary;
