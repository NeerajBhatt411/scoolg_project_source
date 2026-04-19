import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddStudent = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const schoolName = localStorage.getItem('scoolg_school_name') || 'Admin Portal';
    const schoolId = localStorage.getItem('scoolg_school_id'); // Ensure login saves this
    
    // Check if missing
    if (!schoolId) {
        console.warn("scoolg_school_id not found in localStorage. Submission may fail.");
    }

    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        aadhaarNumber: '',
        religionOrCategory: '',
        fatherName: '',
        motherName: '',
        primaryContact: '',
        parentEmail: '',
        currentAddress: '',
        class: '',
        section: '',
        admissionNumber: '',
        rollNumber: '',
        dateOfAdmission: '',
        profileImageUrl: ''
    });

    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [errors, setErrors] = useState({});

    const steps = [
        { id: 1, title: 'Personal' },
        { id: 2, title: 'Parents' },
        { id: 3, title: 'Academic' },
        { id: 4, title: 'Review' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
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
                    // Create a canvas to resize the image
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

                    // Convert to compressed jpeg
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
        if (step === 1) {
            if (!formData.firstName) newErrors.firstName = true;
            if (!formData.lastName) newErrors.lastName = true;
            if (!formData.dateOfBirth) newErrors.dateOfBirth = true;
            if (!formData.gender) newErrors.gender = true;
        } else if (step === 2) {
            if (!formData.fatherName) newErrors.fatherName = true;
            if (!formData.motherName) newErrors.motherName = true;
            if (!formData.primaryContact) newErrors.primaryContact = true;
        } else if (step === 3) {
            if (!formData.class) newErrors.class = true;
            if (!formData.section) newErrors.section = true;
            if (!formData.rollNumber) newErrors.rollNumber = true;
            if (!formData.dateOfAdmission) newErrors.dateOfAdmission = true;
            if (!formData.currentAddress) newErrors.currentAddress = true;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (currentStep < 4) {
            if (validateStep(currentStep)) {
                setCurrentStep(currentStep + 1);
            } else {
                // Flash error or alert
                alert("Please fill all required fields marked with *");
            }
        } else {
            // Step 4 = Submit
            if (!schoolId) {
                alert("School ID is missing. Please log in again.");
                return;
            }
            setIsLoading(true);
            try {
                // Ensure we use the proper API BASE URL 
                const API_URL = 'https://scoolg-backend.netlify.app/api/admin/students';
                const res = await axios.post(API_URL, {
                    ...formData,
                    schoolId
                });
                if (res.data && res.data.appCredentials) {
                    setSuccessData(res.data);
                }
            } catch (err) {
                console.error(err);
                alert("Failed to register student. Check console or make sure all required * fields are filled.");
            } finally {
                setIsLoading(false);
            }
        }
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
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Student Admitted Successfully!</h2>
                        <p className="text-slate-500 font-medium mb-8">The student portal credentials have been generated automatically.</p>
                        
                        <div className="max-w-sm mx-auto bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left shadow-inner">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Portal Credentials</h4>
                            
                            <div className="mb-4">
                                <span className="text-[10px] text-slate-500 font-bold block mb-1">APP ID / LOGIN ID</span>
                                <div className="text-lg font-black text-slate-800 tracking-wider font-mono">{successData.appCredentials.studentAppId}</div>
                            </div>
                            
                            <div className="mb-2">
                                <span className="text-[10px] text-slate-500 font-bold block mb-1">PASSWORD</span>
                                <div className="text-lg font-black text-blue-600 tracking-wider font-mono">{successData.appCredentials.password}</div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button 
                                onClick={() => navigate('/students')}
                                className="px-8 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
                            >
                                Back to Directory
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
                                            <img src={previewPhoto} alt="Student" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-4xl text-[#3b82f6] mb-1 group-hover:scale-110 transition-transform">add_a_photo</span>
                                                <span className="text-[10px] font-bold text-[#3b82f6] uppercase tracking-wider">Upload</span>
                                            </>
                                        )}
                                        <input id="photoUpload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                    </label>
                                    <div className="text-center mt-6">
                                        <h4 className="text-[15px] font-black text-slate-800">Student Photo</h4>
                                        <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-relaxed">Optional visual avatar</p>
                                    </div>
                                </div>
                            )}

                            {/* Right Input Form Grid */}
                            <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full ${currentStep !== 1 ? 'lg:col-span-2' : ''}`}>
                                
                                {/* --- STEP 1: PERSONAL --- */}
                                {currentStep === 1 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">First Name <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input value={formData.firstName} onChange={e=>handleInputChange('firstName', e.target.value)} type="text" placeholder="John" className={`w-full h-12 px-4 rounded-xl border ${errors.firstName ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Last Name <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input value={formData.lastName} onChange={e=>handleInputChange('lastName', e.target.value)} type="text" placeholder="Doe" className={`w-full h-12 px-4 rounded-xl border ${errors.lastName ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date Of Birth <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="date" value={formData.dateOfBirth} onChange={e=>handleInputChange('dateOfBirth', e.target.value)} className={`w-full h-12 px-4 rounded-xl border ${errors.dateOfBirth ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
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

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
                                            <select value={formData.bloodGroup} onChange={e=>handleInputChange('bloodGroup', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none">
                                                <option value="" disabled>Select Group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Aadhaar / ID Number</label>
                                            <input type="text" value={formData.aadhaarNumber} onChange={e=>handleInputChange('aadhaarNumber', e.target.value)} placeholder="0000 0000 0000" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none" />
                                        </div>
                                    </>
                                )}

                                {/* --- STEP 2: PARENTS --- */}
                                {currentStep === 2 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Father's Full Name <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="text" value={formData.fatherName} onChange={e=>handleInputChange('fatherName', e.target.value)} placeholder="Robert Doe" className={`w-full h-12 px-4 rounded-xl border ${errors.fatherName ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mother's Full Name <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="text" value={formData.motherName} onChange={e=>handleInputChange('motherName', e.target.value)} placeholder="Jane Doe" className={`w-full h-12 px-4 rounded-xl border ${errors.motherName ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Primary Phone Number <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="tel" value={formData.primaryContact} onChange={e=>handleInputChange('primaryContact', e.target.value)} placeholder="+91 999 999 9999" className={`w-full h-12 px-4 rounded-xl border ${errors.primaryContact ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Parent Email (Optional)</label>
                                            <input type="email" value={formData.parentEmail} onChange={e=>handleInputChange('parentEmail', e.target.value)} placeholder="parent@email.com" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none" />
                                        </div>
                                    </>
                                )}

                                {/* --- STEP 3: ACADEMIC & ADDRESS --- */}
                                {currentStep === 3 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Class/Grade <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="text" value={formData.class} onChange={e=>handleInputChange('class', e.target.value)} placeholder="e.g. 10" className={`w-full h-12 px-4 rounded-xl border ${errors.class ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Section <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="text" value={formData.section} onChange={e=>handleInputChange('section', e.target.value)} placeholder="e.g. A" className={`w-full h-12 px-4 rounded-xl border ${errors.section ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Roll Number <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="text" value={formData.rollNumber} onChange={e=>handleInputChange('rollNumber', e.target.value)} placeholder="e.g. 01" className={`w-full h-12 px-4 rounded-xl border ${errors.rollNumber ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Admission Number</label>
                                            <input type="text" value={formData.admissionNumber} onChange={e=>handleInputChange('admissionNumber', e.target.value)} placeholder="0000000 (Optional)" className="w-full h-12 px-4 rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date of Admission <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="date" value={formData.dateOfAdmission} onChange={e=>handleInputChange('dateOfAdmission', e.target.value)} className={`w-full h-12 px-4 rounded-xl border ${errors.dateOfAdmission ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Address <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <textarea value={formData.currentAddress} onChange={e=>handleInputChange('currentAddress', e.target.value)} rows="3" placeholder="Full residential physical address" className={`w-full p-4 rounded-xl border ${errors.currentAddress ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none resize-none`}></textarea>
                                        </div>
                                    </>
                                )}

                                {/* --- STEP 4: REVIEW --- */}
                                {currentStep === 4 && (
                                    <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Review Details</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Name</span>{formData.firstName} {formData.lastName}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Class & Sec</span>{formData.class} - {formData.section}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Roll Number</span>{formData.rollNumber}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Aadhaar</span>{formData.aadhaarNumber || 'N/A'}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Admission Date</span>{formData.dateOfAdmission || 'N/A'}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Father</span>{formData.fatherName}</div>
                                            <div><span className="text-slate-500 block text-[10px] uppercase font-bold">Contact</span>{formData.primaryContact}</div>
                                        </div>
                                        <p className="mt-4 text-xs text-slate-500">Please review all fields. Upon submission, system will generate login credentials for the student app.</p>
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
                                className={`flex items-center gap-2 px-8 py-3 text-white font-bold text-sm rounded-xl hover:shadow-lg transition-all active:scale-95 ${currentStep === 4 ? 'bg-green-600 hover:shadow-green-500/30' : 'bg-[#2563eb] hover:shadow-blue-500/30'}`}
                                onClick={handleNext}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : (currentStep === 4 ? 'Confirm & Admit' : 'Next Step')}
                                {!isLoading && <span className="material-symbols-outlined text-[18px]">{currentStep === 4 ? 'check' : 'arrow_forward'}</span>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddStudent;
