import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Onboarding = () => {
  const { step } = useParams();
  const navigate = useNavigate();
  const currentStep = parseInt(step) || 1;

  const steps = [
    {
      title: "Manage School Life Easily",
      description: "Track academic activities from one place.",
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=Onboarding1",
      accent: "primary",
      floatingCards: [
        { icon: "event", label: "Upcoming", value: "Math Quiz", color: "bg-primary-container", textColor: "text-on-primary-container", top: "-top-4", right: "-right-2" },
        { icon: "grade", label: "Achievement", value: "A+ Physics", color: "bg-tertiary-container", textColor: "text-on-tertiary-container", bottom: "bottom-10", left: "-left-4" }
      ]
    },
    {
      title: "Stay Updated Anytime",
      description: "Get notices, homework and important alerts instantly. Never miss a deadline.",
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=Onboarding2",
      accent: "primary",
      isNotificationStyle: true,
      notifications: [
        { icon: "edit_note", title: "New Homework", subtitle: "Just now", text: "Advanced Calculus: Assignment #4 is now available.", color: "bg-primary-container" },
        { icon: "campaign", title: "Urgent Notice", subtitle: "2m ago", text: "Holiday Announcement: Campus closed on Friday.", color: "bg-tertiary-container" }
      ]
    },
    {
      title: "Analyze Your Progress",
      description: "Visual insights into your grades and attendance history over the semester.",
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=Onboarding3",
      accent: "primary",
      floatingCards: [
        { icon: "trending_up", label: "Average", value: "88.4%", color: "bg-green-100", textColor: "text-green-700", top: "top-4", right: "right-4" },
        { icon: "fact_check", label: "Attendance", value: "94%", color: "bg-primary-fixed", textColor: "text-primary", bottom: "bottom-12", left: "left-6" }
      ]
    }
  ];

  const data = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < 3) {
      navigate(`/onboarding/${currentStep + 1}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-container-margin w-full h-16 bg-surface z-50">
        <div className="text-[18px] font-manrope font-extrabold text-primary">SchoolG</div>
        <Link 
          to="/login"
          className="text-on-surface-variant font-bold text-[12px] px-4 py-2 hover:bg-surface-container-low transition-colors rounded-xl uppercase tracking-widest"
        >
          Skip
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-container-margin py-section-padding gap-stack-gap relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md flex flex-col items-center gap-12"
          >
            {/* Illustration Area */}
            <div className="w-full aspect-square relative flex items-center justify-center bg-surface-container-low rounded-[40px] shadow-inner overflow-hidden">
              {/* Decorative Blur */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>

              {data.isNotificationStyle ? (
                <div className="relative w-4/5 h-4/5 flex flex-col justify-center gap-4">
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/60 shadow-lg -rotate-3"></div>
                  {data.notifications.map((n, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={`relative z-10 bg-white p-4 rounded-2xl shadow-xl flex items-start gap-4 border border-surface-container ${i === 0 ? 'translate-x-4' : '-translate-x-2'}`}
                    >
                      <div className={`${n.color} text-white p-2 rounded-xl`}>
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[14px] font-manrope font-extrabold text-on-surface">{n.title}</span>
                          <span className="text-[10px] font-bold text-outline uppercase">{n.subtitle}</span>
                        </div>
                        <p className="text-[12px] font-inter text-on-surface-variant leading-snug">{n.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div className="absolute -bottom-4 -right-2 bg-primary text-white p-3 rounded-full shadow-lg rotate-12">
                    <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full p-8 flex items-center justify-center">
                  <div className="relative w-full h-full bg-white rounded-[40px] shadow-2xl overflow-hidden p-6 flex items-center justify-center border border-white/40">
                    <img src={data.image} alt={data.title} className="w-full h-auto object-contain" />
                  </div>
                  {data.floatingCards.map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`absolute ${card.top || ''} ${card.bottom || ''} ${card.left || ''} ${card.right || ''} bg-white p-3 rounded-2xl shadow-2xl border border-surface-variant/20 flex items-center gap-3 z-20 ${i === 0 ? 'animate-bounce-slow' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center ${card.textColor}`}>
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{card.label}</span>
                        <span className="text-[14px] font-manrope font-extrabold text-on-surface">{card.value}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Area */}
            <div className="text-center space-y-4">
              <h1 className="text-[30px] font-manrope font-extrabold text-on-background leading-tight">{data.title}</h1>
              <p className="text-[16px] font-inter text-on-surface-variant leading-relaxed max-w-[320px] mx-auto">{data.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full px-container-margin py-12 flex flex-col items-center gap-8">
        {/* Pagination */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-surface-container-highest'}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <button 
            onClick={handleNext}
            className="w-full h-[56px] bg-primary text-on-primary font-manrope font-extrabold text-[16px] rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {currentStep === 3 ? "Get Started" : "Next"}
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
