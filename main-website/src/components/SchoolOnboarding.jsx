import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SchoolOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolId, setSchoolId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const isUploading = uploadingCount > 0;
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [infoModal, setInfoModal] = useState({ open: false, title: '', message: '' });

  // --- Safe URL Builder --- 
  const API_BASE_URL = 'https://scoolg-backend.netlify.app/api';
  const ADMIN_PANEL_URL = import.meta.env.VITE_ADMIN_PANEL_URL || '';
  const SCHOOL_WEBSITE_URL = import.meta.env.VITE_SCHOOL_WEBSITE_URL || '';

  const joinURL = (base, endpoint) => {
    const cleanBase = base.replace(/\/+$/, ''); // Remove trailing slash
    const cleanEndpoint = endpoint.replace(/^\/+/, ''); // Remove leading slash
    return `${cleanBase}/${cleanEndpoint}`;
  };

  const openInfoModal = (title, message) => {
    setInfoModal({ open: true, title, message });
  };

  const closeInfoModal = () => {
    setInfoModal({ open: false, title: '', message: '' });
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const uploadToCloudinary = async (file, folder) => {
    if (!file) return null;
    try {
      setUploadingCount((count) => count + 1);
      const base64 = await fileToBase64(file);
      const url = joinURL(API_BASE_URL, '/upload');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64,
          folder,
          schoolName: formData.schoolName || 'General'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'The image file might be too large or invalid.');
      }
      return data.url;
    } catch (err) {
      console.error('📸 Upload error details:', err);
      // Don't alert here to avoid spamming the user during multiple uploads
      setFormError(`Image upload failed: ${err.message}. Please retry.`);
      setTimeout(() => setFormError(''), 5000);
      return null;
    } finally {
      setUploadingCount((count) => Math.max(0, count - 1));
    }
  };
  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    establishedYear: '',
    schoolStrength: '',
    schoolDescription: '',
    mission: '',
    vision: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    selectedBoards: [],
    otherBoardName: '',
    selectedClasses: [],
    selectedSchoolType: '',
    leadership: [
      { name: '', role: '', message: '', photo: '' },
      { name: '', role: '', message: '', photo: '' },
      { name: '', role: '', message: '', photo: '' }
    ],
    facilities: [],
    otherFacilities: '',
    logo: null,
    coverImage: null,
    gallery: [], // Up to 10 images
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: ''
    },
    fees: {
      primary: '',
      secondary: '',
      seniorSecondary: ''
    }
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const clearError = (key) => {
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
    if (formError) setFormError('');
  };

  const handleFeesChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      fees: { ...prev.fees, [field]: value }
    }));
  };

  const handleSocialChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [field]: value }
    }));
  };

  const handleLeadershipChange = (index, field, value) => {
    const newLeadership = [...formData.leadership];
    newLeadership[index][field] = value;
    setFormData(prev => ({ ...prev, leadership: newLeadership }));
    clearError(`leadership.${index}.${field}`);
    if (formError) setFormError('');
  };

  const addLeadershipMember = () => {
    setFormData(prev => ({
      ...prev,
      leadership: [...prev.leadership, { name: '', role: '', message: '', photo: '' }]
    }));
  };

  const addCustomFacility = () => {
    if (formData.otherFacilities.trim()) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities.filter(f => f !== 'OTHER'), formData.otherFacilities.trim()],
        otherFacilities: ''
      }));
    }
  };

  const isImageFile = (file) => {
    if (!file) return false;
    if (file.type) return file.type.startsWith('image/');
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || '');
  };

  const setLeadershipPhoto = (index, url) => {
    setFormData(prev => {
      const next = [...prev.leadership];
      next[index] = { ...next[index], photo: url };
      return { ...prev, leadership: next };
    });
  };

  const fieldClass = (key) => `${inputClass} ${errors[key] ? 'border-red-500 focus:ring-red-500' : ''}`;

  const validateStep = () => {
    const nextErrors = {};
    if (currentStep === 1) {
      if (!formData.schoolName.trim()) nextErrors.schoolName = 'School name is required.';
      if (!formData.email.trim()) nextErrors.email = 'Email is required.';
      if (!isEmailVerified) nextErrors.emailVerified = 'Email verification is required.';
      if (!formData.establishedYear.trim()) nextErrors.establishedYear = 'Established year is required.';
      if (!formData.schoolStrength.trim()) nextErrors.schoolStrength = 'School strength is required.';
      if (!formData.schoolDescription.trim()) nextErrors.schoolDescription = 'Description is required.';
    }
    if (currentStep === 2) {
      if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required.';
      if (!formData.address.trim()) nextErrors.address = 'Address is required.';
      if (!formData.city.trim()) nextErrors.city = 'City is required.';
      if (!formData.state) nextErrors.state = 'State is required.';
      if (!formData.pincode.trim()) nextErrors.pincode = 'Pincode is required.';
    }
    if (currentStep === 3) {
      if (!formData.selectedBoards.length) nextErrors.selectedBoards = 'Select at least one board.';
      if (formData.selectedBoards.includes('OTHER') && !formData.otherBoardName.trim()) {
        nextErrors.otherBoardName = 'Please specify other board.';
      }
      if (!formData.selectedSchoolType) nextErrors.selectedSchoolType = 'Select school type.';
      if (!formData.selectedClasses.length) nextErrors.selectedClasses = 'Select at least one class group.';
      if (!formData.mission.trim()) nextErrors.mission = 'Mission is required.';
      if (!formData.vision.trim()) nextErrors.vision = 'Vision is required.';
    }
    if (currentStep === 4) {
      const leader = formData.leadership[0] || {};
      if (!leader.name?.trim()) nextErrors['leadership.0.name'] = 'Name is required.';
      if (!leader.role?.trim()) nextErrors['leadership.0.role'] = 'Role is required.';
      if (!leader.message?.trim()) nextErrors['leadership.0.message'] = 'Message is required.';
    }
    if (currentStep === 5) {
      if (!formData.facilities.length) nextErrors.facilities = 'Select at least one facility.';
    }
    if (currentStep === 6) {
      if (!formData.logo) nextErrors.logo = 'Logo is required.';
      if (!formData.coverImage) nextErrors.coverImage = 'Cover image is required.';
      if (!formData.gallery.length) nextErrors.gallery = 'At least one gallery image is required.';
    }
    return nextErrors;
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter(isImageFile);
    const remainingSlots = Math.max(0, 10 - formData.gallery.length);
    const filesToUpload = files.slice(0, remainingSlots);
    if (filesToUpload.length === 0) return;
    clearError('gallery');
    if (formError) setFormError('');
    for (const file of filesToUpload) {
      const tempUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, tempUrl]
      }));
      const url = await uploadToCloudinary(file, 'Gallery');
      if (url) {
        setFormData(prev => {
          const updated = prev.gallery
            .map((item) => (item === tempUrl ? url : item))
            .filter(Boolean);
          return { ...prev, gallery: updated };
        });
        URL.revokeObjectURL(tempUrl);
      }
    }
    e.target.value = '';
  };

  const toggleBoard = (board) => {
    setFormData(prev => ({
      ...prev,
      selectedBoards: prev.selectedBoards.includes(board)
        ? prev.selectedBoards.filter(b => b !== board)
        : [...prev.selectedBoards, board]
    }));
    clearError('selectedBoards');
    if (board !== 'OTHER') clearError('otherBoardName');
    if (formError) setFormError('');
  };

  const toggleClass = (cls) => {
    setFormData(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(cls)
        ? prev.selectedClasses.filter(c => c !== cls)
        : [...prev.selectedClasses, cls]
    }));
    clearError('selectedClasses');
    if (formError) setFormError('');
  };

  const toggleFacility = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
    clearError('facilities');
    if (formError) setFormError('');
  };

  const steps = [
    { num: 1, label: 'Info' }, { num: 2, label: 'Contact' }, { num: 3, label: 'Academics' },
    { num: 4, label: 'Leaders' }, { num: 5, label: 'Facilities' }, { num: 6, label: 'Media' },
    { num: 7, label: 'Fees' }, { num: 8, label: 'Review' }
  ];

  const stepTitles = [
    { title: "School Information", desc: "Basic identity and enrollment details." },
    { title: "Contact Details", desc: "Address and official communication channels." },
    { title: "Academic Vision", desc: "Boards, classes, mission, and vision statements." },
    { title: "Leadership Team", desc: "Introduce the board and management." },
    { title: "School Facilities", desc: "Highlight your campus amenities." },
    { title: "Media & Gallery", desc: "Logo, cover, and campus photos (Up to 10)." },
    { title: "Fee Structure (Optional)", desc: "Set up the yearly fee plans for different levels." },
    { title: "Final Review", desc: "Verified profile summary before going live." }
  ];

  const handleNext = async () => {
    if (isUploading) {
      setFormError('Please wait for uploads to finish.');
      return;
    }
    const nextErrors = validateStep();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError('Please fill all required fields marked with *.');
      return;
    }

    if (currentStep === 8) {
      if (schoolId) {
        setIsSaving(true);
        try {
          const url = joinURL(API_BASE_URL, `/onboarding/update/${schoolId}`);
          const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formData, currentStep: 8 })
          });
          const data = await res.json();
          if (res.ok && data.password) setGeneratedPassword(data.password);
        } catch (err) {
          alert("Save failed!");
        } finally {
          setIsSaving(false);
        }
      }
      localStorage.setItem('onboardingData', JSON.stringify(formData));
      alert('School Profile Created Successfully!');
      return;
    }

    // Auto-save to backend on every step change
    if (schoolId) {
      setIsSaving(true);
      try {
        const url = joinURL(API_BASE_URL, `/onboarding/update/${schoolId}`);
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData, currentStep: currentStep + 1 })
        });
        const data = await res.json();
        if (res.ok) {
          if (data.password) setGeneratedPassword(data.password);
          setCurrentStep(prev => prev + 1);
          window.scrollTo(0, 0);
        }
      } catch (err) { alert("Save failed!"); }
      finally { setIsSaving(false); }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 8));
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSendOtp = async () => {
    if (!formData.email) return;
    setIsSendingOtp(true);
    setFormError('');
    try {
      const url = joinURL(API_BASE_URL, '/onboarding/start');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();

      if (res.status === 409) {
        setFormError('Account already exists for this email. Please go to the Login page.');
        return;
      }

      if (res.ok && data.schoolId) {
        setSchoolId(data.schoolId);
        setOtpSent(true);
        // Save the resume step and data in a temp way
        if (data.formData) {
          setFormData(prev => ({ ...prev, ...data.formData }));
          // We don't change step yet, we wait for OTP verification
          setResumeStep(data.currentStep || 1);
        }
      } else {
        setFormError(data.error || "Failed to send OTP. Please check your email.");
      }
    } catch (err) {
      setFormError("Network Error: Could not connect to the server.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const [resumeStep, setResumeStep] = useState(1);

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      try {
        const url = joinURL(API_BASE_URL, '/onboarding/verify');
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, otp: otpCode })
        });
        if (res.ok) {
          setIsEmailVerified(true);
          setOtpSent(false); // Hide OTP field
          clearError('emailVerified');
          if (resumeStep > 1) {
            setCurrentStep(resumeStep);
            setFormError(`Welcome back! Resuming from step ${resumeStep}.`);
            setTimeout(() => setFormError(''), 3000);
          }
          if (formError) setFormError('');
        } else {
          setFormError("Invalid OTP. Please check your email again.");
        }
      } catch (err) {
        alert("Verification failed.");
      }
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value !== '') element.nextSibling.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  /* Standard, Highly Readable, High-Contrast UI */
  const inputClass = "w-full px-4 py-3.5 bg-white border border-gray-500 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-[15px] shadow-sm";
  const labelClass = "block text-[14px] font-semibold text-gray-800 mb-2";

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col text-gray-900">

      {/* 1. Global Header with Top Stepper */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 min-h-[80px] py-4 md:py-0 flex flex-col md:flex-row items-center relative gap-4 md:gap-0">

          {/* Logo - Left aligned on Desktop, Center on Mobile */}
          <div className="flex items-center gap-2.5 w-full md:w-[200px] justify-center md:justify-start shrink-0">
            <div className="bg-white border border-gray-200 w-9 h-9 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden">
              <img
                src="/logo.png"
                alt="ScoolG Logo"
                className="w-full h-full object-contain"
              />
              {isUploading && (
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </div>
              )}
            </div>
            <span className="text-[20px] font-black tracking-tight text-gray-900 flex items-center gap-2">
              SCOOLG
              {isUploading && <span className="text-[10px] text-blue-600 animate-pulse font-bold bg-blue-50 px-2 py-0.5 rounded ml-2">UPLOADING...</span>}
            </span>
          </div>

          {/* Stepper - Perfectly Centered, No Scroll on Desktop */}
          <div className="flex-1 px-4 py-2 md:py-0 overflow-x-auto md:overflow-visible no-scrollbar">
            <div className="flex items-center justify-start md:justify-center min-w-max md:min-w-0">
              {steps.map(step => {
                const isActive = currentStep === step.num;
                const isPast = currentStep > step.num;
                return (
                  <div key={step.num} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center gap-1 px-1.5 md:px-2">
                      <div className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-[12px] md:text-[13px] font-bold transition-all duration-300 ${isPast ? 'bg-green-500 text-white shadow-sm' : isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                        {isPast ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg> : step.num}
                      </div>
                      <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-tight hidden md:block ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {step.num !== 8 && (
                      <div className={`h-[2px] w-2 md:w-5 lg:w-9 rounded-full ${isPast ? 'bg-green-500' : 'bg-gray-200'} mb-auto mt-3.5 md:mt-4`}></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Invisible balancer for perfect centering on desktop */}
          <div className="hidden md:block w-[200px] shrink-0"></div>
        </div>
      </header>

      {/* 2. Main Content Form Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 md:py-12">

        {/* Dynamic Headers */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{stepTitles[currentStep - 1].title}</h2>
          <p className="text-[16px] text-gray-500 font-medium">{stepTitles[currentStep - 1].desc}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 mb-6 relative z-10">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>School Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  placeholder="e.g. St. Xavier's International School"
                  className={fieldClass('schoolName')}
                />
                {errors.schoolName && <p className="text-[12px] text-red-500 mt-1">{errors.schoolName}</p>}
              </div>

              {/* Email Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Official Email Address <span className="text-red-500">*</span></label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      readOnly={isEmailVerified}
                      placeholder="contact@schoolname.edu"
                      className={`${fieldClass('email')} pr-28 ${isEmailVerified ? 'border-gray-200 bg-white text-gray-900 ring-0 focus:ring-0' : ''}`}
                    />
                    {!isEmailVerified && (
                      <button
                        onClick={handleSendOtp}
                        disabled={!formData.email || isSendingOtp}
                        className="absolute right-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isSendingOtp ? (
                          <>
                            <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            Sending
                          </>
                        ) : otpSent ? 'Resend OTP' : 'Verify'}
                      </button>
                    )}
                    {isEmailVerified && (
                      <div className="absolute right-3 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </div>
                  {(errors.email || errors.emailVerified) && (
                    <p className="text-[12px] text-red-500 mt-1">{errors.email || errors.emailVerified}</p>
                  )}

                  {/* OTP Section directly below email - Now perfectly blended */}
                  {otpSent && !isEmailVerified && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-4"
                    >
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 px-1">Verification Code</label>
                      <div className="flex gap-2 mb-4 justify-between">
                        {otp.map((data, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={data}
                            onChange={e => handleOtpChange(e.target, index)}
                            onKeyDown={e => handleOtpKeyDown(e, index)}
                            onFocus={e => e.target.select()}
                            className="w-[14%] aspect-[4/5] text-center text-[20px] font-bold rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm"
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleVerifyOtp}
                        className="w-full py-3 bg-blue-600 text-white font-bold text-[13px] rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                      >
                        Verify OTP
                      </button>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Established Year <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.establishedYear}
                    onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                    placeholder="YYYY"
                    className={fieldClass('establishedYear')}
                  />
                  {errors.establishedYear && <p className="text-[12px] text-red-500 mt-1">{errors.establishedYear}</p>}
                </div>
              </div>

              {/* School Strength Field - NEW */}
              <div>
                <label className={labelClass}>School Strength (Total Students) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.schoolStrength}
                  onChange={(e) => handleInputChange('schoolStrength', e.target.value)}
                  placeholder="e.g. 2,500+"
                  className={fieldClass('schoolStrength')}
                />
                {errors.schoolStrength && <p className="text-[12px] text-red-500 mt-1">{errors.schoolStrength}</p>}
              </div>

              <div>
                <label className={labelClass}>Brief Description <span className="text-red-500">*</span></label>
                <textarea
                  rows="4"
                  value={formData.schoolDescription}
                  onChange={(e) => handleInputChange('schoolDescription', e.target.value)}
                  placeholder="Tell us about your school's vision, mission, or history..."
                  className={`${fieldClass('schoolDescription')} resize-none`}
                ></textarea>
                {errors.schoolDescription && <p className="text-[12px] text-red-500 mt-1">{errors.schoolDescription}</p>}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in-up">

              {/* Contact Line */}
              <div>
                <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={fieldClass('phone')}
                />
                {errors.phone && <p className="text-[12px] text-red-500 mt-1">{errors.phone}</p>}
              </div>

              {/* Address Line */}
              <div>
                <label className={labelClass}>Full School Address <span className="text-red-500">*</span></label>
                <textarea
                  rows="3"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete street address..."
                  className={`${fieldClass('address')} resize-none`}
                ></textarea>
                {errors.address && <p className="text-[12px] text-red-500 mt-1">{errors.address}</p>}
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City name"
                    className={fieldClass('city')}
                  />
                  {errors.city && <p className="text-[12px] text-red-500 mt-1">{errors.city}</p>}
                </div>

                {/* State Dropdown - Grouped logically with City and Pincode */}
                <div>
                  <label className={labelClass}>State / Province <span className="text-red-500">*</span></label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`${fieldClass('state')} cursor-pointer appearance-none px-4`}>
                    <option value="" disabled>Select state</option>
                    {["Andaman & Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"].map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-[12px] text-red-500 mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className={labelClass}>Pincode <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="Postal code"
                    className={fieldClass('pincode')}
                  />
                  {errors.pincode && <p className="text-[12px] text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>

              {/* SOCIAL MEDIA - OPTIONAL */}
              <div className="pt-6 border-t border-gray-100 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Instagram URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    placeholder="e.g. instagram.com/school"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Facebook URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                    placeholder="e.g. facebook.com/school"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <label className={labelClass}>Board Affiliation (Select Multiple) <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['CBSE', 'ICSE', 'OTHER'].map(board => {
                    const isSelected = formData.selectedBoards.includes(board);
                    return (
                      <button
                        key={board}
                        onClick={() => toggleBoard(board)}
                        className={`px-5 py-2.5 rounded-lg border text-[14px] font-semibold transition-all shadow-sm ${isSelected ? 'border-blue-800 text-blue-900 bg-blue-100 border-2' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}>
                        {board}
                      </button>
                    );
                  })}
                </div>
                {errors.selectedBoards && <p className="text-[12px] text-red-500 mt-2">{errors.selectedBoards}</p>}
                {formData.selectedBoards.includes('OTHER') && (
                  <div className="mt-4 animate-fade-in-up">
                    <label className={labelClass}>Please specify Other Board <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.otherBoardName}
                      onChange={(e) => handleInputChange('otherBoardName', e.target.value)}
                      placeholder="e.g. State Board, IB"
                      className={fieldClass('otherBoardName')}
                    />
                    {errors.otherBoardName && <p className="text-[12px] text-red-500 mt-1">{errors.otherBoardName}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>School Type <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Private', 'Government', 'Government-Aided', 'Trust / NGO'].map(type => {
                    const isSelected = formData.selectedSchoolType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => handleInputChange('selectedSchoolType', type)}
                        className={`px-5 py-2.5 rounded-lg border text-[14px] font-semibold transition-all shadow-sm ${isSelected ? 'border-blue-800 text-blue-900 bg-blue-100 border-2' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>
                        {type}
                      </button>
                    );
                  })}
                </div>
                {errors.selectedSchoolType && <p className="text-[12px] text-red-500 mt-2">{errors.selectedSchoolType}</p>}
              </div>

              <div>
                <label className={labelClass}>Classes Available <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {['Primary (1-5)', 'Middle (6-10)', 'Secondary (11-12)'].map((cls) => {
                    const isSelected = formData.selectedClasses.includes(cls);
                    return (
                      <div
                        key={cls}
                        onClick={() => toggleClass(cls)}
                        className={`rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${isSelected ? 'border-2 border-blue-800 bg-blue-50/50 shadow-md' : 'border border-gray-200 bg-white hover:border-blue-500 hover:shadow-sm'}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'border-blue-800 bg-blue-800' : 'border-gray-300 bg-white'}`}>
                          {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <p className={`text-[14px] font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>{cls}</p>
                      </div>
                    );
                  })}
                </div>
                {errors.selectedClasses && <p className="text-[12px] text-red-500 mt-2">{errors.selectedClasses}</p>}
              </div>

              {/* MISSION & VISION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className={labelClass}>School Mission <span className="text-red-500">*</span></label>
                  <textarea
                    rows="3"
                    value={formData.mission}
                    onChange={(e) => handleInputChange('mission', e.target.value)}
                    placeholder="Briefly state your school's mission..."
                    className={`${fieldClass('mission')} resize-none`}
                  ></textarea>
                  {errors.mission && <p className="text-[12px] text-red-500 mt-1">{errors.mission}</p>}
                </div>
                <div>
                  <label className={labelClass}>School Vision <span className="text-red-500">*</span></label>
                  <textarea
                    rows="3"
                    value={formData.vision}
                    onChange={(e) => handleInputChange('vision', e.target.value)}
                    placeholder="Briefly state your school's vision..."
                    className={`${fieldClass('vision')} resize-none`}
                  ></textarea>
                  {errors.vision && <p className="text-[12px] text-red-500 mt-1">{errors.vision}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Leadership Team */}
          {currentStep === 4 && (
            <div className="space-y-10 animate-fade-in-up">
              {formData.leadership.map((member, index) => (
                <div key={index} className="p-6 rounded-2xl border bg-gray-50/50 border-gray-100 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${index === 0 ? 'bg-blue-600' : 'bg-gray-400'} text-white`}>{index + 1}</span>
                      <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">Member {index + 1}</h4>
                    </div>
                    {index > 2 && (
                      <button
                        onClick={() => {
                          const newL = formData.leadership.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, leadership: newL }));
                        }}
                        className="text-red-500 text-[12px] font-semibold hover:underline"
                      >Remove</button>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Member Photo - NEW & OPTIONAL */}
                    <div className="w-full md:w-[120px] shrink-0">
                      <label className="text-[12px] font-bold text-gray-500 mb-2 block uppercase">Photo</label>
                      <div className="relative w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:border-blue-400 transition-all cursor-pointer overflow-hidden group">
                        {member.photo ? (
                          <img src={member.photo} alt="Leader" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-300 group-hover:text-blue-400"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg></div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const file = e.target.files && e.target.files[0];
                            if (!isImageFile(file)) return;
                            const tempUrl = URL.createObjectURL(file);
                            setLeadershipPhoto(index, tempUrl);
                            const url = await uploadToCloudinary(file, 'Leadership');
                            if (url) {
                              setLeadershipPhoto(index, url);
                              URL.revokeObjectURL(tempUrl);
                            } else {
                              // Keep temp preview on failure
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const newLeadership = [...formData.leadership];
                            newLeadership[index].name = e.target.value;
                            setFormData({ ...formData, leadership: newLeadership });
                            clearError(`leadership.${index}.name`);
                            if (formError) setFormError('');
                          }}
                          placeholder="Full Name *"
                          className={`${inputClass} ${errors[`leadership.${index}.name`] ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => {
                            const newLeadership = [...formData.leadership];
                            newLeadership[index].role = e.target.value;
                            setFormData({ ...formData, leadership: newLeadership });
                            clearError(`leadership.${index}.role`);
                            if (formError) setFormError('');
                          }}
                          placeholder="Role (e.g. Principal) *"
                          className={`${inputClass} ${errors[`leadership.${index}.role`] ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors[`leadership.${index}.name`] && (
                          <p className="text-[12px] text-red-500 -mt-2 md:col-span-2">{errors[`leadership.${index}.name`]}</p>
                        )}
                        {errors[`leadership.${index}.role`] && (
                          <p className="text-[12px] text-red-500 -mt-2 md:col-span-2">{errors[`leadership.${index}.role`]}</p>
                        )}
                      </div>
                      <textarea
                        rows="2"
                        value={member.message}
                        onChange={(e) => {
                          const newLeadership = [...formData.leadership];
                          newLeadership[index].message = e.target.value;
                          setFormData({ ...formData, leadership: newLeadership });
                          clearError(`leadership.${index}.message`);
                          if (formError) setFormError('');
                        }}
                        placeholder="Message / Vision snippet... *"
                        className={`${inputClass} resize-none ${errors[`leadership.${index}.message`] ? 'border-red-500 focus:ring-red-500' : ''}`}
                      ></textarea>
                      {errors[`leadership.${index}.message`] && (
                        <p className="text-[12px] text-red-500 -mt-2">{errors[`leadership.${index}.message`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addLeadershipMember}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-blue-600 font-bold hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Add Another Member
              </button>
            </div>
          )}

          {/* STEP 5: School Facilities */}
          {currentStep === 5 && (
            <div className="animate-fade-in-up space-y-8">
              <div>
                <label className={labelClass}>Choose Popular Campus Facilities <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {['Library', 'Science Lab', 'Computer Lab', 'Smart Classrooms', 'Sports Ground', 'Auditorium', 'Transport', 'Hostel', 'Cafeteria', 'Medical Room'].map((facility) => {
                    const isSelected = formData.facilities.includes(facility);
                    return (
                      <button
                        key={facility}
                        onClick={() => toggleFacility(facility)}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg border text-[13px] font-semibold transition-all ${isSelected ? 'border-green-600 text-green-700 bg-green-50 shadow-sm' : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'}`}>
                        {facility}
                        {isSelected && <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                      </button>
                    );
                  })}
                </div>
                {errors.facilities && <p className="text-[12px] text-red-500 mt-2">{errors.facilities}</p>}
              </div>

              <div>
                <label className={labelClass}>Add Custom Facilities (Anything else?)</label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={formData.otherFacilities}
                    onChange={(e) => handleInputChange('otherFacilities', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomFacility()}
                    placeholder="e.g. Swimming Pool, Yoga Garden"
                    className={`${inputClass} !mt-0 flex-1`}
                  />
                  <button
                    onClick={addCustomFacility}
                    className="bg-blue-600 text-white px-5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-1 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    ADD
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.facilities.filter(f => !['Library', 'Science Lab', 'Computer Lab', 'Smart Classrooms', 'Sports Ground', 'Auditorium', 'Transport', 'Hostel', 'Cafeteria', 'Medical Room'].includes(f)).map((f) => (
                    <div key={f} className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 flex items-center gap-2">
                      {f}
                      <button onClick={() => toggleFacility(f)} className="text-gray-400 hover:text-red-500 font-black">×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Media & Gallery */}
          {currentStep === 6 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>School Logo <span className="text-red-500">*</span></label>
                  <div className="relative mt-1 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-16 h-16 object-contain rounded-lg shadow-sm" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center mb-2"><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></div>
                        <p className="text-[12px] font-semibold text-gray-500 text-center">Upload Logo</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!isImageFile(file)) return;
                      const tempUrl = URL.createObjectURL(file);
                      handleInputChange('logo', tempUrl);
                      const url = await uploadToCloudinary(file, 'Logo');
                      if (url) {
                        handleInputChange('logo', url);
                        URL.revokeObjectURL(tempUrl);
                      } else {
                        // Keep temp preview on failure
                      }
                    }} />
                  </div>
                  {errors.logo && <p className="text-[12px] text-red-500 mt-2">{errors.logo}</p>}
                </div>
                <div>
                  <label className={labelClass}>Cover Image <span className="text-red-500">*</span></label>
                  <div className="relative mt-1 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                    {formData.coverImage ? (
                      <img src={formData.coverImage} alt="Cover" className="w-full h-16 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-8 bg-white shadow-sm border border-gray-200 rounded flex items-center justify-center mb-2"><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg></div>
                        <p className="text-[12px] font-semibold text-gray-500">Add Hero Cover</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!isImageFile(file)) return;
                      const tempUrl = URL.createObjectURL(file);
                      handleInputChange('coverImage', tempUrl);
                      const url = await uploadToCloudinary(file, 'Hero_Cover');
                      if (url) {
                        handleInputChange('coverImage', url);
                        URL.revokeObjectURL(tempUrl);
                      } else {
                        // Keep temp preview on failure
                      }
                    }} />
                  </div>
                  {errors.coverImage && <p className="text-[12px] text-red-500 mt-2">{errors.coverImage}</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Campus Gallery (Max 10 Images) <span className="text-red-500">*</span></label>
                <div className="mt-1 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all">
                  <div className="flex flex-wrap gap-3 mb-4 justify-center">
                    {formData.gallery.map((img, idx) => (
                      <img key={idx} src={img} alt="Gallery" className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                    ))}
                    {formData.gallery.length < 10 && (
                      <div className="w-14 h-14 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 relative">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" /></svg>
                        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleGalleryUpload} />
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-gray-500">Click to add photos of Lab, Classroom, Library, etc.</p>
                </div>
                {errors.gallery && <p className="text-[12px] text-red-500 mt-2">{errors.gallery}</p>}
              </div>
            </div>
          )}

          {/* STEP 7: Fees (Optional) */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-center">
                <div className="text-blue-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></div>
                <p className="text-[13px] text-blue-800 font-medium">Fee details help parents decide, but they are <b>totally optional</b>. You can skip this step.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Primary Fees (Yearly) <span className="text-gray-400 font-normal font-sans">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.fees.primary}
                    onChange={(e) => handleFeesChange('primary', e.target.value)}
                    placeholder="e.g. 45,000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Middle Fees (Yearly) <span className="text-gray-400 font-normal font-sans">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.fees.secondary}
                    onChange={(e) => handleFeesChange('secondary', e.target.value)}
                    placeholder="e.g. 60,000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Senior Secondary Fees <span className="text-gray-400 font-normal font-sans">(Optional)</span></label>
                  <input
                    type="text"
                    value={formData.fees.seniorSecondary}
                    onChange={(e) => handleFeesChange('seniorSecondary', e.target.value)}
                    placeholder="e.g. 75,000"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div className="animate-fade-in-up text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Registration Successful! ✨</h3>
              <p className="text-[14px] font-medium text-gray-500 mb-8 max-w-sm mx-auto">Your school profile is now ready. Use these credentials to login to your Scoolg Admin Panel.</p>

              <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 max-w-sm mx-auto space-y-4 shadow-inner">
                <div className="text-left">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Admin Email</label>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl font-bold text-gray-700">{formData.email}</div>
                </div>
                <div className="text-left">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Temporary Password</label>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl font-mono text-[16px] font-black text-blue-600 flex justify-between items-center tracking-wider">
                    {generatedPassword || "Not generated yet"}
                    <button onClick={() => { navigator.clipboard.writeText(generatedPassword); alert("Password Copied!"); }} className="text-gray-300 hover:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 inline-flex items-center gap-3">
                <div className="w-5 h-5 bg-amber-100 flex items-center justify-center rounded text-amber-600 font-bold text-[10px]">!</div>
                <p className="text-[12px] text-amber-800 font-bold">You will be asked to change this password on your first login.</p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => window.open('http://localhost:5174/login', '_blank')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-black text-[15px] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                >
                  🚀 Login to Admin Panel
                </button>
                <button
                  onClick={() => openInfoModal('School Website', 'We are working on your website. We will call you once your website is live.')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white border-2 border-gray-100 text-gray-800 font-bold text-[15px] rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  🌐 View My School Website
                </button>
              </div>

            </div>
          )}

        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold rounded-lg">
            {formError}
          </div>
        )}

        {/* Unified Bottom Footer Buttons - With Saving Indicator */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {currentStep > 1 && currentStep < 8 ? (
            <button onClick={handleBack} className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold text-[14px] rounded-xl hover:bg-gray-100 transition-all shadow-sm">
              Back
            </button>
          ) : <div />}

          {currentStep < 8 && (
            <div className="flex items-center gap-4">
              {isSaving && <span className="text-[12px] text-blue-500 font-bold animate-pulse">Autosaving...</span>}
              <button
                onClick={handleNext}
                disabled={(currentStep === 1 && !isEmailVerified) || isSaving || isUploading}
                className={`font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm flex items-center gap-2 text-[14px]
                  ${(currentStep === 1 && !isEmailVerified) || isSaving || isUploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100'}`}
              >
                {(currentStep === 1 && !isEmailVerified) ? 'Verify Email' : 'Next Step'}
                {isSaving ? <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
              </button>
            </div>
          )}
        </div>

      </main>

      {infoModal.open && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[18px] font-extrabold text-gray-900">{infoModal.title}</h3>
                <p className="text-[14px] text-gray-600 mt-2">{infoModal.message}</p>
              </div>
              <button
                onClick={closeInfoModal}
                className="text-gray-400 hover:text-gray-600 font-bold text-[18px]"
              >
                ×
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeInfoModal}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 transition-all shadow-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolOnboarding;
