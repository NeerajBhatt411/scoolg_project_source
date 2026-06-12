import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, ClipboardCheck, BookOpen, Users } from 'lucide-react';

const ClassDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const className = state?.className;
  const sectionName = state?.sectionName;

  useEffect(() => {
    if (!className || !sectionName) return;
    const load = async () => {
      try {
        const res = await api.get(`/teacher/students?className=${encodeURIComponent(className)}&sectionName=${encodeURIComponent(sectionName)}`);
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Class students load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [className, sectionName]);

  if (!state) return <Navigate to="/classes" replace />;

  const { sectionId, classId, isClassTeacher, subjects } = state;
  const sorted = [...students].sort((a, b) => Number(a.rollNumber) - Number(b.rollNumber));

  return (
    <div className="min-h-full px-4 lg:px-8 pt-5 pb-32 lg:pb-10 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/classes')} aria-label="Back to classes">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-manrope text-2xl font-bold tracking-tight">Class {className}-{sectionName}</h1>
            {isClassTeacher && <Badge variant="success">Class Teacher</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">Class overview and student roster.</p>
        </div>
      </div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-md bg-primary/10 text-primary grid place-items-center font-bold text-xl shrink-0">
                {className}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enrolled</p>
                <p className="text-2xl font-bold">
                  {loading ? '—' : students.length} <span className="text-sm font-medium text-muted-foreground">Students</span>
                </p>
              </div>
            </div>

            {subjects?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {subjects.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          onClick={() => navigate('/attendance', { state: { className, sectionName, sectionId, classId } })}
        >
          <ClipboardCheck className="h-4 w-4 mr-1.5" /> Take Attendance
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate('/homework', { state: { className, sectionName } })}
        >
          <BookOpen className="h-4 w-4 mr-1.5" /> Assign Homework
        </Button>
      </div>

      {/* Students */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Students ({loading ? '…' : students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No students in this class yet.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="divide-y divide-border"
            >
              {sorted.map((s) => (
                <div key={s._id} className="flex items-center gap-3 py-3">
                  <Avatar src={s.profileImageUrl} alt={s.firstName}>
                    {(s.firstName || '?').charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{s.firstName} {s.lastName}</p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap">Roll {s.rollNumber || '—'}</Badge>
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassDetail;
