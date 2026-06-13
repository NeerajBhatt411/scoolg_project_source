import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import TopHeader from '@/components/TopHeader';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockExams = [
      { id: 1, title: 'Unit Test 1', subject: 'Mathematics', classInfo: 'Class 10-A', date: '2026-05-15', status: 'Completed', marksEntered: false },
      { id: 2, title: 'Unit Test 1', subject: 'Physics', classInfo: 'Class 10-A', date: '2026-05-17', status: 'Completed', marksEntered: true },
      { id: 3, title: 'Half Yearly', subject: 'Science', classInfo: 'Class 9-B', date: '2026-08-10', status: 'Upcoming', marksEntered: false },
    ];

    setTimeout(() => {
      setExams(mockExams);
      setLoading(false);
    }, 700);
  }, []);

  return (
    <>
      <TopHeader title="Exams & Marks" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full max-w-[150px]" />
              </CardContent>
            </Card>
          ))
        ) : (
          exams.map((exam) => (
            <Card key={exam.id} className="shadow-sm flex flex-col sm:flex-row overflow-hidden">
              <div className="flex-1 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{exam.subject}</h3>
                  <Badge variant={exam.status === 'Completed' ? 'secondary' : 'outline'} className="w-fit font-normal">
                    {exam.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{exam.title}</p>
                  <p>{exam.classInfo} • {new Date(exam.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="p-6 bg-muted/10 border-t sm:border-t-0 sm:border-l flex items-center sm:w-48 justify-center shrink-0">
                {exam.status === 'Completed' ? (
                  exam.marksEntered ? (
                    <div className="text-sm font-medium text-muted-foreground text-center">
                      Marks Entered
                    </div>
                  ) : (
                    <Button className="w-full">
                      Enter Marks
                    </Button>
                  )
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    Not available yet
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
      </div>
    </>
  );
};

export default Exams;
