import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Select from '../components/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus, Lock, Trash2, BookOpen } from 'lucide-react';

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

  return (
    <div className="min-h-full px-4 lg:px-8 pt-5 pb-32 lg:pb-10 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="font-manrope text-2xl font-bold tracking-tight">My Diary</h1>
        <p className="text-sm text-muted-foreground">Log what you taught — one line per class.</p>
      </div>

      {/* Add form */}
      <Card>
        <CardHeader className="pb-4 sm:pb-4">
          <CardTitle className="text-base">Add entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, sectionName: '', subject: '' })}>
              <option value="">Class</option>
              {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
            </Select>
            <Select value={form.sectionName} onChange={(e) => setForm({ ...form, sectionName: e.target.value })} disabled={!form.className}>
              <option value="">Section</option>
              {sectionOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} disabled={!form.className}>
              <option value="">Subject</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input type="date" value={form.date} max={todayISO()} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-12" />
          </div>
          <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What did you teach? (one line)" />
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
          <Button onClick={save} disabled={saving} className="w-full">
            <Plus /> {saving ? 'Saving...' : 'Add to diary'}
          </Button>
        </CardContent>
      </Card>

      {/* Entries */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="border-dashed bg-muted/30 shadow-none">
          <CardContent className="flex flex-col items-center pt-12 pb-12 sm:pt-12 sm:pb-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No diary entries yet.</p>
            <p className="text-xs text-muted-foreground">Add what you taught today above.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border py-2 sm:py-2">
            {entries.map(e => (
              <div key={e._id} className="flex items-center gap-3 py-3">
                <Badge variant="secondary" className="w-16 shrink-0 justify-center">{fmt(e.date)}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{e.note}</p>
                  <p className="text-xs text-muted-foreground">Class {e.className}-{e.sectionName}{e.subject ? ` · ${e.subject}` : ''}</p>
                </div>
                {e.locked ? (
                  <span title="Locked" className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-500">
                    <Lock className="h-3.5 w-3.5" /> Locked
                  </span>
                ) : (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Lock" onClick={() => lockEntry(e._id)}>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Delete" onClick={() => deleteEntry(e._id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Diary;
