import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
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
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <Hero />
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
