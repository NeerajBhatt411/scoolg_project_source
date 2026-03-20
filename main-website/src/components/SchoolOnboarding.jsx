import React, { useState } from 'react';

const SchoolOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [otherBoardName, setOtherBoardName] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSchoolType, setSelectedSchoolType] = useState('');

  const toggleBoard = (board) => {
    setSelectedBoards(prev => 
      prev.includes(board) ? prev.filter(b => b !== board) : [...prev, board]
    );
  };

  const toggleClass = (cls) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const steps = [
    { num: 1, label: 'Info' }, { num: 2, label: 'Contact' }, { num: 3, label: 'Board' },
    { num: 4, label: 'Leaders' }, { num: 5, label: 'Facilities' }, { num: 6, label: 'Media' },
    { num: 7, label: 'Review' }
  ];

  const stepTitles = [
    { title: "School Information", desc: "Let's start with the basic identity of your institution." },
    { title: "Contact Details", desc: "Where and how can parents reach you?" },
    { title: "Academic Setup", desc: "Define your curriculum boards and class structures." },
    { title: "Leadership Team", desc: "Introduce the key people running the school." },
    { title: "School Facilities", desc: "Highlight the premium amenities you offer." },
    { title: "Brand Identity", desc: "Upload your school's official logo and cover image." },
    { title: "Final Review", desc: "Double-check your profile before launching." }
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSendOtp = () => { if (email) setOtpSent(true); };
  const handleVerifyOtp = () => { if (otp.join('').length === 6) setIsEmailVerified(true); };

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
            <div className="bg-blue-600 w-9 h-9 rounded-lg flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
              </svg>
            </div>
            <span className="text-[20px] font-black tracking-tight text-gray-900">SCOOLG</span>
          </div>

          {/* Stepper - Perfectly Centered on Desktop, Scrollable left-aligned on Mobile */}
          <div className="flex-1 flex w-full overflow-x-auto hide-scrollbar px-1 justify-start md:justify-center">
            <div className="flex min-w-max items-center px-4 md:px-0 mx-auto md:mx-0">
              {steps.map(step => {
                const isActive = currentStep === step.num;
                const isPast = currentStep > step.num;
                return (
                  <div key={step.num} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-bold transition-all duration-300 ${isPast ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white shadow-[0_0_0_4px_rgba(37,99,235,0.15)]' : 'bg-white text-gray-500 border border-gray-300'}`}>
                        {isPast ? <svg className="w-4 h-4 outline-none" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg> : step.num}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider hidden md:block ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                    {step.num !== 7 && (
                      <div className={`h-[2px] w-6 sm:w-10 mx-2 sm:mx-3 mb-4 md:mb-5 ${isPast ? 'bg-green-500' : 'bg-gray-200'}`}></div>
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

        {/* Unified Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 mb-6 relative z-10">

          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>School Full Name</label>
                <input type="text" placeholder="e.g. St. Xavier's International School" className={inputClass} />
              </div>

              {/* Email Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Official Email Address</label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={isEmailVerified}
                      placeholder="contact@schoolname.edu"
                      className={`${inputClass} pr-28 ${isEmailVerified ? 'border-gray-200 bg-white text-gray-900 ring-0 focus:ring-0' : ''}`}
                    />
                    {!isEmailVerified && (
                      <button
                        onClick={handleSendOtp}
                        disabled={!email || otpSent}
                        className="absolute right-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {otpSent ? 'OTP Sent' : 'Verify'}
                      </button>
                    )}
                    {/* We just show a discreet green tick inside the box if verified */}
                    {isEmailVerified && (
                      <div className="absolute right-3 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Established Year</label>
                  <input type="text" placeholder="YYYY" className={inputClass} />
                </div>
              </div>

              {/* Revamped High-End OTP Dialog - Ultra Clean */}
              {otpSent && !isEmailVerified && (
                <div className="mt-2 bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                  <h4 className="text-[16px] font-bold text-gray-900 mb-1">Enter Verification Code</h4>
                  <p className="text-[14px] text-gray-500 mb-5">We've sent a 6-digit code to <b className="text-gray-800">{email}</b></p>

                  <div className="flex gap-2 sm:gap-3 mb-6 w-full justify-between sm:justify-start px-0.5">
                    {otp.map((data, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={data}
                        onChange={e => handleOtpChange(e.target, index)}
                        onKeyDown={e => handleOtpKeyDown(e, index)}
                        onFocus={e => e.target.select()}
                        className="w-[14%] sm:w-[50px] aspect-[4/5] sm:h-[60px] text-center text-[22px] font-bold rounded-lg border border-gray-500 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.join('').length !== 6}
                    className="px-6 py-3 bg-blue-600 text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-200 disabled:text-gray-400 shadow-sm"
                  >
                    Confirm Code
                  </button>
                </div>
              )}

              <div>
                <label className={labelClass}>Brief Description</label>
                <textarea rows="4" placeholder="Tell us about your school's vision, mission, or history..." className={`${inputClass} resize-none`}></textarea>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in-up">

              {/* Contact Line */}
              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" placeholder="+91 98765 43210" className={inputClass} />
              </div>

              {/* Address Line */}
              <div>
                <label className={labelClass}>Full School Address</label>
                <textarea rows="3" placeholder="Enter complete street address..." className={`${inputClass} resize-none`}></textarea>
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" placeholder="City name" className={inputClass} />
                </div>

                {/* State Dropdown - Grouped logically with City and Pincode */}
                <div>
                  <label className={labelClass}>State / Province</label>
                  <select defaultValue="" className={`${inputClass} cursor-pointer appearance-none px-4`}>
                    <option value="" disabled>Select state</option>
                    {["Andaman & Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"].map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Pincode</label>
                  <input type="text" placeholder="Postal code" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <label className={labelClass}>Board Affiliation (Select Multiple)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['CBSE', 'ICSE', 'OTHER'].map(board => {
                    const isSelected = selectedBoards.includes(board);
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
                {selectedBoards.includes('OTHER') && (
                  <div className="mt-4 animate-fade-in-up">
                    <label className={labelClass}>Please specify Other Board</label>
                    <input 
                      type="text" 
                      value={otherBoardName}
                      onChange={(e) => setOtherBoardName(e.target.value)}
                      placeholder="e.g. State Board, IB" 
                      className={inputClass} 
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>School Type</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Private', 'Government', 'Government-Aided', 'Trust / NGO'].map(type => {
                    const isSelected = selectedSchoolType === type;
                    return (
                      <button 
                        key={type} 
                        onClick={() => setSelectedSchoolType(type)}
                        className={`px-5 py-2.5 rounded-lg border text-[14px] font-semibold transition-all shadow-sm ${isSelected ? 'border-blue-800 text-blue-900 bg-blue-100 border-2' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}>
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelClass}>Classes Available</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {['Primary (1-5)', 'Middle (6-10)', 'Secondary (11-12)'].map((cls) => {
                    const isSelected = selectedClasses.includes(cls);
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
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Principal Name</label>
                  <input type="text" placeholder="Dr. John Doe" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Vice Principal</label>
                  <input type="text" placeholder="Prof. Jane Smith" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Dean of Academics</label>
                <input type="text" placeholder="Dr. Michael Brown" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Principal's Welcome Message</label>
                <textarea rows="4" placeholder="Write a brief introductory message..." className={`${inputClass} resize-none`}></textarea>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="animate-fade-in-up">
              <label className={labelClass}>Select Available Amenities</label>
              <div className="flex flex-wrap gap-2.5 mt-2">
                {['Library', 'Science Lab', 'Computer Lab', 'Smart Classrooms', 'Sports Ground', 'Auditorium', 'Transport', 'Hostel', 'Cafeteria', 'Medical Room'].map((facility, index) => (
                  <button key={facility} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg border text-[14px] font-semibold transition-all shadow-sm ${index % 2 === 0 ? 'border-gray-200 text-gray-700 bg-white hover:border-gray-300' : 'border-blue-600 text-blue-700 bg-blue-50'}`}>
                    {facility}
                    {index % 2 !== 0 && <svg className="w-3.5 h-3.5 ml-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label className={labelClass}>School Logo</label>
                <div className="mt-1 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                  <div className="w-12 h-12 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center mb-3"><svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></div>
                  <p className="text-[14px] font-semibold text-gray-800">Upload your Logo</p>
                  <p className="text-[13px] font-medium text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
              <div>
                <label className={labelClass}>Cover Image</label>
                <div className="mt-1 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                  <div className="w-full max-w-[160px] h-16 bg-white shadow-sm border border-gray-200 rounded-lg flex items-center justify-center mb-3"><svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg></div>
                  <p className="text-[14px] font-semibold text-gray-800">Upload Cover Photo</p>
                  <p className="text-[13px] font-medium text-gray-500 mt-1">Recommended 1200x400px</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {currentStep === 7 && (
            <div className="animate-fade-in-up text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">You're All Set!</h3>
              <p className="text-[15px] font-medium text-gray-500 mb-6 max-w-sm mx-auto">Click submit below to register your school in our system and generate your beautiful platform.</p>
            </div>
          )}

        </div>

        {/* Unified Bottom Footer Buttons */}
        <div className="flex items-center justify-between mt-6">
          {currentStep > 1 ? (
            <button onClick={handleBack} className="px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold text-[14px] rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              Back
            </button>
          ) : <div />}

          <button
            onClick={handleNext}
            disabled={currentStep === 1 && !isEmailVerified}
            className={`font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm flex items-center gap-2 text-[14px]
                ${currentStep === 1 && !isEmailVerified ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {currentStep === 7 ? 'Submit Details' : (currentStep === 1 && !isEmailVerified) ? 'Verify Email to Proceed' : 'Next Step'}
          </button>
        </div>

      </main>
    </div>
  );
};

export default SchoolOnboarding;
