import React, { useState, useEffect } from 'react';

const PendingApprovals = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const res = await fetch('https://scoolg-backend.netlify.app/api/superadmin/schools');
            const data = await res.json();
            setSchools(data.filter(s => s.status === 'PENDING'));
        } catch (error) {
            console.error("Failed to fetch schools", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`https://scoolg-backend.netlify.app/api/superadmin/schools/${id}/approve`, {
                method: 'POST'
            });
            if (res.ok) {
                alert('School Approved Successfully!');
                fetchSchools(); // Refresh the list
            }
        } catch (error) {
            console.error("Approval failed", error);
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-full">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-on-surface">Pending Approvals</h2>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">Schools waiting for admin verification and activation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-on-surface-variant">Loading pending requests...</p>
                ) : schools.length === 0 ? (
                    <p className="text-on-surface-variant">No pending approvals at the moment.</p>
                ) : schools.map(school => (
                    <div key={school.id} className="bg-surface-container-lowest p-6 rounded-xl premium-shadow border border-surface-container">
                        <div className="flex items-start justify-between mb-4">
                            {school.formData?.logo ? (
                                <img src={school.formData.logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover bg-surface-container" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg uppercase">
                                    {school.formData?.schoolName ? school.formData.schoolName.substring(0, 2) : 'NA'}
                                </div>
                            )}
                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Step {school.currentStep || 1} / 8</span>
                        </div>
                        <h4 className="text-lg font-bold text-on-surface">{school.formData?.schoolName || 'Incomplete Setup'}</h4>
                        
                        <div className="mt-3 mb-4">
                            <div className="flex justify-between text-xs text-text-muted mb-1 font-bold">
                                <span>Onboarding Progress</span>
                                <span>{Math.round(((school.currentStep || 1) / 8) * 100)}%</span>
                            </div>
                            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${((school.currentStep || 1) / 8) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">mail</span> {school.email}
                            </p>
                            <p className="text-sm text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">calendar_today</span> {new Date(school.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button 
                                onClick={() => handleApprove(school.id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Approve
                            </button>
                            <button className="px-4 bg-surface-container-high hover:bg-surface-container text-on-surface font-bold py-2 rounded-lg transition-colors">
                                View
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingApprovals;
