import React, { useState, useEffect } from 'react';

// Center modal that nudges the user to install the PWA (max conversion).
// - Android/Chrome: real beforeinstallprompt.
// - iOS Safari: Add-to-Home-Screen instructions.
const InstallPrompt = () => {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (standalone) return; // running as the installed app — nothing to show
    if (localStorage.getItem('scoolg_install_dismissed')) return;

    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // Fired by Chrome/Android once the app is actually installed.
    const onInstalled = () => { setInstalled(true); setShow(true); localStorage.setItem('scoolg_install_dismissed', '1'); };
    window.addEventListener('appinstalled', onInstalled);

    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua);
    let t;
    if (ios) { setIsIOS(true); t = setTimeout(() => setShow(true), 1200); }

    return () => { if (t) clearTimeout(t); window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return; // iOS shows instructions in-modal
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === 'accepted') {
      setInstalled(true); // success screen (appinstalled also fires)
    } else {
      setShow(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem('scoolg_install_dismissed', '1');
    setShow(false);
  };

  if (!show) return null;

  const benefits = [
    { icon: 'bolt', text: 'Fast — opens like a native app' },
    { icon: 'fact_check', text: 'Mark attendance & homework on the go' },
    { icon: 'wifi_off', text: 'Works even on a weak connection' },
  ];

  // SUCCESS screen — shown right after install finishes.
  if (installed) {
    return (
      <div className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5">
        <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-7 text-center animate-[pop_0.3s_ease-out]">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[44px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-[22px] font-manrope font-extrabold text-on-surface">Installed! 🎉</h2>
          <p className="text-body-md text-on-surface-variant mt-1 mb-6">ScoolG Teacher is now on your home screen. Open it from there for the full app experience.</p>
          <button onClick={dismiss} className="w-full h-[52px] rounded-2xl bg-primary text-on-primary font-bold text-[16px] shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-7 text-center animate-[pop_0.3s_ease-out] relative">
        <button onClick={dismiss} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="w-24 h-24 rounded-[26px] bg-white shadow-lg shadow-primary/10 border border-surface-container flex items-center justify-center mx-auto mb-4 overflow-hidden">
          <img src="/scoolg-logo.png" alt="ScoolG" className="w-full h-full object-contain p-2" />
        </div>

        <h2 className="text-[22px] font-manrope font-extrabold text-on-surface leading-tight">Install ScoolG Teacher</h2>
        <p className="text-body-md text-on-surface-variant mt-1 mb-5">Add the app to your home screen for one-tap access.</p>

        <div className="space-y-2.5 text-left mb-6">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">{b.icon}</span>
              </div>
              <span className="text-label-md font-medium text-on-surface">{b.text}</span>
            </div>
          ))}
        </div>

        {isIOS ? (
          <div className="bg-surface-container-low rounded-2xl p-4 text-left">
            <p className="text-label-md font-bold text-on-surface mb-2">To install on iPhone:</p>
            <ol className="space-y-1.5 text-label-md text-on-surface-variant">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-primary">ios_share</span> Tap <b>Share</b></li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-primary">add_box</span> Tap <b>Add to Home Screen</b></li>
            </ol>
            <button onClick={dismiss} className="w-full h-11 mt-4 rounded-2xl bg-surface-container text-on-surface-variant font-bold text-label-md">Got it</button>
          </div>
        ) : (
          <div className="space-y-2">
            <button onClick={handleInstall} className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white font-manrope font-bold text-[16px] shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">install_mobile</span> Install App
            </button>
            <button onClick={dismiss} className="w-full h-11 rounded-2xl text-on-surface-variant font-bold text-label-md hover:bg-surface-container-low transition-colors">Maybe later</button>
          </div>
        )}
      </div>
      <style>{`@keyframes pop { from { opacity:0; transform: scale(0.92) translateY(12px); } to { opacity:1; transform: scale(1) translateY(0);} }`}</style>
    </div>
  );
};

export default InstallPrompt;
