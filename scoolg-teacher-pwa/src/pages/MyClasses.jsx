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
        <p className="text-label-md font-label-md text-secondary uppercase tracking-widest">Your Classes</p>
        <h2 className="text-display-lg font-display-lg text-on-surface">My Classes</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-primary">
          <div className="animate-spin w-9 h-9 border-4 border-current border-t-transparent rounded-full"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white border border-dashed border-surface-container-high rounded-3xl p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30 mb-2">groups</span>
          <p className="text-body-md font-bold">No classes assigned yet.</p>
          <p className="text-label-md mt-1">Your admin assigns classes via the timetable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <div key={c.sectionId} className="bg-white border border-surface-container rounded-3xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                    {c.className}
                  </div>
                  <div>
                    <p className="text-title-lg font-bold text-on-surface leading-tight">Class {c.className}-{c.sectionName}</p>
                    {c.isClassTeacher && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Class Teacher</span>
                    )}
                  </div>
                </div>
              </div>

              {c.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.subjects.slice(0, 6).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant text-[10px] font-bold">{s}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => navigate('/attendance', { state: { className: c.className, sectionName: c.sectionName, sectionId: c.sectionId, classId: c.classId } })}
                  className="flex-1 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-label-md font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">fact_check</span> Attendance
                </button>
                <button onClick={() => navigate('/homework', { state: { className: c.className, sectionName: c.sectionName } })}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface text-label-md font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
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
