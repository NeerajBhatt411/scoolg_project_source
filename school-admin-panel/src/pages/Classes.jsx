import React from 'react';

const Classes = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc] pb-10">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex flex-col w-full md:w-auto">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Console</p>
                    <h2 className="text-[1.3rem] md:text-[1.6rem] font-[900] text-[#2563eb] tracking-tight leading-tight">Class & Section Management</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Search classes or teachers..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="h-10 w-10 flex items-center justify-center bg-transparent hover:bg-slate-100 transition-colors rounded-full text-slate-600">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer">
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
            <div className="p-4 sm:p-8 max-w-[1200px] mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
                    <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">OVERVIEW</p>
                        <h3 className="text-2xl font-black text-slate-800">Active Classes (12)</h3>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add Class
                    </button>
                </div>

                {/* Cards List */}
                <div className="space-y-4">
                    {/* Card 1: Nursery */}
                    <div className="bg-white rounded-[24px] p-6 premium-shadow hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-full bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[28px]">child_care</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="text-xl font-bold text-slate-800">Nursery</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="material-symbols-outlined text-[16px]">group</span>
                                            <span className="text-[13px] font-semibold">60 Students</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="material-symbols-outlined text-[16px]">layers</span>
                                            <span className="text-[13px] font-semibold">2 Sections (A, B)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[#2563eb]">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-[1px] w-full bg-slate-100 my-4"></div>

                        {/* Card Footer Detail */}
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div className="flex-1 min-w-[200px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">CLASS TEACHER</p>
                                <div className="flex items-center gap-3">
                                    <img className="w-8 h-8 rounded-full object-cover" alt="Mrs. Sharma" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489" />
                                    <span className="text-sm font-bold text-slate-700">Mrs. Sharma</span>
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SUBJECTS</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">Hindi</span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">English</span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">Math</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2 md:pt-0 justify-end md:justify-start">
                                <button className="text-sm font-bold text-[#2563eb] hover:text-blue-700 transition-colors">
                                    Manage Subjects
                                </button>
                                <button className="px-5 py-2.5 bg-[#eff6ff] text-[#2563eb] font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
                                    Manage Sections
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Class 1 */}
                    <div className="bg-white rounded-[24px] p-6 premium-shadow hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#f5f3ff] text-[#6366f1] flex items-center justify-center shrink-0 border border-indigo-100 text-2xl font-black font-mono">
                                    1
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="text-xl font-bold text-slate-800">Class 1</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="material-symbols-outlined text-[16px]">group</span>
                                            <span className="text-[13px] font-semibold">75 Students</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="material-symbols-outlined text-[16px]">layers</span>
                                            <span className="text-[13px] font-semibold">3 Sections (A, B, C)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[#2563eb]">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-[1px] w-full bg-slate-100 my-4"></div>

                        {/* Card Footer Detail */}
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div className="flex-1 min-w-[200px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">CLASS TEACHER</p>
                                <div className="flex items-center gap-3">
                                    <img className="w-8 h-8 rounded-full object-cover" alt="Mr. Khanna" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvf6slgEdX9nXi1d6qzailidGAp2-qYegXvLspuHOMbu_W3ZNDyAaJddzX7PRrznx8rjNuFRWKUlD9OwDXNwME2-V_LFs99DaazgZ9cT-FFkMSEyt7fgJw8xUfTjgNTvS0bRc4X5UXmTbLLq_lTgI_qXDhTssMaI_G5rJR0bYs5iwUKe3dmg3TNGEzYVYAoHarALve9oAGPdd0YNYrS8dd3PSKdMdcyc-DkGI8_asznOA49TfbisgKS_FGC4_Ml1ag_B-nKjuwd3Qf" />
                                    <span className="text-sm font-bold text-slate-700">Mr. Khanna</span>
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SUBJECTS</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">Science</span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">EVS</span>
                                    <span className="px-3 py-1 bg-slate-200/60 text-slate-600 text-[11px] font-bold rounded-md">+4 More</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2 md:pt-0 justify-end md:justify-start">
                                <button className="text-sm font-bold text-[#2563eb] hover:text-blue-700 transition-colors">
                                    Manage Subjects
                                </button>
                                <button className="px-5 py-2.5 bg-[#eff6ff] text-[#2563eb] font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
                                    Manage Sections
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Class 2 */}
                    <div className="bg-white rounded-[24px] p-6 premium-shadow hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center shrink-0 border border-orange-100 text-2xl font-black font-mono">
                                    2
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="text-xl font-bold text-slate-800">Class 2</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="material-symbols-outlined text-[16px]">group</span>
                                            <span className="text-[13px] font-semibold">58 Students</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <span className="material-symbols-outlined text-[16px]">layers</span>
                                            <span className="text-[13px] font-semibold">2 Sections (A, B)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[#2563eb]">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-[1px] w-full bg-slate-100 my-4"></div>

                        {/* Card Footer Detail */}
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div className="flex-1 min-w-[200px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">CLASS TEACHER</p>
                                <div className="flex items-center gap-3">
                                    <img className="w-8 h-8 rounded-full object-cover" alt="Ms. Verma" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBDLvVkAwu-v5ZPZ6re3O52CIX2gEI2IERoGD597MG2x-gGJ7fuyTi92D4WaHtVjsYYDjKbOrTZG8P2IC5mn_o6jt0bmgLVTw7cALqVPRVIfU3lsHLvFVgpVTiTnBIqKz95a7L-h9hLwmGH61bVVBlud3PyP9jDbjZSNt9aiL3jIGDCjxMu9lLDsfhfK-vh951Z0EsvAPGeyrJ7Qa201MmGKreUodtKZ4o7o6a-5MP6L0sUrHR1G_GW0k2LbwoXf0nGcz0bYex3_M6" />
                                    <span className="text-sm font-bold text-slate-700">Ms. Verma</span>
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">SUBJECTS</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">Geometry</span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">Arts</span>
                                    <span className="px-3 py-1 bg-slate-200/60 text-slate-600 text-[11px] font-bold rounded-md">+3 More</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2 md:pt-0 justify-end md:justify-start">
                                <button className="text-sm font-bold text-[#2563eb] hover:text-blue-700 transition-colors">
                                    Manage Subjects
                                </button>
                                <button className="px-5 py-2.5 bg-[#eff6ff] text-[#2563eb] font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
                                    Manage Sections
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-8">
                    <div className="bg-white p-5 sm:p-6 rounded-3xl premium-shadow flex flex-col justify-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[16px]">assignment</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Students</p>
                        <h4 className="text-2xl font-extrabold text-slate-800">1,248</h4>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-3xl premium-shadow flex flex-col justify-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Staff Members</p>
                        <h4 className="text-2xl font-extrabold text-slate-800">84</h4>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-3xl premium-shadow flex flex-col justify-center">
                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[16px]">domain_add</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Active Sections</p>
                        <h4 className="text-2xl font-extrabold text-slate-800">42</h4>
                    </div>

                    <div className="bg-white p-5 sm:p-6 rounded-3xl premium-shadow flex flex-col justify-center relative overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Vacancy</p>
                        <h4 className="text-2xl font-extrabold text-slate-800">12</h4>
                    </div>
                </div>

            </div>

            {/* Floating Help Button */}
            <button className="fixed bottom-8 right-8 w-12 h-12 bg-[#1e293b] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-slate-800 hover:scale-105 transition-all z-50">
                <span className="material-symbols-outlined text-[20px]">help_outline</span>
            </button>
        </div>
    );
};

export default Classes;
