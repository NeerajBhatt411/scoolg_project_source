import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageSchools = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/superadmin/schools');
                const data = await res.json();
                setSchools(data.filter(s => s.status !== 'PENDING'));
            } catch (error) {
                console.error("Failed to fetch schools", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchools();
    }, []);

    return (
        <div className="p-4 sm:p-8 space-y-6 max-w-full">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-on-surface">Manage Schools</h2>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">View and manage all active schools on the platform.</p>
                </div>
                <button className="primary-gradient text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add School
                </button>
            </div>

            <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[11px] uppercase font-bold text-on-surface-variant tracking-widest bg-surface-container-low/50">
                                <th className="px-6 py-4">School Details</th>
                                <th className="px-6 py-4">Campus Code</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container/50">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-on-surface-variant">Loading schools...</td></tr>
                            ) : schools.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-on-surface-variant">No active schools found.</td></tr>
                            ) : schools.map(school => (
                                <tr 
                                    key={school.id} 
                                    onClick={() => navigate(`/schools/${school.id}`, { state: { school } })}
                                    className="hover:bg-surface-container-low/40 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
                                                {school.formData?.schoolName ? school.formData.schoolName.substring(0, 2) : 'NA'}
                                            </div>
                                            <div>
                                                <span className="font-bold text-[0.875rem] text-on-surface block">{school.formData?.schoolName || 'Unknown School'}</span>
                                                <span className="text-xs text-on-surface-variant">{school.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-on-surface font-bold uppercase text-[0.875rem]">
                                        {school.campusCode || 'N/A'}
                                    </td>
                                    <td className="px-6 py-5 text-on-surface-variant text-[0.875rem]">
                                        {new Date(school.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-[0.875rem] font-bold text-green-600 px-3 py-1 rounded-full status-aura-success w-fit">
                                            <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                            {school.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors">
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
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

export default ManageSchools;
