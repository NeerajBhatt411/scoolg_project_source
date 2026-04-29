import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SchoolProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [school, setSchool] = useState(location.state?.school);
    const [activeTab, setActiveTab] = useState('Overview');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!school) {
        return (
            <div className="flex items-center justify-center min-h-[500px] text-gray-500 font-bold">
                No school data found. <button onClick={() => navigate('/schools')} className="ml-2 text-blue-600 underline">Go Back</button>
            </div>
        );
    }

    const tabs = ['Overview', 'Contact Info', 'Gallery', 'Statistics', 'Advanced'];
    const isActive = school.status !== 'PENDING' && school.status !== 'SUSPENDED' && school.status !== 'INACTIVE';

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        
        setIsUpdating(true);
        try {
            const res = await fetch(`https://scoolg-backend.netlify.app/api/superadmin/schools/${school.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updatedSchool = await res.json();
                setSchool(updatedSchool.school);
                alert(`Status updated to ${newStatus}`);
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Status update error", error);
            alert("Error updating status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch(`https://scoolg-backend.netlify.app/api/superadmin/schools/${school.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                navigate('/schools');
            } else {
                alert("Failed to delete school.");
                setShowDeleteModal(false);
            }
        } catch (error) {
            console.error("Deletion error", error);
            alert("Error deleting school.");
            setShowDeleteModal(false);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-[1400px] mx-auto pb-20 relative bg-background">
            {/* Header / Identity Card */}
            <div className={`bg-surface rounded-[40px] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl border ${!isActive ? 'border-orange-200 bg-orange-50/10' : 'border-border'}`}>
                <div className="flex items-start gap-8">
                    {school.formData?.logo ? (
                        <img src={school.formData.logo} alt="Logo" className="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] overflow-hidden shadow-2xl flex-shrink-0 object-cover bg-surface-container border-4 border-surface" />
                    ) : (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] overflow-hidden shadow-2xl flex-shrink-0 bg-primary/10 border-4 border-surface flex items-center justify-center text-4xl font-black text-primary">
                            {school.formData?.schoolName ? school.formData.schoolName.substring(0, 2).toUpperCase() : 'NA'}
                        </div>
                    )}
                    <div className="space-y-2 mt-2">
                        <button onClick={() => navigate('/schools')} className="text-primary font-black text-xs flex items-center gap-1 hover:opacity-70 transition-all mb-2 uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                            Back to List
                        </button>
                        <h2 className="text-3xl sm:text-4xl font-black text-text tracking-tighter leading-none">
                            {school.formData?.schoolName || 'Unnamed School'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-muted">{school.email}</span>
                            {isActive ? (
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-100 px-2.5 py-1 rounded-full uppercase">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Active
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full uppercase">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> {school.status}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {isActive ? (
                        <button 
                            disabled={isUpdating}
                            onClick={() => handleStatusChange('INACTIVE')}
                            className="px-6 py-3 font-black rounded-2xl flex items-center gap-2 transition-all text-xs uppercase tracking-widest bg-orange-100 hover:bg-orange-200 text-orange-700 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">block</span> Suspend
                        </button>
                    ) : (
                        <button 
                            disabled={isUpdating}
                            onClick={() => handleStatusChange('COMPLETED')}
                            className="px-6 py-3 font-black rounded-2xl flex items-center gap-2 transition-all text-xs uppercase tracking-widest bg-green-100 hover:bg-green-200 text-green-700 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">check_circle</span> Activate
                        </button>
                    )}
                    <button 
                        disabled={isUpdating}
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-3 font-black rounded-2xl flex items-center gap-2 transition-all text-xs uppercase tracking-widest bg-error-container/20 hover:bg-error-container/40 text-error disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative bg-surface rounded-[40px] shadow-2xl border border-border overflow-hidden flex flex-col min-h-[700px]">
                
                {/* Tabs */}
                <div className="flex items-center gap-6 px-10 border-b border-border bg-surface-container/10 pt-2 overflow-x-auto custom-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-5 pt-5 px-4 font-black text-xs uppercase tracking-widest transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {tab === 'Overview' ? 'info' : tab === 'Contact Info' ? 'alternate_email' : tab === 'Gallery' ? 'photo_library' : tab === 'Statistics' ? 'analytics' : 'developer_mode'}
                            </span>
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row flex-1">
                    {/* Left Detail Canvas */}
                    <div className="flex-1 p-10 border-b lg:border-b-0 lg:border-r border-border bg-surface">
                        {activeTab === 'Overview' && (
                            <div className="space-y-12 animate-fade-in">
                                <div>
                                    <h3 className="flex items-center gap-3 text-xl font-black text-text mb-8">
                                        <span className="material-symbols-outlined text-primary text-3xl">domain</span>
                                        Institutional Profile
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="bg-surface-container/20 p-6 rounded-3xl border border-border/50">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">School Full Name</span>
                                            <span className="font-black text-text text-xl tracking-tight">{school.formData?.schoolName}</span>
                                        </div>
                                        <div className="bg-surface-container/20 p-6 rounded-3xl border border-border/50">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Affiliation Board</span>
                                            <span className="font-black text-text text-xl tracking-tight">{school.formData?.affiliationBoard || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 p-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                                <span className="material-symbols-outlined">account_tree</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest">Total Branches</span>
                                                <span className="font-black text-text">{school.formData?.totalBranches || '1'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                                <span className="material-symbols-outlined">language</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest">Website</span>
                                                <a href={school.formData?.website} target="_blank" rel="noreferrer" className="font-black text-primary underline truncate max-w-[200px] block">
                                                    {school.formData?.website || 'N/A'}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2 p-6 bg-surface-container-low/50 rounded-3xl border border-border/30">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Campus Address</span>
                                            <div className="font-bold text-text text-lg flex items-start gap-3">
                                                <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                                                {school.formData?.address}, {school.formData?.city}, {school.formData?.state} - {school.formData?.pincode}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-10 border-t border-border">
                                    <h3 className="flex items-center gap-3 text-xl font-black text-text mb-8">
                                        <span className="material-symbols-outlined text-primary text-3xl">badge</span>
                                        Leadership & Management
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="bg-surface-container-low p-6 rounded-3xl group hover:bg-surface-container-high transition-all">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Principal / Head</span>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-text/5 flex items-center justify-center font-black text-text text-xl">
                                                    {school.formData?.principalName?.substring(0, 1)}
                                                </div>
                                                <span className="font-black text-text text-lg tracking-tight">
                                                    {school.formData?.principalName || 'Not Disclosed'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-surface-container-low p-6 rounded-3xl group hover:bg-surface-container-high transition-all">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">IT Administrator</span>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-text/5 flex items-center justify-center font-black text-text text-xl">
                                                    {school.formData?.itAdminName?.substring(0, 1)}
                                                </div>
                                                <span className="font-black text-text text-lg tracking-tight">
                                                    {school.formData?.itAdminName || 'Not Disclosed'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Contact Info' && (
                            <div className="space-y-12 animate-fade-in">
                                <h3 className="flex items-center gap-3 text-xl font-black text-text mb-8">
                                    <span className="material-symbols-outlined text-primary text-3xl">contact_mail</span>
                                    Connectivity Channels
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="bg-surface-container-low p-8 rounded-[40px] space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                                <span className="material-symbols-outlined">email</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Admin Email</span>
                                                <p className="font-black text-text text-lg">{school.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-text flex items-center justify-center">
                                                <span className="material-symbols-outlined">support_agent</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Support Line</span>
                                                <p className="font-black text-text text-lg">{school.formData?.supportEmail || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-surface-container-low p-8 rounded-[40px] space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                                <span className="material-symbols-outlined">call</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</span>
                                                <p className="font-black text-text text-lg">{school.formData?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-text flex items-center justify-center">
                                                <span className="material-symbols-outlined">person_pin</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Onboarding POC</span>
                                                <p className="font-black text-text text-lg">{school.formData?.contactPerson || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Gallery' && (
                            <div className="space-y-12 animate-fade-in">
                                <h3 className="flex items-center gap-3 text-xl font-black text-text mb-2">
                                    <span className="material-symbols-outlined text-primary text-3xl">photo_library</span>
                                    Branding Artifacts
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <span className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-2">Official Institutional Logo</span>
                                        <div className="aspect-square bg-surface-container/30 rounded-[48px] border-8 border-surface shadow-2xl overflow-hidden flex items-center justify-center group relative cursor-pointer">
                                            {school.formData?.logo ? (
                                                <img src={school.formData.logo} alt="Logo" className="w-full h-full object-contain p-12 group-hover:scale-110 transition-all duration-700" />
                                            ) : (
                                                <div className="text-center opacity-20 group-hover:opacity-40 transition-opacity">
                                                    <span className="material-symbols-outlined text-7xl block">image_not_supported</span>
                                                    <span className="text-[10px] font-black mt-2 uppercase">Awaiting Upload</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <span className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-2">Digital Banner / Cover</span>
                                        <div className="aspect-[4/3] bg-surface-container/30 rounded-[48px] border-8 border-surface shadow-2xl overflow-hidden flex items-center justify-center group relative cursor-pointer">
                                            {school.formData?.banner ? (
                                                <img src={school.formData.banner} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                                            ) : (
                                                <div className="text-center opacity-20 group-hover:opacity-40 transition-opacity">
                                                    <span className="material-symbols-outlined text-7xl block">landscape</span>
                                                    <span className="text-[10px] font-black mt-2 uppercase">Awaiting Upload</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Statistics' && (
                            <div className="flex flex-col items-center justify-center py-24 text-text-muted animate-fade-in opacity-40">
                                <div className="w-24 h-24 bg-surface-container rounded-[32px] flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-5xl">bar_chart_4_bars</span>
                                </div>
                                <h3 className="text-2xl font-black mb-2 tracking-tighter">Usage Analytics</h3>
                                <p className="text-sm font-bold uppercase tracking-widest">Real-time sync coming soon</p>
                            </div>
                        )}

                        {activeTab === 'Advanced' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h3 className="flex items-center gap-3 text-xl font-black text-error">
                                        <span className="material-symbols-outlined text-3xl">developer_mode</span>
                                        Raw Kernel Access
                                    </h3>
                                    <span className="text-[10px] font-black bg-error text-on-error px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-error/20">Read/Write Access</span>
                                </div>
                                
                                <div className="relative group">
                                    <textarea 
                                        className="w-full bg-gray-900 text-green-400 p-8 rounded-[40px] overflow-x-auto text-xs font-mono h-[450px] border-none focus:ring-8 focus:ring-error/10 shadow-inner custom-scrollbar-dark transition-all"
                                        defaultValue={JSON.stringify(school.formData, null, 2)}
                                        id="raw-json-editor"
                                    />
                                    <div className="absolute top-6 right-8 text-[10px] font-black text-gray-500 bg-gray-800 px-3 py-1 rounded-full uppercase">DB: {school.id}</div>
                                </div>
                                
                                <div className="flex items-center justify-between p-8 bg-error-container/5 rounded-[40px] border border-error/10">
                                    <div className="max-w-md">
                                        <p className="font-black text-text tracking-tight">Overwrite Database State</p>
                                        <p className="text-xs text-text-muted font-bold leading-relaxed mt-1">This will bypass all validation. Ensure the JSON schema matches the onboarding requirements.</p>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            try {
                                                const newJSON = JSON.parse(document.getElementById('raw-json-editor').value);
                                                setIsUpdating(true);
                                                const res = await fetch(`https://scoolg-backend.netlify.app/api/onboarding/update/${school.id}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ formData: newJSON })
                                                });
                                                if (res.ok) {
                                                    const updated = await res.json();
                                                    setSchool(updated.data);
                                                    alert('Database kernel updated successfully!');
                                                } else {
                                                    alert('Transmission failed. Check console for details.');
                                                }
                                            } catch(e) {
                                                alert('Syntax Error: Invalid JSON structure detected.');
                                            } finally {
                                                setIsUpdating(false);
                                            }
                                        }}
                                        disabled={isUpdating}
                                        className="px-10 py-4 bg-error text-on-error font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-error/30 flex items-center gap-2 active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{isUpdating ? 'sync' : 'publish'}</span>
                                        {isUpdating ? 'Updating...' : 'Commit Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar Widget Canvas */}
                    <div className="w-full lg:w-[380px] p-10 bg-surface-container/20 space-y-10 flex-shrink-0">
                        
                        {/* Quick Metrics */}
                        <div className="bg-surface border border-border rounded-[40px] p-8 shadow-xl">
                            <h4 className="font-black text-text mb-8 flex items-center justify-between text-[10px] uppercase tracking-widest opacity-60">
                                Platform Metrics
                                <span className="material-symbols-outlined text-primary">analytics</span>
                            </h4>
                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between items-center text-[10px] font-black text-text-muted mb-3 uppercase tracking-tighter">
                                        <span>Student Load</span>
                                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full tracking-normal">62%</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-4 rounded-full overflow-hidden p-1 border border-border/50 shadow-inner">
                                        <div className="bg-primary h-full rounded-full shadow-sm shadow-primary/30" style={{width: '62%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center text-[10px] font-black text-text-muted mb-3 uppercase tracking-tighter">
                                        <span>Faculty Sync</span>
                                        <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-full tracking-normal">45%</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-4 rounded-full overflow-hidden p-1 border border-border/50 shadow-inner">
                                        <div className="bg-green-500 h-full rounded-full shadow-sm shadow-green-500/30" style={{width: '45%'}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center text-[10px] font-black text-text-muted mb-3 uppercase tracking-tighter">
                                        <span>Cloud Storage</span>
                                        <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full tracking-normal">4.2 GB</span>
                                    </div>
                                    <div className="w-full bg-surface-container h-4 rounded-full overflow-hidden p-1 border border-border/50 shadow-inner">
                                        <div className="bg-orange-500 h-full rounded-full shadow-sm shadow-orange-500/30" style={{width: '42%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Status Card */}
                        <div className="bg-primary/5 rounded-[40px] p-8 border border-primary/10 relative overflow-hidden group">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
                            <h4 className="font-black text-primary mb-6 text-[10px] uppercase tracking-widest opacity-80">Software Architecture</h4>
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-6xl font-black text-text leading-none tracking-tighter">v2.4</span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-100 px-3 py-1 rounded-full mb-1 border border-green-200">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    STABLE
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-text-muted leading-relaxed opacity-80">
                                This instance is synced with the global master node and receiving OTA security patches from Scoolg HQ.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .scale-up {
                    animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 10px;
                }
                .custom-scrollbar-dark::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar-dark::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 10px;
                }
            `}</style>

            {/* Custom Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-surface rounded-[48px] p-10 max-w-sm w-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-border scale-up">
                        <div className="w-20 h-20 bg-error/10 text-error rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3">
                            <span className="material-symbols-outlined text-5xl">warning</span>
                        </div>
                        <h3 className="text-2xl font-black text-text text-center mb-3 tracking-tight">Immediate Action?</h3>
                        <p className="text-text-muted text-center text-sm font-bold mb-10 leading-relaxed">
                            This will permanently delete <span className="text-text">{school.formData?.schoolName}</span>. All cloud data, student records, and access tokens will be shredded.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleDelete}
                                disabled={isUpdating}
                                className="w-full py-5 bg-error text-on-error font-black rounded-2xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest shadow-xl shadow-error/20"
                            >
                                {isUpdating ? 'Shredding...' : 'Confirm Destruction'}
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isUpdating}
                                className="w-full py-5 bg-surface-container hover:bg-surface-container-high text-text font-black rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest"
                            >
                                Abort Mission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolProfile;
