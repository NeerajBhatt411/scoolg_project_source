import React from 'react';

// Premium styled select: hides the native arrow and adds a themed chevron.
const Select = ({ value, onChange, children, className = '', disabled = false }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`appearance-none w-full h-12 pl-4 pr-11 rounded-2xl bg-surface-container-low border border-surface-container text-on-surface font-bold text-body-md outline-none focus:ring-2 focus:ring-primary focus:bg-white hover:border-primary/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </select>
    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
      expand_more
    </span>
  </div>
);

export default Select;
