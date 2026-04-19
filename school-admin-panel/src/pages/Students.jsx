import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  ChevronRight, 
  Calendar, 
  BadgeCheck,
  UserCheck,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';

const Students = () => {
    const navigate = useNavigate();
    const { students, loadingStudents, refreshStudents } = useAdmin();
    
    // Filters
    const [classFilter, setClassFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');

    useEffect(() => {
        refreshStudents(true);
    }, []);

    const filteredStudents = students.filter(student => {
        const matchesClass = classFilter === 'All' || student.class === classFilter;
        const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
        return matchesClass && matchesSection;
    });

    // Unique classes and sections for filters
    const classes = ['All', ...new Set(students.map(s => s.class))].sort();
    const sections = ['All', ...new Set(students.map(s => s.section))].sort();

    return (
        <div className="animate-fade-in p-4 md:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Student Directory</h2>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
                        <Users size={14} />
                        {students.length} Total Enrolled Students
                    </p>
                </div>
                
                <button 
                  onClick={() => navigate('/add-student')}
                  className="btn-premium"
                >
                  <Plus size={18} />
                  New Admission
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bento-card p-6 flex items-center gap-5 border-l-4 border-indigo-500">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.05em]">Attendance Today</p>
                        <h4 className="text-2xl font-black text-slate-800">92%</h4>
                    </div>
                </div>
                <div className="bento-card p-6 flex items-center gap-5 border-l-4 border-rose-500">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.05em]">Fee Pending</p>
                        <h4 className="text-2xl font-black text-slate-800">12%</h4>
                    </div>
                </div>
                <div className="bento-card p-6 flex items-center gap-5 border-l-4 border-emerald-500">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                        <BadgeCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.05em]">New Admissions</p>
                        <h4 className="text-2xl font-black text-slate-800">1.4k</h4>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bento-card bg-slate-50/50 p-4 flex flex-col md:flex-row gap-4 border-slate-200">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search name, ID or guardian..." 
                      className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-sm text-slate-700"
                    />
                </div>
                
                <div className="flex gap-3">
                    <div className="relative min-w-[140px]">
                        <select 
                          value={classFilter} 
                          onChange={(e) => setClassFilter(e.target.value)}
                          className="w-full h-12 px-4 appearance-none bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs text-slate-700 cursor-pointer"
                        >
                            {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Grade ${c}`}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    
                    <button className="h-12 w-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all active:scale-95 shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bento-card shadow-2xl shadow-indigo-100 border-none overflow-hidden h-[600px] flex flex-col">
                <div className="overflow-x-auto h-full flex flex-col">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr className="text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                                <th className="px-8 py-5 text-left">Elite Member</th>
                                <th className="px-8 py-5 text-left">Academic Unit</th>
                                <th className="px-8 py-5 text-left">Guardian</th>
                                <th className="px-8 py-5 text-left">ID / Roll</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loadingStudents && students.length === 0 ? (
                                [...Array(6)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                      <td colSpan={5} className="px-8 py-6 h-[80px]">
                                          <div className="h-4 bg-slate-100 rounded-full w-full opacity-50"></div>
                                      </td>
                                    </tr>
                                ))
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr 
                                      key={student.id} 
                                      className="group hover:bg-slate-50 transition-all cursor-pointer"
                                      onClick={() => navigate(`/student/${student.id || student._id}`)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex-shrink-0 flex items-center justify-center border border-indigo-100/50 shadow-sm overflow-hidden transform group-hover:scale-105 transition-transform">
                                                    <img 
                                                      src={student.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}`} 
                                                      alt={student.firstName} 
                                                      className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase">{student.firstName} {student.lastName}</p>
                                                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">{student.gender}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-slate-700">Class {student.class} - {student.section}</span>
                                                <span className="text-[10px] font-bold text-slate-400">Batch 2024</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700">{student.fatherName}</span>
                                                <span className="text-[11px] font-bold text-slate-400 italic">Guardian</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg">#{student.rollNumber || 'NA'}</span>
                                                <span className="text-[10px] font-black text-slate-400">{student.studentAppId || 'SID000'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 transition-all group-hover:shadow-sm">
                                                <ArrowUpRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Custom Pagination Style */}
                <div className="mt-auto bg-slate-50/50 p-6 flex flex-col md:flex-row justify-between items-center border-t border-slate-100 gap-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Page 1 of 24 • Showing 10-25</p>
                    <div className="flex gap-2">
                        <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all">Previous</button>
                        <button className="px-6 py-2.5 bg-slate-900 border border-slate-900 rounded-xl text-[11px] font-black uppercase text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Students;
