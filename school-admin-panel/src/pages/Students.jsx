import React from 'react';
import { useNavigate } from 'react-router-dom';

const Students = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* TopNavBar Component (same as Dashboard) */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">Students</h2>
                    <div className="flex md:hidden items-center gap-3">
                        <button className="h-9 w-9 flex items-center justify-center bg-slate-100 rounded-full">
                            <span className="material-symbols-outlined text-[20px] text-[#434655]">notifications</span>
                        </button>
                        <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img
                                alt="User Avatar"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHgLzAW4q9gKYtvpNlK9SDBOmEmZz_cbEGEcME0yuZXD71yssyHMP13nfuOD4qP1vztDL0ZoCvw1CmCEgHBiWXvvviZ-7FGhK6plEy587L9lEQKffCVIqQA4SWKS0-hxXVpCcVvnnCfwC0nbrOoSz6GsCX7ZbdvRQM4dY9W2eE8uFyaO0Hwx89fnLwF0ynHHsxREW2jn5OWmvBy-hTc3OsUn9M47f0ADOiTkqrl-pw5XT_-8QgssdjtypuBEOaxitVXKoX5_Jp5489"
                            />
                        </div>
                    </div>
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
            <div className="p-4 sm:p-8 space-y-6 max-w-full">
                {/* Page Actions Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <span className="material-symbols-outlined text-primary">group</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">2,450 Total Students</h3>
                            <p className="text-sm text-on-surface-variant font-medium">Academic Year 2023-24</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <button className="flex items-center justify-center gap-2 px-5 py-3 border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all active:scale-95 premium-shadow w-full sm:w-auto">
                            <span className="material-symbols-outlined text-[20px]">ios_share</span>
                            Export CSV
                        </button>
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
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Class</label>
                        <select className="w-full h-11 px-3 bg-surface-container-low border-none rounded-xl text-xs font-semibold outline-none appearance-none">
                            <option>All Classes</option>
                            <option>Grade 10</option>
                            <option>Grade 11</option>
                            <option>Grade 12</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Section</label>
                        <select className="w-full h-11 px-3 bg-surface-container-low border-none rounded-xl text-xs font-semibold outline-none appearance-none">
                            <option>All Sections</option>
                            <option>A</option>
                            <option>B</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Status</label>
                        <select className="w-full h-11 px-3 bg-surface-container-low border-none rounded-xl text-xs font-semibold outline-none appearance-none">
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                    <div className="hidden lg:block space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Gender</label>
                        <select className="w-full h-11 px-3 bg-surface-container-low border-none rounded-xl text-xs font-semibold outline-none appearance-none">
                            <option>All</option>
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                    </div>
                    <button className="col-span-1 lg:col-span-1 mt-auto h-11 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all flex items-center gap-2 justify-center">
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        Filter
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
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider">Class</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider hidden lg:table-cell">Father's Name</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider hidden md:table-cell">Admission Date</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-extrabold text-on-surface-variant tracking-wider text-right">Actions</th>
                                </tr>

                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                <tr className="group hover:bg-[#f8fafc] transition-colors">
                                    <td className="px-6 py-5 text-sm font-bold text-outline hidden sm:table-cell">01</td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Julian Dasher"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG21PCceanW_fIpHURY5Na1S7XUG5CJ9yYqrEZFetxN2l4dOgJh0Kj94X77VDhKTQzt8sBc8whnWSwQgrmXJKFsRpElI7p1rGpUH1Q7cRHSZ2V92V6cow4JdJpDvGV7C2no_IIhdn6STPOyldjPsZ7VzV-CN5LfEGge2JQ_tz7rqXBZfZLjm90MWwmfYAjH3Kv_8P4TRq6QrbPd4GlsY6djToOb9zgka5ULWhxVgcMIuMh1npTyjgtcas2eczkC7iohQ-sKuiL9YOk"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-on-surface">Julian Dasher</p>
                                                <p className="text-[11px] font-medium text-on-surface-variant">ID: SC-2023-882</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold">12 - Section A</span></td>
                                    <td className="px-6 py-5 hidden lg:table-cell"><span className="text-sm font-medium text-on-surface-variant">Robert Dasher</span></td>
                                    <td className="px-6 py-5 hidden md:table-cell"><span className="text-sm font-medium text-on-surface-variant">Aug 12, 2023</span></td>

                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                            <span className="text-[11px] font-bold text-emerald-700">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="group hover:bg-[#f8fafc] transition-colors">
                                    <td className="px-6 py-5 text-sm font-bold text-outline hidden sm:table-cell">02</td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Aria Montgomery"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBDLvVkAwu-v5ZPZ6re3O52CIX2gEI2IERoGD597MG2x-gGJ7fuyTi92D4WaHtVjsYYDjKbOrTZG8P2IC5mn_o6jt0bmgLVTw7cALqVPRVIfU3lsHLvFVgpVTiTnBIqKz95a7L-h9hLwmGH61bVVBlud3PyP9jDbjZSNt9aiL3jIGDCjxMu9lLDsfhfK-vh951Z0EsvAPGeyrJ7Qa201MmGKreUodtKZ4o7o6a-5MP6L0sUrHR1G_GW0k2LbwoXf0nGcz0bYex3_M6"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-on-surface">Aria Montgomery</p>
                                                <p className="text-[11px] font-medium text-on-surface-variant">ID: SC-2023-412</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold">10 - Section B</span></td>
                                    <td className="px-6 py-5 hidden lg:table-cell"><span className="text-sm font-medium text-on-surface-variant">Byron Montgomery</span></td>
                                    <td className="px-6 py-5 hidden md:table-cell"><span className="text-sm font-medium text-on-surface-variant">Sep 05, 2023</span></td>

                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                            <span className="text-[11px] font-bold text-emerald-700">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="group hover:bg-[#f8fafc] transition-colors">
                                    <td className="px-6 py-5 text-sm font-bold text-outline hidden sm:table-cell">03</td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Kaelen Smith"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxUP_5VqWNhH6Qdx8Qv9er16J5rpfPrMnib0jjnSqqm1J7g43XCCXfi-L5NzAtnQO_ogv63bPXylC5YBuHThWp8-Or1rC9RXDMW2JRpYsayy2QWYj5b2BQ29oyGxycAOBj5xsGMzhx9rqr-RTkgzbuz7G3tuuT4V-TbXK4Ps1uGzukb6lQt-Nrl9cqDNyykM0zBmWXTU_XJ0X6EhsDTyv4Gq6AUI69Lm68R0h1G0SjVFEX7CQZN7almYv542jDmB49UfJBpPJJTjvN"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-on-surface">Kaelen Smith</p>
                                                <p className="text-[11px] font-medium text-on-surface-variant">ID: SC-2023-901</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold">12 - Section A</span></td>
                                    <td className="px-6 py-5 hidden lg:table-cell"><span className="text-sm font-medium text-on-surface-variant">Marcus Smith</span></td>
                                    <td className="px-6 py-5 hidden md:table-cell"><span className="text-sm font-medium text-on-surface-variant">Aug 15, 2023</span></td>

                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/50 border border-rose-200/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                                            <span className="text-[11px] font-bold text-rose-700">Inactive</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="group hover:bg-[#f8fafc] transition-colors">
                                    <td className="px-6 py-5 text-sm font-bold text-outline hidden sm:table-cell">04</td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img
                                                className="w-10 h-10 rounded-full object-cover"
                                                alt="Lucas Chen"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvf6slgEdX9nXi1d6qzailidGAp2-qYegXvLspuHOMbu_W3ZNDyAaJddzX7PRrznx8rjNuFRWKUlD9OwDXNwME2-V_LFs99DaazgZ9cT-FFkMSEyt7fgJw8xUfTjgNTvS0bRc4X5UXmTbLLq_lTgI_qXDhTssMaI_G5rJR0bYs5iwUKe3dmg3TNGEzYVYAoHarALve9oAGPdd0YNYrS8dd3PSKdMdcyc-DkGI8_asznOA49TfbisgKS_FGC4_Ml1ag_B-nKjuwd3Qf"
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-on-surface">Lucas Chen</p>
                                                <p className="text-[11px] font-medium text-on-surface-variant">ID: SC-2023-112</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><span className="text-sm font-semibold">11 - Section C</span></td>
                                    <td className="px-6 py-5 hidden lg:table-cell"><span className="text-sm font-medium text-on-surface-variant">David Chen</span></td>
                                    <td className="px-6 py-5 hidden md:table-cell"><span className="text-sm font-medium text-on-surface-variant">Oct 02, 2023</span></td>

                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200/50">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                            <span className="text-[11px] font-bold text-emerald-700">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-5 border-t border-outline-variant/10 gap-3">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Showing 1-20 of 2,450 students</p>
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-all text-on-surface-variant">
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold premium-shadow">1</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-transparent hover:bg-surface-container-high transition-all font-bold">2</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-transparent hover:bg-surface-container-high transition-all font-bold">3</button>
                            <span className="px-2 text-outline">...</span>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-transparent hover:bg-surface-container-high transition-all font-bold">122</button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-all text-on-surface-variant">
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats Summary (Bento Style) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex flex-col justify-between h-40">

                        <span className="material-symbols-outlined text-primary text-3xl">male</span>
                        <div>
                            <p className="text-2xl font-extrabold">1,280</p>
                            <p className="text-[11px] uppercase font-bold text-on-surface-variant mt-1">Male Students</p>
                        </div>
                    </div>
                    <div className="md:col-span-1 bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex flex-col justify-between h-40">

                        <span className="material-symbols-outlined text-rose-500 text-3xl">female</span>
                        <div>
                            <p className="text-2xl font-extrabold">1,170</p>
                            <p className="text-[11px] uppercase font-bold text-on-surface-variant mt-1">Female Students</p>
                        </div>
                    </div>
                    <div className="md:col-span-2 bg-gradient-to-br from-primary to-[#2563eb] p-6 rounded-xl premium-shadow text-white flex justify-between items-center">
                        <div>
                            <h4 className="text-xl font-bold mb-1">New Enrollments</h4>
                            <p className="text-sm opacity-80 font-medium">Tracking students admitted this month</p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-extrabold">+42</span>
                                    <span className="text-[10px] uppercase font-bold opacity-70">This Month</span>
                                </div>
                                <div className="h-8 w-[1px] bg-white/20"></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-extrabold">12%</span>
                                    <span className="text-[10px] uppercase font-bold opacity-70">Growth Rate</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                            <span className="material-symbols-outlined text-4xl">trending_up</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-auto h-12"></div>
        </>
    );
};

export default Students;
