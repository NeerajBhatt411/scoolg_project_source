export default function MobileApps() {
    return (
        <section id="apps" className="py-24 bg-white transition-colors duration-300 dark:bg-slate-950 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <span className="text-primary font-semibold tracking-wider uppercase text-sm dark:text-blue-400">Mobile First</span>
                    <h2 className="mt-2 text-3xl font-display font-bold text-gray-900 sm:text-4xl dark:text-white">Apps tailored for every role</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">Dedicated mobile experiences designed specifically for the needs of each user.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Student & Parent Role */}
                    <div className="flex flex-col items-center group">
                        <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl mb-8 overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500 dark:bg-black dark:border-slate-800">
                            <div className="bg-gray-50 w-full h-full pt-8 px-4 dark:bg-slate-950">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20 dark:bg-slate-800"></div>
                                <div className="flex justify-between items-center mb-6 mt-4">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                        <img src="/logo.png" alt="Logo" className="w-full h-auto" />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">SCoolG</span>
                                    <span className="material-symbols-outlined text-gray-400">settings</span>
                                </div>
                                <div className="bg-primary rounded-2xl p-4 text-white mb-4 shadow-lg shadow-primary/30">
                                    <p className="text-sm opacity-90">Daily Progress</p>
                                    <h3 className="text-2xl font-bold">Excellent</h3>
                                    <div className="h-1 bg-white/30 rounded mt-2 overflow-hidden">
                                        <div className="h-full bg-white w-[92%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 dark:bg-slate-900 dark:border dark:border-slate-800">
                                        <div className="p-2 bg-orange-100 rounded-lg text-orange-500 material-symbols-outlined text-sm dark:bg-orange-900/30 dark:text-orange-400">assignment</div>
                                        <div className="text-xs">
                                            <div className="font-bold dark:text-white">New Homework</div>
                                            <div className="text-gray-400">Physics - Unit 4</div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 dark:bg-slate-900 dark:border dark:border-slate-800">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-500 material-symbols-outlined text-sm dark:bg-green-900/30 dark:text-green-400">payments</div>
                                        <div className="text-xs">
                                            <div className="font-bold dark:text-white">Fee Reminder</div>
                                            <div className="text-gray-400">Term 3 Balance</div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 dark:bg-slate-900 dark:border dark:border-slate-800">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-500 material-symbols-outlined text-sm dark:bg-blue-900/30 dark:text-blue-400">equalizer</div>
                                        <div className="text-xs">
                                            <div className="font-bold dark:text-white">Monthly Results</div>
                                            <div className="text-gray-400">A+ in Mathematics</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Student & Parent Dashboard</h3>
                        <ul className="mt-4 text-gray-600 text-sm space-y-2 text-left dark:text-gray-400">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base dark:text-blue-400">check</span> Track attendance & homework</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base dark:text-blue-400">check</span> Pay school fees & view results</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base dark:text-blue-400">check</span> Direct connection with teachers</li>
                        </ul>
                    </div>

                    {/* Teacher Role */}
                    <div className="flex flex-col items-center group">
                        <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl mb-8 overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-500 dark:bg-black dark:border-slate-800">
                            <div className="bg-gray-50 v-full h-full pt-8 px-4 dark:bg-slate-950">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20 dark:bg-slate-800"></div>
                                <div className="flex justify-between items-center mb-6 mt-4">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                                        <img src="/logo.png" alt="Logo" className="w-full h-auto contrast-125" />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-white">SCoolG</span>
                                    <span className="material-symbols-outlined text-gray-400">settings</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center h-24 dark:bg-slate-900 dark:border dark:border-slate-800">
                                        <span className="material-symbols-outlined text-primary mb-1 dark:text-blue-400">class</span>
                                        <span className="text-xs font-bold dark:text-white">Attendance</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center h-24 dark:bg-slate-900 dark:border dark:border-slate-800">
                                        <span className="material-symbols-outlined text-purple-500 mb-1 dark:text-purple-400">edit_note</span>
                                        <span className="text-xs font-bold dark:text-white">Grade</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-primary dark:bg-slate-900 dark:border-l-blue-500 dark:border-t dark:border-r dark:border-b dark:border-slate-800">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Next Class</p>
                                    <h4 className="font-bold text-sm dark:text-white">Physics - Class 10A</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">10:00 AM - 11:00 AM</p>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h3>
                        <ul className="mt-4 text-gray-600 text-sm space-y-2 text-left dark:text-gray-400">
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base dark:text-blue-400">check</span> Mark attendance in seconds</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base dark:text-blue-400">check</span> Upload homework & materials</li>
                            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base dark:text-blue-400">check</span> Manage class schedule</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
