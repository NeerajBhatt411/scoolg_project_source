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
        if (classFilter !== 'All' && student.class !== classFilter) return false;
        if (sectionFilter !== 'All' && student.section !== sectionFilter) return false;
        return true;
    });

    const uniqueClasses = ['All', ...new Set(students.map(s => s.class).filter(Boolean))];
    const uniqueSections = ['All', ...new Set(students.map(s => s.section).filter(Boolean))];

    return (
        <>
            {/* TopNavBar Component */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">Students</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-surface-container-high focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all text-xs font-semibold"
                            placeholder="Find student..."
                            type="text"
                        />
                    </div>
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 space-y-6 max-w-full relative z-0">
                {/* Page Actions Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <span className="material-symbols-outlined text-primary">group</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{stats.total} Total Students</h3>
                            <p className="text-sm text-on-surface-variant font-medium">Active Enrolled</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <button 
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto"
                            onClick={() => navigate('/students/add')}
                        >
                            <span className="material-symbols-outlined">add</span>
                            Add Student
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Class</label>
                        <select 
                            value={classFilter} 
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="w-full h-11 px-3 bg-surface-container-low border-none rounded-xl text-xs font-semibold outline-none appearance-none"
                        >
                            {uniqueClasses.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Section</label>
                        <select 
                            value={sectionFilter} 
                            onChange={(e) => setSectionFilter(e.target.value)}
                            className="w-full h-11 px-3 bg-surface-container-low border-none rounded-xl text-xs font-semibold outline-none appearance-none"
                        >
                            {uniqueSections.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sections' : s}</option>)}
                        </select>
                    </div>
                    <div className="hidden lg:block space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Status</label>
                        <select className="w-full h-11 px-3 bg-surface-container-low border-none rounded-xl text-xs font-semibold outline-none appearance-none">
                            <option>Active</option>
                        </select>
                    </div>
                    <button className="mt-auto h-11 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 justify-center" onClick={() => { setClassFilter('All'); setSectionFilter('All'); }}>
                        <span className="material-symbols-outlined text-[18px]">clear</span>
                        Clear Filters
                    </button>
                </div>

                {/* Data Table Card */}
                <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden max-w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-surface-container-low/50">
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider hidden sm:table-cell">#</th>
                                    <th className="px-4 sm:px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Roll No</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Class</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider hidden lg:table-cell">Father's Name</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider hidden md:table-cell">Date of Birth</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider text-center">Contact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {loadingStudents && students.length === 0 ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-5 hidden sm:table-cell"><div className="h-4 w-4 bg-slate-100 animate-pulse rounded"></div></td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse"></div>
                                                    <div className="space-y-2">
                                                        <div className="h-3 w-32 bg-slate-100 animate-pulse rounded"></div>
                                                        <div className="h-2 w-16 bg-slate-100 animate-pulse rounded"></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5"><div className="h-3 w-16 bg-slate-100 animate-pulse rounded"></div></td>
                                            <td className="px-6 py-5 hidden lg:table-cell"><div className="h-3 w-28 bg-slate-100 animate-pulse rounded"></div></td>
                                            <td className="px-6 py-5 hidden md:table-cell"><div className="h-3 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                                            <td className="px-6 py-5"><div className="h-3 w-20 bg-slate-100 animate-pulse rounded mx-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredStudents.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-10 font-bold text-slate-400 font-bold">No students found</td></tr>
                                ) : (
                                    filteredStudents.map((student, index) => (
                                        <tr 
                                            key={student._id} 
                                            className="group hover:bg-[#f8fafc] transition-colors cursor-pointer"
                                            onClick={() => navigate('/students/profile', { state: { student } })}
                                        >
                                            <td className="px-6 py-5 text-sm font-bold text-outline hidden sm:table-cell">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                                        {student.profileImageUrl ? (
                                                            <img src={student.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                                                        ) : student.firstName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-on-surface">{student.firstName} {student.lastName}</p>
                                                        <p className="text-[11px] font-medium text-on-surface-variant">ID: {student.studentAppId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5"><span className="text-sm font-bold text-blue-600">#{student.rollNumber || 'NA'}</span></td>
                                            <td className="px-6 py-5"><span className="text-sm font-semibold">{student.class} - Sec {student.section}</span></td>
                                            <td className="px-6 py-5 hidden lg:table-cell"><span className="text-sm font-medium text-on-surface-variant">{student.fatherName}</span></td>
                                            <td className="px-6 py-5 hidden md:table-cell"><span className="text-sm font-medium text-on-surface-variant">
                                                {new Date(student.dateOfBirth).toLocaleDateString()}
                                            </span></td>
                                            
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-sm font-bold text-slate-600">{student.primaryContact}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dashboard Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex flex-col justify-between h-40">
                        <span className="material-symbols-outlined text-primary text-3xl">male</span>
                        <div>
                            <p className="text-2xl font-extrabold">{stats.male}</p>
                            <p className="text-[11px] uppercase font-bold text-on-surface-variant mt-1">Male Students</p>
                        </div>
                    </div>
                    <div className="md:col-span-1 bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex flex-col justify-between h-40">
                        <span className="material-symbols-outlined text-rose-500 text-3xl">female</span>
                        <div>
                            <p className="text-2xl font-extrabold">{stats.female}</p>
                            <p className="text-[11px] uppercase font-bold text-on-surface-variant mt-1">Female Students</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-auto h-12"></div>
        </>
    );
};

export default Students;
