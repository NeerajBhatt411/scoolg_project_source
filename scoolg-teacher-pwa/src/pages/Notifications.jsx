import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import TopHeader from '@/components/TopHeader';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const timeAgo = (d) => {
  const t = new Date(d).getTime();
  if (!t) return '';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24); if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
};

const Notifications = () => {
  const { teacher } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!teacher?._id) { setLoading(false); return; }
      try {
        const res = await api.get('/notifications', { params: { role: 'teacher', userId: teacher._id } });
        if (alive) setNotifications(res.data.items || []);
      } catch (e) {
        if (alive) setNotifications([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [teacher]);

  const markAllRead = async () => {
    if (!teacher?._id) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await api.post('/notifications/read-all', { role: 'teacher', userId: teacher._id }); } catch (e) { /* ignore */ }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <>
      <TopHeader title="Notifications" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {hasUnread && (
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={markAllRead}>
              Mark all read
            </Button>
          </div>
        )}

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
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-base font-medium">No notifications yet</p>
              <p className="text-sm mt-1">Attendance, notices and school updates will appear here.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Card key={notif._id} className={`shadow-sm transition-colors ${!notif.read ? 'bg-muted/30' : 'bg-card'}`}>
                <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <h3 className={`text-sm font-medium text-foreground ${!notif.read ? 'font-semibold' : ''}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notif.body}
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
