import React from 'react';
import { motion } from 'framer-motion';

const Profile = () => {
  return (
    <div className="min-h-full pb-32">
      {/* MOBILE CONTENT (Matches profile_screen design) */}
      <div className="lg:hidden space-y-stack-gap px-container-margin pt-6">
        
        {/* Profile Card */}
        <section className="bg-white p-section-padding rounded-[32px] shadow-sm flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-container p-1">
              <img 
                alt="Johnathan Doe" 
                className="w-full h-full object-cover rounded-full" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPBRp0_h2PWNrDO28zDSDp2z0h-lJfNIXC94dM-za3Wv8qg1ncZxNTKYBiA9NHvnPdsoRM1W52iZRhRT62kY3xnV6Kg1xLbt6QlOOepMDvjkO16rLQ1QHLL5naHD4veCx_mLuYVo86BYaqdbfatTASSSAaNAaI1lBApgjnr4jsiwACH9gyFS9xfdae-DRQFdkjmscDzXHpkTMbZEGCcf24eP7MaWePNEusrp3pqBEteHmHT8AlcZOBo7cp3gupSbLgzj470NWi0-c"
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-primary-container text-white p-1 rounded-full border-4 border-white">
              <span className="material-symbols-outlined text-[16px] font-bold">verified</span>
            </div>
          </div>
          <h2 className="text-[30px] font-bold text-on-surface mt-6">Johnathan Doe</h2>
          <p className="text-body-lg text-secondary">Grade 11 - Science Stream (B)</p>
          
          <div className="flex gap-3 mt-6">
            <span className="bg-primary-fixed text-on-primary-fixed-variant px-4 py-1.5 rounded-full text-label-md font-bold">ID: STU-2024-089</span>
            <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-1.5 rounded-full text-label-md font-bold">Active Student</span>
          </div>
        </section>

        {/* Basic Details */}
        <DetailSection icon="person" title="Basic Details">
          <DetailItem label="Date of Birth" value="March 15, 2007" />
          <DetailItem label="Gender" value="Male" />
          <DetailItem label="Blood Group" value="O+ Positive" />
        </DetailSection>

        {/* Parent Details */}
        <DetailSection icon="groups" title="Parent Details">
          <DetailItem label="Father's Name" value="Richard Doe" />
          <DetailItem label="Contact Number" value="+1 (555) 0123-456" />
          <DetailItem label="Emergency Email" value="richard.doe@email.com" />
        </DetailSection>

        {/* School Details */}
        <DetailSection icon="school" title="School Details">
          <div className="grid grid-cols-2 gap-y-4">
            <DetailItem label="Roll No." value="24BS1102" />
            <DetailItem label="Admission No." value="ADM/2021/045" />
            <DetailItem label="Joined Date" value="Aug 12, 2021" />
            <DetailItem label="Library ID" value="LIB-8822" />
          </div>
          <div className="mt-4 pt-4 border-t border-surface-container">
            <DetailItem label="Residential Address" value="742 Evergreen Terrace, Springfield, State 58008, United States" />
          </div>
        </DetailSection>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button className="w-full bg-primary text-white h-[56px] rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
            <span className="material-symbols-outlined">edit</span>
            Edit Profile
          </button>
          <button className="w-full bg-surface-container-high text-primary h-[56px] rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">lock_reset</span>
            Change Password
          </button>
          <button className="w-full border-2 border-error/20 text-error h-[56px] rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

const DetailSection = ({ icon, title, children }) => (
  <section className="bg-white p-section-padding rounded-[32px] shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h3 className="text-title-lg font-bold text-primary">{title}</h3>
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
