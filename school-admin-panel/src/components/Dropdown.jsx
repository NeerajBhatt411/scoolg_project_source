import React, { useState, useRef, useEffect } from 'react';

// Reusable custom dropdown that replaces the native <select> look with a
// consistent, premium panel that always opens BELOW the trigger.
//
// Props:
//   value      - current selected value
//   onChange   - (value) => void
//   options    - array of strings OR { value, label } objects
//   placeholder- text shown when nothing matches value
//   icon       - optional Material Symbols name shown on the left
//   disabled   - bool
//   className  - applied to the wrapper (use for width, e.g. "w-full sm:w-48")
//   buttonClassName - extra classes for the trigger (e.g. bg/height overrides)
const Dropdown = ({
    value,
    onChange,
    options = [],
    placeholder = 'Select',
    icon,
    disabled = false,
    className = '',
    buttonClassName = 'h-11',
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const norm = options.map(o => (o && typeof o === 'object' ? o : { value: o, label: String(o) }));
    const selected = norm.find(o => String(o.value) === String(value));

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(o => !o)}
                className={`w-full rounded-xl border border-slate-200 bg-white font-bold text-slate-700 text-sm text-left flex items-center outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${icon ? 'pl-10' : 'pl-4'} pr-9 ${buttonClassName}`}
            >
                {icon && <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">{icon}</span>}
                <span className={`truncate ${selected ? '' : 'text-slate-400'}`}>{selected ? selected.label : placeholder}</span>
                <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {open && (
                <div className="absolute z-30 top-full mt-1.5 left-0 w-full min-w-[140px] bg-white border border-slate-200 rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto">
                    {norm.length === 0 && <div className="px-4 py-2 text-xs font-bold text-slate-300">No options</div>}
                    {norm.map(o => (
                        <button
                            key={String(o.value)}
                            type="button"
                            onClick={() => { onChange(o.value); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${String(o.value) === String(value) ? 'bg-blue-50 text-[#2563eb]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
