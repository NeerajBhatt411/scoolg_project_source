import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Team from './components/Team';
import MobileApps from './components/MobileApps';
import CTA from './components/CTA';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SchoolOnboarding from './components/SchoolOnboarding';

function App() {
  // Onboarding is tracked in the URL (/get-started) so the browser Back button
  // closes it (returns to the landing page) instead of leaving the site.
  const [showOnboarding, setShowOnboarding] = useState(() => window.location.pathname.includes('get-started'));
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default is light; dark only when the visitor explicitly chose it.
    return localStorage.getItem('theme') === 'dark';
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const openOnboarding = () => {
    if (!window.location.pathname.includes('get-started')) {
      window.history.pushState({ onboarding: true }, '', '/get-started');
    }
    setShowOnboarding(true);
    window.scrollTo(0, 0);
  };
  const closeOnboarding = () => {
    setShowOnboarding(false);
    if (window.location.pathname.includes('get-started')) {
      window.history.pushState({}, '', '/');
    }
  };
  // Browser Back closes the onboarding (returns to landing) instead of leaving the site.
  useEffect(() => {
    const onPop = () => setShowOnboarding(window.location.pathname.includes('get-started'));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="bg-gray-50 text-gray-800 font-body antialiased min-h-screen transition-colors duration-300 dark:bg-slate-950 dark:text-gray-100">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />
      
      {showOnboarding ? (
        <>
          <button
            onClick={closeOnboarding}
            style={{
              position: 'fixed', top: 16, left: 16, zIndex: 200,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, border: '1px solid #e5e7eb',
              background: '#fff', color: '#374151', fontWeight: 600, fontSize: 13,
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)', cursor: 'pointer',
            }}
          >← Home</button>
          <SchoolOnboarding onClose={closeOnboarding} />
        </>
      ) : (
        <>
          <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} onGetStartedClick={openOnboarding} />
          <Hero onGetStartedClick={openOnboarding} />
          <HowItWorks />
          <Features />
          <Team />
          <MobileApps />
          <CTA onGetStartedClick={openOnboarding} />
          <Contact />
          <Footer isDarkMode={isDarkMode} />
        </>
      )}
    </div>
  );
}

export default App;
