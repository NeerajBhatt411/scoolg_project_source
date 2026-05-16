import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Reverting to simple mock login
    if (studentId && password) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface">
      <main className="flex min-h-screen">
        {/* DESKTOP SIDE: VISUAL/BRANDING - FROM raw_design/desktop_login */}
        <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img
            alt="Academic Campus"
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAuH-PFr0Pye4khXWoq3HltCu7dHkaYV2_-6i_SSO67DBOpKybUC1WlAAYo8Fe3nQ8cY6bTDekolLUILB0qzIO9WKeRB3amvomVnrzqG9rVkwniQa-IuwFih4libpiDPe5MmxnUjldAh_11ZWf0Vs1YCK-m0K5oiZFB6SOIjHdqtIxYOSZAmy1Zht3K6Y2_4PIdtX-K_Clp2FhCi3ipKi6-whrh7cnQSAKpLNXI0ye_BDbIiSjfKJY7KNRJDZBFzho-bJpf1cxY2U"
          />
          <div className="absolute inset-0 bg-primary/20 backdrop-brightness-75"></div>
          <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
            <div>
              <h1 className="font-display-lg text-display-lg font-bold tracking-tight">SchoolG</h1>
              <p className="font-title-lg text-title-lg opacity-90 mt-2">Premium Academy</p>
            </div>
            <div className="max-w-md">
              <h2 className="font-headline-md text-headline-md mb-4 leading-tight">Elevating the standard of modern education management.</h2>
              <div className="flex gap-4">
                <div className="h-1 w-12 bg-white rounded-full"></div>
                <div className="h-1 w-4 bg-white/40 rounded-full"></div>
                <div className="h-1 w-4 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGIN FORM SECTION - Works for both Mobile & Desktop */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-section-padding bg-surface">
          <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <div className="lg:hidden mb-8">
                <span className="font-display-lg text-display-lg font-bold text-primary">SchoolG</span>
              </div>
              <h3 className="font-display-lg text-display-lg text-on-surface">Login to your account</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant">Welcome back. Please enter your details.</p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="studentId">Student ID / Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <input
                    className="w-full h-[52px] pl-12 pr-4 bg-surface-container-low border-none rounded-xl font-body-md text-on-surface transition-all duration-200 focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-outline/60 outline-none"
                    id="studentId"
                    placeholder="Enter your ID or email"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="font-label-md text-label-md text-primary hover:underline transition-all" href="#">Forgot Password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                  <input
                    className="w-full h-[52px] pl-12 pr-12 bg-surface-container-low border-none rounded-xl font-body-md text-on-surface transition-all duration-200 focus:ring-2 focus:ring-primary focus:bg-white placeholder:text-outline/60 outline-none"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary transition-colors" type="button">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 px-1">
                <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all" id="remember" type="checkbox" />
                <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer" htmlFor="remember">Remember Me</label>
              </div>

              <button
                className="w-full h-[52px] bg-primary-container text-white font-title-lg text-title-lg rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                type="submit"
              >
                Login
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="pt-8 flex flex-col items-center space-y-4">
              <p className="font-body-md text-body-md text-on-surface-variant">Having trouble signing in?</p>
              <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-outline-variant hover:bg-surface-container transition-colors font-label-md text-label-md text-secondary">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
