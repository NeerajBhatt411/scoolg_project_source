import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileButton({ size = 40 }) {
    const navigate = useNavigate();
    const { teacher } = useAuth();
    const name = teacher?.fullName || 'Teacher';
    const colors = ['from-blue-500 to-cyan-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500', 'from-indigo-500 to-purple-500'];
    const bgGradient = colors[name.length % colors.length];

    return (
        <button
            onClick={() => navigate('/profile')}
            title="View profile"
            className={`rounded-full bg-gradient-to-br ${bgGradient} text-white font-black flex items-center justify-center shadow-sm ring-2 ring-white hover:ring-slate-200 active:scale-95 transition-all shrink-0 overflow-hidden`}
            style={{ height: size, width: size }}
        >
            {teacher?.profileImageUrl ? (
                <img src={teacher.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`} alt="avatar" className="w-[85%] h-[85%] object-contain drop-shadow-md translate-y-1" />
            )}
        </button>
    );
}
