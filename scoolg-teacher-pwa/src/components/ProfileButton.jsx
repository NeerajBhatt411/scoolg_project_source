import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileButton({ size = 40 }) {
    const navigate = useNavigate();
    const { teacher } = useAuth();
    
    return (
        <button
            onClick={() => navigate('/profile')}
            title="View profile"
            className="rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center shadow-sm ring-2 ring-white hover:ring-blue-100 active:scale-95 transition-all shrink-0 overflow-hidden"
            style={{ height: size, width: size }}
        >
            {teacher?.profileImageUrl ? (
                <img src={teacher.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
                (teacher?.fullName || 'T').charAt(0).toUpperCase()
            )}
        </button>
    );
}
