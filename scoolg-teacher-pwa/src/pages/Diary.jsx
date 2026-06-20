import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getCached, peekCache, setCache } from '../utils/cache';
import TopHeader from '@/components/TopHeader';
import { Plus, Lock, Trash2, BookOpen, ChevronDown } from 'lucide-react';

const todayISO = () => new Date().toISOString().split('T')[0];
const fmt = (d) => { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); } catch { return d; } };

const Diary = () => {
  const [classes, setClasses] = useState(() => peekCache('teacher:my-classes') || []);
  const [entries, setEntries] = useState(() => peekCache('teacher:diary') || []);
  const [loading, setLoading] = useState(() => !peekCache('teacher:diary'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ className: '', sectionName: '', subject: '', date: todayISO(), note: '' });

  const load = async () => {
    try {
      const [cls, di] = await Promise.all([
        getCached('teacher:my-classes', () => api.get('/teacher/my-classes').then(r => Array.isArray(r.data) ? r.data : [])),
        getCached('teacher:diary', () => api.get('/teacher/diary').then(r => Array.isArray(r.data) ? r.data : [])),
      ]);
      setClasses(cls);
      setEntries(di);
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
      setEntries(prev => { const next = [res.data, ...prev]; setCache('teacher:diary', next); return next; });
      setForm({ className: '', sectionName: '', subject: '', date: todayISO(), note: '' });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const lockEntry = async (id) => {
    if (!window.confirm('Lock this entry? After locking you cannot edit or delete it.')) return;
    try {
      const res = await api.post(`/teacher/diary/${id}/lock`);
      setEntries(prev => { const next = prev.map(e => e._id === id ? res.data : e); setCache('teacher:diary', next); return next; });
    } catch (e) { alert('Failed to lock.'); }
  };
  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/teacher/diary/${id}`);
      setEntries(prev => { const next = prev.filter(e => e._id !== id); setCache('teacher:diary', next); return next; });
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete.'); }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      <TopHeader title="My Diary" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        <div className="mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Teacher's Diary</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Log what you taught — one line per class.</p>
        </div>

        {/* Add form */}
        <div className="bg-white rounded-[32px] p-5 sm:p-6 shadow-[0_8px_20px_rgba(120,113,108,0.04)] border border-stone-200/60">
          <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-widest mb-4">Add Entry</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="relative">
                <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: '', subject: '' })} className="w-full appearance-none h-11 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all">
                  <option value="">Class</option>
                  {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })} disabled={!form.className} className="w-full appearance-none h-11 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all disabled:opacity-50">
                  <option value="">Section</option>
                  {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={!form.className} className="w-full appearance-none h-11 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all disabled:opacity-50">
                  <option value="">Subject</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <input type="date" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
            </div>
            
            <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What did you teach? (one line)" className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-[14px] font-bold placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
            
            {error && <p className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold border border-red-100">{error}</p>}
            
            <button onClick={save} disabled={saving} className="w-full h-12 rounded-xl font-black text-[14px] bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" /> {saving ? 'SAVING...' : 'ADD TO DIARY'}
            </button>
          </div>
        </div>

        {/* Entries */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-[24px] bg-white border border-slate-100 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
            <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No diary entries yet</h3>
            <p className="text-slate-500 text-sm">Add what you taught today above.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] overflow-hidden border border-stone-200/60 shadow-[0_8px_20px_rgba(120,113,108,0.04)]">
            <div className="divide-y divide-slate-100">
              {entries.map(e => (
                <div key={e._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:px-6 sm:py-5 hover:bg-slate-50 transition-colors">
                  
                  <div className="flex items-center justify-between sm:w-auto">
                    <span className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest bg-[#faf9f6] text-stone-600 border border-stone-200/60 sm:w-[85px] text-center">
                        {fmt(e.date)}
                    </span>
                    
                    {/* Mobile Actions (top right) */}
                    <div className="flex sm:hidden items-center gap-1">
                      {e.locked ? (
                        <span title="Locked" className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      ) : (
                        <>
                          <button onClick={() => lockEntry(e._id)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                            <Lock className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteEntry(e._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] sm:text-[16px] font-bold text-slate-900 leading-tight mb-1.5">{e.note}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
                            Class {e.className}-{e.sectionName}
                        </span>
                        {e.subject && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200/60">
                                {e.subject}
                            </span>
                        )}
                    </div>
                  </div>
                  
                  {/* Desktop Actions */}
                  <div className="hidden sm:flex shrink-0 items-center gap-2 ml-4">
                    {e.locked ? (
                      <span title="Locked" className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" /> Locked
                      </span>
                    ) : (
                      <>
                        <button title="Lock" onClick={() => lockEntry(e._id)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center transition-colors">
                          <Lock className="h-5 w-5" />
                        </button>
                        <button title="Delete" onClick={() => deleteEntry(e._id)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
