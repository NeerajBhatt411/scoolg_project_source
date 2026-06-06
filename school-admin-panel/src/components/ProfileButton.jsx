import React from 'react';
import { useNavigate } from 'react-router-dom';

// Consistent top-bar profile icon used across all admin pages.
// Shows the school's initial and opens the profile page on click.
export default function ProfileButton({ size = 40 }) {
    const navigate = useNavigate();
    const name = localStorage.getItem('scoolg_school_name') || 'S';
    return (
        <button
            onClick={() => navigate('/profile')}
            title="View profile"
            className="rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center shadow-sm ring-2 ring-white hover:ring-blue-100 active:scale-95 transition-all shrink-0"
            style={{ height: size, width: size }}
        >
            {name.charAt(0).toUpperCase()}
        </button>
    );
}
