import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Consistent top-bar profile icon used across all admin pages. Shows the school
// LOGO if one is set (cached in localStorage by the sidebar), else the school's
// initial. Opens the profile page on click.
export default function ProfileButton({ size = 40 }) {
    const navigate = useNavigate();
    const name = localStorage.getItem('scoolg_school_name') || 'S';
    const logo = localStorage.getItem('scoolg_school_logo') || '';
    const [ok, setOk] = useState(!!logo);
    const showLogo = logo && ok;
    return (
        <button
            onClick={() => navigate('/profile')}
            title="View profile"
            className={`rounded-full flex items-center justify-center shadow-sm ring-2 ring-white hover:ring-blue-100 active:scale-95 transition-all shrink-0 overflow-hidden ${showLogo ? 'bg-white' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black'}`}
            style={{ height: size, width: size }}
        >
            {showLogo
                ? <img src={logo} alt="School" onError={() => setOk(false)} className="w-full h-full object-cover" />
                : name.charAt(0).toUpperCase()}
        </button>
    );
}
