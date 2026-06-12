import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Brief brand splash, then straight to the right place: a saved session goes
// to the dashboard, otherwise the login screen. No onboarding detour.
const SplashScreen = () => {
  const navigate = useNavigate();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // wait for the saved session to restore
    const timer = setTimeout(() => {
      navigate(token ? '/dashboard' : '/login', { replace: true });
    }, 1100);
    return () => clearTimeout(timer);
  }, [navigate, token, loading]);

  return (
    <div className="bg-background text-foreground overflow-hidden h-screen w-full flex flex-col items-center justify-between py-12 relative">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="h-16"></div>

      <main className="flex flex-col items-center relative">
        <div className="absolute inset-0 -top-24 -bottom-24 -left-24 -right-24 bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(250,248,255,0)_70%)] pointer-events-none z-0"></div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-28 h-28 bg-card shadow-2xl shadow-primary/10 rounded-[28px] grid place-items-center mb-8 border">
            <GraduationCap className="h-14 w-14 text-primary" />
          </div>
          <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Teacher Portal</p>
        </motion.div>
      </main>

      <footer className="flex flex-col items-center gap-6">
        <div className="w-[140px] h-[4px] bg-muted rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-1/2 h-full bg-primary rounded-full absolute"
          />
        </div>
        <span className="text-[12px] font-medium text-muted-foreground animate-pulse">Getting things ready…</span>
      </footer>
    </div>
  );
};

export default SplashScreen;
