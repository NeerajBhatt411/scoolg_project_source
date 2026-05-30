import React, { useState, useEffect } from 'react';

// Shows a premium "Install App" banner.
// - Android/Chrome: uses the real beforeinstallprompt event.
// - iOS Safari: shows Add-to-Home-Screen instructions (no native prompt there).
const InstallPrompt = () => {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (standalone) return; // already installed
    if (localStorage.getItem('scoolg_install_dismissed')) return;

    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);

    const ua = window.navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    if (isIOS && /safari/i.test(ua)) {
      const t = setTimeout(() => setShow(true), 1500); // give the app a moment to render
      return () => { clearTimeout(t); window.removeEventListener('beforeinstallprompt', onPrompt); };
    }
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setShow(false);
    } else {
      // iOS — show instructions
      setIosHelp(true);
    }
  };

  const dismiss = () => {
    localStorage.setItem('scoolg_install_dismissed', '1');
    setShow(false);
    setIosHelp(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 lg:left-auto lg:right-6 lg:w-96 z-[80]">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.4)] border border-surface-container p-4 animate-[slideUp_0.3s_ease-out]">
        {!iosHelp ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-surface-container">
              <img src="/scoolg-logo.png" alt="ScoolG" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-md font-extrabold text-on-surface leading-tight">Install ScoolG Teacher</p>
              <p className="text-label-md text-on-surface-variant leading-tight">Add to your home screen for quick access.</p>
            </div>
            <button onClick={handleInstall} className="shrink-0 px-4 h-10 rounded-xl bg-primary text-on-primary font-bold text-label-md shadow-md shadow-primary/25 active:scale-95 transition-transform">
              Install
            </button>
            <button onClick={dismiss} className="shrink-0 w-8 h-8 rounded-full hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-body-md font-extrabold text-on-surface">Install on iPhone</p>
              <button onClick={dismiss} className="w-8 h-8 rounded-full hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <ol className="space-y-2 text-label-md text-on-surface-variant">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-primary">ios_share</span> Tap the <b>Share</b> button below</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-primary">add_box</span> Choose <b>Add to Home Screen</b></li>
            </ol>
          </div>
        )}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0);} }`}</style>
    </div>
  );
};

export default InstallPrompt;
