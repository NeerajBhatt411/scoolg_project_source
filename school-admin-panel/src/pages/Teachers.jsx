import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Teachers = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    const schoolId = localStorage.getItem('scoolg_school_id');
    const API_BASE = 'https://scoolg-backend.netlify.app/api/admin';

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await axios.get(`${API_BASE}/teachers?schoolId=${schoolId}`);
                setTeachers(res.data);
            } catch (error) {
                console.error("Failed to fetch teachers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, [schoolId]);

    return (
        <>
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">Teacher Management</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <button 
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all"
                        onClick={() => navigate('/teachers/add')}
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span> Add Teacher
                    </button>
                </div>
            </header>

            <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center h-24">
                        <p className="text-xs uppercase font-bold text-slate-400 mb-1">TOTAL FACULTY</p>
                        <p className="text-2xl font-extrabold mt-1 text-slate-800">{teachers.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-[#2563eb] rounded-full animate-spin"></div></div>
                    ) : teachers.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4">person_off</span>
                            <p className="font-bold">No teachers found.</p>
                            <p className="text-sm">Click 'Add Teacher' to create one.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-500">App ID</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-500">Name</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-500">Phone</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-500">Email</th>
                                        <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {teachers.map((t) => (
                                        <tr key={t._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-5 text-sm font-bold text-[#2563eb]">{t.teacherAppId}</td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-slate-800">{t.fullName}</p>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-600">{t.phone}</td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-600">{t.email || '-'}</td>
                                            <td className="px-6 py-5">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">{t.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Teachers;
