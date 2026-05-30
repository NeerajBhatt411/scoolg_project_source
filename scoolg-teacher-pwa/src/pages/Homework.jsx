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

  return (
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-32 lg:pb-10 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-label-md font-label-md text-secondary uppercase tracking-widest">Assignments</p>
          <h2 className="text-display-lg font-display-lg text-on-surface">Homework</h2>
        </div>
        <button onClick={openCreate} className="hidden lg:flex items-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-xl font-bold text-label-md shadow-md shadow-primary/20 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[18px]">add</span> Assign
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-primary">
          <div className="animate-spin w-9 h-9 border-4 border-current border-t-transparent rounded-full"></div>
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-dashed border-surface-container-high rounded-3xl p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30 mb-2">assignment</span>
          <p className="text-body-md font-bold">No homework assigned yet.</p>
          <button onClick={openCreate} className="mt-4 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md">Assign Homework</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((hw) => (
            <div key={hw._id} className="bg-white border border-surface-container rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {hw.subject && <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase">{hw.subject}</span>}
                <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant text-[10px] font-black uppercase">
                  {hw.className}-{hw.sectionName === 'All' ? 'All' : hw.sectionName}
                </span>
              </div>
              <h3 className="text-title-lg font-bold text-on-surface leading-tight">{hw.title}</h3>
              {hw.description && <p className="text-body-md text-on-surface-variant line-clamp-2 mt-1">{hw.description}</p>}
              {hw.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hw.attachments.map((a, i) => (
                    <a key={i} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-surface-container-low rounded-lg text-[11px] font-bold text-secondary max-w-[140px]">
                      <span className="material-symbols-outlined text-[14px] text-primary">attach_file</span>
                      <span className="truncate">{a.fileName || 'File'}</span>
                    </a>
                  ))}
                </div>
              )}
              <p className="text-label-md font-bold text-on-surface-variant mt-3">{fmtDate(hw.dueDate)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <button onClick={openCreate} className="lg:hidden fixed bottom-28 right-5 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/30 flex items-center justify-center z-40 active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-[26px]">add</span>
      </button>

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-6 pb-7 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">assignment_add</span> Assign Homework
              </h3>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-md font-bold text-on-surface-variant ml-1 mb-1 block">Class</label>
                  <Select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: 'All' })}>
                    <option value="">Select</option>
                    {distinctClasses.map(c => <option key={c.className} value={c.className}>Class {c.className}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-label-md font-bold text-on-surface-variant ml-1 mb-1 block">Section</label>
                  <Select value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })}>
                    <option value="All">All Sections</option>
                    {sectionsForClass.map(c => <option key={c.sectionId} value={c.sectionName}>{c.sectionName}</option>)}
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Subject</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Math"
                  className="w-full h-12 px-4 mt-1 rounded-2xl bg-surface-container-low border border-surface-container font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" />
              </div>

              <div>
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Algebra Worksheet Ch-4"
                  className="w-full h-12 px-4 mt-1 rounded-2xl bg-surface-container-low border border-surface-container font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" />
              </div>

              <div>
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Instructions..."
                  className="w-full h-24 p-4 mt-1 rounded-2xl bg-surface-container-low border border-surface-container font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none" />
              </div>

              <div>
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Due Date</label>
                <input type="date" value={form.dueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full h-12 px-4 mt-1 rounded-2xl bg-surface-container-low border border-surface-container font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" />
              </div>

              <div>
                <label className="text-label-md font-bold text-on-surface-variant ml-1">Attachments</label>
                <label className={`mt-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploading ? 'border-primary/40 bg-primary/5 text-primary' : 'border-surface-container-high bg-surface-container-low text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[18px]">{uploading ? 'progress_activity' : 'upload_file'}</span>
                  <span className="text-label-md font-bold">{uploading ? 'Uploading...' : 'Add files (PDF, images)'}</span>
                  <input type="file" multiple accept="image/*,application/pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
                </label>
                {form.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-low rounded-lg text-[11px] font-bold text-secondary max-w-[160px]">
                        <span className="material-symbols-outlined text-[14px] text-primary">description</span>
                        <span className="truncate">{a.fileName}</span>
                        <button onClick={() => setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }))} className="text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-label-md font-bold text-error bg-error/10 rounded-lg px-3 py-2">{error}</p>}
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-surface-container shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 h-12 bg-surface-container-low text-on-surface-variant font-bold text-label-md rounded-2xl">Cancel</button>
              <button onClick={handleSave} disabled={saving || uploading} className="flex-1 h-12 bg-primary text-on-primary font-bold text-label-md rounded-2xl disabled:opacity-50 shadow-md shadow-primary/25">
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
