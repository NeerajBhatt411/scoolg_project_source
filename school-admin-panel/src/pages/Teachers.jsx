import React, { useState, useEffect } from 'react';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';

const Teachers = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const PER_PAGE = 8;

    const schoolId = localStorage.getItem('scoolg_school_id');
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await axios.get(`${ADMIN_API_BASE}/teachers?schoolId=${schoolId}`);
                setTeachers(res.data);
            } catch (error) {
                console.error("Failed to fetch teachers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, [schoolId]);

    const filteredTeachers = teachers.filter(t =>
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.teacherAppId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => { setPage(1); }, [searchQuery]);
    const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / PER_PAGE));
    const pageTeachers = filteredTeachers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const Shimmer = ({ className }) => (
        <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg ${className}`}></div>
    );

    return (
        <>
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <MenuButton />
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">Faculty & Staff</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-surface-container-high focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all text-xs font-semibold"
                            placeholder="Find teacher..."
                            type="text"
                        />
                    </div>
                    <ProfileButton size={40} />
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 space-y-6 max-w-full relative z-0">
                {/* Page Actions Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <span className="material-symbols-outlined text-primary">badge</span>
                        </div>
                        <div>
                            {loading ? (
                                <Shimmer className="h-6 w-32" />
                            ) : (
                                <h3 className="text-xl font-bold">{teachers.length} Total Faculty</h3>
                            )}
                            <p className="text-sm text-on-surface-variant font-medium">Active Staff</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <button
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto"
                            onClick={() => navigate('/teachers/add')}
                        >
                            <span className="material-symbols-outlined">add</span>
                            Add Teacher
                        </button>
                    </div>
                </div>

                {/* Data Table Card (desktop) */}
                <div className="hidden md:block bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden max-w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-surface-container-low/50">
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider hidden sm:table-cell">#</th>
                                    <th className="px-4 sm:px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Teacher Profile</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Experience</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Qualification</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider hidden lg:table-cell">Specialization</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider hidden md:table-cell">Phone</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {loading ? (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-5 hidden sm:table-cell"><Shimmer className="h-4 w-4" /></td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <Shimmer className="h-10 w-10 rounded-full" />
                                                    <div className="space-y-2">
                                                        <Shimmer className="h-3 w-32" />
                                                        <Shimmer className="h-2 w-20" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5"><Shimmer className="h-3 w-12" /></td>
                                            <td className="px-6 py-5"><Shimmer className="h-3 w-20" /></td>
                                            <td className="px-6 py-5 hidden lg:table-cell"><Shimmer className="h-3 w-28" /></td>
                                            <td className="px-6 py-5 hidden md:table-cell"><Shimmer className="h-3 w-24" /></td>
                                            <td className="px-6 py-5"><Shimmer className="h-3 w-16 mx-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredTeachers.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-10 font-bold text-slate-400">No teachers found</td></tr>
                                ) : (
                                    pageTeachers.map((teacher, index) => (
                                        <tr
                                            key={teacher._id}
                                            className="group hover:bg-[#f8fafc] transition-colors cursor-pointer"
                                            onClick={() => navigate('/teachers/profile', { state: { teacher } })}
                                        >
                                            <td className="px-6 py-5 text-sm font-bold text-outline hidden sm:table-cell">
                                                {String((page - 1) * PER_PAGE + index + 1).padStart(2, '0')}
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                                                        {teacher.profileImageUrl ? (
                                                            <img src={teacher.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                                                        ) : teacher.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-on-surface">{teacher.fullName}</p>
                                                        <p className="text-[11px] font-medium text-on-surface-variant">ID: {teacher.teacherAppId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5"><span className="text-sm font-bold text-blue-600">{teacher.experienceYears || '0'} Years</span></td>
                                            <td className="px-6 py-5"><span className="text-sm font-semibold">{teacher.highestQualification || 'NA'}</span></td>
                                            <td className="px-6 py-5 hidden lg:table-cell"><span className="text-sm font-medium text-on-surface-variant">{teacher.specialization || 'NA'}</span></td>
                                            <td className="px-6 py-5 hidden md:table-cell"><span className="text-sm font-medium text-on-surface-variant">{teacher.phone}</span></td>

                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">{teacher.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden space-y-3">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="bg-surface-container-lowest rounded-2xl premium-shadow p-4 flex items-center gap-3">
                                <Shimmer className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Shimmer className="h-3 w-32" />
                                    <Shimmer className="h-2 w-24" />
                                </div>
                            </div>
                        ))
                    ) : filteredTeachers.length === 0 ? (
                        <div className="text-center py-10 font-bold text-slate-400 bg-surface-container-lowest rounded-2xl premium-shadow">No teachers found</div>
                    ) : (
                        pageTeachers.map((teacher) => (
                            <button
                                key={teacher._id}
                                onClick={() => navigate('/teachers/profile', { state: { teacher } })}
                                className="w-full text-left bg-surface-container-lowest rounded-2xl premium-shadow p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-500 overflow-hidden shrink-0">
                                    {teacher.profileImageUrl ? (
                                        <img src={teacher.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                                    ) : teacher.fullName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-on-surface truncate">{teacher.fullName}</p>
                                        <span className="inline-flex items-center gap-1 shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span className="text-[10px] font-bold text-emerald-600 uppercase">{teacher.status}</span></span>
                                    </div>
                                    <p className="text-[11px] font-medium text-on-surface-variant truncate">ID: {teacher.teacherAppId}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-on-surface-variant">
                                        <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">work</span>{teacher.experienceYears || '0'} yrs</span>
                                        <span className="inline-flex items-center gap-1 truncate"><span className="material-symbols-outlined text-[14px]">call</span>{teacher.phone}</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 shrink-0">chevron_right</span>
                            </button>
                        ))
                    )}
                </div>

                {/* Pagination (shared) */}
                {!loading && filteredTeachers.length > PER_PAGE && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
                        <p className="text-xs font-bold text-slate-400">
                            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length} teachers
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="h-9 px-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button key={i} onClick={() => setPage(i + 1)}
                                    className={`h-9 w-9 rounded-xl text-sm font-bold transition-colors ${page === i + 1 ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-500/30' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}>{i + 1}</button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="h-9 px-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-auto h-12"></div>
        </>
    );
};

export default Teachers;
