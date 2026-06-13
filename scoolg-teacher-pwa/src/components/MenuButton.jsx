import React from 'react';
import { useAuth } from '../context/AuthContext';

const MenuButton = ({ className = '' }) => {
    const { setMobileNavOpen } = useAuth();
    return (
        <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className={`md:hidden shrink-0 -ml-1 w-9 h-9 grid place-items-center rounded-lg text-slate-700 active:scale-90 active:bg-slate-100 transition-all ${className}`}
        >
            <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
    );
};

export default MenuButton;
