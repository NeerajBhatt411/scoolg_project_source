import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import api from '../utils/api';
import { PageHead, Card, Chip, Empty, Icon, Button, Avatar, SubjectTag, toneFor } from '@/components/designkit';

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
  const tone = toneFor(subjects?.[0]);

  return (
    <div className="p-4 pb-8 lg:p-6 max-w-[920px] mx-auto space-y-5 fade-up">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/classes')}
          aria-label="Back to classes"
          className="w-9 h-9 rounded-[10px] border border-line bg-white grid place-items-center shrink-0 text-ink-soft hover:text-ink hover:border-ink-faint/60 transition-colors"
        >
          <Icon name="arrow-left" size={17} strokeWidth={2} />
        </button>
        <PageHead
          title={`Class ${className}-${sectionName}`}
          sub={subjects?.length ? subjects.join(' · ') : `Section ${sectionName} — roster and quick actions.`}
        />
      </div>

      {/* Hero */}
      <Card className="p-5 shadow-card">
        <div className="flex items-start gap-3.5">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center font-700 text-[17px] shrink-0"
            style={{ background: tone.soft, color: tone.dot }}
          >
            {className}{sectionName}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-800 text-ink text-[24px] tnum leading-tight">
              {loading ? '—' : students.length}{' '}
              <span className="text-[14px] font-600 text-ink-soft">Students</span>
            </p>
          </div>
          {isClassTeacher && <Chip tone="blue">Class teacher</Chip>}
        </div>

        {subjects?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {subjects.map((s) => <SubjectTag key={s} subject={s} />)}
          </div>
        )}

        <div className="flex gap-2.5 mt-4 pt-4 border-t border-line">
          <Button
            className="flex-1"
            icon="clipboard-check"
            onClick={() => navigate('/attendance', { state: { className, sectionName, sectionId, classId } })}
          >
            Take attendance
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            icon="book-open"
            onClick={() => navigate('/homework', { state: { className, sectionName } })}
          >
            Assign homework
          </Button>
        </div>
      </Card>

      {/* Students */}
      <Card className="shadow-card overflow-hidden">
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-t border-line first:border-0">
                <div className="animate-pulse bg-line-soft rounded-full w-9 h-9 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="animate-pulse bg-line-soft rounded h-3.5 w-40" />
                  <div className="animate-pulse bg-line-soft rounded h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <Empty icon="users" title="No students in this class yet." sub="Students appear here once they are enrolled in this section." />
        ) : (
          <div>
            {sorted.map((s) => (
              <div key={s._id} className="flex items-center gap-3 px-5 py-3 border-t border-line first:border-0">
                <span className="w-6 text-[12px] font-700 text-ink-faint tnum shrink-0">{s.rollNumber || '—'}</span>
                <Avatar src={s.profileImageUrl} name={`${s.firstName || ''} ${s.lastName || ''}`.trim()} size={36} className="rounded-full" />
                <p className="font-600 text-ink text-[14px] truncate min-w-0 flex-1">{s.firstName} {s.lastName}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClassDetail;
