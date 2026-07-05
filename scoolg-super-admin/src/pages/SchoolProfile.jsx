import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { saFetch } from '../lib/api';

const SchoolProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id: routeId } = useParams();

    const [school, setSchool] = useState(location.state?.school);
    const [activeTab, setActiveTab] = useState('Overview');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(school?.formData || {});
    const [overview, setOverview] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    const [notFound, setNotFound] = useState(false);

    // On refresh / deep-link there's no navigation state — fetch the school by id
    // so the page works instead of showing "No school data found".
    useEffect(() => {
        if (school || !routeId) return;
        saFetch('/superadmin/schools')
            .then((r) => r.json())
            .then((list) => {
                const found = Array.isArray(list) ? list.find((s) => String(s.id) === String(routeId)) : null;
                if (found) { setSchool(found); setEditData(found.formData || {}); }
                else setNotFound(true);
            })
            .catch(() => setNotFound(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [school, routeId]);

    // Load the school's operational data when the "Data" tab is opened.
    useEffect(() => {
        if (activeTab !== 'Data' || overview || !school?.id) return;
        setLoadingData(true);
        saFetch(`/superadmin/schools/${school.id}/overview`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => setOverview(d))
            .catch(() => {})
            .finally(() => setLoadingData(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, school?.id]);

    if (!school) {
        if (notFound) {
            return (
                <div className="flex items-center justify-center min-h-[500px] text-text-muted font-bold">
                    No school data found. <button onClick={() => navigate('/schools')} className="ml-2 text-primary underline">Go Back</button>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center min-h-[500px] text-text-muted font-bold">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> Loading school…
            </div>
        );
    }

    const tabs = ['Overview', 'Data', 'Contact Info', 'Academic', 'Gallery', 'Advanced'];
    const isActive = school.status !== 'PENDING' && school.status !== 'SUSPENDED' && school.status !== 'INACTIVE';

    const handleStatusChange = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        
        setIsUpdating(true);
        try {
            const res = await saFetch(`/superadmin/schools/${school.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const updatedSchool = await res.json();
                setSchool(updatedSchool.school);
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error("Status update error", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsUpdating(true);
        try {
            const res = await saFetch(`/onboarding/update/${school.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ formData: editData })
            });
            if (res.ok) {
                const updated = await res.json();
                setSchool(updated.data);
                setIsEditing(false);
                alert('School profile updated successfully!');
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error("Save error", error);
            alert("Error saving data.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        setIsUpdating(true);
        try {
            const res = await saFetch(`/superadmin/schools/${school.id}`, { method: 'DELETE' });
            if (res.ok) {
                navigate('/schools');
            } else {
                alert("Failed to delete school.");
                setShowDeleteModal(false);
            }
        } catch (error) {
            console.error("Deletion error", error);
            setShowDeleteModal(false);
        } finally {
            setIsUpdating(false);
        }
    };

    const InputField = ({ label, value, onChange, type = "text", placeholder = "" }) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{label}</label>
            <input 
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-surface-container/50 border border-border/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-text focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
            />
        </div>
    );

    const TextAreaField = ({ label, value, onChange, placeholder = "" }) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{label}</label>
            <textarea 
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full bg-surface-container/50 border border-border/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-text focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none"
            />
        </div>
    );

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
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-6 py-3 font-black rounded-2xl flex items-center gap-2 transition-all text-xs uppercase tracking-widest ${isEditing ? 'bg-primary text-on-primary' : 'bg-surface-container hover:bg-surface-container-high text-text'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{isEditing ? 'visibility' : 'edit'}</span> 
                        {isEditing ? 'View Profile' : 'Edit Profile'}
                    </button>
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

            {isEditing ? (
                /* EDIT FORM UI */
                <div className="bg-surface rounded-[40px] shadow-2xl border-4 border-primary/20 overflow-hidden animate-fade-in">
                    <div className="p-8 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-text tracking-tight">Graphical Profile Editor</h3>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Sectioned Data Management</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 font-black text-xs uppercase tracking-widest text-text-muted hover:text-text transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveProfile}
                                disabled={isUpdating}
                                className="px-8 py-3 bg-primary text-on-primary font-black rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[20px]">{isUpdating ? 'sync' : 'save'}</span>
                                {isUpdating ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Column 1: Basic & Description */}
                        <div className="space-y-8">
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">info</span> Basic Identity
                            </h4>
                            <InputField label="School Name" value={editData.schoolName} onChange={(val) => setEditData({...editData, schoolName: val})} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Established Year" value={editData.establishedYear} onChange={(val) => setEditData({...editData, establishedYear: val})} />
                                <InputField label="Strength" value={editData.schoolStrength} onChange={(val) => setEditData({...editData, schoolStrength: val})} />
                            </div>
                            <TextAreaField label="School Description" value={editData.schoolDescription} onChange={(val) => setEditData({...editData, schoolDescription: val})} />
                            <TextAreaField label="Mission" value={editData.mission} onChange={(val) => setEditData({...editData, mission: val})} />
                            <TextAreaField label="Vision" value={editData.vision} onChange={(val) => setEditData({...editData, vision: val})} />
                        </div>

                        {/* Column 2: Location & Contact */}
                        <div className="space-y-8">
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">location_on</span> Contact & Venue
                            </h4>
                            <InputField label="Contact Phone" value={editData.phone} onChange={(val) => setEditData({...editData, phone: val})} />
                            <TextAreaField label="Full Address" value={editData.address} onChange={(val) => setEditData({...editData, address: val})} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="City" value={editData.city} onChange={(val) => setEditData({...editData, city: val})} />
                                <InputField label="State" value={editData.state} onChange={(val) => setEditData({...editData, state: val})} />
                            </div>
                            <InputField label="Pincode" value={editData.pincode} onChange={(val) => setEditData({...editData, pincode: val})} />
                            
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest pt-4 flex items-center gap-2 border-t border-border/50">
                                <span className="material-symbols-outlined text-[20px]">share</span> Social Media
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                <InputField label="Instagram" value={editData.socialMedia?.instagram} onChange={(val) => setEditData({...editData, socialMedia: {...editData.socialMedia, instagram: val}})} />
                                <InputField label="Facebook" value={editData.socialMedia?.facebook} onChange={(val) => setEditData({...editData, socialMedia: {...editData.socialMedia, facebook: val}})} />
                            </div>
                        </div>

                        {/* Column 3: Media & Academic */}
                        <div className="space-y-8">
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">school</span> Academic Config
                            </h4>
                            <InputField label="Primary Board" value={editData.otherBoardName || (editData.selectedBoards && editData.selectedBoards[0])} onChange={(val) => setEditData({...editData, otherBoardName: val})} />
                            <InputField label="School Type" value={editData.selectedSchoolType} onChange={(val) => setEditData({...editData, selectedSchoolType: val})} />
                            
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest pt-4 flex items-center gap-2 border-t border-border/50">
                                <span className="material-symbols-outlined text-[20px]">image</span> Media Assets (Cloud URLs)
                            </h4>
                            <InputField label="Logo URL" value={editData.logo} onChange={(val) => setEditData({...editData, logo: val})} />
                            <InputField label="Cover Image URL" value={editData.coverImage} onChange={(val) => setEditData({...editData, coverImage: val})} />
                            <TextAreaField label="Gallery (Comma separated URLs)" value={editData.gallery?.join(', ')} onChange={(val) => setEditData({...editData, gallery: val.split(',').map(s => s.trim())})} />
                            
                            <div className="bg-surface-container-high p-6 rounded-3xl space-y-4">
                                <h5 className="text-[10px] font-black text-text uppercase tracking-widest">Fees Breakdown</h5>
                                <div className="grid grid-cols-1 gap-3">
                                    <InputField label="Primary Fee" value={editData.fees?.primary} onChange={(val) => setEditData({...editData, fees: {...editData.fees, primary: val}})} />
                                    <InputField label="Secondary Fee" value={editData.fees?.secondary} onChange={(val) => setEditData({...editData, fees: {...editData.fees, secondary: val}})} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Main Content Area - DISPLAY MODE */
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
                                    {tab === 'Overview' ? 'info' : tab === 'Data' ? 'database' : tab === 'Contact Info' ? 'alternate_email' : tab === 'Academic' ? 'school' : tab === 'Gallery' ? 'photo_library' : 'developer_mode'}
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
                                                <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Established Year</span>
                                                <span className="font-black text-text text-xl tracking-tight">{school.formData?.establishedYear || 'N/A'}</span>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">About School</span>
                                                <p className="font-medium text-text-muted leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                                                    "{school.formData?.schoolDescription || 'No description provided.'}"
                                                </p>
                                            </div>
                                            <div className="p-6 bg-surface-container-low/50 rounded-3xl border border-border/30">
                                                <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Our Mission</span>
                                                <p className="text-xs font-bold text-text leading-relaxed">{school.formData?.mission || 'N/A'}</p>
                                            </div>
                                            <div className="p-6 bg-surface-container-low/50 rounded-3xl border border-border/30">
                                                <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Our Vision</span>
                                                <p className="text-xs font-bold text-text leading-relaxed">{school.formData?.vision || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-10 border-t border-border">
                                        <h3 className="flex items-center gap-3 text-xl font-black text-text mb-8">
                                            <span className="material-symbols-outlined text-primary text-3xl">groups</span>
                                            Key Leadership
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {school.formData?.leadership?.filter(l => l.name).map((person, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-3xl border border-border/30">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black text-2xl">
                                                        {person.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-text tracking-tight">{person.name}</p>
                                                        <p className="text-[10px] font-black text-primary uppercase">{person.role}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!school.formData?.leadership || school.formData.leadership.filter(l => l.name).length === 0) && <p className="text-sm text-text-muted font-bold opacity-50">No leadership data recorded.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Data' && (
                                <div className="space-y-10 animate-fade-in">
                                    <h3 className="flex items-center gap-3 text-xl font-black text-text">
                                        <span className="material-symbols-outlined text-primary text-3xl">database</span>
                                        School Records
                                    </h3>
                                    {loadingData && !overview ? (
                                        <p className="text-text-muted font-bold py-10 text-center">Loading school data…</p>
                                    ) : !overview ? (
                                        <p className="text-text-muted font-bold py-10 text-center">Could not load data.</p>
                                    ) : (
                                        <>
                                            {/* Counts */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {[['Students', overview.counts.students, 'group'], ['Teachers', overview.counts.teachers, 'co_present'], ['Classes', overview.counts.classes, 'school'], ['Sections', overview.counts.sections, 'layers'], ['Attendance', overview.counts.attendances, 'fact_check'], ['Homework', overview.counts.homeworks, 'assignment'], ['Calendar', overview.counts.calendarEvents, 'event']].map(([label, val, icon]) => (
                                                    <div key={label} className="bg-surface-container/30 border border-border/50 rounded-3xl p-5">
                                                        <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                                                        <p className="text-3xl font-black text-text mt-2 leading-none">{val}</p>
                                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{label}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Teachers */}
                                            <div>
                                                <h4 className="text-sm font-black text-text-muted uppercase tracking-widest mb-4">Teachers ({overview.teachers.length})</h4>
                                                {overview.teachers.length === 0 ? <p className="text-text-muted text-sm font-bold opacity-50">None yet.</p> : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {overview.teachers.map((t) => (
                                                            <div key={t._id} className="flex items-center gap-3 p-4 bg-surface-container-low rounded-3xl border border-border/30">
                                                                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black overflow-hidden shrink-0">
                                                                    {t.profileImageUrl ? <img src={t.profileImageUrl} className="w-full h-full object-cover" alt="" /> : (t.fullName || '?').charAt(0)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-black text-text truncate">{t.fullName}</p>
                                                                    <p className="text-[11px] font-bold text-text-muted truncate">{t.teacherAppId} · {t.email || t.phone || ''}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Classes */}
                                            <div>
                                                <h4 className="text-sm font-black text-text-muted uppercase tracking-widest mb-4">Classes ({overview.classes.length})</h4>
                                                {overview.classes.length === 0 ? <p className="text-text-muted text-sm font-bold opacity-50">None yet.</p> : (
                                                    <div className="space-y-3">
                                                        {overview.classes.map((c) => (
                                                            <div key={c._id} className="p-4 bg-surface-container-low rounded-3xl border border-border/30">
                                                                <p className="font-black text-text mb-2">{c.className}</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {(c.subjects || []).length ? c.subjects.map((s, i) => <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-[11px] font-black rounded-lg uppercase tracking-wider">{s}</span>) : <span className="text-text-muted text-xs italic">No subjects</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Students */}
                                            <div>
                                                <h4 className="text-sm font-black text-text-muted uppercase tracking-widest mb-4">Students ({overview.students.length})</h4>
                                                {overview.students.length === 0 ? <p className="text-text-muted text-sm font-bold opacity-50">None yet.</p> : (
                                                    <div className="max-h-[440px] overflow-y-auto custom-scrollbar rounded-3xl border border-border/40 divide-y divide-border/30">
                                                        {overview.students.map((s, i) => (
                                                            <div key={s._id} className="flex items-center gap-4 px-5 py-3 bg-surface">
                                                                <span className="w-8 text-xs font-black text-text-muted shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm overflow-hidden shrink-0">
                                                                    {s.profileImageUrl ? <img src={s.profileImageUrl} className="w-full h-full object-cover" alt="" /> : (s.firstName || '?').charAt(0)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-black text-text text-sm truncate">{s.firstName} {s.lastName}</p>
                                                                    <p className="text-[11px] font-bold text-text-muted truncate">{s.studentAppId}</p>
                                                                </div>
                                                                <span className="text-xs font-black text-text-muted shrink-0">{s.class} · {s.section}</span>
                                                                <span className="text-xs font-black text-primary shrink-0 w-10 text-right">#{s.rollNumber || 'NA'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Contact Info' && (
                                <div className="space-y-12 animate-fade-in">
                                    <h3 className="flex items-center gap-3 text-xl font-black text-text mb-8">
                                        <span className="material-symbols-outlined text-primary text-3xl">contact_mail</span>
                                        Location & Reach
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="bg-surface-container-low p-8 rounded-[40px] space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <span className="material-symbols-outlined">email</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Administrative Email</span>
                                                    <p className="font-black text-text text-lg">{school.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-surface-container-high text-text flex items-center justify-center">
                                                    <span className="material-symbols-outlined">call</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Primary Phone</span>
                                                    <p className="font-black text-text text-lg">{school.formData?.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-surface-container-low p-8 rounded-[40px] space-y-4">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Campus Address</span>
                                            <div className="font-bold text-text text-lg leading-snug">
                                                {school.formData?.address}<br/>
                                                {school.formData?.city}, {school.formData?.state}<br/>
                                                {school.formData?.pincode}
                                            </div>
                                            <div className="pt-4 flex gap-4">
                                                {school.formData?.socialMedia?.instagram && <a href={school.formData.socialMedia.instagram} target="_blank" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary border border-border">IG</a>}
                                                {school.formData?.socialMedia?.facebook && <a href={school.formData.socialMedia.facebook} target="_blank" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary border border-border">FB</a>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Academic' && (
                                <div className="space-y-12 animate-fade-in">
                                    <h3 className="flex items-center gap-3 text-xl font-black text-text mb-8">
                                        <span className="material-symbols-outlined text-primary text-3xl">school</span>
                                        Academic Standards
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="bg-surface-container-low p-6 rounded-3xl">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Board Affiliations</span>
                                            <div className="flex flex-wrap gap-2">
                                                {school.formData?.selectedBoards?.map(board => (
                                                    <span key={board} className="px-4 py-2 bg-primary/10 text-primary font-black text-xs rounded-xl uppercase tracking-widest border border-primary/20">{board}</span>
                                                ))}
                                                {school.formData?.otherBoardName && <span className="px-4 py-2 bg-surface text-text font-black text-xs rounded-xl border border-border">{school.formData.otherBoardName}</span>}
                                            </div>
                                        </div>
                                        <div className="bg-surface-container-low p-6 rounded-3xl">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Levels Offered</span>
                                            <div className="flex flex-wrap gap-2">
                                                {school.formData?.selectedClasses?.map(cls => (
                                                    <span key={cls} className="px-4 py-2 bg-text/5 text-text font-black text-xs rounded-xl border border-border/50">{cls}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2 bg-surface-container-low p-6 rounded-3xl">
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Available Facilities</span>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {school.formData?.facilities?.map(f => (
                                                    <div key={f} className="flex items-center gap-2 p-3 bg-surface rounded-2xl border border-border text-xs font-bold text-text">
                                                        <span className="material-symbols-outlined text-primary text-sm">done_all</span>
                                                        {f}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Gallery' && (
                                <div className="space-y-12 animate-fade-in">
                                    <h3 className="flex items-center gap-3 text-xl font-black text-text mb-2">
                                        <span className="material-symbols-outlined text-primary text-3xl">photo_library</span>
                                        Media Assets
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <span className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-2">Official Logo</span>
                                            <div className="aspect-square bg-surface-container/30 rounded-[48px] border-8 border-surface shadow-2xl overflow-hidden flex items-center justify-center group relative">
                                                {school.formData?.logo ? (
                                                    <img src={school.formData.logo} alt="Logo" className="w-full h-full object-contain p-12 group-hover:scale-110 transition-all duration-700" />
                                                ) : (
                                                    <div className="text-center opacity-20"><span className="material-symbols-outlined text-7xl block">image</span></div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <span className="block text-[11px] font-black text-text-muted uppercase tracking-widest ml-2">Hero Cover</span>
                                            <div className="aspect-[4/3] bg-surface-container/30 rounded-[48px] border-8 border-surface shadow-2xl overflow-hidden flex items-center justify-center group relative">
                                                {school.formData?.coverImage ? (
                                                    <img src={school.formData.coverImage} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" />
                                                ) : (
                                                    <div className="text-center opacity-20"><span className="material-symbols-outlined text-7xl block">landscape</span></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {school.formData?.gallery && school.formData.gallery.length > 0 && (
                                        <div className="pt-10 border-t border-border">
                                            <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-6 ml-2">Extended Gallery</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {school.formData.gallery.map((img, i) => (
                                                    <div key={i} className="aspect-square rounded-3xl overflow-hidden border-2 border-border group">
                                                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Advanced' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex items-center justify-between">
                                        <h3 className="flex items-center gap-3 text-xl font-black text-error">
                                            <span className="material-symbols-outlined text-3xl">developer_mode</span>
                                            Kernel Console
                                        </h3>
                                        <span className="text-[10px] font-black bg-error text-on-error px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-error/20">Read/Write Access</span>
                                    </div>
                                    
                                    <div className="relative group">
                                        <textarea 
                                            className="w-full bg-gray-900 text-green-400 p-8 rounded-[40px] overflow-x-auto text-xs font-mono h-[450px] border-none focus:ring-8 focus:ring-error/10 shadow-inner custom-scrollbar-dark transition-all"
                                            defaultValue={JSON.stringify(school.formData, null, 2)}
                                            id="raw-json-editor"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar Widget Canvas */}
                        <div className="w-full lg:w-[380px] p-10 bg-surface-container/20 space-y-10 flex-shrink-0">
                            
                            {/* Capacity Metrics */}
                            <div className="bg-surface border border-border rounded-[40px] p-8 shadow-xl">
                                <h4 className="font-black text-text mb-8 flex items-center justify-between text-[10px] uppercase tracking-widest opacity-60">
                                    Capacity Load
                                    <span className="material-symbols-outlined text-primary">analytics</span>
                                </h4>
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between items-center text-[10px] font-black text-text-muted mb-3 uppercase tracking-tighter">
                                            <span>Student Capacity</span>
                                            <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full tracking-normal">{school.formData?.schoolStrength || '0'} Total</span>
                                        </div>
                                        <div className="w-full bg-surface-container h-4 rounded-full overflow-hidden p-1 border border-border/50 shadow-inner">
                                            <div className="bg-primary h-full rounded-full shadow-sm shadow-primary/30" style={{width: '62%'}}></div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Campus Code</p>
                                        <p className="text-2xl font-black text-text tracking-tighter">{school.campusCode || 'PENDING'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Node Status */}
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
                                    Instance synced with global master node and receiving OTA patches.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
                .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
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
