import React, { useState, useEffect } from 'react';
import TopHeader from '@/components/TopHeader';
import { FileEdit, CheckCircle2, CalendarDays, Clock } from 'lucide-react';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockExams = [
      { id: 1, title: 'Unit Test 1', subject: 'Mathematics', classInfo: 'Class 10-A', date: '2026-05-15', status: 'Completed', marksEntered: false },
      { id: 2, title: 'Unit Test 1', subject: 'Physics', classInfo: 'Class 10-A', date: '2026-05-17', status: 'Completed', marksEntered: true },
      { id: 3, title: 'Half Yearly', subject: 'Science', classInfo: 'Class 9-B', date: '2026-08-10', status: 'Upcoming', marksEntered: false },
    ];

    setTimeout(() => {
      setExams(mockExams);
      setLoading(false);
    }, 700);
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-32">
      <TopHeader title="Exams" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        <div className="mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Examinations</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage exam marks and schedules for your classes.</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 w-full rounded-[24px] bg-white border border-slate-100 shadow-sm animate-pulse" />
            ))
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="bg-[#faf9f6] rounded-[24px] shadow-[0_8px_20px_rgba(120,113,108,0.06)] border border-stone-200/60 border-b-[4px] border-b-stone-300/60 flex flex-col sm:flex-row overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(120,113,108,0.1)] hover:border-b-stone-400/50 transition-all cursor-default">
                
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-blue-100/50 text-blue-700 border border-blue-200/50">
                        {exam.subject}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-600 border border-stone-200/60">
                        {exam.classInfo}
                    </span>
                    <span className={`ml-auto px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${exam.status === 'Completed' ? 'bg-slate-100 text-slate-600 border-slate-200/60' : 'bg-orange-100 text-orange-700 border-orange-200/60'}`}>
                        {exam.status}
                    </span>
                  </div>
                  
                  <h3 className="text-[17px] sm:text-lg font-black text-slate-900 leading-tight drop-shadow-sm mb-1">{exam.title}</h3>
                  
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 mt-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(exam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                
                <div className="p-5 sm:p-6 border-t sm:border-t-0 sm:border-l border-stone-200/60 bg-white flex flex-col items-center justify-center sm:w-48 shrink-0">
                  {exam.status === 'Completed' ? (
                    exam.marksEntered ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest text-center">Marks Entered</span>
                      </div>
                    ) : (
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all">
                        <FileEdit className="h-4 w-4" /> Enter Marks
                      </button>
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 opacity-50">
                      <Clock className="h-6 w-6 text-slate-400" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Not Available</span>
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Exams;
