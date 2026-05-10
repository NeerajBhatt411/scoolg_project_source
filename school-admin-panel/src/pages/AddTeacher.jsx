import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddTeacher = () => {
    const navigate = useNavigate();
    const schoolId = localStorage.getItem('scoolg_school_id');
    const API_BASE = 'https://scoolg-backend.netlify.app/api/admin';

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        highestQualification: '',
        specialization: '',
        experienceYears: '',
        dateOfJoining: '',
        residentialAddress: ''
    });

    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveTeacher = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/teachers`, {
                schoolId,
                ...formData
            });
            setSuccessData(res.data.appCredentials);
        } catch (err) {
            console.error(err);
            alert("Error adding teacher: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight">Add New Teacher</h2>
                </div>
            </header>

            <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
                {successData ? (
                    <div className="bg-white rounded-[24px] p-10 text-center premium-shadow">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-[40px]">check_circle</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Teacher Added Successfully!</h3>
                        <p className="text-slate-500 mb-8">Please copy the credentials below and share them with the teacher.</p>
                        
                        <div className="bg-slate-50 rounded-2xl p-6 max-w-md mx-auto border border-slate-200 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Teacher App ID</p>
                                <p className="text-xl font-mono font-black text-[#2563eb]">{successData.teacherAppId}</p>
                            </div>
                            <div className="h-[1px] bg-slate-200 w-full"></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Password</p>
                                <p className="text-xl font-mono font-black text-slate-700">{successData.password}</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/teachers')}
                            className="mt-8 px-8 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:shadow-lg transition-all">
                            Back to Teachers
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-[24px] p-6 sm:p-10 premium-shadow">
                        <form onSubmit={handleSaveTeacher}>
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="flex flex-col items-center gap-4 lg:w-[200px] shrink-0">
                                    <div className="relative w-[140px] h-[140px] rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                                        <span className="material-symbols-outlined text-[48px] text-slate-400">person</span>
                                        <button type="button" className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center border-2 border-white shadow-sm hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                        </button>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Upload Photo</span>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Full Name</label>
                                        <input required name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="e.g. Eleanor Rigby" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Employee ID</label>
                                        <input type="text" value="Auto-generated on save" readOnly className="w-full h-12 px-4 rounded-xl border-none bg-slate-200/70 text-sm font-bold text-slate-600 outline-none cursor-not-allowed" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Phone Number</label>
                                        <input required name="phone" value={formData.phone} onChange={handleInputChange} type="text" placeholder="+1 (555) 000-0000" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Email Address</label>
                                        <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="e.g. teacher@scoolg.edu" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Highest Qualification</label>
                                        <input name="highestQualification" value={formData.highestQualification} onChange={handleInputChange} type="text" placeholder="e.g. M.Ed, PhD" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Specialization</label>
                                        <input name="specialization" value={formData.specialization} onChange={handleInputChange} type="text" placeholder="e.g. Quantum Physics" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Experience (Years)</label>
                                        <input name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} type="number" placeholder="0" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Date of Joining</label>
                                        <div className="relative">
                                            <input name="dateOfJoining" value={formData.dateOfJoining} onChange={handleInputChange} type="date" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-500 outline-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-600 ml-1">Residential Address</label>
                                        <input name="residentialAddress" value={formData.residentialAddress} onChange={handleInputChange} type="text" placeholder="Street, City, Zip Code" className="w-full h-12 px-4 rounded-xl border-none bg-slate-100 focus:bg-slate-50 focus:ring-2 focus:ring-[#2563eb]/50 transition-all text-sm font-semibold text-slate-800 placeholder-slate-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end items-center gap-4 pt-8">
                                <button type="button" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors" onClick={() => navigate('/teachers')}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-[#2563eb] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-70">
                                    {loading ? 'Saving...' : 'Save Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default AddTeacher;
