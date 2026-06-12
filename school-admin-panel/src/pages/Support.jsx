import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import MenuButton from '../components/MenuButton';
import Dropdown from '../components/Dropdown';

const Support = () => {
    const schoolName = localStorage.getItem('scoolg_school_name') || 'St. Andrews International';
    const [showModal, setShowModal] = useState(false);
    const { toast } = useToast();
    
    // Initializing with empty array so only user raised issues show up
    const [tickets, setTickets] = useState([]);

    const [newTicket, setNewTicket] = useState({
        subject: '',
        category: 'Technical Issue',
        description: '',
        priority: 'Medium'
    });

    const supportCategories = [
        { title: 'Technical Issue', desc: 'Bugs, glitches or login problems', icon: 'dvr' },
        { title: 'Feature Request', desc: 'Suggest new tools or improvements', icon: 'auto_awesome' },
        { title: 'Billing & Plans', desc: 'Invoices, renewals and payments', icon: 'payments' },
        { title: 'Training Request', desc: 'Book a demo or training session', icon: 'school' }
    ];

    const handleSubmitTicket = (e) => {
        e.preventDefault();
        const id = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
        const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        
        const submittedTicket = {
            id,
            subject: newTicket.subject,
            category: newTicket.category,
            status: 'Pending',
            date,
            priority: newTicket.priority
        };

        setTickets([submittedTicket, ...tickets]);
        setShowModal(false);
        setNewTicket({ subject: '', category: 'Technical Issue', description: '', priority: 'Medium' });
        toast.success('Complaint submitted successfully!');
    };

    const openWhatsApp = () => {
        window.open(`https://wa.me/919999999999?text=Hi Scoolg Support, I am from ${schoolName}. I need assistance.`, '_blank');
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] p-4 sm:p-10 space-y-12">
            {/* Header Section */}
            <header className="max-w-full flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <MenuButton />
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">Support & Help</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-sm tracking-tight uppercase opacity-60">Helpdesk for {schoolName}</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white font-black text-xs uppercase tracking-widest px-10 py-5 rounded-[24px] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95"
                >
                    Raise a Complaint
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {supportCategories.map((cat, i) => (
                            <button 
                                key={i} 
                                onClick={() => { setShowModal(true); setNewTicket({...newTicket, category: cat.title}) }}
                                className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.12)] transition-all duration-700 text-left flex items-start gap-6 active:scale-95"
                            >
                                <div className="w-16 h-16 shrink-0 bg-slate-50 text-slate-900 rounded-[24px] flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-500">
                                    <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{cat.title}</h3>
                                    <p className="text-slate-500 text-xs font-bold leading-relaxed opacity-70">{cat.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tickets List */}
                    <div className="bg-white p-8 sm:p-12 rounded-[56px] border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.03)] min-h-[400px]">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4 mb-10">
                            <span className="w-2 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>
                            Raised Concerns
                        </h2>
                        
                        {tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-5xl text-slate-200">sentiment_satisfied</span>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">No concerns raised yet</h4>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Your school systems are running smoothly.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tickets.map((ticket, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-7 rounded-[36px] bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center font-black text-[11px] text-slate-400 border border-slate-100 shadow-sm">
                                                {ticket.id}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-[16px] tracking-tight">{ticket.subject}</h4>
                                                <div className="flex items-center gap-4 mt-1.5">
                                                    <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest">{ticket.category} • {ticket.date}</p>
                                                    <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-100">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'text-rose-600' : 'text-slate-400'}`}>{ticket.priority}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm ${ticket.status === 'Resolved' ? 'bg-emerald-500 text-white' : ticket.status === 'Pending' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Manager Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 sm:p-10 rounded-[56px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 rounded-[44px] bg-slate-50 p-1.5 border-2 border-slate-100 shadow-lg overflow-hidden group">
                                <img 
                                    src="https://ui-avatars.com/api/?name=Navdeep+Agarwal&background=2563eb&color=fff" 
                                    alt="Manager" 
                                    className="w-full h-full object-cover rounded-[36px] group-hover:scale-110 transition-transform duration-700" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2 mb-10">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tighter">Navdeep Agarwal</h4>
                            <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Primary Account Head</p>
                        </div>

                        <div className="w-full space-y-4">
                            <button 
                                onClick={openWhatsApp}
                                className="w-full bg-[#25D366] text-white font-black text-xs uppercase tracking-widest py-5 rounded-[28px] hover:shadow-[0_15px_30px_rgba(37,211,102,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <span className="material-symbols-outlined text-2xl">chat</span> WhatsApp Us
                            </button>
                            <button className="w-full bg-blue-600 text-white font-black text-xs uppercase tracking-widest py-5 rounded-[28px] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-50">
                                <span className="material-symbols-outlined text-2xl">call</span> Contact Scoolg
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Raise Ticket Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-slate-50 p-10 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">New Complaint</h3>
                                <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Describe your concern below</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-14 h-14 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center active:scale-90">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitTicket} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                                    <Dropdown
                                        value={newTicket.category}
                                        onChange={(v) => setNewTicket({...newTicket, category: v})}
                                        options={['Technical Issue', 'Feature Request', 'Billing & Plans', 'Training Request']}
                                        className="w-full"
                                        buttonClassName="py-5 bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Priority</label>
                                    <Dropdown
                                        value={newTicket.priority}
                                        onChange={(v) => setNewTicket({...newTicket, priority: v})}
                                        options={['Low', 'Medium', 'High', 'Urgent']}
                                        className="w-full"
                                        buttonClassName="py-5 bg-slate-50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="Brief title of the issue"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-5 font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:opacity-50"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Detailed Problem</label>
                                <textarea 
                                    required
                                    rows="4"
                                    placeholder="Explain the problem in detail..."
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-5 font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all resize-none placeholder:opacity-50"
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs">
                                Submit Complaint
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
;
