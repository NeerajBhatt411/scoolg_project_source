import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { PageHead, Segmented, Card, Chip, Empty, Icon, toneFor, fmt12, toMin, periodState } from '@/components/designkit';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const JS_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
  const navigate = useNavigate();
  const today = JS_DAYS[new Date().getDay()];
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : 'Monday');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nowHM, setNowHM] = useState(() => new Date().toTimeString().slice(0, 5));

  // Keep the "now" clock fresh so the live highlight moves between periods
  useEffect(() => {
    const tick = setInterval(() => setNowHM(new Date().toTimeString().slice(0, 5)), 30000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/teacher/timetable');
        setSchedule(res.data?.schedule || []);
      } catch (e) {
        console.error('Timetable load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const periods = schedule.find(d => d.dayOfWeek === activeDay)?.periods || [];
  const dayItems = DAYS.map(d => ({ value: d, label: d.slice(0, 3) }));
  const nowMin = toMin(nowHM);

  return (
    <div className="p-4 pb-8 lg:p-6 max-w-[920px] mx-auto space-y-5 fade-up">
      <PageHead eyebrow="My schedule" title="Weekly Timetable" sub="Tap any period to take attendance." />

      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        <Segmented items={dayItems} value={activeDay} onChange={setActiveDay} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-line-soft rounded-2xl h-20" />
          ))}
        </div>
      ) : periods.length === 0 ? (
        <Card className="shadow-card">
          <Empty icon="calendar-x" title={`No classes on ${activeDay}`} sub="A lighter day — time to plan ahead." />
        </Card>
      ) : (
        <div className="space-y-3">
          {periods.map((p, i) => {
            const t = toneFor(p.subject);
            const live = activeDay === today && periodState(p, nowMin) === 'live';
            return (
              <button
                key={i}
                onClick={() => navigate('/attendance', { state: { className: p.className, sectionName: p.sectionName } })}
                className="group w-full text-left bg-white rounded-2xl border border-line shadow-card overflow-hidden flex items-stretch hover:shadow-card-lg transition-shadow"
              >
                <div className="w-1.5 shrink-0" style={{ background: t.dot }}></div>
                <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
                  <div className="text-center w-[58px] shrink-0">
                    <p className="font-700 text-ink text-[14px] tnum leading-none">{p.startTime ? fmt12(p.startTime).replace(' ', '') : '--'}</p>
                    <p className="text-[11px] text-ink-faint mt-1 tnum">{p.endTime ? fmt12(p.endTime).replace(' ', '') : ''}</p>
                  </div>
                  <div className="w-px self-stretch bg-line"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-600 text-ink-faint">Period {p.periodNumber}</span>
                      {live && <Chip tone="green">Now</Chip>}
                    </div>
                    <p className="font-700 text-ink text-[16px] leading-tight truncate">{p.subject || 'Free'}</p>
                    <p className="text-ink-soft text-[13px] tnum mt-0.5">Class {p.className}-{p.sectionName}</p>
                  </div>
                  <Icon name="chevron-right" size={19} className="text-ink-faint group-hover:text-blue-600 transition-colors shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timetable;
