import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [stats, setStats] = useState({ schools: 0, students: 0, revenue: 0, pending: 0 });
    const [recentSchools, setRecentSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, schoolsRes] = await Promise.all([
                fetch('https://scoolg-backend.netlify.app/api/superadmin/dashboard'),
                fetch('https://scoolg-backend.netlify.app/api/superadmin/schools')
            ]);
            
            const statsData = await statsRes.json();
            const schoolsData = await schoolsRes.json();

            setStats(statsData);
            setRecentSchools(schoolsData.slice(0, 5)); // Show top 5 recent
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`https://scoolg-backend.netlify.app/api/superadmin/schools/${id}/approve`, {
                method: 'POST'
            });
            if (res.ok) {
                fetchData(); // Refresh data after approval
                alert('School Approved Successfully!');
            }
        } catch (error) {
            console.error("Approval failed", error);
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-full">
            {/* Welcome Section */}
            <section className="max-w-full overflow-hidden flex flex-col gap-2">
                <h3 className="text-[20px] sm:text-[28px] font-[800] text-on-surface tracking-tight leading-tight truncate sm:whitespace-normal">
                    Welcome back, Super Admin!
                </h3>
                <p className="text-on-surface-variant font-medium text-xs sm:text-sm">
                    Snapshot of total platform growth and school onboarding metrics.
                </p>
            </section>

            {/* Stat Cards Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-primary">
                    <div>
                        <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                            Total Schools
                        </p>
                        {loading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div> : <h4 className="text-2xl font-extrabold text-on-surface">{stats.schools.toLocaleString()}</h4>}
                        <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span>Platform-wide Active</span>
                        </div>
                    </div>
                    <div className="p-3 bg-primary-container/10 rounded-xl text-primary">
                        <span className="material-symbols-outlined text-3xl">account_balance</span>
                    </div>
                </div>
                
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-secondary">
                    <div>
                        <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                            Total Students
                        </p>
                        {loading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div> : <h4 className="text-2xl font-extrabold text-on-surface">{stats.students.toLocaleString()}</h4>}
                        <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-medium text-xs">
                            <span>Across all schools</span>
                        </div>
                    </div>
                    <div className="p-3 bg-secondary-container/10 rounded-xl text-secondary">
                        <span className="material-symbols-outlined text-3xl">groups</span>
                    </div>
                </div>
                
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-tertiary">
                    <div>
                        <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                            Pending Approvals
                        </p>
                        {loading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div> : <h4 className="text-2xl font-extrabold text-on-surface">{stats.pending}</h4>}
                        <div className="flex items-center gap-1 mt-2 text-tertiary font-bold text-xs">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>Action Required</span>
                        </div>
                    </div>
                    <div className="p-3 bg-tertiary-container/10 rounded-xl text-tertiary">
                        <span className="material-symbols-outlined text-3xl">pending_actions</span>
                    </div>
                </div>
                
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow flex items-start justify-between border-b-4 border-outline">
                    <div>
                        <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                            Revenue / MRR
                        </p>
                        {loading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div> : <h4 className="text-2xl font-extrabold text-on-surface">₹{stats.revenue.toLocaleString()}</h4>}
                        <div className="flex items-center gap-1 mt-2 text-on-surface-variant font-medium text-xs">
                            <span>Estimated Revenue</span>
                        </div>
                    </div>
                    <div className="p-3 bg-surface-container-high rounded-xl text-outline">
                        <span className="material-symbols-outlined text-3xl">payments</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-surface-container-lowest p-5 sm:p-8 rounded-xl premium-shadow">
                <h5 className="text-lg sm:text-2xl text-on-surface font-bold mb-5 sm:mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">bolt</span>
                    Quick Administrative Actions
                </h5>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <button className="primary-gradient text-on-primary font-bold py-3.5 sm:py-4 px-3 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 scale-98 active:scale-95 transition-all shadow-lg shadow-primary/20 overflow-hidden">
                        <span className="material-symbols-outlined text-[20px] sm:text-[24px]">add_business</span>
                        <span className="text-[11px] sm:text-sm whitespace-nowrap">Add School</span>
                    </button>
                    <button className="bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold py-3.5 sm:py-4 px-3 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 scale-98 active:scale-95 transition-all overflow-hidden border border-outline-variant/30">
                        <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]">send</span>
                        <span className="text-[11px] sm:text-sm whitespace-nowrap">Global Notice</span>
                    </button>
                    <button className="bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold py-3.5 sm:py-4 px-3 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 scale-98 active:scale-95 transition-all overflow-hidden border border-outline-variant/30">
                        <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]">analytics</span>
                        <span className="text-[11px] sm:text-sm whitespace-nowrap">View Reports</span>
                    </button>
                    <button className="bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold py-3.5 sm:py-4 px-3 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 scale-98 active:scale-95 transition-all overflow-hidden border border-outline-variant/30">
                        <span className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]">settings</span>
                        <span className="text-[11px] sm:text-sm whitespace-nowrap">App Settings</span>
                    </button>
                </div>
            </div>

            {/* Bottom Card: Recent Onboarding Activity */}
            <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
                <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-surface-container">
                    <h5 className="text-title-md text-on-surface font-bold">Recent School Registrations</h5>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[11px] uppercase font-bold text-on-surface-variant tracking-widest bg-surface-container-low/50">
                                <th className="px-4 sm:px-8 py-4">School Details</th>
                                <th className="px-4 sm:px-8 py-4">Campus Code</th>
                                <th className="px-4 sm:px-8 py-4">Joined Date</th>
                                <th className="px-4 sm:px-8 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-on-surface-variant">Loading schools data...</td>
                                </tr>
                            ) : recentSchools.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-on-surface-variant">No schools registered yet.</td>
                                </tr>
                            ) : recentSchools.map(school => (
                                <tr key={school.id} className="hover:bg-surface-container-low/40 transition-colors">
                                    <td className="px-4 sm:px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                                                {school.formData?.schoolName ? school.formData.schoolName.substring(0, 2) : 'NA'}
                                            </div>
                                            <div>
                                                <span className="font-bold text-[0.875rem] text-on-surface block">{school.formData?.schoolName || 'Unknown School'}</span>
                                                <span className="text-xs text-on-surface-variant">{school.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-8 py-5 text-on-surface font-bold uppercase text-[0.875rem]">
                                        {school.campusCode || 'UNASSIGNED'}
                                    </td>
                                    <td className="px-4 sm:px-8 py-5 text-on-surface-variant text-[0.875rem]">
                                        {new Date(school.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 sm:px-8 py-5">
                                        {school.status === 'PENDING' ? (
                                            <button 
                                                onClick={() => handleApprove(school.id)}
                                                className="flex items-center gap-2 text-[0.875rem] font-bold text-orange-600 px-3 py-1 rounded-full bg-orange-50 w-fit cursor-pointer hover:bg-orange-100 transition-colors border-none"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                                                Approve
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[0.875rem] font-bold text-green-600 px-3 py-1 rounded-full status-aura-success w-fit">
                                                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                                {school.status}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
