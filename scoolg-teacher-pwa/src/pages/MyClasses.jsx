import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-32 lg:pb-10 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Your Classes</p>
        <h2 className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tight">My Classes</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-[28px] h-44"></div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-3xl text-slate-300">groups</span>
          </div>
          <p className="text-sm font-bold text-slate-700">No classes assigned yet.</p>
          <p className="text-xs font-bold text-slate-500 mt-1">Your admin assigns classes via the timetable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <div key={c.sectionId} onClick={() => navigate('/classes/detail', { state: c })} className="bg-white p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)] transition-all duration-500 border border-slate-50 group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[18px] bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    {c.className}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 tracking-tight leading-tight">Class {c.className}-{c.sectionName}</p>
                    {c.isClassTeacher && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 inline-block mt-1">Class Teacher</span>
                    )}
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
              </div>

              {c.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.subjects.slice(0, 6).map((s) => (
                    <span key={s} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">{s}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); navigate('/attendance', { state: { className: c.className, sectionName: c.sectionName, sectionId: c.sectionId, classId: c.classId } }); }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-[0_10px_30px_rgba(37,99,235,0.25)] active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">fact_check</span> Attendance
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate('/homework', { state: { className: c.className, sectionName: c.sectionName } }); }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">assignment</span> Homework
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClasses;
