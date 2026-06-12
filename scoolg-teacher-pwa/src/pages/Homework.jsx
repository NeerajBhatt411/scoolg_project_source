import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PageHead, Card, Chip, SubjectTag, Button, Icon, Empty } from '@/components/designkit';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const shortDate = (d) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
};

const dueChip = (d) => {
  if (!d) return { text: 'No due date', tone: 'soft' };
  const due = new Date(d); due.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  const base = shortDate(due);
  if (diff < 0) return { text: `Overdue · ${base}`, tone: 'red' };
  if (diff === 0) return { text: 'Due today', tone: 'blue' };
  if (diff === 1) return { text: 'Due tomorrow', tone: 'blue' };
  return { text: `Due ${base}`, tone: 'soft' };
};

const fieldCls = 'w-full h-11 px-3.5 rounded-[10px] bg-white border border-line text-ink font-500 text-[13.5px] outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-400 transition-all';
const labelCls = 'text-[12px] font-600 text-ink-soft mb-1.5 block';

const SelectField = ({ value, onChange, disabled, children }) => (
  <div className="relative">
    <select value={value} onChange={onChange} disabled={disabled}
      className={`${fieldCls} pr-9 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}>
      {children}
    </select>
    <Icon name="chevron-down" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none" />
  </div>
);

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
    <div className="p-4 pb-28 lg:p-6 max-w-[980px] mx-auto space-y-5 fade-up relative">
      <PageHead
        eyebrow="Assignments"
        title="Homework"
        sub={`${list.length} active assignment${list.length === 1 ? '' : 's'}`}
        action={(
          <div className="hidden lg:inline-flex">
            <Button icon="plus" onClick={openCreate}>Assign homework</Button>
          </div>
        )}
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-line-soft animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="shadow-card">
          <Empty
            icon="book-open"
            title="No homework assigned yet"
            sub="Create your first assignment to get started."
            action={<Button icon="plus" size="sm" className="mt-4" onClick={openCreate}>Assign homework</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {list.map(hw => {
            const due = dueChip(hw.dueDate);
            return (
              <Card key={hw._id} className="p-5 shadow-card hover:shadow-card-lg transition-shadow flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {hw.subject && <SubjectTag subject={hw.subject} />}
                    <span className="text-[11px] font-600 text-ink-faint bg-line-soft px-2 py-1 rounded-md tnum whitespace-nowrap">{hw.className}-{hw.sectionName}</span>
                  </div>
                  <Chip tone={due.tone}>{due.text}</Chip>
                </div>
                <h3 className="font-700 text-ink text-[16px] leading-tight">{hw.title}</h3>
                {hw.description && <p className="text-ink-soft text-[13px] mt-1.5 leading-snug line-clamp-2">{hw.description}</p>}
                {hw.attachments?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hw.attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-line-soft text-[11.5px] font-600 text-ink-soft max-w-[150px] hover:bg-line transition-colors">
                        <Icon name={a.type === 'image' ? 'image' : 'file-text'} size={14} className="text-blue-600 shrink-0" />
                        <span className="truncate">{a.fileName || 'File'}</span>
                      </a>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-3.5 flex items-center justify-between border-t border-line">
                  <span className="text-[12px] font-600 text-ink-faint whitespace-nowrap">
                    {hw.createdAt ? `Assigned ${shortDate(hw.createdAt)}` : ''}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={openCreate}
        aria-label="Assign homework"
        className="lg:hidden fixed bottom-[84px] right-4 w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-pop grid place-items-center z-30 active:scale-90 transition-transform"
      >
        <Icon name="plus" size={24} strokeWidth={2.25} />
      </button>

      {/* Assign sheet / modal */}
      {showModal && (
        <div className="fixed inset-0 z-[80] flex justify-center bg-ink/35 backdrop-blur-[2px] items-end lg:items-center lg:p-4" onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white w-full shadow-pop max-h-[90vh] flex flex-col pop-in rounded-t-2xl lg:max-w-lg lg:rounded-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
              <h3 className="font-700 text-ink text-[16px] flex items-center gap-2">
                <Icon name="file-plus" size={19} className="text-blue-600" />Assign homework
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-line-soft grid place-items-center text-ink-soft hover:bg-line transition-colors">
                <Icon name="x" size={17} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Class</label>
                  <SelectField value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: 'All', subject: '' })}>
                    <option value="">Select</option>
                    {distinctClasses.map(c => <option key={c.className} value={c.className}>Class {c.className}</option>)}
                  </SelectField>
                </div>
                <div>
                  <label className={labelCls}>Section</label>
                  <SelectField value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })}>
                    <option value="All">All Sections</option>
                    {sectionsForClass.map(c => <option key={c.sectionId} value={c.sectionName}>{c.sectionName}</option>)}
                  </SelectField>
                </div>
              </div>

              <div>
                <label className={labelCls}>Subject</label>
                <SelectField value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={!form.className}>
                  <option value="">{form.className ? 'Select subject' : 'Select a class first'}</option>
                  {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </SelectField>
                {form.className && classSubjects.length === 0 && (
                  <p className="text-[12px] text-ink-faint mt-1.5">No subjects set for this class. Ask admin to add them.</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Algebra Worksheet — Chapter 4" className={fieldCls} />
              </div>

              <div>
                <label className={labelCls}>Instructions</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What should students do?"
                  className={`${fieldCls} h-24 py-2.5 resize-none`}
                />
              </div>

              <div>
                <label className={labelCls}>Due date *</label>
                <input type="date" required value={form.dueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={fieldCls} />
              </div>

              <div>
                <label className={labelCls}>Attachments</label>
                <label className={`w-full h-11 rounded-[10px] border border-dashed font-600 text-[13px] inline-flex items-center justify-center gap-2 cursor-pointer transition-colors ${uploading ? 'border-blue-300 bg-blue-50/60 text-blue-600' : 'border-line bg-line-soft/60 text-ink-soft hover:border-blue-300 hover:text-blue-600'}`}>
                  {uploading
                    ? <Icon name="loader" size={17} className="animate-spin" />
                    : <Icon name="upload" size={17} />}
                  {uploading ? 'Uploading…' : 'Add files (PDF, images)'}
                  <input type="file" multiple accept="image/*,application/pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
                </label>
                {form.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.attachments.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-line-soft rounded-md text-[11.5px] font-600 text-ink-soft max-w-[160px]">
                        <Icon name={a.type === 'image' ? 'image' : 'file-text'} size={14} className="text-blue-600 shrink-0" />
                        <span className="truncate">{a.fileName}</span>
                        <button onClick={() => setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }))} className="shrink-0 text-ink-faint hover:text-rose-500 transition-colors">
                          <Icon name="x" size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="rounded-[10px] bg-rose-50 px-3 py-2.5 text-[12.5px] font-600 text-rose-600">{error}</p>}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-line shrink-0">
              <Button variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1" icon="send" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Assigning…' : 'Assign'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;
