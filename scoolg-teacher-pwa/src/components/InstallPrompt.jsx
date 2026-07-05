import React, { useState, useEffect } from 'react';
import { Download, Share, X, Plus } from 'lucide-react';

// A visible "Install app" banner for the login screen. On Android/Chrome it fires
// the native install prompt; on iOS (no beforeinstallprompt) it shows the manual
// Add-to-Home-Screen steps. Hidden if already installed or dismissed this session.
const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;

const InstallPrompt = () => {
    const [deferred, setDeferred] = useState(() => window.deferredPWAInstallPrompt || null);
    const [show, setShow] = useState(false);
    const [iosHelp, setIosHelp] = useState(false);

    useEffect(() => {
        if (isStandalone() || sessionStorage.getItem('sg-install-dismissed') === '1') return;
        // Show for iOS immediately, or once Android hands us a prompt.
        if (isIOS() || window.deferredPWAInstallPrompt) setShow(true);

        const onPrompt = (e) => { e.preventDefault?.(); window.deferredPWAInstallPrompt = e; setDeferred(e); setShow(true); };
        const onReady = () => { if (window.deferredPWAInstallPrompt) { setDeferred(window.deferredPWAInstallPrompt); setShow(true); } };
        const onInstalled = () => { setShow(false); window.deferredPWAInstallPrompt = null; };
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('pwa-prompt-ready', onReady);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('pwa-prompt-ready', onReady);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const dismiss = () => { setShow(false); sessionStorage.setItem('sg-install-dismissed', '1'); };

    const install = async () => {
        if (isIOS()) { setIosHelp(true); return; }
        if (!deferred) { setIosHelp(true); return; }
        deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === 'accepted') { setShow(false); window.deferredPWAInstallPrompt = null; setDeferred(null); }
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 z-[200] p-3 sm:p-4 flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)] border border-slate-100 p-4">
                {iosHelp && isIOS() ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <p className="font-black text-slate-900 text-sm flex-1">Install on iPhone / iPad</p>
                            <button onClick={dismiss} className="w-8 h-8 grid place-items-center rounded-full bg-slate-100 text-slate-400"><X size={16} /></button>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed flex items-center gap-1.5 flex-wrap">
                            Tap <Share size={14} className="inline text-blue-600" /> <b className="text-slate-700">Share</b> then <Plus size={14} className="inline text-blue-600" /> <b className="text-slate-700">Add to Home Screen</b>.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 shrink-0 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-lg shadow-blue-600/25"><Download size={22} /></div>
                        <div className="min-w-0 flex-1">
                            <p className="font-black text-slate-900 text-sm leading-tight">Install the Scoolg app</p>
                            <p className="text-[11px] font-semibold text-slate-400">Faster access, works offline</p>
                        </div>
                        <button onClick={install} className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-colors">Install</button>
                        <button onClick={dismiss} className="shrink-0 w-8 h-8 grid place-items-center rounded-full bg-slate-100 text-slate-400"><X size={16} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstallPrompt;
