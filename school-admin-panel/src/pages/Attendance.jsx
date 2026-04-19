import React from 'react';

const Attendance = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight">Mark Attendance</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Search student..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="h-10 w-10 flex items-center justify-center bg-transparent hover:bg-slate-100 transition-colors rounded-full text-slate-600">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[11px] font-bold text-slate-800">Admin User</p>
                                <p className="text-[9px] font-semibold text-slate-500">Principal Office</p>
                            </div>
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer">
                                <img
                                    alt="Admin Avatar"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 max-w-[1240px] mx-auto space-y-6 w-full flex-1">

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filter & Action Card */}
                    <div className="bg-white rounded-[24px] p-6 lg:p-8 premium-shadow flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Class</label>
                                <button className="w-full h-12 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl px-4 flex items-center justify-between text-sm font-bold text-slate-700">
                                    <span>Class 5</span>
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">keyboard_arrow_down</span>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Section</label>
                                <button className="w-full h-12 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl px-4 flex items-center justify-between text-sm font-bold text-slate-700">
                                    <span>Section A</span>
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">keyboard_arrow_down</span>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date</label>
                                <button className="w-full h-12 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl px-4 flex items-center gap-3 text-sm font-bold text-slate-700">
                                    <span className="material-symbols-outlined text-[18px] text-[#2563eb]">calendar_month</span>
                                    <span>Today, 24 May 2024</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6 sm:mt-10 lg:mt-auto pt-6">
                            <button className="flex items-center gap-2 px-8 py-3.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 w-full sm:w-auto justify-center">
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                Mark All Present
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 lg:pb-0">
                        {/* Present */}
                        <div className="bg-white min-w-[120px] rounded-[24px] premium-shadow flex flex-col items-center justify-center py-8 relative overflow-hidden shrink-0">
                            <h3 className="text-[2.5rem] font-black text-emerald-500 leading-none">28</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">PRESENT</p>
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-emerald-500"></div>
                        </div>
                        {/* Absent */}
                        <div className="bg-white min-w-[120px] rounded-[24px] premium-shadow flex flex-col items-center justify-center py-8 relative overflow-hidden shrink-0">
                            <h3 className="text-[2.5rem] font-black text-red-500 leading-none">2</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">ABSENT</p>
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-red-500"></div>
                        </div>
                        {/* Late */}
                        <div className="bg-white min-w-[120px] rounded-[24px] premium-shadow flex flex-col items-center justify-center py-8 relative overflow-hidden shrink-0">
                            <h3 className="text-[2.5rem] font-black text-amber-500 leading-none">1</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">LATE</p>
                            <div className="absolute bottom-0 left-0 w-full h-2 bg-amber-500"></div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-[24px] premium-shadow overflow-hidden w-full pb-6">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 md:px-10 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider w-20">#</th>
                                    <th className="px-6 md:px-10 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">STUDENT</th>
                                    <th className="px-6 md:px-10 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider w-40">ROLL NO</th>
                                    <th className="px-6 md:px-10 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center w-[300px]">ATTENDANCE STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {/* Student 1 */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 md:px-10 py-4 text-sm font-bold text-slate-400">01</td>
                                    <td className="px-6 md:px-10 py-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Arjun Sharma"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5Vq5g8gO4D4vQGf9eR2B8sK6V1X8yJd2yR4Q8uG1kY0vR5M7F6X9P3P1Q2h8D9j0S5K4H9H5v6v4X4v1P3P3P1Q2h8D9j0S5K4"
                                                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Arjun+Sharma&background=f1f5f9&color=64748b"; }}
                                            />
                                            <div>
                                                <p className="text-sm font-black text-slate-800">Arjun Sharma</p>
                                                <p className="text-[11px] font-semibold text-slate-500">Class 5-A</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-10 py-4"><span className="text-sm font-bold text-[#2563eb]">#5A01</span></td>
                                    <td className="px-6 md:px-10 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-black transition-all bg-emerald-50 text-emerald-600 border-2 border-emerald-500 shadow-sm">P</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">A</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">L</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">H</button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Student 2 */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 md:px-10 py-4 text-sm font-bold text-slate-400">02</td>
                                    <td className="px-6 md:px-10 py-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Sarah Jenkins"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489"
                                            />
                                            <div>
                                                <p className="text-sm font-black text-slate-800">Sarah Jenkins</p>
                                                <p className="text-[11px] font-semibold text-slate-500">Class 5-A</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-10 py-4"><span className="text-sm font-bold text-[#2563eb]">#5A02</span></td>
                                    <td className="px-6 md:px-10 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">P</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-black transition-all bg-red-50 text-red-600 border-2 border-red-500 shadow-sm">A</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">L</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">H</button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Student 3 */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 md:px-10 py-4 text-sm font-bold text-slate-400">03</td>
                                    <td className="px-6 md:px-10 py-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Leo Maxwell"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5Vq5g8gO4D4vQGf9eR2B8sK6V1X8yJd2yR4Q8uG1kY0vR5M7F6X9P3P1Q2h8D9j0S5K4H9H5v6v4X4v1P3P3P1Q2h8D9j0S5K5"
                                                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Leo+Maxwell&background=f1f5f9&color=64748b"; }}
                                            />
                                            <div>
                                                <p className="text-sm font-black text-slate-800">Leo Maxwell</p>
                                                <p className="text-[11px] font-semibold text-slate-500">Class 5-A</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-10 py-4"><span className="text-sm font-bold text-[#2563eb]">#5A03</span></td>
                                    <td className="px-6 md:px-10 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">P</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">A</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-black transition-all bg-amber-50 text-amber-600 border-2 border-amber-500 shadow-sm">L</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">H</button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Student 4 */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 md:px-10 py-4 text-sm font-bold text-slate-400">04</td>
                                    <td className="px-6 md:px-10 py-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Meera Patel"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5Vq5g8gO4D4vQGf9eR2B8sK6V1X8yJd2yR4Q8uG1kY0vR5M7F6X9P3P1Q2h8D9j0S5K4H9H5v6v4X4v1P3P3P1Q2h8D9j0S5K6"
                                                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Meera+Patel&background=f1f5f9&color=64748b"; }}
                                            />
                                            <div>
                                                <p className="text-sm font-black text-slate-800">Meera Patel</p>
                                                <p className="text-[11px] font-semibold text-slate-500">Class 5-A</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-10 py-4"><span className="text-sm font-bold text-[#2563eb]">#5A04</span></td>
                                    <td className="px-6 md:px-10 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-black transition-all bg-emerald-50 text-emerald-600 border-2 border-emerald-500 shadow-sm">P</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">A</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">L</button>
                                            <button className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[13px] font-bold transition-all bg-slate-50 text-slate-400 hover:bg-slate-100">H</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="h-16"></div> {/* Spacer for fixed footer */}

            </div>

            {/* Bottom Sticky Footer */}
            <div className="w-full bg-white h-auto sm:h-[80px] border-t border-slate-200 mt-auto px-4 md:px-8 py-4 sm:py-0 flex flex-col sm:flex-row justify-between items-center gap-4 z-30 sticky bottom-0">
                {/* Legends */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center sm:justify-start">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">P: Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">A: Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">L: Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">H: Holiday</span>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <button className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">
                        Cancel
                    </button>
                    <button className="flex items-center gap-2 px-8 py-3 bg-[#2563eb] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
                        Submit
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Attendance;
