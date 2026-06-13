import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopHeader from '@/components/TopHeader';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const mockNotices = [
      {
        id: 1,
        title: 'Mid-Term Examinations Schedule',
        description: 'The mid-term examinations for classes 9 to 12 will commence from next Monday. Please ensure all question papers are submitted to the exam department by Wednesday.',
        type: 'Exams',
        date: new Date(Date.now() - 86400000).toISOString(),
        author: 'Exam Department',
      },
      {
        id: 2,
        title: 'Annual Sports Meet 2026',
        description: 'We are thrilled to announce our Annual Sports Meet next month. Teachers are requested to submit the list of participating students by the end of this week.',
        type: 'Events',
        date: new Date(Date.now() - 172800000).toISOString(),
        author: 'Principal',
      },
      {
        id: 3,
        title: 'Staff Meeting at 2 PM',
        description: 'An urgent staff meeting is scheduled today at 2 PM in the main auditorium regarding the upcoming inspection.',
        type: 'General',
        date: new Date().toISOString(),
        author: 'Admin Office',
      }
    ];

    setTimeout(() => {
      setNotices(mockNotices);
      setLoading(false);
    }, 800);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredNotices = activeTab === 'All' ? notices : notices.filter(n => n.type === activeTab);

  return (
    <>
      <TopHeader title="Notices" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <Tabs defaultValue="All" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="General">General</TabsTrigger>
          <TabsTrigger value="Exams">Exams</TabsTrigger>
          <TabsTrigger value="Events">Events</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : filteredNotices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-muted/20">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No notices found</h3>
              <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotices.map((notice) => (
              <Card key={notice.id} className="transition-all hover:shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4 space-y-0">
                  <div className="space-y-1.5">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <CardDescription className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {formatDate(notice.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        {notice.author}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-normal shrink-0">
                    {notice.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {notice.description}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>
      </div>
    </>
  );
};

export default Notices;
