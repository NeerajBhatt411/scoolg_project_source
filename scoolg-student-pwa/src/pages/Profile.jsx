import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, User, Users, GraduationCap, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-full pb-32">
      {/* CONTENT (Responsive for Mobile & Desktop) */}
      <div className="max-w-3xl mx-auto space-y-stack-gap px-container-margin pt-6 sm:pt-10">
        
        {/* Profile Card */}
        <section className="bg-white p-section-padding rounded-[32px] shadow-sm flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-container p-1">
              <img 
                alt={user.firstName} 
                className="w-full h-full object-cover rounded-full" 
                src={user.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName}`}
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-full border-4 border-white shadow-sm">
              <BadgeCheck strokeWidth={2.5} size={20} />
            </div>
          </div>
          <h2 className="text-[30px] font-bold text-on-surface mt-6">{user.firstName} {user.lastName}</h2>
          <p className="text-body-lg text-secondary">Grade {user.class} - {user.section}</p>

          
          <div className="flex gap-3 mt-6">
            <span className="bg-primary-fixed text-on-primary-fixed-variant px-4 py-1.5 rounded-full text-label-md font-bold">ID: {user.studentAppId}</span>
            <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-1.5 rounded-full text-label-md font-bold">{user.status} Student</span>
          </div>

        </section>

        {/* Basic Details */}
        <DetailSection icon={<User size={24} strokeWidth={2.5} />} title="Basic Details">
          <DetailItem label="Date of Birth" value={formatDate(user.dateOfBirth)} />
          <DetailItem label="Gender" value={user.gender || 'N/A'} />
          <DetailItem label="Blood Group" value={user.bloodGroup || 'N/A'} />
        </DetailSection>


        {/* Parent Details */}
        <DetailSection icon={<Users size={24} strokeWidth={2.5} />} title="Parent Details">
          <DetailItem label="Father's Name" value={user.fatherName || 'N/A'} />
          <DetailItem label="Mother's Name" value={user.motherName || 'N/A'} />
          <DetailItem label="Contact Number" value={user.primaryContact || 'N/A'} />
          <DetailItem label="Emergency Email" value={user.parentEmail || 'N/A'} />
        </DetailSection>


        {/* School Details */}
        <DetailSection icon={<GraduationCap size={24} strokeWidth={2.5} />} title="School Details">
          <div className="grid grid-cols-2 gap-y-4">
            <DetailItem label="Roll No." value={user.rollNumber || 'N/A'} />
            <DetailItem label="Admission No." value={user.admissionNumber || 'N/A'} />
            <DetailItem label="Joined Date" value={formatDate(user.dateOfAdmission)} />
            <DetailItem label="Class" value={user.class} />
          </div>
          <div className="mt-4 pt-4 border-t border-surface-container">
            <DetailItem label="Residential Address" value={user.currentAddress || 'N/A'} />
          </div>
        </DetailSection>


        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button className="w-full bg-slate-50 border border-slate-100 text-slate-700 h-[56px] rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-slate-100">
            <KeyRound size={20} strokeWidth={2.5} />
            Change Password
          </button>
          <button 
            onClick={logout}
            className="w-full bg-rose-50 border border-rose-100 text-rose-600 h-[56px] rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-rose-100"
          >
            <LogOut size={20} strokeWidth={2.5} />
            Logout
          </button>

        </div>

      </div>
    </div>
  );
};

const DetailSection = ({ icon, title, children }) => (
  <section className="bg-white p-section-padding rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </section>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-label-md text-outline font-medium mb-1">{label}</p>
    <p className="text-body-lg text-on-surface font-semibold">{value}</p>
  </div>
);

export default Profile;
