import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, User, Users, GraduationCap, KeyRound, LogOut, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const name = user.firstName || 'Student';
  const colors = ['from-blue-500 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-orange-400 to-rose-400', 'from-purple-500 to-pink-500', 'from-amber-400 to-orange-500'];
  const bgGradient = colors[name.length % colors.length];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 flex flex-col">
      
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-6 lg:pt-10 space-y-6">
        
        {/* Profile Identity Card */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          {/* Decorative background element */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${bgGradient} opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}></div>
          
          <div className="relative shrink-0">
            <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center relative z-10`}>
              {user.profileImageUrl ? (
                <img 
                  alt={name} 
                  className="w-full h-full object-cover" 
                  src={user.profileImageUrl}
                />
              ) : (
                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`} alt="avatar" className="w-[85%] h-[85%] object-contain drop-shadow-lg translate-y-2" />
              )}
            </div>
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-sm z-20">
              <BadgeCheck strokeWidth={3} size={20} />
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left relative z-10 w-full">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">{user.firstName} {user.lastName}</h2>
            <p className="text-lg text-slate-500 font-medium mb-6">Grade {user.class} - Section {user.section}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                ID: {user.studentAppId}
              </div>
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {user.status || 'Active'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Details */}
          <DetailSection icon={<User size={24} strokeWidth={2.5} />} title="Personal Information" color="text-indigo-600" bg="bg-indigo-50">
            <div className="grid grid-cols-2 gap-y-6">
                <DetailItem label="Date of Birth" value={formatDate(user.dateOfBirth)} />
                <DetailItem label="Gender" value={user.gender || 'N/A'} />
                <DetailItem label="Blood Group" value={user.bloodGroup || 'N/A'} />
                <DetailItem label="Category" value={user.category || 'N/A'} />
            </div>
          </DetailSection>

          {/* School Details */}
          <DetailSection icon={<GraduationCap size={24} strokeWidth={2.5} />} title="Academic Details" color="text-amber-600" bg="bg-amber-50">
            <div className="grid grid-cols-2 gap-y-6">
              <DetailItem label="Roll Number" value={user.rollNumber || 'N/A'} />
              <DetailItem label="Admission No." value={user.admissionNumber || 'N/A'} />
              <DetailItem label="Joined Date" value={formatDate(user.dateOfAdmission)} />
              <DetailItem label="House" value={user.house || 'N/A'} />
            </div>
          </DetailSection>

          {/* Parent Details */}
          <DetailSection icon={<Users size={24} strokeWidth={2.5} />} title="Guardian Details" color="text-emerald-600" bg="bg-emerald-50" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 lg:grid-cols-4 gap-6">
              <DetailItem label="Father's Name" value={user.fatherName || 'N/A'} />
              <DetailItem label="Mother's Name" value={user.motherName || 'N/A'} />
              <DetailItem icon={<Phone size={14} className="text-slate-400" />} label="Contact Number" value={user.primaryContact || 'N/A'} />
              <DetailItem icon={<Mail size={14} className="text-slate-400" />} label="Email Address" value={user.parentEmail || 'N/A'} />
            </div>
            
            {user.currentAddress && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
                    <div className="mt-1 shrink-0 text-slate-400"><MapPin size={20} strokeWidth={2.5} /></div>
                    <div>
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Residential Address</p>
                        <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed">{user.currentAddress}</p>
                    </div>
                </div>
            )}
          </DetailSection>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <button onClick={() => navigate('/change-password')} className="bg-white border border-slate-200 text-slate-700 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all hover:bg-slate-50 hover:border-slate-300">
            <KeyRound size={20} strokeWidth={2.5} />
            Change Password
          </button>
          <button 
            onClick={logout}
            className="bg-rose-50 border border-rose-100 text-rose-600 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all hover:bg-rose-100 hover:border-rose-200"
          >
            <LogOut size={20} strokeWidth={2.5} />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

const DetailSection = ({ icon, title, color, bg, children, className = "" }) => (
  <section className={`bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-full ${className}`}>
    <div className="flex items-center gap-4 mb-8">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
    </div>
    <div className="flex-1 flex flex-col justify-center">
      {children}
    </div>
  </section>
);

const DetailItem = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-sm sm:text-base text-slate-900 font-bold truncate">{value}</p>
  </div>
);

export default Profile;
