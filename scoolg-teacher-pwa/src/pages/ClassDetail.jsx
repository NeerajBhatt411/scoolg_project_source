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
          className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex items-center justify-center text-slate-900 hover:bg-blue-600 hover:text-white transition-all duration-500 active:scale-95"
          aria-label="Back to classes"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Class Detail</p>
          <div className="flex items-center gap-2">
            <h2 className="text-[26px] sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">Class {className}-{sectionName}</h2>
            {isClassTeacher && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">Class Teacher</span>
            )}
          </div>
        </div>
      </div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[18px] sm:rounded-[20px] bg-blue-50 text-blue-700 flex items-center justify-center font-black text-2xl shrink-0 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
            {className}
          </div>
          <div>
            <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest mb-1">Enrolled</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
              {loading ? '—' : students.length} <span className="text-base font-bold text-slate-400 tracking-normal">Students</span>
            </p>
          </div>
        </div>

        {subjects?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {subjects.map((s) => (
              <span key={s} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">{s}</span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/attendance', { state: { className, sectionName, sectionId, classId } })}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_10px_30px_rgba(37,99,235,0.25)] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          Take Attendance
        </button>
        <button
          onClick={() => navigate('/homework', { state: { className, sectionName } })}
          className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">assignment</span>
          Assign Homework
        </button>
      </div>

      {/* Students */}
      <div className="space-y-4">
        <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight"><span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>Students ({loading ? '…' : students.length})</h5>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-[20px] h-16" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-3xl text-slate-300">groups</span>
            </div>
            <p className="text-sm font-bold text-slate-700">No students in this class yet.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white p-2 sm:p-4 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 space-y-1"
          >
            {sorted.map((s) => (
              <div key={s._id} className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                {s.profileImageUrl ? (
                  <img src={s.profileImageUrl} alt={s.firstName} className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] object-cover border border-slate-100 shadow-sm shrink-0" />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] bg-blue-50 text-blue-700 flex items-center justify-center font-black border border-slate-100 shadow-sm shrink-0">
                    {(s.firstName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-sm tracking-tight truncate">{s.firstName} {s.lastName}</p>
                </div>
                <span className="text-[10px] font-black text-white bg-blue-600 px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-[0_5px_15px_rgba(37,99,235,0.3)]">Roll {s.rollNumber || '—'}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClassDetail;
