import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddStudent = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { id: 1, title: 'Personal' },
        { id: 2, title: 'Parents' },
        { id: 3, title: 'Academic' },
        { id: 4, title: 'Address' }
    ];

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate('/students');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative pb-20">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight">New Student Admission</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Global Search..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="h-10 w-10 flex items-center justify-center bg-transparent hover:bg-slate-100 transition-colors rounded-full text-slate-600">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-[11px] font-bold text-slate-800">Admin Portal</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Super Admin</p>
                            </div>
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm cursor-pointer">
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
            <div className="p-4 sm:p-8 max-w-[1000px] mx-auto space-y-8 w-full">

                {/* Horizontal Stepper Component */}
                <div className="w-full pt-4 md:pt-8 px-4 md:px-12">
                    <div className="relative flex items-center justify-between w-full">
                        {/* Connecting Line behind steps */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 z-0"></div>
                        
                        {steps.map((step, index) => {
                            const isCompleted = step.id < currentStep;
                            const isActive = step.id === currentStep;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                    <div 
                                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all shadow-sm ${
                                            isActive || isCompleted 
                                                ? 'bg-[#2563eb] text-white' 
                                                : 'bg-slate-200 text-slate-500'
                                        }`}
                                    >
                                        {isCompleted ? <span className="material-symbols-outlined text-[18px]">check</span> : step.id}
                                    </div>
                                    <span 
                                        className={`absolute top-14 text-[11px] md:text-xs font-bold whitespace-nowrap transition-colors ${
                                            isActive ? 'text-[#2563eb]' : 'text-slate-500'
                                        }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="h-6"></div> {/* Spacer for step titles */}

                {/* Form Card content */}
                <div className="bg-white rounded-[24px] p-6 lg:p-10 premium-shadow">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Left Profile Upload Area */}
                        <div className="flex flex-col items-center mx-auto lg:mx-0 w-full lg:w-[220px] shrink-0 pt-4">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#f8fafc] flex flex-col items-center justify-center border-2 border-dashed border-[#94a3b8] group cursor-pointer hover:bg-slate-50 transition-colors">
                                <span className="material-symbols-outlined text-4xl text-[#3b82f6] mb-1 group-hover:scale-110 transition-transform disabled">add_a_photo</span>
                                <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider">Upload</span>
                                <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#2563eb] text-white flex items-center justify-center border-[3px] border-white shadow-md hover:scale-105 transition-transform z-10">
                                    <span className="material-symbols-outlined text-[16px] md:text-[20px]">edit</span>
                                </button>
                            </div>
                            <div className="text-center mt-6">
                                <h4 className="text-[15px] font-black text-slate-800">Student Photo</h4>
                                <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-relaxed">JPG, PNG up to 2MB<br/>(1:1 Ratio Preferred)</p>
                            </div>
                        </div>

                        {/* Right Input Form Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input type="text" placeholder="John Doe" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date Of Birth</label>
                                <div className="relative">
                                    <input type="text" placeholder="mm/dd/yyyy" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                <div className="relative">
                                    <select className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 appearance-none outline-none">
                                        <option value="" disabled selected className="text-slate-400">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
                                <div className="relative">
                                    <select className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-400 appearance-none outline-none">
                                        <option value="" disabled selected>Select Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="O+">O+</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Aadhar Number</label>
                                <input type="text" placeholder="0000 0000 0000" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Religion</label>
                                <input type="text" placeholder="Enter Religion" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                <div className="relative">
                                    <select className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 appearance-none outline-none">
                                        <option value="General">General</option>
                                        <option value="OBC">OBC</option>
                                        <option value="SC/ST">SC/ST</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nationality</label>
                                <input type="text" value="Indian" readOnly className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-100 text-sm font-bold text-slate-600 outline-none focus:outline-none pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Step Navigation Actions */}
                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
                        <button 
                            className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
                            onClick={handleBack}
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Back
                        </button>
                        <button 
                            className="flex items-center gap-2 px-8 py-3 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                            onClick={handleNext}
                        >
                            {currentStep === 4 ? 'Submit' : 'Next Step'}
                            <span className="material-symbols-outlined text-[18px]">{currentStep === 4 ? 'check' : 'arrow_forward'}</span>
                        </button>
                    </div>
                </div>

                {/* Support/Help Message Banner */}
                <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-[24px] p-5 sm:p-6 flex items-start sm:items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[#1e40af] mb-1">Need help?</h4>
                        <p className="text-[12px] font-medium text-[#1e40af]/80 leading-relaxed max-w-4xl">
                            Ensure all fields marked with an asterisk are filled before proceeding. You can save your progress at any time by clicking the 'Save Draft' button in the settings menu.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AddStudent;
