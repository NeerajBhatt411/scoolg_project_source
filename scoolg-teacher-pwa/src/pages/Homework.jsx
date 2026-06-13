import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TopHeader from '@/components/TopHeader';
import { Plus, X, Paperclip, Upload, Loader2, NotebookPen, Clock, BookOpen, ChevronDown } from 'lucide-react';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const fmtDate = (d) => {
  if (!d) return 'No due date';
  try { return 'Due ' + new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); } catch { return ''; }
};

const dueStyle = (d) => {
  if (!d) return { label: 'No due date', style: 'bg-slate-100 text-slate-600 border-slate-200/60' };
  const due = new Date(d); due.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (due.getTime() < today.getTime()) return { label: fmtDate(d), style: 'bg-red-100 text-red-700 border-red-200/60' };
  if (due.getTime() === today.getTime()) return { label: 'Due today', style: 'bg-orange-100 text-orange-700 border-orange-200/60' };
  return { label: fmtDate(d), style: 'bg-emerald-100 text-emerald-700 border-emerald-200/60' };
};

const Homework = () => {
  const location = useLocation();
  const prefill = location.state || null;
  const { school } = useAuth();

  const [classes, setClasses] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const emptyForm = { className: prefill?.className || '', sectionName: prefill?.sectionName || 'All', subject: '', title: '', description: '', dueDate: '', attachments: [] };
  const [form, setForm] = useState(emptyForm);

  const loadHomework = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teacher/homework');
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/teacher/my-classes').then(res => setClasses(Array.isArray(res.data) ? res.data : [])).catch(console.error);
    loadHomework();
  }, []);

  const distinctClasses = [...new Map(classes.map(c => [c.className, c])).values()];

  const openCreate = () => {
    setForm({ ...emptyForm, className: prefill?.className || distinctClasses[0]?.className || '' });
    setError('');
    setShowModal(true);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const out = [];
      for (const file of files) {
        const base64 = await fileToBase64(file);
        const res = await api.post('/upload', { file: base64, folder: 'Homework', schoolName: school?.name || 'General' });
        if (res.data?.url) out.push({ url: res.data.url, fileName: file.name, type: res.data.type || 'file' });
      }
      setForm(f => ({ ...f, attachments: [...f.attachments, ...out] }));
    } catch (err) {
      console.error(err); alert('Upload failed (file too large/invalid).');
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleSave = async () => {
    if (!form.className) return setError('Select a class');
    if (!form.title.trim()) return setError('Title is required');
    if (!form.dueDate) return setError('Due date is required');
    setSaving(true); setError('');
    try {
      await api.post('/teacher/homework', form);
      setShowModal(false);
      loadHomework();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign');
    } finally { setSaving(false); }
  };

  const sectionsForClass = classes.filter(c => c.className === form.className);
  const classSubjects = distinctClasses.find(c => c.className === form.className)?.subjects || [];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      <TopHeader title="Homework" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Assign and track homework for your classes.</p>
            </div>
            <button 
                onClick={openCreate} 
                className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_8px_20px_rgba(37,99,235,0.2)] transition-all"
            >
                <Plus className="h-5 w-5" /> Assign Homework
            </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[200px] w-full rounded-[24px] bg-white border border-slate-100 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
            <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <NotebookPen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No homework assigned yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first assignment to get started.</p>
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md">
                <Plus className="h-5 w-5" /> Assign Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {list.map((hw) => {
              const due = dueStyle(hw.dueDate);
              return (
                <div key={hw._id} className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-stone-200 border-b-[6px] border-b-stone-300 flex flex-col hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)] hover:border-b-stone-400 transition-all cursor-default">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {hw.subject && (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-100/50 text-blue-700 border border-blue-200/50">
                            {hw.subject}
                        </span>
                    )}
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-600 border border-stone-200/60">
                      Class {hw.className}-{hw.sectionName === 'All' ? 'All' : hw.sectionName}
                    </span>
                  </div>
                  
                  <h3 className="text-[17px] font-black text-slate-900 leading-tight mb-2 drop-shadow-sm">{hw.title}</h3>
                  {hw.description && <p className="text-[13px] font-medium text-slate-500 line-clamp-2 mb-4 leading-relaxed">{hw.description}</p>}
                  
                  {hw.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                      {hw.attachments.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors text-xs font-bold text-slate-600 max-w-full">
                          <Paperclip className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{a.fileName || 'Attachment'}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-stone-200/60 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${due.style}`}>
                        {due.label}
                    </span>
                    {hw.createdAt && (
                      <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Given {new Date(hw.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile FAB */}
        <button
          onClick={openCreate}
          className="sm:hidden fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform active:scale-95"
        >
          <Plus className="h-7 w-7" />
        </button>

        {/* Assign Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Assign Homework</h3>
                  <p className="text-[13px] font-medium text-slate-500">Create a new assignment.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Class</label>
                    <div className="relative">
                        <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: 'All', subject: '' })} className="w-full appearance-none h-10 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all">
                            <option value="">Select</option>
                            {distinctClasses.map(c => <option key={c.className} value={c.className}>Class {c.className}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Section</label>
                    <div className="relative">
                        <select value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })} className="w-full appearance-none h-10 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all">
                            <option value="All">All Sections</option>
                            {sectionsForClass.map(c => <option key={c.sectionId} value={c.sectionName}>{c.sectionName}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Subject</label>
                    <div className="relative">
                        <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={!form.className} className="w-full appearance-none h-10 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all disabled:opacity-50">
                          <option value="">{form.className ? 'Select' : 'Select Class'}</option>
                          {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Due Date *</label>
                    <input type="date" required value={form.dueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Title *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Algebra Worksheet Ch-4" className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Instructions..." className="w-full min-h-[80px] p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none" />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Attachments</label>
                  <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${uploading ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-300'}`}>
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin mb-2" /> : <Upload className="h-6 w-6 mb-2" />}
                    <span className="text-[13px] font-bold">{uploading ? 'Uploading...' : 'Tap to add files (PDF, images)'}</span>
                    <input type="file" multiple accept="image/*,application/pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
                  </label>
                  {form.attachments.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3">
                      {form.attachments.map((a, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Paperclip className="h-4 w-4" />
                            </div>
                            <span className="text-[13px] font-bold text-slate-700 truncate">{a.fileName}</span>
                          </div>
                          <button onClick={() => setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }))} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && <p className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold border border-red-100">{error}</p>}
              </div>

              <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-[32px] flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 h-12 rounded-xl font-bold text-[14px] bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving || uploading} className="flex-1 h-12 rounded-xl font-bold text-[14px] bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {saving ? 'Assigning...' : 'Assign Homework'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homework;
