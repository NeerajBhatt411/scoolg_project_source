import React from 'react';
import MenuButton from './MenuButton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopHeader = ({ title, showSearch = false, searchQuery, onSearchChange, placeholder = "Search..." }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

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

                {/* Profile Picture */}
                <button onClick={() => navigate('/profile')} className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${bgGradient} text-white font-black flex items-center justify-center shadow-sm ring-2 ring-white overflow-hidden shrink-0 transition-transform active:scale-95`}>
                    {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`} alt="avatar" className="w-[85%] h-[85%] object-contain drop-shadow-md translate-y-1" />
                    )}
                </button>
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
