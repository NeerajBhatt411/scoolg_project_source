import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';

const AddTeacher = () => {
    const navigate = useNavigate();
    const { refreshTeachers } = useAdmin();
    const [currentStep, setCurrentStep] = useState(1);
    const schoolName = localStorage.getItem('scoolg_school_name') || 'Admin Portal';
    const schoolId = localStorage.getItem('scoolg_school_id'); 
    const today = new Date().toISOString().split('T')[0];
    
    // Check if missing
    if (!schoolId) {
        console.warn("scoolg_school_id not found in localStorage. Submission may fail.");
    }

    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        gender: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        residentialAddress: '',
        highestQualification: '',
        specialization: '',
        experienceYears: '',
        dateOfJoining: '',
        profileImageUrl: ''
    });

    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [errors, setErrors] = useState({});

    const steps = [
        { id: 1, title: 'Personal' },
        { id: 2, title: 'Contact' },
        { id: 3, title: 'Professional' },
        { id: 4, title: 'Review' }
    ];

    const handleInputChange = (field, value) => {
        let nextValue = value;

        if (field === 'phone') {
            nextValue = value.replace(/\D/g, '').slice(0, 10);
        }

        if (field === 'experienceYears') {
            nextValue = value === '' ? '' : value.replace(/[^\d]/g, '');
        }

        setFormData(prev => ({ ...prev, [field]: nextValue }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setPreviewPhoto(dataUrl);
                    setFormData(prev => ({ ...prev, profileImageUrl: dataUrl }));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const validateStep = (step) => {
        const newErrors = {};
        const trimmedFullName = formData.fullName.trim();
        const trimmedAddress = formData.residentialAddress.trim();
        const trimmedQualification = formData.highestQualification.trim();
        const trimmedSpecialization = formData.specialization.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (step === 1) {
            if (!trimmedFullName || trimmedFullName.length < 2) newErrors.fullName = "Full Name is required";
            if (!formData.gender) newErrors.gender = "Gender is required";
            if (!formData.dateOfBirth) {
                newErrors.dateOfBirth = "Date of Birth is required";
            } else {
                const dob = new Date(formData.dateOfBirth);
                if (Number.isNaN(dob.getTime()) || formData.dateOfBirth > today) {
                    newErrors.dateOfBirth = "Please enter a valid date of birth.";
                } else {
                    const todayDate = new Date();
                    let age = todayDate.getFullYear() - dob.getFullYear();
                    const m = todayDate.getMonth() - dob.getMonth();
                    if (m < 0 || (m === 0 && todayDate.getDate() < dob.getDate())) {
                        age--;
                    }
                    if (age < 18) {
                        newErrors.dateOfBirth = "Teacher must be at least 18 years old.";
                    }
                }
            }
        } else if (step === 2) {
            if (!formData.phone) {
                newErrors.phone = "Phone number is required";
            } else {
                const digits = formData.phone.replace(/\D/g, '');
                if (digits.length !== 10) {
                    newErrors.phone = "Phone number must be exactly 10 digits.";
                }
            }
            if (formData.email) {
                if (!emailRegex.test(formData.email)) {
                    newErrors.email = "Please enter a valid email address.";
                }
            }
            if (!trimmedAddress || trimmedAddress.length < 5) newErrors.residentialAddress = "Address is required";
        } else if (step === 3) {
            if (!trimmedQualification) newErrors.highestQualification = "Qualification is required";
            if (!trimmedSpecialization) newErrors.specialization = "Specialization is required";
            if (formData.experienceYears === '' || formData.experienceYears === null || formData.experienceYears === undefined) {
                newErrors.experienceYears = "Experience is required";
            } else if (Number(formData.experienceYears) < 0) {
                newErrors.experienceYears = "Experience cannot be negative.";
            }
            if (!formData.dateOfJoining) {
                newErrors.dateOfJoining = "Date of joining is required";
            } else if (formData.dateOfJoining > today) {
                newErrors.dateOfJoining = "Date of joining cannot be in the future.";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 ? true : Object.values(newErrors)[0];
    };

    const isStepValid = (step) => {
        const trimmedFullName = formData.fullName.trim();
        const trimmedAddress = formData.residentialAddress.trim();
        const trimmedQualification = formData.highestQualification.trim();
        const trimmedSpecialization = formData.specialization.trim();
        const emailValid = !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

        if (step === 1) {
            if (!trimmedFullName || trimmedFullName.length < 2 || !formData.gender || !formData.dateOfBirth || formData.dateOfBirth > today) {
                return false;
            }

            const dob = new Date(formData.dateOfBirth);
            if (Number.isNaN(dob.getTime())) return false;

            const todayDate = new Date();
            let age = todayDate.getFullYear() - dob.getFullYear();
            const monthOffset = todayDate.getMonth() - dob.getMonth();
            if (monthOffset < 0 || (monthOffset === 0 && todayDate.getDate() < dob.getDate())) {
                age--;
            }
            return age >= 18;
        }

        if (step === 2) {
            return /^\d{10}$/.test(formData.phone) && emailValid && trimmedAddress.length >= 5;
        }

        if (step === 3) {
            return Boolean(
                trimmedQualification &&
                trimmedSpecialization &&
                formData.experienceYears !== '' &&
                Number(formData.experienceYears) >= 0 &&
                formData.dateOfJoining &&
                formData.dateOfJoining <= today
            );
        }

        return true;
    };

    const handleNext = async () => {
        if (currentStep < 4) {
            const validationResult = validateStep(currentStep);
            if (validationResult === true) {
                setCurrentStep(currentStep + 1);
            } else {
                alert(validationResult);
            }
        } else {
            if (!schoolId) {
                alert("School ID is missing. Please log in again.");
                return;
            }
            setIsLoading(true);
            try {
                const res = await axios.post(`${ADMIN_API_BASE}/teachers`, {
                    ...formData,
                    schoolId
                });
                if (res.data && res.data.appCredentials) {
                    setSuccessData(res.data);
                    refreshTeachers(); // keep shared teacher cache fresh for timetable, etc.
                }
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.error || "Failed to register teacher. Check console or make sure all required fields are filled.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate('/teachers');
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative pb-20">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight">Add New Teacher</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-bold text-slate-800" title={schoolName}>
                                {schoolName.length > 20 ? schoolName.substring(0, 18) + '...' : schoolName}
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">School Admin</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-slate-500">
                            <span className="material-symbols-outlined text-xl">account_circle</span>
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
                        
                        {steps.map((step) => {
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

                {/* SUCCESS MESSAGE UI */}
                {successData ? (
                    <div className="bg-white rounded-[24px] p-6 lg:p-12 premium-shadow text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Teacher Added Successfully!</h2>
                        <p className="text-slate-500 font-medium mb-8">The faculty portal credentials have been generated automatically.</p>
                        
                        <div className="max-w-sm mx-auto bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left shadow-inner">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Portal Credentials</h4>
                            
                            <div className="mb-4">
                                <span className="text-[10px] text-slate-500 font-bold block mb-1">APP ID / LOGIN ID</span>
                                <div className="text-lg font-black text-slate-800 tracking-wider font-mono">{successData.appCredentials.teacherAppId}</div>
                            </div>
                            
                            <div className="mb-2">
                                <span className="text-[10px] text-slate-500 font-bold block mb-1">PASSWORD</span>
                                <div className="text-lg font-black text-blue-600 tracking-wider font-mono">{successData.appCredentials.password}</div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button 
                                onClick={() => navigate('/teachers')}
                                className="px-8 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                            >
                                Back to Faculty List
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form Card content */
                    <div className="bg-white rounded-[24px] p-6 lg:p-10 premium-shadow">
                        <div className="flex flex-col lg:flex-row gap-10">
                            
                            {/* Left Profile Upload Area (Only for Step 1) */}
                            {currentStep === 1 && (
                                <div className="flex flex-col items-center mx-auto lg:mx-0 w-full lg:w-[220px] shrink-0 pt-4">
                                    <label htmlFor="photoUpload" className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#f8fafc] flex flex-col items-center justify-center border-2 border-dashed border-[#94a3b8] group cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden">
                                        {previewPhoto ? (
                                            <img src={previewPhoto} alt="Teacher" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-4xl text-[#3b82f6] mb-1 group-hover:scale-110 transition-transform">add_a_photo</span>
                                                <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider">Upload</span>
                                            </>
                                        )}
                                        <input id="photoUpload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                    </label>
                                    <div className="text-center mt-6">
                                        <h4 className="text-[15px] font-black text-slate-800">Teacher Photo</h4>
                                        <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-relaxed">Optional visual avatar</p>
                                    </div>
                                </div>
                            )}

                            {/* Right Input Form Grid */}
                            <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full ${currentStep !== 1 ? 'lg:col-span-2' : ''}`}>
                                
                                {/* --- STEP 1: PERSONAL --- */}
                                {currentStep === 1 && (
                                    <>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input value={formData.fullName} onChange={e=>handleInputChange('fullName', e.target.value)} type="text" placeholder="John Doe" className={`w-full h-12 px-4 rounded-xl border ${errors.fullName ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date Of Birth <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="date" max={today} value={formData.dateOfBirth} onChange={e=>handleInputChange('dateOfBirth', e.target.value)} className={`w-full h-12 px-4 rounded-xl border ${errors.dateOfBirth ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gender <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <select value={formData.gender} onChange={e=>handleInputChange('gender', e.target.value)} className={`w-full h-12 px-4 rounded-xl border ${errors.gender ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`}>
                                                <option value="" disabled>Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {/* --- STEP 2: CONTACT --- */}
                                {currentStep === 2 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Primary Phone Number <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="tel" value={formData.phone} onChange={e=>handleInputChange('phone', e.target.value)} placeholder="9999999999" className={`w-full h-12 px-4 rounded-xl border ${errors.phone ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address (Optional)</label>
                                            <input type="email" value={formData.email} onChange={e=>handleInputChange('email', e.target.value)} placeholder="teacher@email.com" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none" />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Residential Address <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <textarea value={formData.residentialAddress} onChange={e=>handleInputChange('residentialAddress', e.target.value)} rows="3" placeholder="Full residential physical address" className={`w-full p-4 rounded-xl border ${errors.residentialAddress ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none resize-none`}></textarea>
                                        </div>
                                    </>
                                )}

                                {/* --- STEP 3: PROFESSIONAL --- */}
                                {currentStep === 3 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Highest Qualification <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="text" value={formData.highestQualification} onChange={e=>handleInputChange('highestQualification', e.target.value)} placeholder="e.g. M.Ed, PhD" className={`w-full h-12 px-4 rounded-xl border ${errors.highestQualification ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Specialization <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="text" value={formData.specialization} onChange={e=>handleInputChange('specialization', e.target.value)} placeholder="e.g. Mathematics" className={`w-full h-12 px-4 rounded-xl border ${errors.specialization ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Experience (Years) <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="number" min="0" step="1" value={formData.experienceYears} onChange={e=>handleInputChange('experienceYears', e.target.value)} placeholder="e.g. 5" className={`w-full h-12 px-4 rounded-xl border ${errors.experienceYears ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Joining <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="date" max={today} value={formData.dateOfJoining} onChange={e=>handleInputChange('dateOfJoining', e.target.value)} className={`w-full h-12 px-4 rounded-xl border ${errors.dateOfJoining ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                    </>
                                )}

                                {/* --- STEP 4: REVIEW --- */}
                                {currentStep === 4 && (
                                    <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Review Details</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Name</span>{formData.fullName}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Gender</span>{formData.gender}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Phone</span>{formData.phone}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Email</span>{formData.email || 'N/A'}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Qualification</span>{formData.highestQualification}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Specialization</span>{formData.specialization}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Experience</span>{formData.experienceYears} Years</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Joining Date</span>{formData.dateOfJoining}</div>
                                        </div>
                                        <p className="mt-4 text-xs text-slate-500">Please review all fields. Upon submission, system will generate login credentials for the teacher app.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step Navigation Actions */}
                        <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
                            <button 
                                className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
                                onClick={handleBack}
                                disabled={isLoading}
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back
                            </button>
                            <button 
                                className={`flex items-center gap-2 px-8 py-3 font-bold text-sm rounded-xl transition-all active:scale-95 ${
                                    !isStepValid(currentStep) 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                    : (currentStep === 4 ? 'bg-green-600 text-white hover:shadow-green-500/30 hover:shadow-lg' : 'bg-[#2563eb] text-white hover:shadow-blue-500/30 hover:shadow-lg')
                                }`}
                                onClick={handleNext}
                                disabled={isLoading || !isStepValid(currentStep)}
                            >
                                {isLoading ? 'Processing...' : (currentStep === 4 ? 'Confirm & Add' : 'Next Step')}
                                {!isLoading && <span className="material-symbols-outlined text-[18px]">{currentStep === 4 ? 'check' : 'arrow_forward'}</span>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddTeacher;
