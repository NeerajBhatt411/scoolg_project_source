import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <div className="min-h-full">
      {/* MOBILE VIEW (Matches dashboard_with_attendance_bar design) */}
      <div className="lg:hidden space-y-8 pb-32 pt-stack-gap">
        
        {/* Total Attendance Section */}
        <section className="px-container-margin">
          <div className="bg-white border border-outline-variant p-card-internal-padding rounded-[20px] shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-body-md font-bold text-on-surface-variant">Total Attendance</h3>
                <p className="text-display-lg font-bold text-primary">94%</p>
              </div>
              <div className="flex items-center gap-1 text-primary cursor-pointer hover:underline">
                <span className="text-label-md font-bold">View Details</span>
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </div>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full" style={{ width: '94%' }}></div>
            </div>
            <p className="text-label-md text-on-surface-variant">You have attended 168 out of 180 sessions this term.</p>
          </div>
        </section>

        {/* Announcements Carousel */}
        <section className="px-container-margin">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-headline-md font-headline-md text-on-surface">Latest Announcements</h2>
            <button className="text-primary text-label-md font-label-md font-bold">View All</button>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-high h-48 group">
            <img 
              alt="School Event" 
              className="w-full h-full object-cover brightness-75" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ32w7-UqUBM-BjRxQBpuKuaZFHQcpRK4Cq_zKpsDCIEIKkMzh6FSHo6RkpsxyTrXI0Dde9KixRu3Ytol7vHlHakNshf3PtlEkwp52wT2_NjdFNzyMVCCEnhe98p3vxyASL5IVYTmmD_W6yZjM8Yo3x43JDvHgzjRkAwW5UXmsV4knpEKP-biYXKjoQqHO9hHgGpkEX-12j9AtQ3R2qRqwDpuKxChPIEoti_-wR4asoz4-a2pGI1WSFSDxnw5FuUOCtBZssX2DQyE"
            />
            <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent">
              <h3 className="text-white text-title-lg font-title-lg mb-1">Annual Science Fair 2024</h3>
              <p className="text-white/80 text-body-md">Registrations are now open for all STEM enthusiasts. Join us next Friday!</p>
              <div className="flex gap-2 mt-4">
                <div className="w-6 h-1.5 rounded-full bg-primary"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Academics Section */}
        <section className="px-container-margin">
          <h2 className="text-headline-md font-headline-md mb-4 text-on-surface">Academics</h2>
          <div className="grid grid-cols-2 gap-4">
            <AcademicCard icon="schedule" title="Timetable" subtitle="Check daily periods" bg="bg-primary-fixed" color="text-primary" />
            <AcademicCard icon="assignment" title="Homework" subtitle="4 pending tasks" bg="bg-tertiary-fixed" color="text-tertiary" />
            <AcademicCard icon="how_to_reg" title="Attendance" subtitle="View monthly logs" bg="bg-secondary-fixed" color="text-secondary" />
            <AcademicCard icon="insights" title="Results" subtitle="Term 1 performance" bg="bg-green-100" color="text-green-700" />
            <AcademicCard icon="event_note" title="Exam Dates" subtitle="Finals timetable" bg="bg-orange-100" color="text-orange-700" />
            <AcademicCard icon="menu_book" title="Subjects" subtitle="12 total courses" bg="bg-blue-100" color="text-blue-700" />
          </div>
        </section>

        {/* Finance Section */}
        <section className="px-container-margin">
          <h2 className="text-headline-md font-headline-md mb-4 text-on-surface">Finance</h2>
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary">payments</span>
              </div>
              <div>
                <span className="text-title-lg font-title-lg block text-on-surface">Fees</span>
                <span className="text-label-md font-label-md text-error font-bold">Outstanding: $240.00</span>
              </div>
            </div>
            <button className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-label-md shadow-sm active:scale-95 transition-transform">
              PAY NOW
            </button>
          </div>
          <div className="mt-3 flex gap-3">
            <button className="flex-1 bg-white border border-outline-variant py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-label-md font-bold text-secondary">
              <span className="material-symbols-outlined">receipt_long</span>
              Receipts
            </button>
            <button className="flex-1 bg-white border border-outline-variant py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-label-md font-bold text-secondary">
              <span className="material-symbols-outlined">history</span>
              History
            </button>
          </div>
        </section>

        {/* School Updates Section */}
        <section className="px-container-margin pb-8">
          <h2 className="text-headline-md font-headline-md mb-4 text-on-surface">School Updates</h2>
          <div className="space-y-3">
            <UpdateItem icon="campaign" title="School Notices" subtitle="Update on winter timings" />
            <UpdateItem icon="festival" title="Upcoming Events" subtitle="Cultural fest in 3 days" />
            <UpdateItem icon="description" title="Circulars" subtitle="New laboratory guidelines" />
            <UpdateItem icon="directions_bus" title="Transport" subtitle="Bus Route #14 on time" />
          </div>
        </section>
      </div>

      {/* DESKTOP VIEW (Matches desktop_dashboard design) */}
      <div className="hidden lg:block space-y-stack-gap p-8 max-w-7xl mx-auto">
        {/* Attendance Banner */}
        <section className="bg-white p-8 rounded-[24px] shadow-soft border border-surface-container relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-display-lg font-display-lg text-primary mb-1">Total Attendance: 94%</h2>
              <p className="text-body-lg text-secondary">You have attended <span className="font-bold text-on-surface">168 out of 180</span> sessions this semester.</p>
            </div>
            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-label-md font-bold">
              Excellent Standing
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: '94%' }}></div>
          </div>
          <div className="flex justify-between mt-4 text-label-md text-outline">
            <span>Academic Year 2023-24</span>
            <span className="font-bold uppercase tracking-wider">Target: 85%</span>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-stack-gap">
          {/* Academics Grid */}
          <div className="col-span-7 space-y-4">
            <h3 className="text-headline-md font-headline-md text-on-surface px-1">Academics</h3>
            <div className="grid grid-cols-2 gap-4">
              <DesktopAcademicCard icon="calendar_today" title="Timetable" subtitle="Next: Physics at 10:30 AM" />
              <DesktopAcademicCard icon="menu_book" title="Homework" subtitle="3 Pending tasks due tomorrow" />
              <DesktopAcademicCard icon="fact_check" title="Attendance" subtitle="Detailed log for 12 subjects" />
              <DesktopAcademicCard icon="assessment" title="Results" subtitle="Mid-term results available" />
              <DesktopAcademicCard icon="event_note" title="Exam Dates" subtitle="Finals start in 24 days" />
              <DesktopAcademicCard icon="import_contacts" title="Subjects" subtitle="View syllabus & curriculum" />
            </div>
          </div>

          {/* Finance Section */}
          <div className="col-span-5 space-y-4">
            <h3 className="text-headline-md font-headline-md text-on-surface px-1">Finance</h3>
            <div className="flex flex-col gap-4 h-full">
              <div className="bg-primary-container text-on-primary p-8 rounded-[24px] shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-label-md opacity-80 uppercase tracking-widest mb-2 font-bold">Outstanding Fees</p>
                  <p className="text-[42px] font-bold tracking-tight mb-6">$1,250.00</p>
                  <button className="bg-white text-primary px-8 py-3 rounded-xl font-bold text-title-lg hover:scale-105 transition-transform active:scale-95 shadow-md">Pay Now</button>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[160px] opacity-10 rotate-12">account_balance_wallet</span>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <DesktopAcademicCard icon="receipt_long" title="Receipts" subtitle="Download previous payments" />
                <DesktopAcademicCard icon="history" title="History" subtitle="Complete transaction log" />
              </div>
            </div>
          </div>
        </div>

        {/* Announcements & Updates Grid */}
        <div className="grid grid-cols-12 gap-stack-gap">
          {/* Announcements */}
          <div className="col-span-8 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-headline-md font-headline-md text-on-surface">Latest Announcements</h3>
              <button className="text-primary font-bold text-label-md flex items-center gap-1">View All <span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <AnnouncementCard image="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ32w7-UqUBM-BjRxQBpuKuaZFHQcpRK4Cq_zKpsDCIEIKkMzh6FSHo6RkpsxyTrXI0Dde9KixRu3Ytol7vHlHakNshf3PtlEkwp52wT2_NjdFNzyMVCCEnhe98p3vxyASL5IVYTmmD_W6yZjM8Yo3x43JDvHgzjRkAwW5UXmsV4knpEKP-biYXKjoQqHO9hHgGpkEX-12j9AtQ3R2qRqwDpuKxChPIEoti_-wR4asoz4-a2pGI1WSFSDxnw5FuUOCtBZssX2DQyE" tag="Event" title="Annual Science Fair 2024" date="March 15th • Auditorium" />
              <AnnouncementCard image="https://lh3.googleusercontent.com/aida-public/AB6AXuCLhnLkYXEBOpO2bdQ48YjjVmmGt8jLxTc_MF-Kr6LUCSp9aOiUekY6qLMyr6mN-Pqhe960PxJwJRbJDcPa8WpSI3da17JGoCR9fwV54jkf8ec6SBA3WALmZQh1IH4456eeF5mgLRUDb323OQ4KL2tY5nYvE6Fye5dZ9CCnCtHy1sGg53bS9XVC1H3ci09lht_thuKJJNqj7h880v__JQW40Jzw-hKDcJ-QFlgaCONtMIBzB7wweN0Hxh990ckHl5Tg0w9Us3A6Bf0" tag="Health" title="Spring Vaccination Drive" date="Grade 9-12 students" tagColor="bg-tertiary" />
              <AnnouncementCard image="https://lh3.googleusercontent.com/aida-public/AB6AXuCTtzjyjDh_bqP3TRkqu54mkj1wktvmdPDR-oV0ZdhVHvPIvJKnFcm32n4p6b7R86CMv4xTZ1XmF541Y0du_b_PBto8VxPAQZ67bBG2Jn_lj-repcNtUF2Xk8vq53HkA6fz5aTtFnRB0QBaqmi-wUPLGgRhN7max6hFzXJ7d06guhWnrh61sf_Z8EIzXr8pBeeFPNPH5JcEawcXvdH2Xsln_PyyG-QZ_gi5FSl8Sp5x-MVlwD81RBd50ucMstF8-vHM7dUG0ET4y_o" tag="Academic" title="Digital Learning Portal" date="Access 24/7 materials" tagColor="bg-green-600" />
            </div>
          </div>

          {/* School Updates */}
          <div className="col-span-4 space-y-4">
            <h3 className="text-headline-md font-headline-md text-on-surface px-1">School Updates</h3>
            <div className="bg-white rounded-[24px] border border-surface-container overflow-hidden divide-y divide-surface-container">
              <DesktopUpdateItem icon="campaign" title="Holiday Notice" time="2h ago" />
              <DesktopUpdateItem icon="festival" title="Sports Meet Schedule" time="Yesterday" />
              <DesktopUpdateItem icon="description" title="Revised Fee Structure" time="3 days ago" />
              <DesktopUpdateItem icon="directions_bus" title="Route 7 Bus Delay" time="4 days ago" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AcademicCard = ({ icon, title, subtitle, bg, color }) => (
  <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-95">
    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    </div>
    <span className="text-label-md font-label-md font-bold block mb-1 text-on-surface">{title}</span>
    <span className="text-body-md text-on-surface-variant line-clamp-1">{subtitle}</span>
  </div>
);

const DesktopAcademicCard = ({ icon, title, subtitle }) => (
  <div className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col gap-3 group hover:border-primary border border-surface-container transition-all cursor-pointer hover:shadow-md active:scale-[0.98]">
    <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">{icon}</span>
    <div>
      <p className="font-bold text-title-lg text-on-surface">{title}</p>
      <p className="text-label-md text-secondary line-clamp-1">{subtitle}</p>
    </div>
  </div>
);

const UpdateItem = ({ icon, title, subtitle }) => (
  <div className="bg-white p-4 rounded-xl border border-outline-variant flex items-center justify-between cursor-pointer active:bg-surface-container-low transition-colors group">
    <div className="flex items-center gap-4">
      <span className="material-symbols-outlined text-secondary bg-surface-container rounded-lg p-2 group-hover:bg-primary-container group-hover:text-white transition-colors">{icon}</span>
      <div>
        <p className="font-bold text-body-lg text-on-surface">{title}</p>
        <p className="text-label-md text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
    <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
  </div>
);

const DesktopUpdateItem = ({ icon, title, time }) => (
  <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-colors">
        <span className="material-symbols-outlined text-secondary text-[20px] group-hover:text-inherit">{icon}</span>
      </div>
      <div>
        <p className="font-bold text-body-md text-on-surface line-clamp-1">{title}</p>
        <p className="text-label-md text-outline">{time}</p>
      </div>
    </div>
    <span className="text-[10px] uppercase tracking-widest font-bold text-outline group-hover:text-primary transition-colors">View</span>
  </div>
);

const AnnouncementCard = ({ image, tag, title, date, tagColor = "bg-primary" }) => (
  <div className="group relative overflow-hidden rounded-[24px] shadow-sm aspect-[4/5] cursor-pointer hover:shadow-xl transition-shadow">
    <img alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={image} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
      <span className={`${tagColor} text-white text-[10px] font-bold uppercase px-2 py-1 rounded w-fit mb-2 tracking-widest`}>{tag}</span>
      <h4 className="text-white font-bold text-title-lg leading-tight group-hover:text-primary-fixed transition-colors">{title}</h4>
      <p className="text-white/60 text-label-md mt-2 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
        {date}
      </p>
    </div>
  </div>
);

export default Dashboard;
