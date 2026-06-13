import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, MapPin } from 'lucide-react';
import TopHeader from '@/components/TopHeader';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockEvents = [
      { id: 1, title: 'Summer Break Begins', date: '2026-06-20', type: 'Holiday' },
      { id: 2, title: 'Teacher Training Session', date: '2026-06-25', type: 'Meeting', time: '10:00 AM - 02:00 PM', location: 'Main Auditorium' },
      { id: 3, title: 'Mid-Term Examinations', date: '2026-07-15', type: 'Exam' },
      { id: 4, title: 'Independence Day', date: '2026-08-15', type: 'Event', time: '08:00 AM', location: 'School Ground' },
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 600);
  }, []);

  return (
    <>
      <TopHeader title="Calendar" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0 flex">
                <div className="w-24 p-4 border-r flex flex-col items-center justify-center gap-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <div className="p-4 flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          events.map((event) => {
            const dateObj = new Date(event.date);
            const month = dateObj.toLocaleString('default', { month: 'short' });
            const day = dateObj.getDate();

            return (
              <Card key={event.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0 flex">
                  <div className="w-20 sm:w-24 border-r bg-muted/20 flex flex-col items-center justify-center p-4">
                    <span className="text-sm font-medium text-muted-foreground uppercase">{month}</span>
                    <span className="text-2xl font-bold text-foreground mt-1">{day}</span>
                  </div>
                  <div className="p-5 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-foreground truncate">{event.title}</h3>
                      <Badge variant="secondary" className="w-fit font-normal">
                        {event.type}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-3">
                      {event.time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      </div>
    </>
  );
};

export default Calendar;
