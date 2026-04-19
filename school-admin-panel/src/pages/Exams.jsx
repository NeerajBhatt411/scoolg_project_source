import React from 'react';

const Exams = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative pb-20">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight">Marks Entry</h2>
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
                                <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Registrar Office</p>
                            </div>
                            <div className="h-10 w-10 bg-[#1e293b] rounded-full flex items-center justify-center border-2 border-white shadow-sm cursor-pointer">
                                <span className="material-symbols-outlined text-white text-[20px]">person</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 max-w-[1240px] mx-auto space-y-6 w-full">

                {/* Filters Section */}
                <div className="bg-white rounded-[24px] p-6 lg:p-8 premium-shadow flex flex-col md:flex-row gap-6 items-end">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Exam Cycle</label>
                            <input type="text" value="Final Term Examinar" readOnly className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none border-none truncate" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Academic Class</label>
                            <button className="w-full h-12 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl px-4 flex items-center justify-between text-sm font-bold text-slate-700">
                                <span>Class 10</span>
                                <span className="material-symbols-outlined text-[18px] text-slate-400">keyboard_arrow_down</span>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Section</label>
                            <button className="w-full h-12 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl px-4 flex items-center justify-between text-sm font-bold text-slate-700">
                                <span>Section A (Elite)</span>
                                <span className="material-symbols-outlined text-[18px] text-slate-400">keyboard_arrow_down</span>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                            <input type="text" value="Advanced Mathem" readOnly className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none border-none truncate" />
                        </div>
                    </div>
                    
                    <button className="h-12 flex items-center gap-2 px-8 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 w-full md:w-auto shrink-0 justify-center">
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        Fetch List
                    </button>
                </div>

                {/* Info Stats & Actions Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="bg-white rounded-[24px] p-5 premium-shadow flex items-center gap-6 md:gap-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-500">Total Marks Possible</p>
                                <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">100</h3>
                            </div>
                        </div>
                        
                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                        
                        <div className="text-center hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Passing</p>
                            <h4 className="text-lg font-extrabold text-slate-800 mt-1">35</h4>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg. Class Score</p>
                            <h4 className="text-lg font-extrabold text-[#2563eb] mt-1">78.4</h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <button className="text-sm font-bold text-[#2563eb] hover:underline px-2">
                            Bulk Clear
                        </button>
                        <button className="px-6 py-3 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 premium-shadow transition-all">
                            Export Template
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-[24px] premium-shadow overflow-hidden w-full mb-8">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 md:px-8 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider w-16">#</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">ROLL NUMBER</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">STUDENT NAME</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">STATUS</th>
                                    <th className="px-6 md:px-8 py-5 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-right w-48">MARKS OBTAINED</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* Student 1 */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500">01</td>
                                    <td className="px-6 md:px-8 py-4 text-sm font-black text-slate-800">1024001</td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">AA</div>
                                            <p className="text-sm font-bold text-slate-800">Aditi Agarwal</p>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">PASSED</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 text-right">
                                        <div className="w-24 ml-auto h-10 bg-slate-50 rounded-xl flex items-center justify-center text-sm font-black text-slate-800 border border-slate-100">
                                            88
                                        </div>
                                    </td>
                                </tr>

                                {/* Student 2 */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500">02</td>
                                    <td className="px-6 md:px-8 py-4 text-sm font-black text-slate-800">1024002</td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">BT</div>
                                            <p className="text-sm font-bold text-slate-800">Brijesh Tiwari</p>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">BELOW PASS MARK</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 text-right">
                                        <div className="w-24 ml-auto h-10 bg-red-50 rounded-xl flex items-center justify-center text-sm font-black text-red-600 border border-red-200">
                                            32
                                        </div>
                                    </td>
                                </tr>

                                {/* Student 3 */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500">03</td>
                                    <td className="px-6 md:px-8 py-4 text-sm font-black text-slate-800">1024003</td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">DK</div>
                                            <p className="text-sm font-bold text-slate-800">Divya Kapoor</p>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">PASSED</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 text-right">
                                        <div className="w-24 ml-auto h-10 bg-slate-50 rounded-xl flex items-center justify-center text-sm font-black text-slate-800 border border-slate-100">
                                            95
                                        </div>
                                    </td>
                                </tr>

                                {/* Student 4 */}
                                <tr className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500">04</td>
                                    <td className="px-6 md:px-8 py-4 text-sm font-black text-slate-800">1024004</td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">HM</div>
                                            <p className="text-sm font-bold text-slate-800">Harsh Mehta</p>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PENDING</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 text-right">
                                        <div className="w-24 ml-auto h-10 bg-slate-50 rounded-xl flex items-center justify-center text-sm font-semibold text-slate-400 border border-slate-100 cursor-text">
                                            Enter
                                        </div>
                                    </td>
                                </tr>

                                {/* Student 5 */}
                                <tr className="hover:bg-slate-50/50 transition-colors border-b-0">
                                    <td className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500">05</td>
                                    <td className="px-6 md:px-8 py-4 text-sm font-black text-slate-800">1024005</td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">IK</div>
                                            <p className="text-sm font-bold text-slate-800">Ishaan Khanna</p>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">PASSED</span>
                                        </div>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 text-right">
                                        <div className="w-24 ml-auto h-10 bg-slate-50 rounded-xl flex items-center justify-center text-sm font-black text-slate-800 border border-slate-100">
                                            76
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 md:px-8 py-5 border-t border-slate-100 gap-4">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">SHOWING 1 TO 5 OF 32 STUDENTS</p>
                        <div className="flex items-center gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2563eb] text-white font-bold text-xs shadow-sm shadow-blue-500/30">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all font-bold text-xs text-slate-600">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all font-bold text-xs text-slate-600">3</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Sticky Action Footer */}
            <div className="w-full bg-[#f8fafc] md:bg-transparent h-auto md:h-24 p-4 md:px-8 flex items-center justify-end gap-4 fixed bottom-0 z-30 pointer-events-none">
                <div className="flex gap-4 pointer-events-auto bg-[#f8fafc] md:bg-transparent p-2 md:p-0 rounded-xl w-full md:w-auto justify-end">
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 premium-shadow transition-all w-full md:w-auto shrink-0">
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Save Draft
                    </button>
                    <button className="flex items-center justify-center gap-2 px-8 py-3 bg-[#2563eb] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 w-full md:w-auto shrink-0">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        Submit & Lock Marks
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Exams;
