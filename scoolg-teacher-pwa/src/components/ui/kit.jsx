// Shared UI primitives + helpers for the redesigned teacher PWA (flat / solid blue).
import React from 'react';
import Icon from './Icon';

// ---------- subject tones ----------
const SUBJECT_TONE = {
  Mathematics: { bg: 'bg-blue-50', text: 'text-blue-700', dot: '#2563EB', soft: '#EFF4FF' },
  Physics: { bg: 'bg-blue-50', text: 'text-blue-800', dot: '#1E40AF', soft: '#E5ECFB' },
  English: { bg: 'bg-blue-50', text: 'text-blue-600', dot: '#3B82F6', soft: '#EFF4FF' },
  default: { bg: 'bg-slate-100', text: 'text-slate-600', dot: '#94A3B8', soft: '#F1F5F9' },
};
export function toneFor(subject) {
  if (!subject) return SUBJECT_TONE.default;
  const s = subject.toLowerCase();
  if (s.includes('math')) return SUBJECT_TONE.Mathematics;
  if (s.includes('phys') || s.includes('sci') || s.includes('chem')) return SUBJECT_TONE.Physics;
  if (s.includes('eng')) return SUBJECT_TONE.English;
  return SUBJECT_TONE.default;
}

// ---------- time helpers ----------
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DAYS_WORK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const toMin = (t) => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; };
export const fmt12 = (t) => {
  if (!t) return '--';
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return t;
  const ap = h < 12 ? 'AM' : 'PM';
  const hh = h % 12 || 12;
  return `${hh}:${String(m || 0).padStart(2, '0')} ${ap}`;
};
// live/upcoming/done for a period given current minutes-since-midnight
export const periodState = (p, nowMin) => {
  const s = toMin(p.startTime), e = toMin(p.endTime);
  if (nowMin >= s && nowMin < e) return 'live';
  if (nowMin < s) return 'upcoming';
  return 'done';
};

// ---------- components ----------
export function Avatar({ src, name, size = 40, className = '' }) {
  const initials = (name || 'T').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={`relative shrink-0 overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <div className="w-full h-full grid place-items-center bg-blue-50 text-blue-700 font-700" style={{ fontSize: size * 0.36 }}>{initials}</div>}
    </div>
  );
}

export function PageHead({ eyebrow, title, sub, action }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="text-[12px] font-600 text-ink-faint mb-1">{eyebrow}</p>}
        <h1 className="font-700 text-ink tracking-[-0.02em] leading-tight text-[22px] lg:text-[26px]">{title}</h1>
        {sub && <p className="text-ink-soft text-[13.5px] mt-1 leading-snug">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function SubjectTag({ subject, className = '' }) {
  const t = toneFor(subject);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-600 ${t.bg} ${t.text} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }}></span>{subject}
    </span>
  );
}

export function Chip({ children, tone = 'soft', icon }) {
  const tones = {
    soft: 'bg-line-soft text-ink-soft',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-blue-50 text-blue-700',
    red: 'bg-slate-800 text-white',
    amber: 'bg-line-soft text-ink-soft',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] font-600 whitespace-nowrap ${tones[tone]}`}>{icon && <Icon name={icon} size={13} strokeWidth={2.25} />}{children}</span>;
}

export function Segmented({ items, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex gap-1.5 ${className}`}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button key={it.value} onClick={() => onChange(it.value)}
            className={`px-3.5 h-9 rounded-lg text-[13px] font-600 border transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-ink-soft border-line hover:border-ink-faint/60'}`}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export function Card({ className = '', children, as: Tag = 'div', ...rest }) {
  return <Tag className={`bg-card rounded-2xl border border-line ${className}`} {...rest}>{children}</Tag>;
}

export function Empty({ icon, title, sub, action }) {
  return (
    <div className="grid place-items-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-xl bg-line-soft grid place-items-center mb-3 text-ink-faint"><Icon name={icon} size={24} /></div>
      <p className="font-600 text-ink text-[15.5px]">{title}</p>
      {sub && <p className="text-ink-soft text-[13px] mt-1 max-w-[280px]">{sub}</p>}
      {action}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', icon, iconRight, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 font-600 rounded-[10px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100';
  const sizes = { sm: 'h-9 px-3.5 text-[13px]', md: 'h-10 px-4 text-[13.5px]', lg: 'h-[50px] px-6 text-[15px]' };
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost: 'bg-line-soft text-ink hover:bg-line',
    outline: 'bg-white text-ink border border-line hover:border-ink-faint/60',
    danger: 'bg-white text-ink-soft border border-line hover:bg-line-soft',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === 'lg' ? 19 : 17} strokeWidth={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 19 : 17} strokeWidth={2} />}
    </button>
  );
}

export function Logo({ size = 40 }) {
  return (
    <div className="rounded-xl grid place-items-center bg-blue-600 shrink-0" style={{ width: size, height: size }}>
      <Icon name="graduation-cap" size={size * 0.54} strokeWidth={2} className="text-white" />
    </div>
  );
}

export { Icon };
