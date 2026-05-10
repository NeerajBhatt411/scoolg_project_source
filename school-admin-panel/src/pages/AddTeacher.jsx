import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddTeacher = () => {
    const navigate = useNavigate();
    const schoolId = localStorage.getItem('scoolg_school_id');
    const API_BASE = 'https://scoolg-backend.netlify.app/api/admin';

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
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
            alert("Error adding teacher");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* TopNavBar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center w-full md:w-auto">
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[#1e293b] tracking-tight">Add New Teacher</h2>
                </div>
            </header>

            {/* Content Canvas */}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">First Name</label>
                                    <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="e.g. John" className="w-full h-12 px-4 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/50 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Last Name</label>
                                    <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="e.g. Doe" className="w-full h-12 px-4 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/50 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Phone Number</label>
                                    <input required name="phone" value={formData.phone} onChange={handleInputChange} type="text" placeholder="e.g. 9876543210" className="w-full h-12 px-4 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/50 outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Email Address</label>
                                    <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Optional" className="w-full h-12 px-4 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-[#2563eb]/50 outline-none" />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-4 mt-10">
                                <button type="button" onClick={() => navigate('/teachers')} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancel</button>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-70">
                                    {loading ? 'Saving...' : 'Save & Generate ID'}
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
