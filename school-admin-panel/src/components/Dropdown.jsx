import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

// Custom select (shadcn-Select style): consistent trigger, portal-rendered
// menu (never clipped by modals/overflow containers), check mark on the
// selected option, flips upward when there's no room below.
//
// Props:
//   value      - current selected value
//   onChange   - (value) => void
//   options    - array of strings OR { value, label } objects
//   placeholder- text shown when nothing matches value
//   icon       - optional Material Symbols name shown on the left
//   disabled   - bool
//   className  - wrapper classes (width lives here, e.g. "w-full sm:w-48")
//   buttonClassName - extra trigger classes (height/background overrides)
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
    const [pos, setPos] = useState(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const norm = options.map(o => (o && typeof o === 'object' ? o : { value: o, label: String(o) }));
    const selected = norm.find(o => String(o.value) === String(value));

    const place = () => {
        const el = triggerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const estH = Math.min(240, norm.length * 40 + 10);
        const openUp = window.innerHeight - r.bottom < estH + 12 && r.top > estH + 12;
        setPos({ top: r.bottom + 6, bottomUp: window.innerHeight - r.top + 6, left: r.left, width: r.width, openUp });
    };

    useLayoutEffect(() => { if (open) place(); /* eslint-disable-next-line */ }, [open]);

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
            setOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        const onMove = () => place();
        document.addEventListener('mousedown', onDown);
        document.addEventListener('touchstart', onDown);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', onMove);
        window.addEventListener('scroll', onMove, true);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('touchstart', onDown);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', onMove);
            window.removeEventListener('scroll', onMove, true);
        };
        // eslint-disable-next-line
    }, [open]);

    return (
        <div className={`relative ${className}`}>
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen(o => !o)}
                className={`w-full rounded-xl border border-slate-200 bg-white font-bold text-slate-700 text-sm text-left flex items-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${icon ? 'pl-10' : 'pl-4'} pr-9 ${buttonClassName}`}
            >
                {icon && <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">{icon}</span>}
                <span className={`truncate ${selected ? '' : 'text-slate-400'}`}>{selected ? selected.label : placeholder}</span>
                <span className={`material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {open && pos && createPortal(
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        left: pos.left,
                        width: Math.max(pos.width, 150),
                        zIndex: 9999,
                        ...(pos.openUp ? { bottom: pos.bottomUp } : { top: pos.top }),
                    }}
                    className={`bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 py-1 max-h-60 overflow-y-auto ${pos.openUp ? 'dd-anim-up' : 'dd-anim'}`}
                >
                    {norm.length === 0 && <div className="px-4 py-2.5 text-xs font-bold text-slate-300">No options</div>}
                    {norm.map(o => {
                        const isSel = String(o.value) === String(value);
                        return (
                            <button
                                key={String(o.value)}
                                type="button"
                                onClick={() => { onChange(o.value); setOpen(false); }}
                                className={`w-full text-left pl-4 pr-9 py-2.5 text-sm font-bold relative transition-colors ${isSel ? 'bg-blue-50 text-[#2563eb]' : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'}`}
                            >
                                <span className="block truncate">{o.label}</span>
                                {isSel && <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px]">check</span>}
                            </button>
                        );
                    })}
                </div>,
                document.body
            )}
        </div>
    );
};

export default Dropdown;
