import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Select from '../components/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus, X, Paperclip, Upload, Loader2, NotebookPen } from 'lucide-react';

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

const dueBadge = (d) => {
  if (!d) return { label: 'No due date', variant: 'outline' };
  const due = new Date(d); due.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (due.getTime() < today.getTime()) return { label: fmtDate(d), variant: 'destructive' };
  if (due.getTime() === today.getTime()) return { label: 'Due today', variant: 'warning' };
  return { label: fmtDate(d), variant: 'success' };
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
    <div className="min-h-full px-4 lg:px-8 pt-5 pb-32 lg:pb-10 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-manrope text-2xl font-bold tracking-tight">Homework</h1>
          <p className="text-sm text-muted-foreground">Assign and track homework for your classes.</p>
        </div>
        <Button onClick={openCreate} className="hidden lg:inline-flex">
          <Plus /> Assign
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <Card className="border-dashed bg-muted/30 shadow-none">
          <CardContent className="flex flex-col items-center pt-12 pb-12 sm:pt-12 sm:pb-12 text-center">
            <NotebookPen className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No homework assigned yet.</p>
            <p className="text-xs text-muted-foreground">Create your first assignment to get started.</p>
            <Button onClick={openCreate} size="sm" className="mt-4">
              <Plus /> Assign Homework
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {list.map((hw) => {
            const due = dueBadge(hw.dueDate);
            return (
              <Card key={hw._id} className="flex flex-col">
                <CardHeader className="pb-3 sm:pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {hw.subject && <Badge>{hw.subject}</Badge>}
                    <Badge variant="secondary">
                      Class {hw.className}-{hw.sectionName === 'All' ? 'All' : hw.sectionName}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{hw.title}</CardTitle>
                  {hw.description && <CardDescription className="line-clamp-2">{hw.description}</CardDescription>}
                </CardHeader>
                {hw.attachments?.length > 0 && (
                  <CardContent className="pb-3 sm:pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {hw.attachments.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer" className="max-w-[150px]">
                          <Badge variant="outline" className="max-w-full font-normal text-muted-foreground hover:bg-muted">
                            <Paperclip className="h-3 w-3 shrink-0 text-primary" />
                            <span className="truncate">{a.fileName || 'File'}</span>
                          </Badge>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                )}
                <CardFooter className="mt-auto justify-between border-t pt-3 sm:pt-3 pb-4 sm:pb-4">
                  <Badge variant={due.variant}>{due.label}</Badge>
                  {hw.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Given {new Date(hw.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </p>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Mobile FAB */}
      <Button
        onClick={openCreate}
        size="icon"
        className="lg:hidden fixed bottom-28 right-5 z-40 h-14 w-14 rounded-full shadow-lg [&_svg]:size-6"
      >
        <Plus />
      </Button>

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[88vh] w-full flex-col rounded-t-xl border bg-card p-5 pb-6 shadow-lg sm:max-w-lg sm:rounded-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-manrope text-lg font-bold tracking-tight">Assign Homework</h3>
                <p className="text-sm text-muted-foreground">Fill in the details below.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X />
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Class</label>
                  <Select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: 'All', subject: '' })}>
                    <option value="">Select</option>
                    {distinctClasses.map(c => <option key={c.className} value={c.className}>Class {c.className}</option>)}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Section</label>
                  <Select value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })}>
                    <option value="All">All Sections</option>
                    {sectionsForClass.map(c => <option key={c.sectionId} value={c.sectionName}>{c.sectionName}</option>)}
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Subject</label>
                <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={!form.className}>
                  <option value="">{form.className ? 'Select subject' : 'Select a class first'}</option>
                  {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                {form.className && classSubjects.length === 0 && (
                  <p className="text-xs text-muted-foreground">No subjects set for this class. Ask admin to add them.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Algebra Worksheet Ch-4" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Instructions..."
                  className="flex min-h-24 w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm font-medium shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Due Date *</label>
                <Input type="date" required value={form.dueDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Attachments</label>
                <label className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed transition-colors ${uploading ? 'border-primary/40 bg-primary/5 text-primary' : 'border-input text-muted-foreground hover:bg-muted/50'}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Add files (PDF, images)'}</span>
                  <input type="file" multiple accept="image/*,application/pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
                </label>
                {form.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.attachments.map((a, i) => (
                      <Badge key={i} variant="outline" className="max-w-[160px] font-normal text-muted-foreground">
                        <Paperclip className="h-3 w-3 shrink-0 text-primary" />
                        <span className="truncate">{a.fileName}</span>
                        <button onClick={() => setForm(f => ({ ...f, attachments: f.attachments.filter((_, idx) => idx !== i) }))} className="shrink-0 transition-colors hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            </div>

            <div className="mt-4 flex shrink-0 gap-3 border-t pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving || uploading}>
                <Plus /> {saving ? 'Assigning...' : 'Assign Homework'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homework;
