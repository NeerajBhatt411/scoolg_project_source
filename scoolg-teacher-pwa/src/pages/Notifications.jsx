import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import TopHeader from '@/components/TopHeader';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockNots = [
      { id: 1, title: 'Attendance Reminder', message: 'You have not marked attendance for Class 10-A today.', time: '10 mins ago', read: false },
      { id: 2, title: 'Staff Meeting', message: 'Reminder: Staff meeting in the auditorium at 2:00 PM.', time: '1 hour ago', read: false },
      { id: 3, title: 'Leave Approved', message: 'Your casual leave request for tomorrow has been approved by the Principal.', time: '1 day ago', read: true },
      { id: 4, title: 'New Notice Published', message: 'A new notice regarding mid-term exams has been published.', time: '2 days ago', read: true },
    ];

    setTimeout(() => {
      setNotifications(mockNots);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <>
      <TopHeader title="Notifications" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Mark all read
          </Button>
        </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 sm:p-5 flex gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          notifications.map((notif) => (
            <Card key={notif.id} className={`shadow-sm transition-colors ${!notif.read ? 'bg-muted/30' : 'bg-card'}`}>
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                {!notif.read && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className={`text-sm font-medium text-foreground ${!notif.read ? 'font-semibold' : ''}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </>
  );
};

export default Notifications;
