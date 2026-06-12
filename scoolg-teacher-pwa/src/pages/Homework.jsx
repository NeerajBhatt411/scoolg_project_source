import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Select from '../components/Select';

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
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-32 lg:pb-10 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Assignments</p>
          <h2 className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tight">Homework</h2>
        </div>
        <button onClick={openCreate} className="hidden lg:flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-black text-sm shadow shadow-blue-600/25 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[18px]">add</span> Assign
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-[20px] h-40"></div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-3xl text-slate-400">assignment</span>
          </div>
          <p className="text-sm font-bold text-slate-700">No homework assigned yet.</p>
          <button onClick={openCreate} className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow shadow-blue-600/25">Assign Homework</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((hw) => (
            <div key={hw._id} className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.08)] transition-all duration-500">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {hw.subject && <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">{hw.subject}</span>}
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                  {hw.className}-{hw.sectionName === 'All' ? 'All' : hw.sectionName}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{hw.title}</h3>
              {hw.description && <p className="text-sm font-medium text-slate-500 line-clamp-2 mt-1">{hw.description}</p>}
              {hw.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hw.attachments.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-500 max-w-[140px]">
                      <span className="material-symbols-outlined text-[14px] text-blue-600">attach_file</span>
                      <span className="truncate">{a.fileName || 'File'}</span>
                    </a>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100">{fmtDate(hw.dueDate)}</span>
                {hw.createdAt && <p className="text-[11px] font-bold text-slate-400">Given {new Date(hw.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <button onClick={openCreate} className="lg:hidden fixed bottom-28 right-5 w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-[26px]">add</span>
      </button>

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-[28px] rounded-t-[28px] p-6 pb-7 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span> Assign Homework
              </h3>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Class</label>
                  <Select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: 'All', subject: '' })}>
                    <option value="">Select</option>
                    {distinctClasses.map(c => <option key={c.className} value={c.className}>Class {c.className}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Section</label>
                  <Select value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })}>
                    <option value="All">All Sections</option>
                    {sectionsForClass.map(c => <option key={c.sectionId} value={c.sectionName}>{c.sectionName}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Subject</label>
                <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={!form.className}>
                  <option value="">{form.className ? 'Select subject' : 'Select a class first'}</option>
                  {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                {form.className && classSubjects.length === 0 && (
                  <p className="text-[11px] font-bold text-slate-400 mt-1 ml-1">No subjects set for this class. Ask admin to add them.</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Algebra Worksheet Ch-4"
                  className="w-full h-12 px-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Instructions..."
                  className="w-full h-24 p-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none" />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date *</label>
                <input type="date" required value={form.dueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full h-12 px-4 mt-1 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachments</label>
                <label className={`mt-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploading ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-[18px]">{uploading ? 'progress_activity' : 'upload_file'}</span>
                  <span className="text-xs font-bold">{uploading ? 'Uploading...' : 'Add files (PDF, images)'}</span>
                  <input type="file" multiple accept="image/*,application/pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
                </label>
                {form.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-500 max-w-[160px]">
                        <span className="material-symbols-outlined text-[14px] text-blue-600">description</span>
                        <span className="truncate">{a.fileName}</span>
                        <button onClick={() => setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }))} className="text-slate-400 hover:text-rose-500 transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-xs font-bold text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 h-12 bg-slate-50 border border-slate-100 text-slate-500 font-black text-sm rounded-xl">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading} className="flex-1 h-12 bg-blue-600 text-white font-black text-sm rounded-xl disabled:opacity-50 shadow shadow-blue-600/25">
                {saving ? 'Assigning...' : 'Assign Homework'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;
