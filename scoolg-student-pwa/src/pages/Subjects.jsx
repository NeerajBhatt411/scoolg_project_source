import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

let cachedSubjects = null;

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState(cachedSubjects || []);
  const [loading, setLoading] = useState(!cachedSubjects);

  useEffect(() => {
    // No subjects API yet — show the honest empty state instead of fake data.
    setLoading(false);
  }, []);

  return (
    <div className="min-h-full pb-32 pt-stack-gap">
      <div className="max-w-7xl mx-auto px-container-margin lg:px-8 space-y-6">
        
        <div className="mb-4">
            <h1 className="text-display-lg font-display-lg font-bold text-on-surface tracking-tight">My Subjects</h1>
            <p className="text-body-lg text-on-surface-variant mt-1">Syllabus, teachers, and details for Class {user?.class}-{user?.section}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-48 w-full rounded-[24px] bg-surface-container-low shadow-sm animate-pulse" />
            ))
          ) : subjects.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-surface-container-lowest rounded-[32px] border border-outline-variant/30 border-dashed">
              <div className="h-16 w-16 bg-surface-container text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">menu_book</span>
              </div>
              <h3 className="text-title-lg font-title-lg font-bold text-on-surface mb-1">No subjects found</h3>
              <p className="text-body-md text-on-surface-variant">Your subjects will appear here once assigned.</p>
            </div>
          ) : (
            subjects.map((subject) => (
              <div key={subject.id} className="bg-surface-container-lowest rounded-[24px] p-5 sm:p-6 shadow-sm border border-outline-variant/30 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-[16px] bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-primary group-hover:text-white text-[24px]">book</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-surface-container text-on-surface-variant border border-outline-variant/30">
                    {subject.code}
                  </span>
                </div>
                
                <h3 className="text-title-lg font-title-lg font-bold text-on-surface mb-1 leading-tight group-hover:text-primary transition-colors">{subject.name}</h3>
                <p className="text-body-md text-secondary mb-6 flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  {subject.teacher}
                </p>
                
                <div className="mt-auto pt-4 border-t border-outline-variant/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Attendance</span>
                    <span className="text-label-md font-bold text-primary">{Math.round((subject.attended / subject.totalClasses) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(subject.attended / subject.totalClasses) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
