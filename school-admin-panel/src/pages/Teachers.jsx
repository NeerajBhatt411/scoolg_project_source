import React from 'react';
import { useNavigate } from 'react-router-dom';

const Teachers = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* TopNavBar Component */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">Teacher Management</h2>
                    <div className="flex md:hidden items-center gap-3">
                        <button className="h-9 w-9 flex items-center justify-center bg-slate-100 rounded-full">
                            <span className="material-symbols-outlined text-[20px] text-[#434655]">notifications</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[11px] font-bold text-on-surface">Admin User</p>
                                <p className="text-[9px] font-semibold text-on-surface-variant">Super Admin</p>
                            </div>
                            <div className="h-9 w-9 bg-primary text-white flex items-center justify-center rounded-full font-bold shadow-sm">
                                AD
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64 group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-xl border-none bg-surface-container-high focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all text-xs font-semibold"
                            placeholder="Search teachers..."
                            type="text"
                        />
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <button className="h-10 w-10 flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded-full">
                            <span className="material-symbols-outlined text-[20px] text-[#434655]">notifications</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs font-bold text-on-surface">Admin User</p>
                                <p className="text-[10px] font-semibold text-on-surface-variant">Super Admin</p>
                            </div>
                            <div className="h-10 w-10 bg-[#2563eb] text-white flex items-center justify-center rounded-full font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity">
                                AD
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 space-y-8 max-w-full">
                
                {/* Header Actions & Info */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-extrabold text-[#2563eb] tracking-wider uppercase mb-1">ACADEMIC STAFF</h3>
                        <p className="text-sm text-on-surface-variant">Manage faculty profiles, academic workloads, and contact information.</p>
                    </div>
                    <button 
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2563eb] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 w-full md:w-auto"
                        onClick={() => navigate('/teachers/add')}
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add Teacher
                    </button>
                </div>

                {/* Dashboard Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-surface-container-lowest p-5 rounded-2xl premium-shadow flex flex-col justify-center h-28">
                        <p className="text-xs uppercase font-bold text-on-surface-variant mb-1">TOTAL FACULTY</p>
                        <p className="text-3xl font-extrabold mt-1 text-slate-800">42</p>
                    </div>
                    <div className="bg-surface-container-lowest p-5 rounded-2xl premium-shadow flex flex-col justify-center h-28">
                        <p className="text-xs uppercase font-bold text-on-surface-variant mb-1">FULL TIME</p>
                        <p className="text-3xl font-extrabold mt-1 text-slate-800">38</p>
                    </div>
                    <div className="bg-surface-container-lowest p-5 rounded-2xl premium-shadow flex flex-col justify-center h-28">
                        <p className="text-xs uppercase font-bold text-on-surface-variant mb-1">DEPARTMENTS</p>
                        <p className="text-3xl font-extrabold mt-1 text-slate-800">8</p>
                    </div>
                    <div className="bg-surface-container-lowest p-5 rounded-2xl premium-shadow flex flex-col justify-center h-28">
                        <p className="text-xs uppercase font-bold text-on-surface-variant mb-1">ON LEAVE</p>
                        <p className="text-3xl font-extrabold mt-1 text-rose-600">2</p>
                    </div>
                </div>

                {/* Data Table Card */}
                <div className="bg-surface-container-lowest rounded-2xl premium-shadow overflow-hidden max-w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">#</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">PHOTO</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">NAME</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">EMP ID</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">SUBJECTS</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">CLASSES</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">PHONE</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider text-center">STATUS</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/60">
                                {/* Row 1 */}
                                <tr className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5 text-sm font-semibold text-slate-500">01</td>
                                    <td className="px-6 py-5">
                                        <img className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Sarah Jenkins" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-black text-slate-800">Dr. Sarah Jenkins</p>
                                        <p className="text-[11px] font-semibold text-slate-500">sarah.j@scoolg.edu</p>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold text-slate-600">T-2023-001</span></td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-1">
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">MATH</span>
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">SCIENCE</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-semibold text-slate-600">5-A, 5-B, 6-A</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-medium text-slate-600">+1 (555) 012-3456</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">ACTIVE</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>

                                {/* Row 2 */}
                                <tr className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5 text-sm font-semibold text-slate-500">02</td>
                                    <td className="px-6 py-5">
                                        <img className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Robert Sterling" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG21PCceanW_fIpHURY5Na1S7XUG5CJ9yYqrEZFetxN2l4dOgJh0Kj94X77VDhKTQzt8sBc8whnWSwQgrmXJKFsRpElI7p1rGpUH1Q7cRHSZ2V92V6cow4JdJpDvGV7C2no_IIhdn6STPOyldjPsZ7VzV-CN5LfEGge2JQ_tz7rqXBZfZLjm90MWwmfYAjH3Kv_8P4TRq6QrbPd4GlsY6djToOb9zgka5ULWhxVgcMIuMh1npTyjgtcas2eczkC7iohQ-sKuiL9YOk" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-black text-slate-800">Robert Sterling</p>
                                        <p className="text-[11px] font-semibold text-slate-500">r.sterling@scoolg.edu</p>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold text-slate-600">T-2023-014</span></td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-1">
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">HISTORY</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-semibold text-slate-600">7-B, 8-C</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-medium text-slate-600">+1 (555) 012-7890</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">ACTIVE</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>

                                {/* Row 3 */}
                                <tr className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5 text-sm font-semibold text-slate-500">03</td>
                                    <td className="px-6 py-5">
                                        <img className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Emily Watson" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBDLvVkAwu-v5ZPZ6re3O52CIX2gEI2IERoGD597MG2x-gGJ7fuyTi92D4WaHtVjsYYDjKbOrTZG8P2IC5mn_o6jt0bmgLVTw7cALqVPRVIfU3lsHLvFVgpVTiTnBIqKz95a7L-h9hLwmGH61bVVBlud3PyP9jDbjZSNt9aiL3jIGDCjxMu9lLDsfhfK-vh951Z0EsvAPGeyrJ7Qa201MmGKreUodtKZ4o7o6a-5MP6L0sUrHR1G_GW0k2LbwoXf0nGcz0bYex3_M6" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-black text-slate-800">Emily Watson</p>
                                        <p className="text-[11px] font-semibold text-slate-500">e.watson@scoolg.edu</p>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold text-slate-600">T-2022-088</span></td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-1 flex-wrap">
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">ENGLISH</span>
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">DRAMA</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-semibold text-slate-600">9-A, 10-A</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-medium text-slate-600">+1 (555) 012-1122</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">ON LEAVE</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>

                                {/* Row 4 */}
                                <tr className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5 text-sm font-semibold text-slate-500">04</td>
                                    <td className="px-6 py-5">
                                        <img className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Marcus Thorne" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvf6slgEdX9nXi1d6qzailidGAp2-qYegXvLspuHOMbu_W3ZNDyAaJddzX7PRrznx8rjNuFRWKUlD9OwDXNwME2-V_LFs99DaazgZ9cT-FFkMSEyt7fgJw8xUfTjgNTvS0bRc4X5UXmTbLLq_lTgI_qXDhTssMaI_G5rJR0bYs5iwUKe3dmg3TNGEzYVYAoHarALve9oAGPdd0YNYrS8dd3PSKdMdcyc-DkGI8_asznOA49TfbisgKS_FGC4_Ml1ag_B-nKjuwd3Qf" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-black text-slate-800">Marcus Thorne</p>
                                        <p className="text-[11px] font-semibold text-slate-500">m.thorne@scoolg.edu</p>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold text-slate-600">T-2024-005</span></td>
                                    <td className="px-6 py-5">
                                        <div className="flex gap-1">
                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100 whitespace-nowrap">COMP SCIENCE</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-semibold text-slate-600">11-A, 12-B</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-medium text-slate-600">+1 (555) 012-4433</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">ACTIVE</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-4">
                        <p className="text-xs font-semibold text-slate-500">Showing 1 to 4 of 42 entries</p>
                        <div className="flex items-center gap-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2563eb] text-white font-bold text-xs shadow-sm shadow-blue-500/30">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all font-bold text-xs text-slate-600">2</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all font-bold text-xs text-slate-600">3</button>
                            <span className="px-1 text-slate-400 text-xs">...</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all font-bold text-xs text-slate-600">11</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-all text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            {/* Footer space */}
            <div className="mt-8 mb-4 flex justify-between px-8 text-[11px] font-semibold text-slate-400 tracking-wider">
                <p>&copy; 2024 SCOOLG ACADEMIC CURATOR SYSTEM</p>
                <div className="flex gap-4">
                    <button className="hover:text-slate-600 uppercase">PRIVACY POLICY</button>
                    <button className="hover:text-slate-600 uppercase">TERMS OF SERVICE</button>
                </div>
            </div>
            <div className="h-4"></div>
        </>
    );
};

export default Teachers;
