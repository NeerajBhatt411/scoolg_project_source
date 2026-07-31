import React, { useState, useEffect, useMemo, useRef } from 'react';
import ProfileButton from '../components/ProfileButton';
import MenuButton from '../components/MenuButton';
import Dropdown from '../components/Dropdown';
import { useAdmin } from '../context/AdminContext';
import IdCardFace, { ID_CARD_TEMPLATES } from '../components/IdCardFace';

// ID Card generator: pick a design (portrait / landscape), choose how many cards
// per A4 sheet, select which students, then print. Mirrors the print-CSS approach
// used by FeeReceiptPrint — the app chrome is hidden and only the sheets print.

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

// Darken/lighten a hex colour by `amt` (negative darkens) — used to derive the
// second gradient shade from the school's chosen accent colour.
const shade = (hex, amt) => {
    let c = String(hex).replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16);
    const clamp = (v) => Math.max(0, Math.min(255, v));
    const r = clamp((n >> 16) + amt), g = clamp(((n >> 8) & 0xff) + amt), b = clamp((n & 0xff) + amt);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Preset accent swatches for quick picking.
const ACCENT_PRESETS = ['#2563eb', '#059669', '#4f46e5', '#e11d48', '#d97706', '#0d9488', '#0f172a', '#7c3aed', '#b91c1c', '#0891b2'];

const IdCards = () => {
    const { students, loadingStudents, refreshStudents } = useAdmin();

    const schoolName = localStorage.getItem('scoolg_school_name') || 'My School';
    const schoolLogo = localStorage.getItem('scoolg_school_logo') || '';

    const [classFilter, setClassFilter] = useState('All');
    const [sectionFilter, setSectionFilter] = useState('All');
    const [templateId, setTemplateId] = useState(ID_CARD_TEMPLATES[0].id);
    const [perPage, setPerPage] = useState(8);
    // Set of student _ids that are EXCLUDED from printing (default: everyone in).
    const [excluded, setExcluded] = useState(() => new Set());

    // Principal signature (data-URL) + name — printed in the signatory slot on every
    // card. Remembered in localStorage so the admin uploads it once.
    const [signature, setSignature] = useState(() => localStorage.getItem('scoolg_idcard_signature') || '');
    const [principalName, setPrincipalName] = useState(() => localStorage.getItem('scoolg_idcard_principal') || '');

    // Academic session (e.g. "2025-2026") printed on every card. Defaults to the
    // current school year (sessions roll over in April in India).
    const defaultSession = (() => {
        const d = new Date();
        const y = d.getFullYear();
        return d.getMonth() >= 3 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
    })();
    const [session, setSession] = useState(() => localStorage.getItem('scoolg_idcard_session') || defaultSession);

    // Custom accent colour. Empty string => use each design's own colours.
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('scoolg_idcard_accent') || '');

    const school = { name: schoolName, logo: schoolLogo, signature, principalName, session };

    const onSession = (v) => { setSession(v); localStorage.setItem('scoolg_idcard_session', v); };
    const onAccent = (v) => { setAccentColor(v); localStorage.setItem('scoolg_idcard_accent', v); };
    const resetAccent = () => { setAccentColor(''); localStorage.removeItem('scoolg_idcard_accent'); };

    const onSignatureFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1024 * 1024) { alert('Please upload a signature image under 1 MB.'); return; }
        const reader = new FileReader();
        reader.onload = () => {
            setSignature(reader.result);
            try { localStorage.setItem('scoolg_idcard_signature', reader.result); } catch { /* quota */ }
        };
        reader.readAsDataURL(file);
    };
    const removeSignature = () => { setSignature(''); localStorage.removeItem('scoolg_idcard_signature'); };
    const onPrincipalName = (v) => { setPrincipalName(v); localStorage.setItem('scoolg_idcard_principal', v); };

    useEffect(() => { refreshStudents(); }, []);

    const template = ID_CARD_TEMPLATES.find(t => t.id === templateId) || ID_CARD_TEMPLATES[0];
    // Only recolour once the typed/picked value is a complete hex colour, so a
    // half-typed "#25" never breaks the shade() maths.
    const validAccent = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(accentColor);
    // The template actually printed: same layout, but recoloured if the school picked
    // a custom accent (c2 becomes a darker shade for the gradient designs).
    const effectiveTemplate = validAccent
        ? { ...template, c1: accentColor, c2: shade(accentColor, -34), accent: accentColor }
        : template;

    const classNames = [...new Set(students.map(s => s.class).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    const uniqueClasses = ['All', ...classNames];
    const uniqueSections = ['All', ...new Set(students.map(s => s.section).filter(Boolean))];

    // Default to the first class so the list isn't empty on load.
    const didDefault = useRef(false);
    useEffect(() => {
        if (!didDefault.current && classNames.length) {
            setClassFilter(classNames[0]);
            didDefault.current = true;
        }
    }, [classNames.length]);

    const filteredStudents = useMemo(() => students.filter(s => {
        if (classFilter !== 'All' && s.class !== classFilter) return false;
        if (sectionFilter !== 'All' && s.section !== sectionFilter) return false;
        return true;
    }).sort((a, b) => (parseInt(a.rollNumber, 10) || 0) - (parseInt(b.rollNumber, 10) || 0)),
        [students, classFilter, sectionFilter]);

    const selectedStudents = filteredStudents.filter(s => !excluded.has(s._id));

    const toggleStudent = (id) => setExcluded(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    const selectAll = () => setExcluded(new Set());
    const clearAll = () => setExcluded(new Set(filteredStudents.map(s => s._id)));

    // Chunk selected students into pages of `perPage`.
    const pages = useMemo(() => {
        const out = [];
        for (let i = 0; i < selectedStudents.length; i += perPage) {
            out.push(selectedStudents.slice(i, i + perPage));
        }
        return out;
    }, [selectedStudents, perPage]);

    // Columns on the A4 sheet: portrait cards are narrow (fit 3), landscape wide (fit 2).
    const columns = template.orientation === 'portrait' ? 3 : 2;

    const perPageOptions = template.orientation === 'portrait'
        ? [1, 2, 3, 6, 9]
        : [1, 2, 4, 6, 8];

    // Keep perPage valid when switching between portrait/landscape.
    useEffect(() => {
        if (!perPageOptions.includes(perPage)) setPerPage(perPageOptions[perPageOptions.length - 1]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateId]);

    const handlePrint = () => window.print();

    return (
        <>
            {/* Top bar */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0 print:hidden">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <MenuButton />
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">ID Cards</h2>
                </div>
                <div className="flex items-center gap-4">
                    <ProfileButton size={40} />
                </div>
            </header>

            <div className="p-4 sm:p-8 space-y-6 print:hidden">
                {/* Filters */}
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Class</label>
                        <Dropdown value={classFilter} onChange={setClassFilter}
                            options={uniqueClasses.map(c => ({ value: c, label: c === 'All' ? 'All Classes' : c }))}
                            className="w-full" buttonClassName="h-11" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Section</label>
                        <Dropdown value={sectionFilter} onChange={setSectionFilter}
                            options={uniqueSections.map(s => ({ value: s, label: s === 'All' ? 'All Sections' : s }))}
                            className="w-full" buttonClassName="h-11" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Cards / Page</label>
                        <Dropdown value={String(perPage)} onChange={(v) => setPerPage(Number(v))}
                            options={perPageOptions.map(n => ({ value: String(n), label: `${n} per page` }))}
                            className="w-full" buttonClassName="h-11" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={handlePrint} disabled={!selectedStudents.length}
                            className="w-full h-11 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            Print {selectedStudents.length ? `(${selectedStudents.length})` : ''}
                        </button>
                    </div>
                </div>

                {/* Design gallery */}
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">style</span>
                        <h3 className="text-base font-black text-on-surface">Choose a Design</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {ID_CARD_TEMPLATES.map(t => {
                            const active = t.id === templateId;
                            const sampleStudent = filteredStudents[0] || {
                                firstName: 'Student', lastName: 'Name', class: '10', section: 'A',
                                rollNumber: '01', studentAppId: 'STU-0001',
                            };
                            return (
                                <button key={t.id} onClick={() => setTemplateId(t.id)}
                                    className={`group relative rounded-2xl border-2 p-3 transition-all text-left ${active ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                    <div className="flex items-center justify-center h-[160px] overflow-hidden rounded-xl bg-slate-50">
                                        {/* Scaled thumbnail preview of the design */}
                                        <div className="origin-center" style={{ transform: t.orientation === 'portrait' ? 'scale(0.4)' : 'scale(0.42)' }}>
                                            <IdCardFace template={t} student={sampleStudent} school={school} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div>
                                            <p className="text-sm font-black text-on-surface leading-tight">{t.name}</p>
                                            <p className="text-[11px] font-bold text-on-surface-variant capitalize">{t.orientation}</p>
                                        </div>
                                        {active && <span className="material-symbols-outlined text-primary">check_circle</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Card settings: academic session + principal signature */}
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">tune</span>
                        <h3 className="text-base font-black text-on-surface">Card Settings</h3>
                    </div>

                    {/* Academic Session */}
                    <div className="space-y-1 mb-6 max-w-xs">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Academic Session</label>
                        <input
                            value={session}
                            onChange={(e) => onSession(e.target.value)}
                            placeholder="2025-2026"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
                        />
                        <p className="text-[11px] font-semibold text-slate-400 ml-1">Printed at the top of every card.</p>
                    </div>

                    {/* Accent colour */}
                    <div className="border-t border-slate-100 pt-4 mb-6">
                        <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Card Colour</label>
                        <p className="text-[11px] font-semibold text-slate-400 ml-1 mb-3">Pick your school colour — it recolours the header, borders &amp; accents on the selected design.</p>
                        <div className="flex items-center flex-wrap gap-2">
                            {ACCENT_PRESETS.map(c => (
                                <button key={c} onClick={() => onAccent(c)} title={c}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${accentColor.toLowerCase() === c.toLowerCase() ? 'border-slate-900 scale-110' : 'border-white shadow'}`}
                                    style={{ background: c }} />
                            ))}
                            <span className="w-px h-8 bg-slate-200 mx-1" />
                            {/* A normally-sized colour box so the OS palette opens right next to it */}
                            <input type="color" value={validAccent ? accentColor : '#2563eb'} onChange={(e) => onAccent(e.target.value)}
                                title="Custom colour" className="w-9 h-9 rounded-lg border border-slate-200 bg-white cursor-pointer p-0.5 shrink-0" />
                            {/* Type a hex code directly */}
                            <input type="text" value={accentColor} onChange={(e) => onAccent(e.target.value)} placeholder="#2563EB" maxLength={7}
                                className="w-24 h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-primary/40" />
                            <button onClick={resetAccent}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${accentColor ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-primary/10 text-primary'}`}>
                                {accentColor ? "Design's own colours" : 'Design default'}
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mb-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">draw</span>
                        <h4 className="text-sm font-black text-on-surface">Principal Signature</h4>
                    </div>
                    <p className="text-xs font-semibold text-on-surface-variant mb-4">
                        Upload the signature once — it prints in the signatory box on every card. Leave empty for a blank sign line.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-40 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-white grid place-items-center overflow-hidden shrink-0">
                            {signature
                                ? <img src={signature} alt="signature" className="max-h-full max-w-full object-contain" />
                                : <span className="text-[11px] font-bold text-slate-300">No signature</span>}
                        </div>
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-on-surface-variant ml-1">Signatory Name / Designation</label>
                                <input
                                    value={principalName}
                                    onChange={(e) => onPrincipalName(e.target.value)}
                                    placeholder="Principal"
                                    className="w-full sm:w-72 h-11 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/40 text-sm font-semibold"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[18px]">upload</span>
                                    {signature ? 'Change Signature' : 'Upload Signature'}
                                    <input type="file" accept="image/*" onChange={onSignatureFile} className="hidden" />
                                </label>
                                {signature && (
                                    <button onClick={removeSignature} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        Remove
                                    </button>
                                )}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-400">Tip: a PNG with a transparent background looks cleanest.</p>
                        </div>
                    </div>
                </div>

                {/* Student picker */}
                <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl premium-shadow">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">badge</span>
                            <h3 className="text-base font-black text-on-surface">
                                {selectedStudents.length} of {filteredStudents.length} selected
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={selectAll} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Select All</button>
                            <button onClick={clearAll} className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Clear</button>
                        </div>
                    </div>

                    {loadingStudents && students.length === 0 ? (
                        <p className="text-center py-8 font-bold text-slate-400">Loading students…</p>
                    ) : filteredStudents.length === 0 ? (
                        <p className="text-center py-8 font-bold text-slate-400">No students in this class/section</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {filteredStudents.map(s => {
                                const on = !excluded.has(s._id);
                                return (
                                    <button key={s._id} onClick={() => toggleStudent(s._id)}
                                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${on ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-white opacity-60'}`}>
                                        <div className={`w-5 h-5 rounded-md grid place-items-center shrink-0 ${on ? 'bg-primary text-white' : 'bg-slate-200 text-transparent'}`}>
                                            <span className="material-symbols-outlined text-[15px]">check</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 grid place-items-center font-bold text-slate-500 text-xs">
                                            {s.profileImageUrl ? <img src={s.profileImageUrl} alt="" className="w-full h-full object-cover" /> : (s.firstName?.charAt(0) || '?')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-on-surface truncate">{s.firstName} {s.lastName}</p>
                                            <p className="text-[11px] font-semibold text-on-surface-variant truncate">Roll {s.rollNumber || 'NA'} · {s.class}-{s.section}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Live preview note */}
                <p className="text-center text-xs font-semibold text-on-surface-variant">
                    Preview below shows how the sheets will print · {pages.length} page{pages.length !== 1 ? 's' : ''}
                </p>

                {/* On-screen preview (scaled A4 sheets) */}
                <div className="flex flex-col items-center gap-6">
                    {pages.map((pageStudents, pi) => (
                        <div key={pi} className="bg-white shadow-xl rounded-lg overflow-hidden origin-top" style={{ transform: 'scale(0.85)' }}>
                            <div className="a4-sheet-preview" style={{ width: '210mm', minHeight: '297mm', padding: '10mm', boxSizing: 'border-box' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '6mm', justifyItems: 'center' }}>
                                    {pageStudents.map(s => (
                                        <IdCardFace key={s._id} template={effectiveTemplate} student={s} school={school} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PRINT AREA — hidden on screen, shown only when printing */}
            <div id="idcard-print-root" className="hidden print:block">
                {pages.map((pageStudents, pi) => (
                    <div key={pi} className="card-sheet" style={{ padding: '10mm', boxSizing: 'border-box' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '6mm', justifyItems: 'center' }}>
                            {pageStudents.map(s => (
                                <IdCardFace key={s._id} template={template} student={s} school={school} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Print CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    header, aside { display: none !important; }
                    html, body, #root, .min-h-screen, main {
                        height: auto !important; min-height: 0 !important;
                        margin: 0 !important; padding: 0 !important;
                        background: #fff !important; overflow: visible !important;
                    }
                    #idcard-print-root { display: block !important; }
                    .card-sheet {
                        width: 100% !important;
                        break-after: page;
                        page-break-after: always;
                    }
                    .card-sheet:last-child { break-after: auto; page-break-after: auto; }
                    .idcard { break-inside: avoid; page-break-inside: avoid; }
                    @page { size: A4 portrait; margin: 0; }
                    /* Force browsers to print background colors of the cards */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}} />

            <div className="h-12 print:hidden" />
        </>
    );
};

export default IdCards;
