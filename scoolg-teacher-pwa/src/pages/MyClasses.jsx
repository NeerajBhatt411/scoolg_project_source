import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ClipboardCheck, BookOpen, ChevronRight } from 'lucide-react';

import TopHeader from '@/components/TopHeader';

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

  return (
    <>
      <TopHeader title="My Classes" />
      <div className="min-h-full px-4 lg:px-8 pt-5 pb-32 lg:pb-10 space-y-5 max-w-5xl mx-auto">

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Users className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No classes assigned yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Your admin assigns classes via the timetable.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <Card
              key={c.sectionId}
              onClick={() => navigate('/classes/detail', { state: c })}
              className="transition-shadow hover:shadow-md cursor-pointer"
            >
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                <div className="h-11 w-11 rounded-md bg-primary/10 text-primary grid place-items-center font-bold shrink-0">
                  {c.className}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">Class {c.className}-{c.sectionName}</CardTitle>
                  {c.isClassTeacher && (
                    <Badge variant="success" className="mt-1">Class Teacher</Badge>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>

              {c.subjects?.length > 0 && (
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {c.subjects.slice(0, 6).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              )}

              <CardFooter className="gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={(e) => { e.stopPropagation(); navigate('/attendance', { state: { className: c.className, sectionName: c.sectionName, sectionId: c.sectionId, classId: c.classId } }); }}
                >
                  <ClipboardCheck className="h-4 w-4 mr-1.5" /> Attendance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => { e.stopPropagation(); navigate('/homework', { state: { className: c.className, sectionName: c.sectionName } }); }}
                >
                  <BookOpen className="h-4 w-4 mr-1.5" /> Homework
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default MyClasses;
