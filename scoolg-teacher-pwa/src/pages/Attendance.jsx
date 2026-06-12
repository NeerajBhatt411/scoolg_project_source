import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Select from '../components/Select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Send, Users } from 'lucide-react';

const Attendance = () => {
  const location = useLocation();
  const prefill = location.state || null;

  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(prefill || null); // {className, sectionName, sectionId, classId}
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentId -> 'P' | 'A'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load class list
  useEffect(() => {
    api.get('/teacher/my-classes')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setClasses(list);
        if (!selected && list.length > 0) setSelected(list[0]);
      })
      .catch(e => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load students + existing attendance when class/date changes
  useEffect(() => {
    if (!selected) return;
    let active = true;
    setLoading(true);
    setSaved(false);
    (async () => {
      try {
        const stuRes = await api.get(`/teacher/students?className=${encodeURIComponent(selected.className)}&sectionName=${encodeURIComponent(selected.sectionName)}`);
        const list = Array.isArray(stuRes.data) ? stuRes.data : [];
        if (!active) return;
        setStudents(list);

        const attRes = await api.get(`/teacher/attendance?sectionId=${selected.sectionId}&date=${date}`);
        const existing = {};
        (attRes.data?.records || []).forEach(r => { if (r.studentId) existing[r.studentId] = r.status; });
        const initial = {};
        list.forEach(s => { initial[s._id] = existing[s._id] || 'P'; });
        if (active) setMarks(initial);
      } catch (e) {
        console.error('Attendance load failed', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [selected, date]);

  const setMark = (id, status) => setMarks(m => ({ ...m, [id]: status }));
  const presentCount = Object.values(marks).filter(s => s === 'P').length;
  const absentCount = students.length - presentCount;

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const records = students.map(s => ({ studentId: s._id, status: marks[s._id] || 'P' }));
      await api.post('/teacher/attendance', {
        classId: selected.classId,
        sectionId: selected.sectionId,
        date,
        records,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Save failed', e);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full px-4 lg:px-8 pt-5 pb-40 lg:pb-10 space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="font-manrope text-2xl font-bold tracking-tight">Take Attendance</h1>
        <p className="text-sm text-muted-foreground">Mark today's register for your class.</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Class</label>
              <Select value={selected ? selected.sectionId : ''} onChange={(e) => setSelected(classes.find(c => c.sectionId === e.target.value))}>
                {classes.length === 0 && <option value="">No classes</option>}
                {classes.map(c => <option key={c.sectionId} value={c.sectionId}>Class {c.className}-{c.sectionName}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date</label>
              <Input type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          {students.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">{students.length}</div>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{presentCount}</div>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No students in this class.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {students.map((s, i) => {
              const mark = marks[s._id] || 'P';
              return (
                <div key={s._id} className="flex items-center gap-3 px-4 py-3">
                  <Badge variant="secondary" className="w-10 justify-center shrink-0">
                    {s.rollNumber || i + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.firstName} {s.lastName}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {mark === 'P' ? (
                      <Button size="icon" onClick={() => setMark(s._id, 'P')} className="bg-emerald-600 hover:bg-emerald-600/90 text-white">P</Button>
                    ) : (
                      <Button size="icon" variant="outline" onClick={() => setMark(s._id, 'P')} className="text-muted-foreground">P</Button>
                    )}
                    {mark === 'A' ? (
                      <Button size="icon" variant="destructive" onClick={() => setMark(s._id, 'A')}>A</Button>
                    ) : (
                      <Button size="icon" variant="outline" onClick={() => setMark(s._id, 'A')} className="text-muted-foreground">A</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Save bar */}
      {students.length > 0 && (
        <div className="fixed bottom-24 lg:bottom-6 left-0 lg:left-64 right-0 px-4 lg:px-8 z-40">
          <div className="max-w-5xl mx-auto">
            <Button size="lg" onClick={handleSave} disabled={saving}
              className={`w-full shadow-md ${saved ? 'bg-emerald-600 hover:bg-emerald-600/90' : ''}`}>
              {saved ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Attendance'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
