import React, { useState, useEffect } from 'react';

// Install UX:
// - Big center modal once per session (dismiss => hidden for this session only).
// - A small floating "Install" chip stays until the app is actually installed,
//   so the option is always there without nagging on every refresh.
// - Android/Chrome: real beforeinstallprompt. iOS Safari: Add-to-Home-Screen steps.
const InstallPrompt = () => {
  const [deferred, setDeferred] = useState(null);
  const [installable, setInstallable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (standalone) return;                       // already running as the app
    if (localStorage.getItem('scoolg_installed')) return; // installed earlier

    const dismissedSession = sessionStorage.getItem('scoolg_install_dismissed');

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setInstallable(true);
      if (!dismissedSession) setShowModal(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const onInstalled = () => {
      setInstalled(true); setShowModal(true);
      localStorage.setItem('scoolg_installed', '1');
    };
    window.addEventListener('appinstalled', onInstalled);

    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua);
    let t;
    if (ios) {
      setIsIOS(true); setInstallable(true);
      if (!dismissedSession) t = setTimeout(() => setShowModal(true), 1200);
    }

    return () => { if (t) clearTimeout(t); window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return; // iOS -> instructions are shown in the modal
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    // Do NOT show "Installed" here — accepting only starts the install.
    // The real `appinstalled` event (fires once the app is actually added
    // to the phone, a few seconds later) flips us to the success screen.
    setShowModal(false);
    if (outcome !== 'accepted') sessionStorage.setItem('scoolg_install_dismissed', '1');
  };

  const dismissModal = () => { sessionStorage.setItem('scoolg_install_dismissed', '1'); setShowModal(false); };
  const finishSuccess = () => { setInstalled(false); setInstallable(false); setShowModal(false); };

  // 1) Success screen
  if (installed) {
    return (
      <div className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5">
        <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-7 text-center animate-[pop_0.3s_ease-out]">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[44px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-[22px] font-manrope font-extrabold text-on-surface">Installed! 🎉</h2>
          <p className="text-body-md text-on-surface-variant mt-1 mb-6">ScoolG Teacher is now on your home screen. Open it from there for the full app experience.</p>
          <button onClick={finishSuccess} className="w-full h-[52px] rounded-2xl bg-primary text-on-primary font-bold text-[16px] shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform">Continue</button>
        </div>
      </div>
    );
  }

  // 2) Big modal
  if (showModal) {
    const benefits = [
      { icon: 'bolt', text: 'Fast — opens like a native app' },
      { icon: 'fact_check', text: 'Mark attendance & homework on the go' },
      { icon: 'wifi_off', text: 'Works even on a weak connection' },
    ];
    return (
      <div className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-5">
        <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-7 text-center animate-[pop_0.3s_ease-out] relative">
          <button onClick={dismissModal} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
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
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[18px]">{b.icon}</span></div>
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
              <button onClick={dismissModal} className="w-full h-11 mt-4 rounded-2xl bg-surface-container text-on-surface-variant font-bold text-label-md">Got it</button>
            </div>
          ) : (
            <div className="space-y-2">
              <button onClick={handleInstall} className="w-full h-[52px] rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white font-manrope font-bold text-[16px] shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">install_mobile</span> Install App
              </button>
              <button onClick={dismissModal} className="w-full h-11 rounded-2xl text-on-surface-variant font-bold text-label-md hover:bg-surface-container-low transition-colors">Maybe later</button>
            </div>
          )}
        </div>
        <style>{`@keyframes pop { from { opacity:0; transform: scale(0.92) translateY(12px); } to { opacity:1; transform: scale(1) translateY(0);} }`}</style>
      </div>
    );
  }

  // 3) Persistent small chip (until installed)
  if (installable) {
    return (
      <button onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-[70] flex items-center gap-2 pl-3 pr-4 h-12 rounded-full bg-primary text-on-primary font-bold text-label-md shadow-[0_12px_30px_-8px_rgba(37,99,235,0.6)] active:scale-95 transition-transform">
        <span className="material-symbols-outlined text-[20px]">install_mobile</span>
        Install App
      </button>
    );
  }

  return null;
};

export default InstallPrompt;
