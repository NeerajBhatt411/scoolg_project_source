import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Store original student to fallback/init
    const [student, setStudent] = useState(location.state?.student);
    
    // Editing states
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(student || {});
    const [isSaving, setIsSaving] = useState(false);

    const [activeTab, setActiveTab] = useState('Personal');

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500 font-bold">
                No student data found. <button onClick={() => navigate('/students')} className="ml-2 text-blue-500 underline">Go Back</button>
            </div>
        );
    }

    const tabs = ['Personal', 'Academic', 'Attendance', 'Exams', 'Documents'];
    const isFrozen = student.status === 'Inactive';

    const handleStatusChange = async () => {
        const newStatus = isFrozen ? 'Active' : 'Inactive';
        if (!window.confirm(`Are you sure you want to mark this student as ${newStatus}?`)) return;

        try {
            const res = await axios.put(`https://scoolg-backend.netlify.app/api/admin/students/${student._id}`, { status: newStatus });
            setStudent(res.data.student);
            setEditData(res.data.student);
        } catch (err) {
            alert('Failed to update status.');
        }
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const res = await axios.put(`https://scoolg-backend.netlify.app/api/admin/students/${student._id}`, editData);
            setStudent(res.data.student);
            setIsEditing(false);
        } catch (err) {
            alert('Failed to update details. Check console.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-[1200px] mx-auto pb-20 relative">
            {/* Header: Title */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-black text-blue-700 tracking-tight">Student Profile</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input type="text" placeholder="Search students, records..." className="pl-9 pr-4 py-2 bg-white rounded-full border border-slate-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                    </div>
                </div>
            </div>

            {/* Top Identity Card */}
            <div className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm border ${isFrozen ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-md flex-shrink-0 bg-slate-100 border-4 border-white flex items-center justify-center text-3xl font-bold text-slate-400">
                        {student.profileImageUrl ? (
                            <img src={student.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : student.firstName.charAt(0)}
                    </div>
                    <div className="space-y-1 mt-1">
                        <button onClick={() => navigate('/students')} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors mb-1">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            Back to Student Directory
                        </button>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{student.firstName} {student.lastName}</h2>
                            {isFrozen ? (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Inactive
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Active
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500 mt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                Class {student.class}-{student.section}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                Admission: {student.dateOfAdmission ? new Date(student.dateOfAdmission).getFullYear() : '2024'}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 mt-2">
                            <span className="material-symbols-outlined text-[18px]">badge</span>
                            ID: {student.studentAppId} <span className="mx-2 text-slate-300">|</span> Roll: {student.rollNumber}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={handleSaveEdit} disabled={isSaving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors text-sm">
                                <span className="material-symbols-outlined text-[18px]">save</span> {isSaving ? 'Saving...' : 'Save Details'}
                            </button>
                            <button onClick={() => { setIsEditing(false); setEditData(student); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} disabled={isFrozen} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                            </button>
                            <button onClick={handleStatusChange} className={`px-5 py-2.5 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm ${isFrozen ? 'bg-green-100 hover:bg-green-200 text-green-700' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}>
                                <span className="material-symbols-outlined text-[18px]">sync_alt</span> {isFrozen ? 'Mark Active' : 'Mark Inactive'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
                
                {/* Tabs */}
                <div className="flex items-center gap-8 px-8 border-b border-slate-100 pt-2 overflow-x-auto custom-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 pt-4 px-2 font-bold text-sm tracking-wide transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row flex-1">
                    {/* Left Detail Form Canvas */}
                    <div className="flex-1 p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
                        {activeTab === 'Personal' && (
                            <div className="space-y-10 animate-fade-in">
                                <div>
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800 mb-6">
                                        <span className="material-symbols-outlined text-blue-600">person</span>
                                        Student Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                        {/* FIRST NAME */}
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">First Name</span>
                                            {isEditing ? (
                                                <input name="firstName" value={editData.firstName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.firstName}</span>
                                            )}
                                        </div>
                                        {/* LAST NAME */}
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Name</span>
                                            {isEditing ? (
                                                <input name="lastName" value={editData.lastName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.lastName}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">{new Date(student.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">{student.gender}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</span>
                                            {isEditing ? (
                                                <input name="primaryContact" value={editData.primaryContact} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.primaryContact}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</span>
                                            {isEditing ? (
                                                <input name="parentEmail" value={editData.parentEmail} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" placeholder="Optional" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.parentEmail || 'Not Provided'}</span>
                                            )}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Address</span>
                                            {isEditing ? (
                                                <textarea name="currentAddress" value={editData.currentAddress} onChange={handleInputChange} rows="2" className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-medium text-slate-800 resize-none" />
                                            ) : (
                                                <span className="font-medium text-slate-600 px-2 py-1">{student.currentAddress}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-800 mb-6">
                                        <span className="material-symbols-outlined text-blue-600">family_restroom</span>
                                        Guardian Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Father's Name</span>
                                            {isEditing ? (
                                                <input name="fatherName" value={editData.fatherName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.fatherName}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mother's Name</span>
                                            {isEditing ? (
                                                <input name="motherName" value={editData.motherName} onChange={handleInputChange} className="w-full border-b-2 border-blue-500 bg-blue-50/50 outline-none px-2 py-1 font-bold text-slate-800" />
                                            ) : (
                                                <span className="font-bold text-slate-800 px-2 py-1">{student.motherName}</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Occupation</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">Not Provided</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Contact</span>
                                            <span className="font-bold text-slate-800 px-2 py-1">{student.primaryContact}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Academic' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-4">Academic History</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-6 rounded-2xl">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Class</span>
                                        <span className="text-2xl font-black text-slate-800">{student.class} - {student.section}</span>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl">
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date of Admission</span>
                                        <span className="text-2xl font-black text-slate-800">{student.dateOfAdmission ? new Date(student.dateOfAdmission).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">school</span>
                                    <p className="font-bold">No past academic records found.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Documents' && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-4">Required Documents</h3>
                                
                                <div className="flex items-center justify-between p-5 border border-slate-200 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined">fingerprint</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">Aadhaar Card</h4>
                                            <p className="text-sm font-medium text-slate-500">
                                                {student.aadhaarNumber ? `ID: ${student.aadhaarNumber}` : 'Not Available'}
                                            </p>
                                        </div>
                                    </div>
                                    {student.aadhaarNumber && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Verified</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stubs for empty sections */}
                        {(activeTab === 'Exams' || activeTab === 'Attendance') && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fade-in">
                                <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">{activeTab === 'Exams' ? 'quiz' : 'event_available'}</span>
                                <h3 className="text-lg font-bold text-slate-600 mb-1">Not Enough Data</h3>
                                <p className="text-sm text-slate-400">There corresponds no records for this term yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar Widget Canvas */}
                    <div className="w-full lg:w-[320px] p-6 sm:p-8 bg-slate-50/50 space-y-6 flex-shrink-0">
                        {/* Fake Calendar Widget */}
                        <div className="bg-[#f8fafc] border border-slate-100 rounded-3xl p-6 shadow-sm">
                            <h4 className="font-extrabold text-slate-800 mb-4 flex items-center justify-between">
                                Attendance Overview <span className="text-blue-600 text-sm">Oct 2023</span>
                            </h4>
                            <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center mb-6">
                                {['M','T','W','T','F','S','S'].map(d=><div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}
                                {/* Fake Days */}
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">1</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">2</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">3</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">4</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">5</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">6</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">7</div>
                                
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">8</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-rose-500 text-white flex items-center justify-center">9</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">10</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">11</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-amber-400 text-white flex items-center justify-center">12</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">13</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">14</div>

                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">15</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">16</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">17</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-rose-500 text-white flex items-center justify-center">18</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center">19</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">20</div>
                                <div className="text-xs font-bold w-6 h-6 mx-auto text-slate-400">21</div>
                            </div>

                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-2">
                                <span>Working Days</span>
                                <span className="text-slate-800">24</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-500 mb-6 border-b border-dashed border-slate-200 pb-4">
                                <span>Present</span>
                                <span className="text-emerald-500">21</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Percentage</span>
                                <span className="text-2xl font-black text-blue-600">87.5%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full" style={{width: '87.5%'}}></div>
                            </div>
                        </div>

                        {/* Academic Standing */}
                        <div className="bg-[#f0f5ff] rounded-3xl p-6 shadow-sm border border-blue-100">
                            <h4 className="font-extrabold text-blue-700 mb-4 text-sm">Academic standing</h4>
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-4xl font-black text-slate-800">A+</span>
                                <span className="text-sm font-bold text-slate-500 mb-1">Top 5%</span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                {student.firstName} is currently leading the class in Mathematics and Science.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default StudentProfile;
