import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import TopHeader from '@/components/TopHeader';
import { Search, ChevronRight, User, GraduationCap, Mail, Phone } from 'lucide-react';
import MenuButton from '../components/MenuButton';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [classesInfo, setClassesInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // 1. Fetch all classes the teacher teaches
                const clsRes = await api.get('/teacher/my-classes');
                const myClasses = (clsRes.data || []).filter(c => c.teaches || c.isClassTeacher);
                setClassesInfo(myClasses);

                // 2. Fetch students for each class
                let allStudents = [];
                for (const cls of myClasses) {
                    try {
                        const stdRes = await api.get(`/teacher/students?className=${cls.className}&sectionName=${cls.sectionName}`);
                        const classStudents = (stdRes.data || []).map(s => ({
                            ...s,
                            className: cls.className,
                            sectionName: cls.sectionName
                        }));
                        allStudents = [...allStudents, ...classStudents];
                    } catch (err) {
                        console.error('Error fetching students for', cls.className, err);
                    }
                }
                
                // Deduplicate if needed (though they shouldn't overlap if they belong to 1 class)
                const uniqueStudents = Array.from(new Map(allStudents.map(s => [s._id || s.rollNumber, s])).values());
                
                // Sort by class then by name
                uniqueStudents.sort((a, b) => {
                    if (a.className !== b.className) return (a.className || '').localeCompare(b.className || '');
                    const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
                    const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
                    return nameA.localeCompare(nameB);
                });

                setStudents(uniqueStudents);
            } catch (error) {
                console.error('Failed to load students', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter(s => {
        const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
        const roll = (s.rollNumber || '').toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || roll.includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || `${s.className} ${s.sectionName}` === activeTab;
        return matchesSearch && matchesTab;
    });

    const uniqueClasses = ['All', ...new Set(students.map(s => `${s.className} ${s.sectionName}`))];

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-24">
            <TopHeader 
                title="Students Directory" 
                showSearch={true} 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
                placeholder="Find student by name or roll no..."
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Students</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {loading ? 'Loading students...' : `You teach ${students.length} students across ${uniqueClasses.length - 1} classes.`}
                        </p>
                    </div>
                </div>

                {!loading && uniqueClasses.length > 2 && (
                    <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
                        {uniqueClasses.map(cls => (
                            <button 
                                key={cls}
                                onClick={() => setActiveTab(cls)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === cls 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {cls === 'All' ? 'All Classes' : `Class ${cls}`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Mobile Search Bar (Since TopHeader search is hidden on very small screens) */}
                <div className="md:hidden relative w-full mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search student by name or roll..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/30 outline-none"
                    />
                </div>

                {/* Students Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-slate-100 animate-pulse shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    ) : filteredStudents.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-white rounded-[32px] border border-slate-100 border-dashed">
                            <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No students found</h3>
                            <p className="text-slate-500 text-sm">
                                {searchQuery ? 'Try adjusting your search query.' : 'There are no students assigned to your classes yet.'}
                            </p>
                        </div>
                    ) : (
                        filteredStudents.map((student, idx) => (
                            <div 
                                key={student._id || idx} 
                                className="bg-[#faf9f6] rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-[0_8px_20px_rgba(120,113,108,0.06)] border border-stone-200/60 border-b-[4px] border-b-stone-300/60 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(120,113,108,0.1)] hover:border-b-stone-400/50 transition-all flex items-center gap-4 cursor-pointer group"
                            >
                                <div className="relative shrink-0">
                                    {student.profileImageUrl ? (
                                        <img src={student.profileImageUrl} alt="Student" className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover shadow-sm border border-white" />
                                    ) : (
                                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center text-xl font-black shadow-inner">
                                            {(student.firstName?.charAt(0) || 'S').toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[15px] sm:text-lg font-black text-slate-900 truncate tracking-tight mb-0.5 group-hover:text-blue-600 transition-colors">
                                        {student.firstName} {student.lastName}
                                    </h3>
                                    
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-100/50 text-blue-700 border border-blue-200/50">
                                            {student.className} {student.sectionName}
                                        </span>
                                        {student.rollNumber && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-stone-600 border border-stone-200/60">
                                                Roll {student.rollNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="shrink-0 h-8 w-8 rounded-full bg-white border border-stone-200/80 flex items-center justify-center text-stone-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Students;
