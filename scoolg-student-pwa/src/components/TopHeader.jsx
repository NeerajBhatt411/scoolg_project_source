import React, { useState, useRef, useEffect } from 'react';
import MenuButton from './MenuButton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopHeader = ({ title, showSearch = false, searchQuery, onSearchChange, placeholder = "Search..." }) => {
    const { user, token, switchAccount, getSavedAccounts, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setShowProfileMenu(false);
        logout();
        navigate('/login');
    };

    // PWA Install Logic
    const [deferred, setDeferred] = React.useState(null);
    const [installable, setInstallable] = React.useState(true); // Default true so it always shows initially unless standalone

    React.useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        if (standalone) {
            setInstallable(false);
            return;
        }

        const checkPrompt = () => {
            if (window.deferredPWAInstallPrompt) {
                setDeferred(window.deferredPWAInstallPrompt);
            }
        };
        
        checkPrompt();

        const onPromptReady = () => {
            checkPrompt();
        };

        window.addEventListener('pwa-prompt-ready', onPromptReady);

        const onInstalled = () => {
            setInstallable(false);
            window.deferredPWAInstallPrompt = null;
        };
        window.addEventListener('appinstalled', onInstalled);

        return () => { 
            window.removeEventListener('pwa-prompt-ready', onPromptReady); 
            window.removeEventListener('appinstalled', onInstalled); 
        };
    }, []);

    const handleInstall = async () => {
        if (!deferred) {
            alert("To install this app, open your browser menu and select 'Add to Home Screen' or 'Install App'.");
            return;
        }
        deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === 'accepted') {
            setInstallable(false);
            window.deferredPWAInstallPrompt = null;
            setDeferred(null);
        }
    };

    const getBgColor = (name) => {
        const colors = ['from-blue-500 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-orange-400 to-rose-400', 'from-purple-500 to-pink-500', 'from-amber-400 to-orange-500'];
        const charCode = name ? name.charCodeAt(0) : 0;
        return colors[charCode % colors.length];
    };
    const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Student';
    const bgGradient = getBgColor(name);

    const otherAccounts = getSavedAccounts().filter(acc => acc.token !== token);

    return (
        <>
        <header className="h-[64px] md:h-[72px] w-full sticky top-0 z-40 bg-[#f8fafc]/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-row justify-between items-center gap-4 px-4 md:px-8">
            <div className="flex items-center gap-2 md:w-auto">
                <MenuButton />
                <h2 className="text-xl md:text-[1.8rem] font-[900] text-slate-900 tracking-tight">{title}</h2>
            </div>
            <div className="flex items-center gap-2 md:gap-4 md:w-auto justify-end">
                {showSearch && (
                    <div className="relative flex-1 md:w-80 lg:w-96 group hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all text-sm font-medium"
                            placeholder={placeholder}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                        />
                    </div>
                )}
                
                {/* Install App Icon (MOBILE ONLY in header) */}
                {installable && (
                    <button onClick={handleInstall} title="Install App" className="md:hidden w-9 h-9 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors relative">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                    </button>
                )}

                {/* Notification Bell */}
                <button onClick={() => navigate('/notifications')} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded-full transition-colors relative">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${bgGradient} text-white font-black flex items-center justify-center shadow-sm ring-2 ring-white overflow-hidden shrink-0 transition-transform active:scale-95`}>
                        {user?.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`} alt="avatar" className="w-[85%] h-[85%] object-contain drop-shadow-md translate-y-1" />
                        )}
                    </button>

                    {showProfileMenu && (
                        <>
                        {/* Mobile Overlay */}
                        <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShowProfileMenu(false)}></div>
                        
                        <div className="fixed top-[72px] right-4 left-4 sm:absolute sm:top-auto sm:right-0 sm:left-auto sm:mt-3 sm:w-80 bg-white sm:rounded-2xl rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
                            {/* Current User Header */}
                            <div className="p-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${bgGradient} text-white font-black flex items-center justify-center shrink-0 overflow-hidden shadow-sm ring-4 ring-white`}>
                                    {user?.profileImageUrl ? (
                                        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`} alt="avatar" className="w-[85%] h-[85%] object-contain drop-shadow-md translate-y-1" />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[15px] font-extrabold text-slate-900 truncate">{user?.firstName} {user?.lastName}</span>
                                    <span className="text-[11px] font-bold text-slate-500 truncate mt-0.5">{user?.studentAppId}</span>
                                </div>
                            </div>
                            
                            <div className="p-2">
                                <button onClick={() => { setShowProfileMenu(false); navigate('/profile'); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-[20px] text-slate-400">person</span>
                                    Manage Profile
                                </button>
                            </div>

                            <div className="h-px bg-slate-100 mx-4"></div>
                            
                            {/* Switch & Add Accounts */}
                            <div className="max-h-[40vh] sm:max-h-60 overflow-y-auto p-2">
                                {otherAccounts.length > 0 && (
                                    <>
                                    <p className="px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Other Accounts</p>
                                    <div className="space-y-1 mb-2">
                                        {otherAccounts.map(acc => (
                                            <button 
                                                key={acc.token}
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    switchAccount(acc.token);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors active:scale-[0.98] border border-transparent hover:border-slate-100"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center shrink-0 text-xs overflow-hidden ring-2 ring-white shadow-sm">
                                                    {acc.student?.profileImageUrl ? (
                                                        <img src={acc.student.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        (acc.student?.firstName?.charAt(0) || 'S')
                                                    )}
                                                </div>
                                                <div className="flex flex-col text-left truncate flex-1">
                                                    <span className="text-sm font-bold truncate">{acc.student?.firstName} {acc.student?.lastName}</span>
                                                    <span className="text-[10px] text-slate-500 truncate font-semibold">{acc.school?.name}</span>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300 text-[18px]">swap_horiz</span>
                                            </button>
                                        ))}
                                    </div>
                                    </>
                                )}
                                
                                <button 
                                    onClick={() => {
                                        setShowProfileMenu(false);
                                        navigate('/login?addAccount=true');
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors active:scale-[0.98]"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </div>
                                    Add Another Account
                                </button>
                            </div>

                            <div className="h-px bg-slate-100"></div>

                            <div className="p-2 bg-slate-50/50">
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                    Log out
                                </button>
                            </div>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </header>
        
        {/* Install App Floating Button (DESKTOP ONLY at bottom right) */}
        {installable && (
            <button 
                onClick={handleInstall}
                className="hidden md:flex fixed bottom-6 right-6 z-[70] items-center gap-2 pl-3 pr-4 h-12 rounded-full bg-blue-600 text-white font-bold text-sm shadow-[0_12px_30px_-8px_rgba(37,99,235,0.6)] active:scale-95 transition-transform"
                title="Install App"
            >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Install App
            </button>
        )}
        </>
    );
};

export default TopHeader;
