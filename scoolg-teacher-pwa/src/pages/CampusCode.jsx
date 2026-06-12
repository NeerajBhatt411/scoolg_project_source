import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';


const CampusCode = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/student/verify-campus/${code.toUpperCase()}`);
      sessionStorage.setItem('temp_school_info', JSON.stringify(response.data));
      sessionStorage.setItem('verified_campus_code', code.toUpperCase());
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid Campus Code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-container-margin font-body-md">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-2xl border border-surface-container"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-primary-container/10 text-primary rounded-[24px] flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px]">location_on</span>
          </div>
          <h1 className="text-display-lg font-manrope font-extrabold text-on-surface mb-2">Campus Code</h1>
          <p className="text-body-lg text-on-surface-variant">Please enter your school's unique campus code to proceed.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="p-4 bg-error/10 text-error rounded-2xl text-label-md font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-label-md font-bold text-outline uppercase tracking-widest ml-1">Enter Code</label>
            <input 
              autoFocus
              className="w-full h-[64px] px-6 bg-surface-container-low border-2 border-transparent rounded-2xl font-display-lg text-display-lg text-center tracking-[4px] uppercase focus:border-primary focus:bg-white transition-all outline-none" 
              placeholder="E.G. GAJ1561"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>

          <button 
            disabled={loading || !code}
            className="w-full h-[60px] bg-primary text-on-primary rounded-2xl font-manrope font-extrabold text-[18px] shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Continue'}
            {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
        </form>

        <p className="mt-8 text-center text-label-md text-on-surface-variant">
          Don't have a code? <a href="#" className="text-primary font-bold hover:underline">Contact your administrator</a>
        </p>
      </motion.div>
      
      <div className="mt-12 opacity-30 flex flex-col items-center">
        <span className="text-[24px] font-manrope font-extrabold text-primary">SchoolG</span>
        <p className="text-[10px] font-bold uppercase tracking-[4px] text-muted-foreground">Premium Academy</p>
      </div>
    </div>
  );
};

export default CampusCode;
