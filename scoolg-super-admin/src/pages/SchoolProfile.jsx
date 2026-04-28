import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SchoolProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [school, setSchool] = useState(location.state?.school);
    const [activeTab, setActiveTab] = useState('Overview');

    if (!school) {
        return (
            <div className="flex items-center justify-center min-h-[500px] text-gray-500 font-bold">
                No school data found. <button onClick={() => navigate('/schools')} className="ml-2 text-blue-600 underline">Go Back</button>
            </div>
        );
    }

    const tabs = ['Overview', 'Contact Info', 'Subscription', 'Statistics', 'Settings'];
    const isActive = school.status !== 'PENDING' && school.status !== 'SUSPENDED';

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-[1200px] mx-auto pb-20 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">School Profile</h1>
                <div className="flex items-center gap-4">
                    <button className="bg-white border border-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        Login as Admin
                    </button>
                </div>
            </div>

            {/* Top Identity Card */}
            <div className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm border ${!isActive ? 'border-orange-200 bg-orange-50/20' : 'border-gray-100'}`}>
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-md flex-shrink-0 bg-blue-50 border-4 border-white flex items-center justify-center text-3xl font-bold text-blue-600">
                        {school.formData?.schoolName ? school.formData.schoolName.substring(0, 2).toUpperCase() : 'NA'}
                    </div>
                    <div className="space-y-1 mt-1">
                        <button onClick={() => navigate('/schools')} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors mb-1">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            Back to Directory
                        </button>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{school.formData?.schoolName || 'Unknown School'}</h2>
                            {isActive ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> {school.status}
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> {school.status}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500 mt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                                {school.formData?.city || 'City N/A'}, {school.formData?.state || 'State N/A'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                Onboarded: {new Date(school.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 mt-2">
                            <span className="material-symbols-outlined text-[18px]">badge</span>
                            Campus Code: <strong className="text-gray-800">{school.campusCode || 'UNASSIGNED'}</strong>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm">
                        <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                    </button>
                    <button className={`px-5 py-2.5 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm ${isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}>
                        <span className="material-symbols-outlined text-[18px]">block</span> {isActive ? 'Suspend' : 'Activate'}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
                
                {/* Tabs */}
                <div className="flex items-center gap-8 px-8 border-b border-gray-100 pt-2 overflow-x-auto custom-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 pt-4 px-2 font-bold text-sm tracking-wide transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row flex-1">
                    {/* Left Detail Canvas */}
                    <div className="flex-1 p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                        {activeTab === 'Overview' && (
                            <div className="space-y-10 animate-fade-in">
                                <div>
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 mb-6">
                                        <span className="material-symbols-outlined text-blue-600">domain</span>
                                        School Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">School Name</span>
                                            <span className="font-bold text-gray-800 px-2 py-1">{school.formData?.schoolName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Affiliation Board</span>
                                            <span className="font-bold text-gray-800 px-2 py-1">{school.formData?.affiliationBoard || 'CBSE (Default)'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Branches</span>
                                            <span className="font-bold text-gray-800 px-2 py-1">{school.formData?.totalBranches || '1'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">School Website</span>
                                            <span className="font-bold text-blue-600 underline px-2 py-1 cursor-pointer">{school.formData?.website || 'N/A'}</span>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Address</span>
                                            <span className="font-medium text-gray-600 px-2 py-1">
                                                {school.formData?.address || 'Address not provided'} {school.formData?.city} {school.formData?.state} {school.formData?.pincode}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 mb-6">
                                        <span className="material-symbols-outlined text-blue-600">manage_accounts</span>
                                        Key Personnel
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Principal Name</span>
                                            <span className="font-bold text-gray-800 px-2 py-1">{school.formData?.principalName || 'Not Assigned'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">IT Admin Name</span>
                                            <span className="font-bold text-gray-800 px-2 py-1">{school.formData?.itAdminName || 'Not Assigned'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Contact Info' && (
                            <div className="space-y-10 animate-fade-in">
                                <h3 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 mb-6">
                                    <span className="material-symbols-outlined text-blue-600">contact_mail</span>
                                    Communication Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Email (Admin)</span>
                                        <span className="font-bold text-gray-800 px-2 py-1">{school.email}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Support Email</span>
                                        <span className="font-bold text-gray-800 px-2 py-1">{school.formData?.supportEmail || school.email}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Phone</span>
                                        <span className="font-bold text-gray-800 px-2 py-1">{school.formData?.phone || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Secondary Phone</span>
                                        <span className="font-bold text-gray-800 px-2 py-1">{school.formData?.secondaryPhone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(activeTab === 'Subscription' || activeTab === 'Statistics' || activeTab === 'Settings') && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-fade-in">
                                <span className="material-symbols-outlined text-6xl mb-4 text-gray-200">
                                    {activeTab === 'Subscription' ? 'workspace_premium' : activeTab === 'Statistics' ? 'monitoring' : 'settings_applications'}
                                </span>
                                <h3 className="text-lg font-bold text-gray-600 mb-1">Module Under Construction</h3>
                                <p className="text-sm text-gray-400">Detailed {activeTab.toLowerCase()} insights will be available in the next update.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar Widget Canvas */}
                    <div className="w-full lg:w-[320px] p-6 sm:p-8 bg-gray-50/50 space-y-6 flex-shrink-0">
                        
                        {/* Quick Stats Widget */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <h4 className="font-extrabold text-gray-900 mb-4 flex items-center justify-between">
                                Current Utilization
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-1">
                                        <span>Students</span>
                                        <span className="text-blue-600">1,240 / 2,000</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '62%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-1">
                                        <span>Teachers</span>
                                        <span className="text-emerald-500">45 / 100</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{width: '45%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-1">
                                        <span>Storage</span>
                                        <span className="text-orange-500">4.2GB / 10GB</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '42%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* App Version Standing */}
                        <div className="bg-[#f0f5ff] rounded-3xl p-6 shadow-sm border border-blue-100">
                            <h4 className="font-extrabold text-blue-700 mb-4 text-sm">System Version</h4>
                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-4xl font-black text-gray-900">v2.4</span>
                                <span className="text-sm font-bold text-green-600 mb-1">Up to date</span>
                            </div>
                            <p className="text-xs font-medium text-gray-600 leading-relaxed">
                                {school.formData?.schoolName} is running the latest stable build of the Scoolg Platform.
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

export default SchoolProfile;
