import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding/1');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-hidden h-screen w-full flex flex-col items-center justify-between py-12 relative">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary-fixed/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary-fixed/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[15%] right-[10%] w-4 h-4 rounded-full bg-primary/10 border border-primary/5"></div>
        <div className="absolute bottom-[20%] left-[15%] w-6 h-6 rounded-full bg-secondary/10 border border-secondary/5"></div>
      </div>

      <div className="h-16"></div>

      <main className="flex flex-col items-center relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 -top-24 -bottom-24 -left-24 -right-24 bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(250,248,255,0)_70%)] pointer-events-none z-0"></div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-32 h-32 bg-surface-container-lowest shadow-2xl shadow-primary/10 rounded-[32px] flex items-center justify-center mb-8 border border-white/40">
            <span className="material-symbols-outlined !text-[64px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-[30px] font-manrope font-extrabold text-on-background tracking-tighter">SchoolG</h1>
            <p className="text-[12px] font-inter font-bold text-outline uppercase tracking-widest opacity-80">Precision Management</p>
          </div>
        </motion.div>
      </main>

      <footer className="flex flex-col items-center gap-6">
        <div className="w-[140px] h-[4px] bg-slate-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-primary rounded-full absolute"
          />
        </div>
        <span className="text-[12px] font-inter font-medium text-outline-variant animate-pulse">Initializing school systems...</span>
        <div className="mt-12 opacity-40">
          <p className="text-[10px] font-inter font-bold tracking-tight uppercase">POWERED BY EDUSYSTEMS GLOBAL</p>
        </div>
      </footer>
    </div>
  );
};

export default SplashScreen;
