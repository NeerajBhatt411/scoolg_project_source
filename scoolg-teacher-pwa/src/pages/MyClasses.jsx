import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { PageHead, Card, Chip, Empty, Icon, Button, SubjectTag, toneFor } from '@/components/designkit';

const MyClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/teacher/my-classes');
        setClasses(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('My classes load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const gradeCount = new Set(classes.map(c => c.className)).size;

  return (
    <div className="p-4 pb-8 lg:p-6 max-w-[1000px] mx-auto space-y-5 fade-up">
      <PageHead
        eyebrow="Your classes"
        title="My Classes"
        sub={loading ? 'Loading your sections…' : `${classes.length} ${classes.length === 1 ? 'section' : 'sections'} across ${gradeCount} ${gradeCount === 1 ? 'grade' : 'grades'}.`}
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-line-soft rounded-2xl h-44" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="shadow-card">
          <Empty icon="users" title="No classes assigned yet." sub="Your admin assigns classes via the timetable." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {classes.map((c) => {
            const t = toneFor(c.subjects?.[0]);
            return (
              <Card
                key={c.sectionId}
                onClick={() => navigate('/classes/detail', { state: c })}
                className="p-5 shadow-card hover:shadow-card-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl grid place-items-center font-700 text-[17px] shrink-0"
                    style={{ background: t.soft, color: t.dot }}
                  >
                    {c.className}{c.sectionName}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-700 text-ink text-[16px] leading-tight">Class {c.className}-{c.sectionName}</p>
                      {c.isClassTeacher && <Icon name="star" size={15} fill="#2563EB" className="text-blue-600" />}
                    </div>
                  </div>
                  {c.isClassTeacher && <Chip tone="blue">Class teacher</Chip>}
                </div>

                {c.subjects?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {c.subjects.map((s) => <SubjectTag key={s} subject={s} />)}
                  </div>
                )}

                <div className="flex gap-2.5 mt-4 pt-4 border-t border-line">
                  <Button
                    variant="outline"
                    className="flex-1"
                    icon="clipboard-check"
                    onClick={(e) => { e.stopPropagation(); navigate('/attendance', { state: { className: c.className, sectionName: c.sectionName, sectionId: c.sectionId, classId: c.classId } }); }}
                  >
                    Attendance
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    icon="book-open"
                    onClick={(e) => { e.stopPropagation(); navigate('/homework', { state: { className: c.className, sectionName: c.sectionName } }); }}
                  >
                    Homework
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyClasses;
