import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import MenuButton from '../components/MenuButton';
import Dropdown from '../components/Dropdown';

const AddStudent = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { classes, getSections } = useAdmin();
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
    const [availableSections, setAvailableSections] = useState([]);
    
    // Bulk Upload States
    const [activeTab, setActiveTab] = useState('single');
    const [bulkClass, setBulkClass] = useState('');
    const [bulkSection, setBulkSection] = useState('');
    const [bulkData, setBulkData] = useState([]);
    const [bulkSuccess, setBulkSuccess] = useState(null);
    const [bulkAvailableSections, setBulkAvailableSections] = useState([]);
    // `classes` comes from the shared cache (loaded once at app start).

    // Fetch Sections when class changes (cached per class in context).
    useEffect(() => {
        let active = true;
        if (!formData.class) {
            setAvailableSections([]);
            return;
        }
        const selectedClass = classes.find(c => c.className === formData.class);
        if (!selectedClass) return;
        getSections(selectedClass._id).then((data) => {
            if (!active) return;
            setAvailableSections(data);
            // Reset section if not valid for new class
            if (data.length > 0 && !data.find(s => s.sectionName === formData.section)) {
                setFormData(prev => ({ ...prev, section: data[0].sectionName }));
            }
        });
        return () => { active = false; };
    }, [formData.class, classes, getSections, formData.section]);

    // Bulk tab section fetcher
    useEffect(() => {
        let active = true;
        if (!bulkClass) {
            setBulkAvailableSections([]);
            return;
        }
        const selectedClass = classes.find(c => c.className === bulkClass);
        if (!selectedClass) return;
        getSections(selectedClass._id).then((data) => {
            if (!active) return;
            setBulkAvailableSections(data);
            if (data.length > 0 && !data.find(s => s.sectionName === bulkSection)) {
                setBulkSection(data[0].sectionName);
            }
        });
        return () => { active = false; };
    }, [bulkClass, classes, getSections, bulkSection]);

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
        const today = new Date().toISOString().split('T')[0];

        if (step === 1) {
            if (!formData.firstName || formData.firstName.length < 2) newErrors.firstName = true;
            if (!formData.lastName || formData.lastName.length < 2) newErrors.lastName = true;
            if (!formData.rollNumber) newErrors.rollNumber = true;
            if (!formData.dateOfBirth || formData.dateOfBirth > today) newErrors.dateOfBirth = true;
            if (!formData.gender) newErrors.gender = true;
        } else if (step === 2) {
            if (!formData.fatherName || formData.fatherName.length < 2) newErrors.fatherName = true;
            if (!formData.motherName || formData.motherName.length < 2) newErrors.motherName = true;
            if (!formData.primaryContact || !/^\d{10}$/.test(formData.primaryContact)) newErrors.primaryContact = true;
            if (!formData.parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) newErrors.parentEmail = true;
        } else if (step === 3) {
            if (!formData.class) newErrors.class = true;
            if (!formData.section) newErrors.section = true;
            if (!formData.dateOfAdmission || formData.dateOfAdmission > today) newErrors.dateOfAdmission = true;
            if (!formData.currentAddress || formData.currentAddress.length < 5) newErrors.currentAddress = true;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isStepValid = (step) => {
        const today = new Date().toISOString().split('T')[0];
        if (step === 1) {
            return formData.firstName.length >= 2 && formData.lastName.length >= 2 && formData.rollNumber && formData.dateOfBirth && formData.dateOfBirth <= today && formData.gender;
        } else if (step === 2) {
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail || '');
            return formData.fatherName.length >= 2 && formData.motherName.length >= 2 && /^\d{10}$/.test(formData.primaryContact) && emailValid;
        } else if (step === 3) {
            return formData.class && formData.section && formData.dateOfAdmission && formData.dateOfAdmission <= today && formData.currentAddress.length >= 5;
        }
        return true;
    };

    const handleNext = async () => {
        if (currentStep < 4) {
            if (validateStep(currentStep)) {
                setCurrentStep(currentStep + 1);
            } else {
                // Flash error or alert
                toast.warning("Please fill all required fields marked with *");
            }
        } else {
            // Step 4 = Submit
            if (!schoolId) {
                toast.error("School ID is missing. Please log in again.");
                return;
            }
            setIsLoading(true);
            try {
                const res = await axios.post(`${ADMIN_API_BASE}/students`, {
                    ...formData,
                    schoolId
                });
                if (res.data && res.data.appCredentials) {
                    setSuccessData(res.data);
                } else {
                    // Created (2xx) but no credentials in the response: don't leave the
                    // admin on the form with no feedback (they'd re-submit and create a
                    // duplicate). Confirm success and return to the list.
                    toast.success("Student added successfully.");
                    navigate('/students');
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to register student. Check console or make sure all required * fields are filled.");
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

    // --- Bulk Logic ---
    const handleDownloadTemplate = async () => {
        if (!bulkClass) {
            return toast.error("Please select a Class first before downloading the template");
        }
        if (bulkAvailableSections.length > 0 && !bulkSection) {
            return toast.error("Please select a Section first before downloading the template");
        }

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Student Upload');

        const headers = [
            { header: "First Name (Required)", key: "firstName", width: 25 },
            { header: "Last Name (Required)", key: "lastName", width: 20 },
            { header: "Roll Number (Required)", key: "roll", width: 22 },
            { header: "Date of Birth YYYY-MM-DD (Required)", key: "dob", width: 35 },
            { header: "Gender M/F (Required)", key: "gender", width: 22 },
            { header: "Blood Group (Optional)", key: "bloodGroup", width: 22 },
            { header: "Aadhaar Number (Optional)", key: "aadhaar", width: 28 },
            { header: "Father Name (Required)", key: "father", width: 25 },
            { header: "Mother Name (Required)", key: "mother", width: 25 },
            { header: "Primary Contact 10-digits (Required)", key: "contact", width: 35 },
            { header: "Parent Email (Optional)", key: "email", width: 30 },
            { header: "Current Address (Required)", key: "address", width: 40 },
            { header: "Admission Number (Optional)", key: "admission", width: 28 },
            { header: "Date of Admission YYYY-MM-DD (Required)", key: "doa", width: 40 },
            { header: "Class (Read Only)", key: "class", width: 20 },
            { header: "Section (Read Only)", key: "section", width: 20 }
        ];

        sheet.columns = headers;

        // Style the header row
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.height = 30;

        headers.forEach((h, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (h.header.includes('(Required)')) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // Blue
            } else if (h.header.includes('(Optional)')) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }; // Green
            } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF64748B' } }; // Gray for Read Only
            }
        });

        // Add 500 rows with dropdown data validation and prefilled class/section
        for (let i = 2; i <= 501; i++) {
            // Dropdown for Gender
            sheet.getCell(`E${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"Male,Female,Other"']
            };
            // Dropdown for Blood Group
            sheet.getCell(`F${i}`).dataValidation = {
                type: 'list',
                allowBlank: true,
                formulae: ['"A+,A-,B+,B-,O+,O-,AB+,AB-"']
            };
            // Prefill Class and Section
            sheet.getCell(`O${i}`).value = bulkClass;
            sheet.getCell(`P${i}`).value = bulkSection || 'N/A';
        }

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), 'Student_Bulk_Upload_Premium_Template.xlsx');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false, dateNF: 'yyyy-mm-dd' });

                if (json.length === 0) {
                    toast.error("File is empty or contains only headers");
                    return;
                }

                const parsedStudents = json.map(row => {
                    const obj = {
                        firstName: String(row["First Name (Required)"] || '').trim(),
                        lastName: String(row["Last Name (Required)"] || '').trim(),
                        rollNumber: String(row["Roll Number (Required)"] || '').trim(),
                        dateOfBirth: String(row["Date of Birth YYYY-MM-DD (Required)"] || '').trim(),
                        gender: String(row["Gender M/F (Required)"] || '').trim(),
                        bloodGroup: String(row["Blood Group (Optional)"] || '').trim(),
                        aadhaarNumber: String(row["Aadhaar Number (Optional)"] || '').trim(),
                        fatherName: String(row["Father Name (Required)"] || '').trim(),
                        motherName: String(row["Mother Name (Required)"] || '').trim(),
                        primaryContact: String(row["Primary Contact 10-digits (Required)"] || '').trim(),
                        parentEmail: String(row["Parent Email (Optional)"] || '').trim(),
                        currentAddress: String(row["Current Address (Required)"] || '').trim(),
                        admissionNumber: String(row["Admission Number (Optional)"] || '').trim(),
                        dateOfAdmission: String(row["Date of Admission YYYY-MM-DD (Required)"] || '').trim(),
                        hasError: false,
                        errors: []
                    };

                    // Validation
                    if (!obj.firstName) { obj.hasError = true; obj.errors.push("First Name missing"); }
                    if (!obj.lastName) { obj.hasError = true; obj.errors.push("Last Name missing"); }
                    if (!obj.dateOfBirth) { obj.hasError = true; obj.errors.push("DOB missing"); }
                    if (!obj.gender) { obj.hasError = true; obj.errors.push("Gender missing"); }
                    if (!obj.fatherName) { obj.hasError = true; obj.errors.push("Father Name missing"); }
                    if (!obj.motherName) { obj.hasError = true; obj.errors.push("Mother Name missing"); }
                    if (!obj.primaryContact || obj.primaryContact.length !== 10) { obj.hasError = true; obj.errors.push("Invalid Contact (10 digits)"); }
                    if (!obj.currentAddress) { obj.hasError = true; obj.errors.push("Address missing"); }
                    if (!obj.rollNumber) { obj.hasError = true; obj.errors.push("Roll Number missing"); }
                    if (!obj.dateOfAdmission) { obj.hasError = true; obj.errors.push("DOA missing"); }

                    // Normalize gender
                    const gLow = obj.gender.toLowerCase();
                    if (gLow.startsWith('m')) obj.gender = 'Male';
                    else if (gLow.startsWith('f')) obj.gender = 'Female';
                    else if (gLow.startsWith('o')) obj.gender = 'Other';
                    else if (obj.gender) { obj.hasError = true; obj.errors.push("Invalid Gender format"); }

                    return obj;
                });

                setBulkData(parsedStudents);
                e.target.value = null; // reset
            } catch (err) {
                toast.error("Error parsing Excel file. Please use the downloaded template.");
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleBulkSubmit = async () => {
        if (!bulkClass) return toast.error("Please select a class");
        if (bulkData.length === 0) return toast.error("Please upload valid CSV data");
        if (bulkData.some(d => d.hasError)) return toast.error("Please fix red highlighted rows in CSV and re-upload");
        
        setIsLoading(true);
        try {
            const res = await axios.post(`${ADMIN_API_BASE}/students/bulk`, {
                schoolId,
                className: bulkClass,
                sectionName: bulkSection,
                students: bulkData
            });
            setBulkSuccess(res.data.students);
            toast.success(res.data.message);
        } catch (err) {
            console.error(err);
            toast.error("Failed to bulk add students");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadCredentials = () => {
        if (!bulkSuccess) return;
        const headers = ["First Name", "Last Name", "App ID (Login)", "Password"];
        const rows = bulkSuccess.map(s => [s.firstName, s.lastName, s.studentAppId, s.password]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Credentials_Class_${bulkClass}_${bulkSection || 'All'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative pb-20">
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <MenuButton />
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight">New Student Admission</h2>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                            <button onClick={() => setActiveTab('single')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'single' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Single Add</button>
                            <button onClick={() => setActiveTab('bulk')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'bulk' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Bulk Upload</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 max-w-[1000px] mx-auto space-y-8 w-full">

                {activeTab === 'single' ? (
                    <>

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
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Roll Number <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="text" value={formData.rollNumber} onChange={e=>handleInputChange('rollNumber', e.target.value)} placeholder="e.g. 01" className={`w-full h-12 px-4 rounded-xl border ${errors.rollNumber ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date Of Birth <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <input type="date" value={formData.dateOfBirth} onChange={e=>handleInputChange('dateOfBirth', e.target.value)} className={`w-full h-12 px-4 rounded-xl border ${errors.dateOfBirth ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gender <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <Dropdown
                                                value={formData.gender}
                                                onChange={(v) => handleInputChange('gender', v)}
                                                options={['Male', 'Female', 'Other']}
                                                placeholder="Select Gender"
                                                className="w-full"
                                                buttonClassName={`h-12 ${errors.gender ? 'border-red-500 bg-red-50/30' : 'bg-slate-50'}`}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
                                            <Dropdown
                                                value={formData.bloodGroup}
                                                onChange={(v) => handleInputChange('bloodGroup', v)}
                                                options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                                                placeholder="Select Group"
                                                className="w-full"
                                                buttonClassName="h-12 bg-slate-50"
                                            />
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
                                            <input type="tel" value={formData.primaryContact} onChange={e=>handleInputChange('primaryContact', e.target.value)} placeholder="10 Digit Number" maxLength="10" className={`w-full h-12 px-4 rounded-xl border ${errors.primaryContact ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                            {errors.primaryContact && <p className="text-[10px] text-red-500 font-bold ml-1">Must be exactly 10 digits</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Parent Email <span className="text-red-500">*</span></label>
                                            <input type="email" value={formData.parentEmail} onChange={e=>handleInputChange('parentEmail', e.target.value)} placeholder="parent@email.com" className={`w-full h-12 px-4 rounded-xl border ${errors.parentEmail ? 'border-red-500 bg-red-50/30' : 'border-transparent bg-slate-50'} focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-[#2563eb]/20 transition-all text-sm font-semibold text-slate-800 outline-none`} />
                                            {errors.parentEmail && <p className="text-[10px] text-red-500 font-bold ml-1">A valid parent email is required (for password recovery)</p>}
                                        </div>
                                    </>
                                )}

                                {/* --- STEP 3: ACADEMIC & ADDRESS --- */}
                                {currentStep === 3 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Class/Grade <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <Dropdown
                                                value={formData.class}
                                                onChange={(v) => handleInputChange('class', v)}
                                                options={classes.map(c => ({ value: c.className, label: c.className }))}
                                                placeholder="Select Class"
                                                className="w-full"
                                                buttonClassName={`h-12 ${errors.class ? 'border-red-500 bg-red-50/30' : 'bg-slate-50'}`}
                                            />
                                            {classes.length === 0 && (
                                                <p className="text-[9px] text-red-500 font-bold uppercase tracking-tighter mt-1">
                                                    No classes found. <span className="underline cursor-pointer" onClick={() => navigate('/classes')}>Add Class First</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Section <span className="text-red-500 text-lg leading-none">*</span></label>
                                            <Dropdown
                                                value={formData.section}
                                                onChange={(v) => handleInputChange('section', v)}
                                                options={availableSections.map(s => ({ value: s.sectionName, label: s.sectionName }))}
                                                placeholder="Select Section"
                                                className="w-full"
                                                buttonClassName={`h-12 ${errors.section ? 'border-red-500 bg-red-50/30' : 'bg-slate-50'}`}
                                            />
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
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
                                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
                                onClick={handleBack}
                                disabled={isLoading}
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back
                            </button>
                            <button
                                className={`flex items-center gap-2 px-5 sm:px-8 py-3 font-bold text-sm rounded-xl transition-all active:scale-95 ${
                                    !isStepValid(currentStep) 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                    : (currentStep === 4 ? 'bg-green-600 text-white hover:shadow-green-500/30 hover:shadow-lg' : 'bg-[#2563eb] text-white hover:shadow-blue-500/30 hover:shadow-lg')
                                }`}
                                onClick={handleNext}
                                disabled={isLoading || !isStepValid(currentStep)}
                            >
                                {isLoading ? 'Processing...' : (currentStep === 4 ? 'Confirm & Admit' : 'Next Step')}
                                {!isLoading && <span className="material-symbols-outlined text-[18px]">{currentStep === 4 ? 'check' : 'arrow_forward'}</span>}
                            </button>
                        </div>
                    </div>
                )}
                </>
                ) : (
                    /* BULK UPLOAD TAB CONTENT */
                    <div className="bg-white rounded-[24px] p-6 lg:p-10 premium-shadow min-h-[60vh]">
                        {bulkSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">{bulkSuccess.length} Students Added Successfully!</h2>
                                <p className="text-slate-500 font-medium mb-8">Download their login credentials and share with them.</p>
                                <button onClick={downloadCredentials} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto">
                                    <span className="material-symbols-outlined">download</span> Download Passwords (CSV)
                                </button>
                                <div className="mt-6">
                                    <button onClick={() => { setBulkSuccess(null); setBulkData([]); }} className="text-blue-600 font-bold text-sm underline">Upload more students</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Class <span className="text-red-500">*</span></label>
                                        <Dropdown
                                            value={bulkClass}
                                            onChange={setBulkClass}
                                            options={classes.map(c => ({ value: c.className, label: c.className }))}
                                            placeholder="Select Class"
                                            className="w-full"
                                            buttonClassName="h-12 bg-slate-50"
                                        />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Section (Optional)</label>
                                        <Dropdown
                                            value={bulkSection}
                                            onChange={setBulkSection}
                                            options={bulkAvailableSections.map(s => ({ value: s.sectionName, label: s.sectionName }))}
                                            placeholder="Select Section"
                                            className="w-full"
                                            buttonClassName="h-12 bg-slate-50"
                                        />
                                    </div>
                                    <button onClick={handleDownloadTemplate} className="h-12 px-6 border-2 border-[#2563eb] text-[#2563eb] font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 shrink-0">
                                        <span className="material-symbols-outlined text-lg">download</span> Template
                                    </button>
                                </div>

                                <label className="flex flex-col items-center justify-center w-full h-40 md:h-64 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                                        </div>
                                        <p className="mb-2 text-sm text-slate-700 font-bold"><span className="text-blue-600 font-black">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-slate-500 font-medium">Excel file only (.xlsx)</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".xlsx" onChange={handleFileUpload} />
                                </label>

                                {bulkData.length > 0 && (
                                    <div className="mt-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-slate-800">Preview Data ({bulkData.length} students)</h3>
                                            {bulkData.some(d => d.hasError) && <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">Contains Errors</span>}
                                        </div>
                                        <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-80">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 font-bold">First Name</th>
                                                        <th className="px-4 py-3 font-bold">Last Name</th>
                                                        <th className="px-4 py-3 font-bold">Roll No</th>
                                                        <th className="px-4 py-3 font-bold">Gender</th>
                                                        <th className="px-4 py-3 font-bold">DOB</th>
                                                        <th className="px-4 py-3 font-bold">Parents</th>
                                                        <th className="px-4 py-3 font-bold">Contact</th>
                                                        <th className="px-4 py-3 font-bold">DOA</th>
                                                        <th className="px-4 py-3 font-bold text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bulkData.map((row, i) => (
                                                        <tr key={i} className={`border-b last:border-0 ${row.hasError ? 'bg-red-50/50' : 'bg-white hover:bg-slate-50'}`}>
                                                            <td className={`px-4 py-3 font-medium ${!row.firstName ? 'text-red-500' : 'text-slate-800'}`}>{row.firstName || '-'}</td>
                                                            <td className="px-4 py-3 text-slate-600">{row.lastName || '-'}</td>
                                                            <td className="px-4 py-3 text-slate-600">{row.rollNumber || '-'}</td>
                                                            <td className="px-4 py-3 text-slate-600">{row.gender || '-'}</td>
                                                            <td className="px-4 py-3 text-slate-600">{row.dateOfBirth || '-'}</td>
                                                            <td className="px-4 py-3 text-slate-600 truncate max-w-[100px]" title={`${row.fatherName} & ${row.motherName}`}>{row.fatherName || '-'}</td>
                                                            <td className="px-4 py-3 text-slate-600">{row.primaryContact || '-'}</td>
                                                            <td className="px-4 py-3 text-slate-600">{row.dateOfAdmission || '-'}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                {row.hasError ? (
                                                                    <span className="text-red-600 text-[11px] font-bold bg-red-100 px-2 py-1 rounded-md" title={row.errors.join(', ')}>Errors ({row.errors.length})</span>
                                                                ) : (
                                                                    <span className="text-green-600 text-[11px] font-bold bg-green-100 px-2 py-1 rounded-md">Valid</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-8 text-right">
                                            <button
                                                onClick={handleBulkSubmit}
                                                disabled={isLoading || bulkData.some(d => d.hasError)}
                                                className={`px-8 py-3 font-bold rounded-xl transition-all ${isLoading || bulkData.some(d => d.hasError) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#2563eb] text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'}`}
                                            >
                                                {isLoading ? 'Processing...' : 'Upload & Add Students'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddStudent;
