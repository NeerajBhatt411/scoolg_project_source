import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddTeacher = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight">Add New Teacher</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Search..."
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
            <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
                
                {/* Form Card */}
                <div className="bg-white rounded-[24px] p-6 sm:p-10 premium-shadow">
                    
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Photo Upload Section */}
                        <div className="flex flex-col items-center gap-4 lg:w-[200px] shrink-0">
                            <div className="relative w-[140px] h-[140px] rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                                <span className="material-symbols-outlined text-[48px] text-slate-400">person</span>
                                <button className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center border-2 border-white shadow-sm hover:scale-105 transition-transform">
                                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                </button>
                            </div>
                            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Upload Photo</span>
                        </div>

                        {/* Form Fields container */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Full Name</label>
                                <input type="text" placeholder="e.g. Eleanor Rigby" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Employee ID</label>
                                <input type="text" value="EMP-2024-042" readOnly className="w-full h-12 px-4 rounded-xl border-none bg-slate-200/70 text-sm font-bold text-slate-600 outline-none cursor-not-allowed" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Phone Number</label>
                                <input type="text" placeholder="+1 (555) 000-0000" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Email Address</label>
                                <input type="email" placeholder="e.g. teacher@scoolg.edu" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Highest Qualification</label>
                                <input type="text" placeholder="e.g. M.Ed, PhD" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Specialization</label>
                                <input type="text" placeholder="e.g. Quantum Physics" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Experience (Years)</label>
                                <input type="number" placeholder="0" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Date of Joining</label>
                                <div className="relative">
                                    <input type="date" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-500 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-bold text-slate-600 ml-1">Residential Address</label>
                                <input type="text" placeholder="Street, City, Zip Code" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                            </div>

                        </div>
                    </div>

                    {/* Divider Region */}
                    <div className="flex items-center gap-4 my-10">
                        <span className="text-sm font-bold text-[#1e293b] whitespace-nowrap">Subject & Class Assignment</span>
                        <div className="h-[1px] w-full bg-slate-100"></div>
                    </div>

                    {/* Subject & Class Assignment Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        
                        {/* Preferred Subjects */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#2563eb]">
                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                <span className="text-sm font-bold">Preferred Subjects</span>
                            </div>
                            <div className="min-h-[60px] p-2 bg-slate-100 rounded-2xl flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] text-white rounded-full text-xs font-bold">
                                    Mathematics
                                    <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-blue-200">close</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] text-white rounded-full text-xs font-bold">
                                    Science
                                    <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-blue-200">close</span>
                                </div>
                                <button className="flex items-center gap-1 px-4 py-2 bg-white text-[#2563eb] rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-50 transition-colors ml-1">
                                    <span className="text-[16px] leading-none">+</span> Add
                                </button>
                            </div>
                        </div>

                        {/* Assigned Classes */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[#2563eb]">
                                <span className="material-symbols-outlined text-[18px]">class</span>
                                <span className="text-sm font-bold">Assigned Classes</span>
                            </div>
                            <div className="min-h-[60px] p-2 bg-slate-100 rounded-2xl flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 px-4 py-2 bg-[#475569] text-white rounded-full text-xs font-bold">
                                    5-A
                                    <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-slate-300">close</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-4 py-2 bg-[#475569] text-white rounded-full text-xs font-bold">
                                    5-B
                                    <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-slate-300">close</span>
                                </div>
                                <button className="flex items-center gap-1 px-4 py-2 bg-transparent text-slate-500 rounded-full text-xs font-bold border border-slate-300 border-dashed hover:bg-slate-200/50 transition-colors ml-1">
                                    <span className="text-[16px] leading-none">+</span> Assign
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <button 
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                            onClick={() => navigate('/teachers')}
                        >
                            Cancel
                        </button>
                        <button className="px-8 py-3 bg-[#2563eb] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
                            Save Teacher
                        </button>
                    </div>

                </div>

                {/* System Info Banner */}
                <div className="bg-[#ffedd5] border border-[#fed7aa] p-5 rounded-2xl flex items-start sm:items-center gap-4">
                    <span className="material-symbols-outlined text-[#c2410c] mt-0.5 sm:mt-0">info</span>
                    <div>
                        <h4 className="text-sm font-bold text-[#9a3412] mb-0.5">System Generated Access</h4>
                        <p className="text-xs font-medium text-[#c2410c]/80 text-left">
                            Saving this profile will automatically generate a staff login ID and send an invitation link to the registered email address.
                        </p>
                    </div>
                </div>

                <div className="h-6"></div>
            </div>
        </>
    );
};

export default AddTeacher;
