import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Users, ClipboardCheck, BookOpen, ChevronRight } from 'lucide-react';
import TopHeader from '@/components/TopHeader';

let cachedClasses = null;

const MyClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState(cachedClasses || []);
  const [loading, setLoading] = useState(!cachedClasses);

  useEffect(() => {
    const load = async () => {
      try {
        if (!cachedClasses) {
          const res = await api.get('/teacher/my-classes');
          const data = Array.isArray(res.data) ? res.data : [];
          cachedClasses = data;
          setClasses(data);
        }
      } catch (e) {
        console.error('My classes load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      <TopHeader title="My Classes" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Classes Overview</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Manage attendance, homework, and details for your assigned classes.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-sm animate-pulse h-48"></div>
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
              <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No classes assigned</h3>
              <p className="text-slate-500 text-sm">Your admin assigns classes via the timetable.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {classes.map((c) => (
                <div
                  key={c.sectionId}
                  onClick={() => navigate('/classes/detail', { state: c })}
                  className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-stone-200 border-b-[6px] border-b-stone-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)] hover:border-b-stone-400 transition-all cursor-pointer group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 flex items-center justify-center text-xl font-black shadow-inner shrink-0">
                          {c.className}
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">Class {c.className}-{c.sectionName}</h3>
                            {c.isClassTeacher ? (
                                <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">Class Teacher</span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">Subject Teacher</span>
                            )}
                        </div>
                    </div>
                    <div className="shrink-0 h-8 w-8 rounded-full bg-white border border-stone-200/80 flex items-center justify-center text-stone-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>

                  {c.subjects?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5 flex-1 content-start">
                      {c.subjects.slice(0, 6).map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-slate-600 bg-white border border-slate-200 shadow-sm">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-stone-200/60">
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-600 hover:text-white transition-colors"
                      onClick={(e) => { e.stopPropagation(); navigate('/attendance', { state: { className: c.className, sectionName: c.sectionName, sectionId: c.sectionId, classId: c.classId } }); }}
                    >
                      <ClipboardCheck className="h-4 w-4" /> Attendance
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors shadow-sm"
                      onClick={(e) => { e.stopPropagation(); navigate('/homework', { state: { className: c.className, sectionName: c.sectionName } }); }}
                    >
                      <BookOpen className="h-4 w-4" /> Homework
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default MyClasses;
