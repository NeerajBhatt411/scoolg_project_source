import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const ClassDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const className = state?.className;
  const sectionName = state?.sectionName;

  useEffect(() => {
    if (!className || !sectionName) return;
    const load = async () => {
      try {
        const res = await api.get(`/teacher/students?className=${encodeURIComponent(className)}&sectionName=${encodeURIComponent(sectionName)}`);
        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error('Class students load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [className, sectionName]);

  if (!state) return <Navigate to="/classes" replace />;

  const { sectionId, classId, isClassTeacher, subjects } = state;
  const sorted = [...students].sort((a, b) => Number(a.rollNumber) - Number(b.rollNumber));

  return (
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-32 lg:pb-10 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/classes')}
          className="w-10 h-10 rounded-full bg-white border border-surface-container shadow-sm flex items-center justify-center text-on-surface active:scale-95 transition-transform"
          aria-label="Back to classes"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="space-y-0.5">
          <p className="text-label-md font-label-md text-secondary uppercase tracking-widest">Class Detail</p>
          <div className="flex items-center gap-2">
            <h2 className="text-display-lg font-display-lg text-on-surface leading-tight">Class {className}-{sectionName}</h2>
            {isClassTeacher && (
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Class Teacher</span>
            )}
          </div>
        </div>
      </div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white border border-surface-container rounded-3xl p-6 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl shrink-0">
            {className}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Enrolled</p>
            <p className="text-3xl font-manrope font-extrabold text-on-surface leading-tight">
              {loading ? '—' : students.length} <span className="text-base font-bold text-on-surface-variant">Students</span>
            </p>
          </div>
        </div>

        {subjects?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {subjects.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-surface-container-low text-on-surface-variant text-[10px] font-bold">{s}</span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/attendance', { state: { className, sectionName, sectionId, classId } })}
          className="flex-1 py-3 rounded-2xl bg-primary text-white text-label-md font-bold flex items-center justify-center gap-1.5 shadow-[0_8px_24px_-14px_rgba(37,99,235,0.6)] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          Take Attendance
        </button>
        <button
          onClick={() => navigate('/homework', { state: { className, sectionName } })}
          className="flex-1 py-3 rounded-2xl bg-surface-container-high text-on-surface text-label-md font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">assignment</span>
          Assign Homework
        </button>
      </div>

      {/* Students */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          Students ({loading ? '…' : students.length})
        </p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-surface-container-low rounded-2xl h-16" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white border border-dashed border-surface-container-high rounded-3xl p-10 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-30 mb-2">groups</span>
            <p className="text-body-md font-bold">No students in this class yet.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-3"
          >
            {sorted.map((s) => (
              <div key={s._id} className="bg-white border border-surface-container rounded-2xl p-3 shadow-sm flex items-center gap-3">
                {s.profileImageUrl ? (
                  <img src={s.profileImageUrl} alt={s.firstName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                    {(s.firstName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-body-md font-bold text-on-surface truncate">{s.firstName} {s.lastName}</p>
                  <p className="text-label-md text-on-surface-variant">Roll {s.rollNumber || '—'}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;
