import React from 'react';

const Dashboard = () => {
    const schoolName = localStorage.getItem('scoolg_school_name') || 'St. Andrews International';

    return (
        <>
            {/* TopNavBar Shell */}
            <header className="h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md flex justify-between items-center px-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-[2.0rem] font-extrabold text-on-surface tracking-tight">Dashboard</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative w-64 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-surface-container-high focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all text-sm"
                            placeholder="Search records..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hover:bg-[#e6e8ea] rounded-full p-2 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[#434655]">notifications</span>
                        </button>
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img
                                alt="User Avatar"
                                className="h-full w-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 space-y-8">
                {/* Welcome Section */}
                <section>
                    <h3 className="text-[28px] font-[800] text-on-surface tracking-tight">
                        Welcome back, {schoolName}!
                    </h3>
                    <p className="text-on-surface-variant font-medium mt-1">
                        Here is a quick overview of today's academic performance.
                    </p>
                </section>

                {/* Stat Cards Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-surface-container-lowest p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-primary">
                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Total Students
                            </p>
                            <h4 className="text-2xl font-extrabold text-on-surface">2,450</h4>
                            <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span>12% from last term</span>
                            </div>
                        </div>
                        <div className="p-3 bg-primary-container/10 rounded-xl text-primary">
                            <span className="material-symbols-outlined text-3xl">group</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-secondary">
                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Teachers
                            </p>
                            <h4 className="text-2xl font-extrabold text-on-surface">48</h4>
                            <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-medium text-xs">
                                <span>Active across 14 wings</span>
                            </div>
                        </div>
                        <div className="p-3 bg-secondary-container/10 rounded-xl text-secondary">
                            <span className="material-symbols-outlined text-3xl">school</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-tertiary">
                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Attendance
                            </p>
                            <h4 className="text-2xl font-extrabold text-on-surface">94%</h4>
                            <div className="flex items-center gap-1 mt-2 text-tertiary font-bold text-xs">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                <span>Above target average</span>
                            </div>
                        </div>
                        <div className="p-3 bg-tertiary-container/10 rounded-xl text-tertiary">
                            <span className="material-symbols-outlined text-3xl">fact_check</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-outline">
                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Classes
                            </p>
                            <h4 className="text-2xl font-extrabold text-on-surface">14</h4>
                            <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-medium text-xs">
                                <span>Standard 1 to 12</span>
                            </div>
                        </div>
                        <div className="p-3 bg-surface-container-high rounded-xl text-outline">
                            <span className="material-symbols-outlined text-3xl">class</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="bg-surface-container-lowest p-8 rounded-xl premium-shadow">
                    <h5 className="text-title-md text-on-surface font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">bolt</span>
                        Quick Administrative Actions
                    </h5>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="primary-gradient text-on-primary font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 scale-98 active:scale-95 transition-all shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">person_add</span>
                            <span>Admit Student</span>
                        </button>
                        <button className="bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 scale-98 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-primary">person_add_alt_1</span>
                            <span>Add Teacher</span>
                        </button>
                        <button className="bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 scale-98 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-primary">send</span>
                            <span>Send Notice</span>
                        </button>
                        <button className="bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 scale-98 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-primary">event_note</span>
                            <span>Timetable</span>
                        </button>
                    </div>
                </div>

                {/* Middle Row: Charts & Notices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Attendance Chart */}
                    <div className="bg-surface-container-lowest p-8 rounded-xl premium-shadow">
                        <div className="flex justify-between items-center mb-8">
                            <h5 className="text-title-md text-on-surface font-bold">Class Attendance</h5>
                            <button className="text-primary font-bold text-sm hover:underline">View Analytics</button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-on-surface">Class 1</span>
                                    <span className="text-primary">96%</span>
                                </div>
                                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '96%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-on-surface">Class 2</span>
                                    <span className="text-primary">88%</span>
                                </div>
                                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '88%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-on-surface">Class 3</span>
                                    <span className="text-primary">92%</span>
                                </div>
                                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: '92%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-on-surface">Class 4</span>
                                    <span className="text-primary">79%</span>
                                </div>
                                <div className="h-3 w-full bg-surface-container-low rounded-full overflow-hidden">
                                    <div className="h-full bg-error/80 rounded-full" style={{ width: '79%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notices */}
                    <div className="bg-surface-container-lowest p-8 rounded-xl premium-shadow">
                        <div className="flex justify-between items-center mb-8">
                            <h5 className="text-title-md text-on-surface font-bold">Recent Notices</h5>
                            <button className="bg-surface-container-low hover:bg-surface-container-high p-2 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-on-surface-variant text-xl">open_in_new</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">groups</span>
                                </div>
                                <div className="flex-1">
                                    <h6 className="font-bold text-on-surface text-[0.875rem]">PTM on 15 Apr</h6>
                                    <p className="text-on-surface-variant text-xs mt-0.5">Parent Teacher Meeting for Grade 5-10</p>
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant">2h ago</span>
                            </div>
                            <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                                    <span className="material-symbols-outlined">celebration</span>
                                </div>
                                <div className="flex-1">
                                    <h6 className="font-bold text-on-surface text-[0.875rem]">Holiday: Holi</h6>
                                    <p className="text-on-surface-variant text-xs mt-0.5">School will remain closed on 25th March</p>
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant">1d ago</span>
                            </div>
                            <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-secondary-container/10 flex items-center justify-center text-secondary">
                                    <span className="material-symbols-outlined">sports_basketball</span>
                                </div>
                                <div className="flex-1">
                                    <h6 className="font-bold text-on-surface text-[0.875rem]">Sports Day</h6>
                                    <p className="text-on-surface-variant text-xs mt-0.5">Annual sports meet registration is open</p>
                                </div>
                                <span className="text-xs font-bold text-on-surface-variant">3d ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Card: Recent Activity */}
                <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
                    <div className="px-8 py-6 border-b border-surface-container">
                        <h5 className="text-title-md text-on-surface font-bold">Recent Activity</h5>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[11px] uppercase font-bold text-on-surface-variant tracking-widest">
                                    <th className="px-8 py-4">Activity</th>
                                    <th className="px-8 py-4">Subject</th>
                                    <th className="px-8 py-4">Performed By</th>
                                    <th className="px-8 py-4">Time</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container/50">
                                <tr className="hover:bg-surface-container-low/40 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <span className="material-symbols-outlined text-sm">person_add</span>
                                            </div>
                                            <span className="font-bold text-[0.875rem]">New Admission</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-on-surface text-[0.875rem]">Rahul Kumar admitted</td>
                                    <td className="px-8 py-5 text-on-surface-variant text-[0.875rem]">Admin Sarah</td>
                                    <td className="px-8 py-5 text-on-surface-variant text-[0.875rem]">Just Now</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[0.875rem] font-bold text-green-600 px-3 py-1 rounded-full status-aura-success w-fit">
                                            <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                            Success
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-surface-container-low/40 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <span className="material-symbols-outlined text-sm">update</span>
                                            </div>
                                            <span className="font-bold text-[0.875rem]">Timetable Update</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-on-surface text-[0.875rem]">Class 8-B timetable updated</td>
                                    <td className="px-8 py-5 text-on-surface-variant text-[0.875rem]">Registrar Office</td>
                                    <td className="px-8 py-5 text-on-surface-variant text-[0.875rem]">45 mins ago</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[0.875rem] font-bold text-blue-600 px-3 py-1 rounded-full bg-blue-50 w-fit">
                                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                            Updated
                                        </div>
                                    </td>
                                </tr>
                                <tr className="hover:bg-surface-container-low/40 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                                <span className="material-symbols-outlined text-sm">campaign</span>
                                            </div>
                                            <span className="font-bold text-[0.875rem]">Notice Published</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-on-surface text-[0.875rem]">Annual Sports Day Announcement</td>
                                    <td className="px-8 py-5 text-on-surface-variant text-[0.875rem]">Admin Sarah</td>
                                    <td className="px-8 py-5 text-on-surface-variant text-[0.875rem]">2 hours ago</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[0.875rem] font-bold text-orange-600 px-3 py-1 rounded-full bg-orange-50 w-fit">
                                            <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                                            Public
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="px-8 py-6 bg-surface-container-low/30 border-t border-surface-container text-center">
                        <button className="text-primary font-bold text-[0.875rem] hover:underline">View All Activities</button>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 h-14 w-14 primary-gradient text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-2xl">add</span>
            </button>
        </>
    );
};

export default Dashboard;
