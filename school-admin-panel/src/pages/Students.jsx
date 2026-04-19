import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const Students = () => {
    const navigate = useNavigate();
    const { students, loadingStudents, stats, refreshStudents } = useAdmin();
    
    // Filters
    const [classFilter, setClassFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');

    useEffect(() => {
        // Silent refresh every time we land here
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
        <div className="animate-fade p-4 md:p-8 max-w-full space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Student Directory</h2>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">group</span>
                        {students.length} Total Students
                    </p>
                </div>
                
                <button 
                  onClick={() => navigate('/add-student')}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">person_add</span>
                  New Admission
                </button>
            </div>

            {/* Stats Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl premium-shadow flex items-center gap-4 border-l-4 border-blue-500">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><span className="material-symbols-outlined text-3xl">face</span></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Students</p>
                        <h4 className="text-2xl font-black text-slate-800">{students.length}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl premium-shadow flex items-center gap-4 border-l-4 border-indigo-500">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><span className="material-symbols-outlined text-3xl">male</span></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Male</p>
                        <h4 className="text-2xl font-black text-slate-800">{students.filter(s => s.gender?.toLowerCase() === 'male').length}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl premium-shadow flex items-center gap-4 border-l-4 border-pink-500">
                    <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600"><span className="material-symbols-outlined text-3xl">female</span></div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Female</p>
                        <h4 className="text-2xl font-black text-slate-800">{students.filter(s => s.gender?.toLowerCase() === 'female').length}</h4>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl premium-shadow flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-200 transition-all font-semibold text-sm"
                    />
                </div>
                
                <div className="flex gap-2">
                    <select 
                      value={classFilter} 
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white font-bold text-xs cursor-pointer"
                    >
                        {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</option>)}
                    </select>
                    
                    <select 
                      value={sectionFilter} 
                      onChange={(e) => setSectionFilter(e.target.value)}
                      className="h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white font-bold text-xs cursor-pointer"
                    >
                        {sections.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sections' : `Section ${s}`}</option>)}
                    </select>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-2xl premium-shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider hidden sm:table-cell">#</th>
                                <th className="px-4 sm:px-6 py-4 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Student</th>
                                <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Roll No</th>
                                <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Class</th>
                                <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider hidden lg:table-cell">Father's Name</th>
                                <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider hidden md:table-cell text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loadingStudents && students.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-5 hidden sm:table-cell"><div className="h-4 w-4 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-5"><div className="h-4 w-32 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-5"><div className="h-4 w-12 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-5"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-5 hidden lg:table-cell"><div className="h-4 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                                        <td className="px-6 py-5 text-right"><div className="h-4 w-8 bg-slate-100 animate-pulse rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : (
                                filteredStudents.map((student, index) => (
                                    <tr 
                                      key={student.id || student._id} 
                                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                                      onClick={() => navigate(`/student/${student.id || student._id}`)}
                                    >
                                        <td className="px-6 py-5 hidden sm:table-cell">
                                            <span className="text-xs font-bold text-slate-400">{index + 1}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                                                    <img src={student.profileImageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.firstName} alt={student.firstName} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{student.firstName} {student.lastName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 tracking-tight">{student.studentAppId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><span className="text-sm font-bold text-blue-600">#{student.rollNumber || 'NA'}</span></td>
                                        <td className="px-6 py-5"><span className="text-sm font-semibold">{student.class} - Sec {student.section}</span></td>
                                        <td className="px-6 py-5 hidden lg:table-cell"><span className="text-sm font-medium text-slate-600">{student.fatherName}</span></td>
                                        <td className="px-6 py-5 text-right hidden md:table-cell">
                                            <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 hover:shadow-sm transition-all"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Students;
