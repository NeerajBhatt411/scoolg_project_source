import React, { useState } from 'react';

const Timetable = () => {
    const [view, setView] = useState('class'); // 'class' or 'teacher'

    const getSubjectStyle = (subject) => {
        const styles = {
            'Math': 'bg-blue-50 text-blue-600 border-l-4 border-blue-500',
            'English': 'bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500',
            'Physics': 'bg-orange-50 text-orange-600 border-l-4 border-orange-500',
            'Chemistry': 'bg-teal-50 text-teal-600 border-l-4 border-teal-500',
            'Comp. Sc.': 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-500',
            'History': 'bg-purple-50 text-purple-600 border-l-4 border-purple-500',
            'Geography': 'bg-amber-50 text-amber-600 border-l-4 border-amber-500',
            'Games': 'bg-rose-50 text-rose-600 border-l-4 border-rose-500',
            'Lib / Self': 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-500',
            'Art / Craft': 'bg-red-50 text-red-600 border-l-4 border-red-500',
            'Assembly': 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600',
        };
        return styles[subject] || 'bg-slate-50 text-slate-600 border-l-4 border-slate-400';
    };

    const SubjectCard = ({ subject, teacher }) => (
        <div className={`p-3 rounded-r-xl h-full flex flex-col justify-center min-w-[100px] ${getSubjectStyle(subject)}`}>
            <p className="font-bold text-sm leading-tight">{subject}</p>
            <p className="text-[10px] font-semibold opacity-70 mt-1">{teacher}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex flex-col w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight leading-tight">Timetable Management</h2>
                    <p className="text-xs font-semibold text-slate-500">Academic Session 2024-25</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Search records..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="h-10 w-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-full text-slate-600">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer">
                            <img
                                alt="Admin Avatar"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-6">

                {/* Top Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                        <button
                            onClick={() => setView('class')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'class' ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Class View
                        </button>
                        <button
                            onClick={() => setView('teacher')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'teacher' ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Teacher View
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all">
                            <span>Class 5-A</span>
                            <span className="material-symbols-outlined text-[18px] text-slate-400">keyboard_arrow_down</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#2563eb] font-bold text-sm rounded-xl border border-white hover:border-blue-100 hover:bg-blue-50 shadow-sm transition-all">
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            Configure Timings
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all">
                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                            Print PDF
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl shadow-sm shadow-blue-500/30 hover:scale-95 transition-all">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Edit Mode
                        </button>
                    </div>
                </div>

                {/* Timetable Table Wrapper */}
                <div className="bg-white rounded-3xl premium-shadow overflow-x-auto w-full border border-slate-100 p-2 sm:p-4 lg:p-6">
                    <table className="w-full text-center min-w-[1000px] border-separate border-spacing-2">
                        <thead>
                            <tr>
                                <th className="p-3 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 rounded-xl w-24">DAY / TIME</th>
                                <th className="p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-800">Period 1</div>
                                    <div className="text-[10px] font-semibold text-slate-500">08:00 - 08:40</div>
                                </th>
                                <th className="p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-800">Period 2</div>
                                    <div className="text-[10px] font-semibold text-slate-500">08:40 - 09:20</div>
                                </th>
                                <th className="p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-800">Period 3</div>
                                    <div className="text-[10px] font-semibold text-slate-500">09:20 - 10:00</div>
                                </th>
                                <th className="p-3 bg-slate-50 rounded-xl w-14">
                                    <div className="text-xs font-bold text-slate-800">Break</div>
                                    <div className="text-[10px] font-semibold text-slate-500">10:00 - 10:15</div>
                                </th>
                                <th className="p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-800">Period 4</div>
                                    <div className="text-[10px] font-semibold text-slate-500">10:15 - 10:55</div>
                                </th>
                                <th className="p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-800">Period 5</div>
                                    <div className="text-[10px] font-semibold text-slate-500">10:55 - 11:35</div>
                                </th>
                                <th className="p-3 bg-slate-50 rounded-xl w-16">
                                    <div className="text-xs font-bold text-slate-800">Lunch</div>
                                    <div className="text-[10px] font-semibold text-slate-500">11:35 - 12:15</div>
                                </th>
                                <th className="p-3 bg-slate-50 rounded-xl">
                                    <div className="text-xs font-bold text-slate-800">Period 6</div>
                                    <div className="text-[10px] font-semibold text-slate-500">12:15 - 12:55</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Monday */}
                            <tr>
                                <td className="py-2 text-sm font-black text-slate-800 tracking-wide">Mon</td>
                                <td className="py-2"><SubjectCard subject="Math" teacher="Sharma" /></td>
                                <td className="py-2"><SubjectCard subject="English" teacher="Verma" /></td>
                                <td className="py-2"><SubjectCard subject="Physics" teacher="Khanna" /></td>
                                <td rowSpan="6" className="w-10">
                                    <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-full py-8">
                                        <span className="text-slate-400 font-extrabold text-[11px] tracking-[0.4em] uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Break</span>
                                    </div>
                                </td>
                                <td className="py-2"><SubjectCard subject="History" teacher="Gupta" /></td>
                                <td className="py-2"><SubjectCard subject="Geography" teacher="Singh" /></td>
                                <td className="py-2"><div className="h-full w-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[20px]">restaurant</span></div></td>
                                <td className="py-2"><SubjectCard subject="Games" teacher="Rawat" /></td>
                            </tr>
                            {/* Tuesday */}
                            <tr>
                                <td className="py-2 text-sm font-black text-slate-800 tracking-wide">Tue</td>
                                <td className="py-2"><SubjectCard subject="English" teacher="Verma" /></td>
                                <td className="py-2"><SubjectCard subject="Math" teacher="Sharma" /></td>
                                <td className="py-2"><SubjectCard subject="Comp. Sc." teacher="Dutta" /></td>
                                <td className="py-2"><SubjectCard subject="Physics" teacher="Khanna" /></td>
                                <td className="py-2"><SubjectCard subject="Chemistry" teacher="Bose" /></td>
                                <td className="py-2"><div className="h-full w-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[20px]">restaurant</span></div></td>
                                <td className="py-2"><SubjectCard subject="Lib / Self" teacher="Staff" /></td>
                            </tr>
                            {/* Wednesday */}
                            <tr>
                                <td className="py-2 text-sm font-black text-slate-800 tracking-wide">Wed</td>
                                <td className="py-2"><SubjectCard subject="Math" teacher="Sharma" /></td>
                                <td className="py-2"><SubjectCard subject="Physics" teacher="Khanna" /></td>
                                <td className="py-2"><SubjectCard subject="English" teacher="Verma" /></td>
                                <td className="py-2"><SubjectCard subject="Chemistry" teacher="Bose" /></td>
                                <td className="py-2"><SubjectCard subject="History" teacher="Gupta" /></td>
                                <td className="py-2"><div className="h-full w-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[20px]">restaurant</span></div></td>
                                <td className="py-2"><SubjectCard subject="Games" teacher="Rawat" /></td>
                            </tr>
                            {/* Thursday */}
                            <tr>
                                <td className="py-2 text-sm font-black text-slate-800 tracking-wide">Thu</td>
                                <td className="py-2"><SubjectCard subject="Physics" teacher="Khanna" /></td>
                                <td className="py-2"><SubjectCard subject="Chemistry" teacher="Bose" /></td>
                                <td className="py-2"><SubjectCard subject="Math" teacher="Sharma" /></td>
                                <td className="py-2"><SubjectCard subject="English" teacher="Verma" /></td>
                                <td className="py-2"><SubjectCard subject="Geography" teacher="Singh" /></td>
                                <td className="py-2"><div className="h-full w-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[20px]">restaurant</span></div></td>
                                <td className="py-2"><SubjectCard subject="Comp. Sc." teacher="Dutta" /></td>
                            </tr>
                            {/* Friday */}
                            <tr>
                                <td className="py-2 text-sm font-black text-slate-800 tracking-wide">Fri</td>
                                <td className="py-2"><SubjectCard subject="English" teacher="Verma" /></td>
                                <td className="py-2"><SubjectCard subject="Math" teacher="Sharma" /></td>
                                <td className="py-2"><SubjectCard subject="Geography" teacher="Singh" /></td>
                                <td className="py-2"><SubjectCard subject="Games" teacher="Rawat" /></td>
                                <td className="py-2"><SubjectCard subject="History" teacher="Gupta" /></td>
                                <td className="py-2"><div className="h-full w-full bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[20px]">restaurant</span></div></td>
                                <td className="py-2"><SubjectCard subject="Lib / Self" teacher="Staff" /></td>
                            </tr>
                            {/* Saturday */}
                            <tr>
                                <td className="py-2 text-sm font-black text-slate-800 tracking-wide">Sat</td>
                                <td className="py-2"><SubjectCard subject="Art / Craft" teacher="Das" /></td>
                                <td className="py-2"><SubjectCard subject="Art / Craft" teacher="Das" /></td>
                                <td className="py-2"><SubjectCard subject="Assembly" teacher="Admin" /></td>
                                <td colSpan="4" className="py-2">
                                    <div className="h-full w-full py-5 flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent"></div>
                                        <span className="relative z-10 text-[10px] font-extrabold text-slate-400 tracking-[0.3em] uppercase">No Scheduled Sessions After Break</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Bottom Stats Row & Floating Card Container */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative group pb-16">
                    {/* Stat Card 1 */}
                    <div className="bg-white p-6 rounded-3xl premium-shadow flex items-start gap-4 hover:translate-y-[-4px] transition-transform">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px] text-blue-600">trending_up</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 mb-1">Weekly Utilization</p>
                            <h3 className="text-2xl font-extrabold text-blue-700">92%</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">34/36 Active Periods</p>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white p-6 rounded-3xl premium-shadow flex items-start gap-4 hover:translate-y-[-4px] transition-transform">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px] text-emerald-600">casino</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 mb-1">Teacher Sync</p>
                            <h3 className="text-2xl font-extrabold text-emerald-600">Optimized</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">No Overlap Detected</p>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white p-6 rounded-3xl premium-shadow flex items-start gap-4 hover:translate-y-[-4px] transition-transform">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px] text-orange-600">warning</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 mb-1">Pending Slots</p>
                            <h3 className="text-2xl font-extrabold text-orange-500">02</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Music & Arts Pending...</p>
                        </div>
                    </div>

                    {/* Floating Smart Optimizer Card */}
                    <div className="absolute -bottom-4 right-0 lg:-right-4 bg-white px-6 py-4 rounded-full premium-shadow flex items-center gap-4 z-10 border border-slate-100 hover:shadow-lg transition-all animate-bounce-slow">
                        <span className="material-symbols-outlined text-[20px] text-blue-600">auto_awesome</span>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">Smart Optimizer</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Optimal schedule generated by AI</p>
                        </div>
                        <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors ml-4 text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Timetable;
