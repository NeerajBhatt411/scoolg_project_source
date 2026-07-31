import React from 'react';

// Student ID cards, rendered at exact physical size (mm) so print is true-to-scale.
// 20 designs built from 10 distinct layouts (5 portrait + 5 landscape), each in two
// colour themes. Every card is self-contained inline styles so colours print right.
//
// `school` carries: { name, logo, signature, principalName, session }.

const FONT = 'system-ui, Segoe UI, Roboto, sans-serif';
const PW = 57, PH = 90;   // portrait card  (mm)
const LW = 90, LH = 57;   // landscape card (mm)
const MM = (mm) => `${mm}mm`;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const initials = (s) => `${(s.firstName || '?').charAt(0)}${(s.lastName || '').charAt(0)}`.toUpperCase();
const fullName = (s) => `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student Name';
const sessionLine = (school) => (school.session ? `SESSION ${school.session}` : 'STUDENT IDENTITY CARD');

// School name stays on ONE line and never crops: the font shrinks as the name gets
// longer so even long school names fit the header width.
const schoolFont = (name, base) => {
    const len = (name || '').length;
    if (len <= 15) return base;
    if (len <= 20) return base - 1;
    if (len <= 26) return base - 2;
    if (len <= 32) return base - 3;
    if (len <= 40) return base - 4;
    return base - 5;
};
const SchoolName = ({ school, size, color, center, style }) => (
    <div style={{ fontSize: schoolFont(school.name, size), fontWeight: 900, color, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip', lineHeight: 1.05, textAlign: center ? 'center' : undefined, maxWidth: '100%', ...style }}>
        {school.name}
    </div>
);

// ---- shared pieces ---------------------------------------------------------

const Logo = ({ school, size = 26, bg = 'rgba(255,255,255,0.2)', textColor = '#fff', ring = 'rgba(255,255,255,0.85)' }) =>
    school.logo ? (
        <img src={school.logo} alt="" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 6, background: '#fff', padding: 1 }} />
    ) : (
        <div style={{ width: size, height: size, borderRadius: 6, background: bg, color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: size * 0.5, border: `1px solid ${ring}` }}>
            {(school.name || 'S').charAt(0).toUpperCase()}
        </div>
    );

const Photo = ({ student, size, radius = 8, border = '2px solid #fff' }) => (
    <div style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', background: '#e2e8f0', border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {student.profileImageUrl
            ? <img src={student.profileImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontWeight: 900, fontSize: size * 0.32, color: '#94a3b8' }}>{initials(student)}</span>}
    </div>
);

const Row = ({ label, value, color = '#334155', labelColor = '#94a3b8' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, fontSize: 8.5, lineHeight: 1.35 }}>
        <span style={{ color: labelColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ color, fontWeight: 800, textAlign: 'right', maxWidth: '64%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</span>
    </div>
);

const AddrRow = ({ value, color = '#334155', labelColor = '#94a3b8' }) => (
    <div style={{ fontSize: 8, lineHeight: 1.25 }}>
        <span style={{ color: labelColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.3 }}>Address</span>
        <div style={{ color, fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{value || '—'}</div>
    </div>
);

const InfoRows = ({ student, color, labelColor }) => (
    <>
        <Row label="Father" value={student.fatherName} color={color} labelColor={labelColor} />
        <Row label="DOB" value={fmtDate(student.dateOfBirth)} color={color} labelColor={labelColor} />
        <Row label="Phone" value={student.primaryContact} color={color} labelColor={labelColor} />
        <AddrRow value={student.currentAddress} color={color} labelColor={labelColor} />
    </>
);

// Principal signature — right aligned. Signature image on top, name below, no line.
const Signatory = ({ school, labelColor = '#64748b', sigHeight = 28, width = 88 }) => (
    <div style={{ width, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {school.signature
            ? <img src={school.signature} alt="signature" style={{ height: sigHeight, maxWidth: width, objectFit: 'contain' }} />
            : <div style={{ height: sigHeight }} />}
        <div style={{ fontSize: 7.5, fontWeight: 800, color: labelColor, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2, textAlign: 'right' }}>
            {school.principalName || 'Principal'}
        </div>
    </div>
);

const shell = (w, h, extra = {}) => ({ width: MM(w), height: MM(h), background: '#fff', overflow: 'hidden', border: '1px solid #e2e8f0', fontFamily: FONT, boxSizing: 'border-box', ...extra });

// ============================ PORTRAIT LAYOUTS =============================

// 1. Solid header band, centred photo, rows, signatory.
const PBand = ({ student, school, c1 }) => (
    <div className="idcard" style={shell(PW, PH, { borderRadius: 10, display: 'flex', flexDirection: 'column' })}>
        <div style={{ background: c1, color: '#fff', padding: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Logo school={school} size={28} />
            <div style={{ minWidth: 0 }}>
                <SchoolName school={school} size={11} />
                <div style={{ fontSize: 7, fontWeight: 700, opacity: 0.9, letterSpacing: 0.5 }}>{sessionLine(school)}</div>
            </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 8px 5px' }}>
            <Photo student={student} size={84} radius={10} border={`3px solid ${c1}`} />
            <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a', marginTop: 6, textAlign: 'center', lineHeight: 1.1 }}>{fullName(student)}</div>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: c1, marginTop: 1 }}>Class {student.class}-{student.section} · Roll {student.rollNumber || '—'}</div>
        </div>
        <div style={{ padding: '3px 12px 10px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            <InfoRows student={student} />
            <div style={{ marginTop: 'auto', paddingTop: 6, display: 'flex', justifyContent: 'flex-end' }}><Signatory school={school} /></div>
        </div>
    </div>
);

// 2. Gradient curved top, round overlapping photo, class pill.
const PCurve = ({ student, school, c1, c2 }) => (
    <div className="idcard" style={shell(PW, PH, { borderRadius: 14, position: 'relative' })}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '42%', background: `linear-gradient(135deg, ${c1}, ${c2})`, borderBottomLeftRadius: '50% 22%', borderBottomRightRadius: '50% 22%' }} />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, alignSelf: 'stretch', padding: '7px 9px', color: '#fff' }}>
                <Logo school={school} size={22} />
                <div style={{ minWidth: 0 }}>
                    <SchoolName school={school} size={10} />
                    <div style={{ fontSize: 6.5, fontWeight: 700, opacity: 0.9, letterSpacing: 0.5 }}>{sessionLine(school)}</div>
                </div>
            </div>
            <Photo student={student} size={72} radius={999} border="3px solid #fff" />
            <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a', marginTop: 5, textAlign: 'center', lineHeight: 1.1, padding: '0 6px' }}>{fullName(student)}</div>
            <div style={{ fontSize: 7.5, fontWeight: 900, color: '#fff', background: c1, borderRadius: 20, padding: '2px 12px', marginTop: 4 }}>
                Class {student.class}-{student.section} · Roll {student.rollNumber || '—'}
            </div>
            <div style={{ alignSelf: 'stretch', padding: '8px 13px 8px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                <InfoRows student={student} />
                <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', justifyContent: 'flex-end' }}><Signatory school={school} labelColor={c1} /></div>
            </div>
        </div>
    </div>
);

// 3. Top third filled, white rounded photo overlap, coloured session strip bottom.
const PTopFill = ({ student, school, c1, c2 }) => (
    <div className="idcard" style={shell(PW, PH, { borderRadius: 10, display: 'flex', flexDirection: 'column' })}>
        <div style={{ background: `linear-gradient(160deg, ${c1}, ${c2})`, padding: '9px 10px 26px', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Logo school={school} size={24} />
            <SchoolName school={school} size={11.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -22 }}>
            <Photo student={student} size={80} radius={12} border="3px solid #fff" />
            <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a', marginTop: 5, textAlign: 'center', lineHeight: 1.1 }}>{fullName(student)}</div>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: c1 }}>Class {student.class}-{student.section} · Roll {student.rollNumber || '—'}</div>
        </div>
        <div style={{ padding: '6px 13px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            <InfoRows student={student} />
            <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', justifyContent: 'flex-end' }}><Signatory school={school} labelColor={c1} /></div>
        </div>
        <div style={{ background: c1, color: '#fff', fontSize: 7, fontWeight: 800, textAlign: 'center', padding: '4px', letterSpacing: 1, textTransform: 'uppercase' }}>{sessionLine(school)}</div>
    </div>
);

// 4. Bordered formal, centred logo + name header, photo, rows.
const PFormal = ({ student, school, c1 }) => (
    <div className="idcard" style={shell(PW, PH, { borderRadius: 6, border: `2px solid ${c1}`, padding: 5, display: 'flex', flexDirection: 'column' })}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: `2px solid ${c1}`, paddingBottom: 5 }}>
            <Logo school={school} size={30} bg={c1} ring={c1} />
            <SchoolName school={school} size={12} color={c1} center style={{ marginTop: 3 }} />
            <div style={{ fontSize: 7, fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>{sessionLine(school)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 5px' }}>
            <Photo student={student} size={82} radius={6} border={`2px solid ${c1}`} />
            <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a', marginTop: 5, textAlign: 'center', lineHeight: 1.1 }}>{fullName(student)}</div>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: c1 }}>Class {student.class}-{student.section} · Roll {student.rollNumber || '—'}</div>
        </div>
        <div style={{ padding: '2px 6px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            <InfoRows student={student} />
            <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', justifyContent: 'flex-end' }}><Signatory school={school} labelColor={c1} /></div>
        </div>
    </div>
);

// 5. Left vertical stripe, photo top, compact.
const PStripe = ({ student, school, c1, c2 }) => (
    <div className="idcard" style={shell(PW, PH, { borderRadius: 10, display: 'flex' })}>
        <div style={{ width: 12, background: `linear-gradient(${c1}, ${c2})`, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '9px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Logo school={school} size={26} bg={c1} ring={c1} />
                <div style={{ minWidth: 0 }}>
                    <SchoolName school={school} size={11} color={c1} />
                    <div style={{ fontSize: 6.5, fontWeight: 700, color: '#94a3b8', letterSpacing: 0.8 }}>{sessionLine(school)}</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '9px 0 4px' }}>
                <Photo student={student} size={78} radius={10} border={`3px solid ${c1}`} />
                <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a', marginTop: 5, textAlign: 'center', lineHeight: 1.1 }}>{fullName(student)}</div>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: c1 }}>Class {student.class}-{student.section} · Roll {student.rollNumber || '—'}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                <InfoRows student={student} />
                <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', justifyContent: 'flex-end' }}><Signatory school={school} labelColor={c1} /></div>
            </div>
        </div>
    </div>
);

// ============================ LANDSCAPE LAYOUTS ===========================

// 6. Left colour panel (logo, photo, roll), right white info.
const LPanelLeft = ({ student, school, c1, c2 }) => (
    <div className="idcard" style={shell(LW, LH, { borderRadius: 10, display: 'flex' })}>
        <div style={{ width: '33%', background: `linear-gradient(160deg, ${c1}, ${c2})`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7px', gap: 5 }}>
            <Logo school={school} size={22} />
            <Photo student={student} size={62} radius={8} border="2px solid rgba(255,255,255,0.7)" />
            <div style={{ fontSize: 8, fontWeight: 900, background: 'rgba(255,255,255,0.18)', borderRadius: 6, padding: '2px 9px' }}>Roll {student.rollNumber || '—'}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 11px' }}>
            <SchoolName school={school} size={11.5} color={c1} />
            <div style={{ fontSize: 7, fontWeight: 800, color: '#94a3b8', letterSpacing: 1, marginBottom: 3 }}>{sessionLine(school)}</div>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{fullName(student)}</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#475569', marginBottom: 3 }}>Class {student.class}-{student.section}</div>
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}><InfoRows student={student} /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}><Signatory school={school} width={72} sigHeight={22} /></div>
            </div>
        </div>
    </div>
);

// 7. Top gradient bar, photo left, rows right.
const LTopBar = ({ student, school, c1, c2 }) => (
    <div className="idcard" style={shell(LW, LH, { borderRadius: 10, display: 'flex', flexDirection: 'column' })}>
        <div style={{ background: `linear-gradient(90deg, ${c1}, ${c2})`, color: '#fff', padding: '5px 11px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Logo school={school} size={22} />
            <div style={{ minWidth: 0 }}>
                <SchoolName school={school} size={12} />
                <div style={{ fontSize: 6.5, fontWeight: 700, opacity: 0.9, letterSpacing: 1 }}>{sessionLine(school)}</div>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 9, padding: '8px 11px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Photo student={student} size={58} radius={8} border={`2px solid ${c1}`} />
                <div style={{ fontSize: 7, fontWeight: 900, color: '#fff', background: c1, borderRadius: 5, padding: '1px 8px' }}>Roll {student.rollNumber || '—'}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{fullName(student)}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: c1, marginBottom: 2 }}>Class {student.class}-{student.section}</div>
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}><InfoRows student={student} color="#334155" /></div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}><Signatory school={school} width={70} sigHeight={22} labelColor={c1} /></div>
                </div>
            </div>
        </div>
    </div>
);

// 8. Right colour panel with photo, left white info.
const LPanelRight = ({ student, school, c1, c2 }) => (
    <div className="idcard" style={shell(LW, LH, { borderRadius: 10, display: 'flex' })}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 11px' }}>
            <SchoolName school={school} size={11.5} color={c1} />
            <div style={{ fontSize: 7, fontWeight: 800, color: '#94a3b8', letterSpacing: 1, marginBottom: 3 }}>{sessionLine(school)}</div>
            <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{fullName(student)}</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#475569', marginBottom: 3 }}>Class {student.class}-{student.section}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}><InfoRows student={student} /></div>
            <div style={{ paddingTop: 2, display: 'flex', justifyContent: 'flex-end' }}><Signatory school={school} width={72} sigHeight={20} labelColor={c1} /></div>
        </div>
        <div style={{ width: '32%', background: `linear-gradient(200deg, ${c1}, ${c2})`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7px', gap: 5 }}>
            <Logo school={school} size={20} />
            <Photo student={student} size={60} radius={8} border="2px solid rgba(255,255,255,0.7)" />
            <div style={{ fontSize: 8, fontWeight: 900, background: 'rgba(255,255,255,0.18)', borderRadius: 6, padding: '2px 9px' }}>Roll {student.rollNumber || '—'}</div>
        </div>
    </div>
);

// 9. Bordered formal, centred header, photo left, rows.
const LFormal = ({ student, school, c1 }) => (
    <div className="idcard" style={shell(LW, LH, { borderRadius: 6, border: `2px solid ${c1}`, padding: 5, display: 'flex', flexDirection: 'column' })}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderBottom: `2px solid ${c1}`, paddingBottom: 4 }}>
            <Logo school={school} size={22} bg={c1} ring={c1} />
            <div style={{ textAlign: 'center', minWidth: 0 }}>
                <SchoolName school={school} size={11} color={c1} />
                <div style={{ fontSize: 6.5, fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>{sessionLine(school)}</div>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 9, padding: '6px 4px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Photo student={student} size={60} radius={6} border={`2px solid ${c1}`} />
                <div style={{ fontSize: 7, fontWeight: 900, color: c1 }}>Roll {student.rollNumber || '—'}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{fullName(student)}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: c1, marginBottom: 2 }}>Class {student.class}-{student.section}</div>
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}><InfoRows student={student} /></div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}><Signatory school={school} width={68} sigHeight={20} labelColor={c1} /></div>
                </div>
            </div>
        </div>
    </div>
);

// 10. Split — tinted left half with photo + name, plain right with rows.
const LSplit = ({ student, school, c1, c2 }) => (
    <div className="idcard" style={shell(LW, LH, { borderRadius: 10, display: 'flex' })}>
        <div style={{ width: '45%', background: `${c1}12`, borderRight: `2px solid ${c1}`, display: 'flex', flexDirection: 'column', padding: '8px 9px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Logo school={school} size={20} bg={c1} ring={c1} />
                <SchoolName school={school} size={10} color={c1} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, marginTop: 'auto', marginBottom: 'auto' }}>
                <Photo student={student} size={58} radius={10} border={`2px solid ${c1}`} />
                <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', textAlign: 'center', lineHeight: 1.05 }}>{fullName(student)}</div>
                <div style={{ fontSize: 7.5, fontWeight: 900, color: '#fff', background: c1, borderRadius: 20, padding: '1px 8px' }}>Class {student.class}-{student.section}</div>
            </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 10px' }}>
            <div style={{ fontSize: 6, fontWeight: 800, color: c1, letterSpacing: 1, marginBottom: 3 }}>{sessionLine(school)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                <Row label="Roll" value={student.rollNumber} color="#334155" />
                <InfoRows student={student} />
            </div>
            <div style={{ paddingTop: 2, display: 'flex', justifyContent: 'flex-end' }}><Signatory school={school} width={78} sigHeight={22} labelColor={c1} /></div>
        </div>
    </div>
);

// ============================ TEMPLATE REGISTRY ===========================

const LAYOUTS = {
    'p-band': PBand, 'p-curve': PCurve, 'p-topfill': PTopFill, 'p-formal': PFormal, 'p-stripe': PStripe,
    'l-panel-left': LPanelLeft, 'l-topbar': LTopBar, 'l-panel-right': LPanelRight, 'l-formal': LFormal, 'l-split': LSplit,
};

export const ID_CARD_TEMPLATES = [
    // Portrait (10)
    { id: 'classic-blue', name: 'Classic Blue', orientation: 'portrait', layout: 'p-band', c1: '#2563eb', c2: '#1d4ed8' },
    { id: 'classic-maroon', name: 'Classic Maroon', orientation: 'portrait', layout: 'p-band', c1: '#9f1239', c2: '#881337' },
    { id: 'emerald-curve', name: 'Emerald Curve', orientation: 'portrait', layout: 'p-curve', c1: '#059669', c2: '#10b981' },
    { id: 'indigo-curve', name: 'Indigo Curve', orientation: 'portrait', layout: 'p-curve', c1: '#4f46e5', c2: '#7c3aed' },
    { id: 'rose-header', name: 'Rose Header', orientation: 'portrait', layout: 'p-topfill', c1: '#e11d48', c2: '#f43f5e' },
    { id: 'teal-header', name: 'Teal Header', orientation: 'portrait', layout: 'p-topfill', c1: '#0d9488', c2: '#14b8a6' },
    { id: 'formal-slate', name: 'Formal Slate', orientation: 'portrait', layout: 'p-formal', c1: '#0f172a', c2: '#334155' },
    { id: 'formal-purple', name: 'Formal Purple', orientation: 'portrait', layout: 'p-formal', c1: '#7c3aed', c2: '#a855f7' },
    { id: 'amber-stripe', name: 'Amber Stripe', orientation: 'portrait', layout: 'p-stripe', c1: '#d97706', c2: '#f59e0b' },
    { id: 'cyan-stripe', name: 'Cyan Stripe', orientation: 'portrait', layout: 'p-stripe', c1: '#0891b2', c2: '#06b6d4' },
    // Landscape (10)
    { id: 'slate-pro', name: 'Slate Pro', orientation: 'landscape', layout: 'l-panel-left', c1: '#0f172a', c2: '#334155' },
    { id: 'blue-panel', name: 'Blue Panel', orientation: 'landscape', layout: 'l-panel-left', c1: '#2563eb', c2: '#4f46e5' },
    { id: 'sunset', name: 'Sunset', orientation: 'landscape', layout: 'l-topbar', c1: '#e11d48', c2: '#f97316' },
    { id: 'meadow-bar', name: 'Meadow Bar', orientation: 'landscape', layout: 'l-topbar', c1: '#059669', c2: '#65a30d' },
    { id: 'indigo-right', name: 'Indigo Right', orientation: 'landscape', layout: 'l-panel-right', c1: '#4f46e5', c2: '#7c3aed' },
    { id: 'crimson-right', name: 'Crimson Right', orientation: 'landscape', layout: 'l-panel-right', c1: '#b91c1c', c2: '#dc2626' },
    { id: 'formal-violet', name: 'Formal Violet', orientation: 'landscape', layout: 'l-formal', c1: '#7c3aed', c2: '#a855f7' },
    { id: 'formal-teal', name: 'Formal Teal', orientation: 'landscape', layout: 'l-formal', c1: '#0d9488', c2: '#14b8a6' },
    { id: 'cyan-split', name: 'Cyan Split', orientation: 'landscape', layout: 'l-split', c1: '#0891b2', c2: '#06b6d4' },
    { id: 'amber-split', name: 'Amber Split', orientation: 'landscape', layout: 'l-split', c1: '#d97706', c2: '#f59e0b' },
];

const IdCardFace = ({ template, student = {}, school = {} }) => {
    const Layout = LAYOUTS[template.layout] || PBand;
    return <Layout student={student} school={school} c1={template.accent || template.c1} c2={template.c2 || template.accent || template.c1} />;
};

export default IdCardFace;
