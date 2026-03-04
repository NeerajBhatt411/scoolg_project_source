import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import Team from './components/Team';
import MobileApps from './components/MobileApps';
import CTA from './components/CTA';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme);
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

  return (
    <div className="bg-gray-50 text-gray-800 font-body antialiased min-h-screen transition-colors duration-300 dark:bg-slate-950 dark:text-gray-100">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />
      <div className="bg-noise"></div>
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <Hero />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <Team />
      <MobileApps />
      <CTA />
      <Contact />
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
