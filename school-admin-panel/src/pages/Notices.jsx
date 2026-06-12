import React, { useState } from 'react';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';
import Dropdown from '../components/Dropdown';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';

const initialNotices = [];

const NOTICE_TYPES = ['All', 'Common Notice', 'Schedule / Calendar', 'Exam Update', 'Event / Activity', 'Holiday'];

const Notices = () => {
    const { classes } = useAdmin();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('All Notices');
    const tabs = ['All Notices', 'Scheduled', 'Drafts'];
    const [typeFilter, setTypeFilter] = useState('All');

    const [notices, setNotices] = useState(initialNotices);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedNotices, setExpandedNotices] = useState({});
    const [isScheduled, setIsScheduled] = useState(false);
    
    const [newNotice, setNewNotice] = useState({
        title: '',
        description: '',
        docFile: null,
        fileName: '',
        priority: 'Normal',
        type: 'Common Notice',
        publishedBy: 'Admin Office',
        date: '',
        classGroup: 'All Classes'
    });

    const resetForm = () => {
        setEditingId(null);
        setIsScheduled(false);
        setNewNotice({
            title: '',
            description: '',
            docFile: null,
            fileName: '',
            priority: 'Normal',
            type: 'Common Notice',
            publishedBy: 'Admin Office',
            date: '',
            classGroup: 'All Classes'
        });
    };

    const handleEdit = (notice) => {
        setEditingId(notice.id);
        setNewNotice(notice);
        setIsScheduled(new Date(notice.date) > new Date());
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setNotices(notices.filter(n => n.id !== id));
        toast.success("Notice deleted successfully.");
    };

    const toggleExpand = (id) => {
        setExpandedNotices(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewNotice({
                ...newNotice,
                docFile: e.target.files[0],
                fileName: e.target.files[0].name
            });
        }
    };

    const handleSaveNotice = (status) => {
        if (!newNotice.title || !newNotice.description) {
            toast.warning("Title and Description are required.");
            return;
        }
        
        const createdNotice = {
            ...newNotice,
            id: editingId || Date.now(),
            date: isScheduled && newNotice.date ? newNotice.date : new Date().toISOString().slice(0, 16),
            status: status
        };

        if (editingId) {
            setNotices(notices.map(n => n.id === editingId ? createdNotice : n));
        } else {
            setNotices([createdNotice, ...notices]);
        }
        
        setShowModal(false);
        resetForm();

        if (status === 'draft') {
            toast.success("Notice saved to drafts successfully.");
            setActiveTab('Drafts');
        } else {
            toast.success("Notice published and sent successfully.");
            setActiveTab('All Notices');
        }
    };

    // Filter Logic
    const displayedNotices = notices.filter(n => {
        let matchTab = false;
        if (activeTab === 'Drafts') matchTab = n.status === 'draft';
        else if (activeTab === 'Scheduled') {
            matchTab = n.status === 'published' && new Date(n.date) > new Date();
        } else {
            // For All Notices
            matchTab = n.status === 'published';
        }

        if (!matchTab) return false;
        if (typeFilter !== 'All' && n.type !== typeFilter) return false;
        
        return true;
    });

    const getPriorityStyles = (priority) => {
        switch(priority?.toLowerCase()) {
            case 'urgent': return { bg: 'bg-red-50 border-red-100', text: 'text-red-500', icon: 'bg-red-50 text-red-500', iconName: 'warning' };
            case 'important': return { bg: 'bg-orange-50 border-orange-100', text: 'text-orange-500', icon: 'bg-orange-50 text-orange-500', iconName: 'info' };
            default: return { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-500', icon: 'bg-slate-100 text-slate-500', iconName: 'campaign' };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col relative pb-20">
            {/* TopNavBar */}
            <header className="h-16 md:h-[72px] w-full sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-row justify-between items-center gap-4 px-4 md:px-8">
                <div className="flex items-center gap-2 min-w-0">
                    <MenuButton />
                    <h2 className="text-[1.3rem] md:text-[1.6rem] font-[900] text-[#1e293b] tracking-tight leading-tight">Notices</h2>
                </div>
                <div className="flex items-center gap-3 md:gap-4 shrink-0 justify-end">
                    <div className="relative group hidden sm:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-48 xl:w-72 h-10 pl-10 pr-4 rounded-full border-none bg-slate-100 focus:ring-2 focus:ring-[#2563eb]/40 focus:bg-white transition-all text-xs font-semibold placeholder-slate-400"
                            placeholder="Search notices, audience or date..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="h-10 w-10 flex items-center justify-center bg-transparent hover:bg-slate-100 transition-colors rounded-full text-slate-600">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                        </button>
                        <ProfileButton size={40} />
                    </div>
                </div>
            </header>

            {/* Content Canvas */}
            <div className="p-4 sm:p-8 max-w-[1000px] mx-auto space-y-6 w-full">

                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Notices & Announcements</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Broadcast critical information to students, staff, and parents.</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="hidden sm:flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 shrink-0">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Create Notice
                    </button>
                </div>

                {/* Tabs & Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto custom-scrollbar">
                        {tabs.map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                    activeTab === tab 
                                    ? 'bg-blue-50 text-[#2563eb] border border-blue-100' 
                                    : 'bg-transparent text-slate-500 hover:bg-slate-100 border border-transparent'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <Dropdown
                        value={typeFilter}
                        onChange={(v) => setTypeFilter(v)}
                        options={NOTICE_TYPES.map(t => ({ value: t, label: t === 'All' ? 'All Types' : t }))}
                        icon="filter_alt"
                        className="w-full sm:w-48"
                        buttonClassName="h-10"
                    />
                </div>

                {/* Notice Cards */}
                <div className="space-y-4">
                    {displayedNotices.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-slate-50/50">
                            <div className="w-16 h-16 bg-white text-slate-300 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                                <span className="material-symbols-outlined text-[32px]">drafts</span>
                            </div>
                            <h4 className="text-lg font-bold text-slate-700 mb-2">No Notices Found</h4>
                            <p className="text-sm font-medium text-slate-500 max-w-sm mb-6">There are no notices in this section currently. You can create a new notice to broadcast information.</p>
                            <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-white border border-slate-200 text-[#2563eb] font-bold text-sm rounded-xl hover:bg-blue-50 transition-all">
                                Create New Notice
                            </button>
                        </div>
                    ) : (
                        displayedNotices.map((notice) => {
                            const pStyle = getPriorityStyles(notice.priority);
                            return (
                                <div key={notice.id} className="bg-white rounded-3xl p-6 premium-shadow hover:shadow-md transition-shadow relative group">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${pStyle.icon}`}>
                                            <span className="material-symbols-outlined text-[24px]">{pStyle.iconName}</span>
                                        </div>
                                        <div className="flex-1 w-full flex flex-col">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                <div className="flex flex-wrap items-center gap-3 pr-16 sm:pr-0">
                                                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{notice.title}</h3>
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${pStyle.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full bg-current ${pStyle.text}`}></span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${pStyle.text}`}>{notice.priority}</span>
                                                    </div>
                                                    {notice.status === 'draft' && (
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Draft</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-400 sm:text-right shrink-0">{formatDate(notice.date)}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-widest">
                                                    {notice.type}
                                                </span>
                                            </div>
                                            <p className={`text-sm font-medium text-slate-500 mb-2 leading-relaxed ${expandedNotices[notice.id] ? '' : 'line-clamp-3'}`}>
                                                {notice.description}
                                            </p>
                                            {notice.description.length > 150 && (
                                                <button onClick={() => toggleExpand(notice.id)} className="text-[11px] font-black text-[#2563eb] hover:text-blue-700 transition-colors self-start mb-4 uppercase tracking-widest">
                                                    {expandedNotices[notice.id] ? 'Show Less' : 'Read More'}
                                                </button>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2 mt-auto">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                                    <span className="material-symbols-outlined text-[16px]">groups</span>
                                                    <span className="text-xs font-bold">{notice.classGroup}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">
                                                    <span className="material-symbols-outlined text-[16px]">assignment</span>
                                                    <span className="text-xs font-bold">By : {notice.publishedBy}</span>
                                                </div>
                                                {notice.fileName && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                                                        <span className="material-symbols-outlined text-[16px]">attach_file</span>
                                                        <span className="text-xs font-bold max-w-[150px] truncate">{notice.fileName}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons: Edit/Delete on Hover */}
                                            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                {notice.status === 'draft' && (
                                                    <button onClick={() => handleEdit(notice)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 hover:scale-105 transition-all shadow-sm">
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(notice.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:scale-105 transition-all shadow-sm">
                                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Archive Box */}
                {activeTab === 'All Notices' && displayedNotices.length > 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center mt-10 bg-slate-50/50">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[24px]">archive</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-800 mb-1">Notice Archive</h4>
                        <p className="text-xs font-medium text-slate-500 max-w-sm mb-4">Looking for older announcements? Access the complete history of sent notices here.</p>
                        <button className="text-sm font-bold text-[#2563eb] hover:underline">View Archived Notices</button>
                    </div>
                )}
            </div>

            {/* Floating FAB */}
            <button onClick={() => setShowModal(true)} className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg hover:shadow-blue-500/40 hover:scale-105 transition-all z-40 sm:hidden">
                <span className="material-symbols-outlined text-[28px]">add</span>
            </button>

            {/* Create Notice Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl relative my-auto animate-fade-in flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50 rounded-t-[32px]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[24px]">campaign</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-[900] text-slate-800 tracking-tight">{editingId ? 'Edit Notice' : 'Create Notice'}</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{editingId ? 'Update Information' : 'Broadcast Information'}</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                
                                {/* Top Row: Title & Audience */}
                                <div className="sm:col-span-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Notice Title <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={newNotice.title}
                                        onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                                        placeholder="e.g. Annual Sports Meet"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Target Audience</label>
                                    <Dropdown
                                        value={newNotice.classGroup}
                                        onChange={(v) => setNewNotice({...newNotice, classGroup: v})}
                                        options={[
                                            { value: 'All Classes', label: 'All Classes' },
                                            { value: 'Staff Only', label: 'Staff Only' },
                                            ...(classes?.map(c => ({ value: `Class ${c.className}`, label: `Class ${c.className}` })) || [])
                                        ]}
                                        icon="groups"
                                        className="w-full"
                                        buttonClassName="h-12 bg-slate-50"
                                    />
                                </div>

                                {/* Middle Row: Description & Types/Priority */}
                                <div className="sm:col-span-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Description <span className="text-red-500">*</span></label>
                                    <textarea 
                                        value={newNotice.description}
                                        onChange={(e) => setNewNotice({...newNotice, description: e.target.value})}
                                        placeholder="Write your detailed notice here..."
                                        className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm resize-none"
                                    />
                                </div>
                                <div className="sm:col-span-1 space-y-5">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Notice Type</label>
                                        <Dropdown
                                            value={newNotice.type}
                                            onChange={(v) => setNewNotice({...newNotice, type: v})}
                                            options={['Common Notice', 'Schedule / Calendar', 'Exam Update', 'Event / Activity', 'Holiday']}
                                            icon="category"
                                            className="w-full"
                                            buttonClassName="h-12 bg-slate-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Priority</label>
                                        <Dropdown
                                            value={newNotice.priority}
                                            onChange={(v) => setNewNotice({...newNotice, priority: v})}
                                            options={['Normal', 'Important', 'Urgent']}
                                            icon="flag"
                                            className="w-full"
                                            buttonClassName="h-12 bg-slate-50"
                                        />
                                    </div>
                                </div>

                                {/* Bottom Row: Publish Settings & Attach/Publisher */}
                                <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 block">Publish Settings</label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${!isScheduled ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${!isScheduled ? 'border-blue-500' : 'border-slate-300'}`}>
                                                {!isScheduled && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={!isScheduled} onChange={() => setIsScheduled(false)} />
                                            <div>
                                                <span className="text-[13px] font-bold text-slate-700 block leading-tight">Send Immediately</span>
                                                <span className="text-[9px] font-bold text-slate-400">Published right now</span>
                                            </div>
                                        </label>

                                        <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${isScheduled ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isScheduled ? 'border-blue-500' : 'border-slate-300'}`}>
                                                {isScheduled && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={isScheduled} onChange={() => setIsScheduled(true)} />
                                            <div>
                                                <span className="text-[13px] font-bold text-slate-700 block leading-tight">Schedule for Later</span>
                                                <span className="text-[9px] font-bold text-slate-400">Pick specific date & time</span>
                                            </div>
                                        </label>
                                    </div>

                                    {isScheduled && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 animate-fade-in">
                                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Select Date & Time</label>
                                            <input 
                                                type="datetime-local" 
                                                value={newNotice.date}
                                                onChange={(e) => setNewNotice({...newNotice, date: e.target.value})}
                                                className="w-full sm:w-2/3 h-11 px-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="sm:col-span-1 space-y-5">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Published By</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">person</span>
                                            <input 
                                                type="text" 
                                                value={newNotice.publishedBy}
                                                onChange={(e) => setNewNotice({...newNotice, publishedBy: e.target.value})}
                                                placeholder="e.g. Principal, Admin"
                                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 block">Attach File</label>
                                        <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors group relative overflow-hidden">
                                            <input type="file" className="hidden" onChange={handleFileChange} />
                                            <div className="flex items-center gap-2 text-blue-500 group-hover:scale-105 transition-transform px-4">
                                                <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                                                <p className="text-[11px] font-bold truncate max-w-[150px]">{newNotice.fileName || 'Upload PDF/Image'}</p>
                                            </div>
                                            {newNotice.fileName && (
                                                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-white text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold shadow-sm">Replace</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 sm:p-8 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 shrink-0 bg-slate-50/50 rounded-b-[32px]">
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="py-3.5 px-6 rounded-xl font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 transition-all text-xs tracking-widest uppercase text-center">
                                Cancel
                            </button>
                            <button onClick={() => handleSaveNotice('draft')} className="py-3.5 px-8 rounded-xl font-black text-slate-600 bg-slate-200 hover:bg-slate-300 transition-all shadow-sm text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">drafts</span>
                                {editingId ? 'Update Draft' : 'Save Draft'}
                            </button>
                            <button onClick={() => handleSaveNotice('published')} className="py-3.5 px-8 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:scale-[0.98] text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                {editingId ? 'Republish Notice' : 'Send Notice'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default Notices;
