// ===== Design-handoff UI kit (Claude Design "Scoolg Teacher" redesign) =====
// Flat / solid-blue system: ink/line/paper tokens, Plus Jakarta Sans,
// lucide line icons, rounded-2xl bordered cards with hairline shadows.
import React from 'react';
import {
  LayoutDashboard, Calendar, CalendarDays, CalendarRange, CalendarX, Users, User,
  ClipboardCheck, BookOpen, Settings, LifeBuoy, Search, Bell, HelpCircle, LogOut,
  Clock, ChevronRight, ChevronDown, ChevronUp, ArrowUpRight, ArrowRight,
  TrendingUp, TrendingDown, Plus, Check, X, CheckCircle, Star, MapPin, Mail,
  Phone, Award, Lock, ShieldCheck, Eye, EyeOff, Paperclip, FileText, FilePlus,
  Image, Upload, Send, Zap, Smartphone, Monitor, Coffee, RotateCcw, Save,
  IdCard, GraduationCap, Filter, NotebookPen, ArrowLeft, Trash2, Loader2, AlertCircle,
} from 'lucide-react';

const ICONS = {
  'layout-dashboard': LayoutDashboard, calendar: Calendar, 'calendar-days': CalendarDays,
  'calendar-range': CalendarRange, 'calendar-x': CalendarX, users: Users, user: User,
  'clipboard-check': ClipboardCheck, 'book-open': BookOpen, settings: Settings,
  'life-buoy': LifeBuoy, search: Search, bell: Bell, 'help-circle': HelpCircle,
  'log-out': LogOut, clock: Clock, 'chevron-right': ChevronRight, 'chevron-down': ChevronDown,
  'chevron-up': ChevronUp, 'arrow-up-right': ArrowUpRight, 'arrow-right': ArrowRight,
  'trending-up': TrendingUp, 'trending-down': TrendingDown, plus: Plus, check: Check,
  x: X, 'check-circle': CheckCircle, star: Star, 'map-pin': MapPin, mail: Mail,
  phone: Phone, award: Award, lock: Lock, 'shield-check': ShieldCheck, eye: Eye,
  'eye-off': EyeOff, paperclip: Paperclip, 'file-text': FileText, 'file-plus': FilePlus,
  image: Image, upload: Upload, send: Send, zap: Zap, smartphone: Smartphone,
  monitor: Monitor, coffee: Coffee, 'rotate-ccw': RotateCcw, save: Save,
  'id-card': IdCard, 'graduation-cap': GraduationCap, filter: Filter,
  'notebook-pen': NotebookPen, 'arrow-left': ArrowLeft, 'trash-2': Trash2, loader: Loader2,
  'alert-circle': AlertCircle,
};

export function Icon({ name, size = 20, className = '', strokeWidth = 1.75, style, fill }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} style={style} fill={fill || 'none'} />;
}

// ---- subject tones (single-blue system) ----
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

// ---- time helpers ----
export const toMin = (t) => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; };
export const fmt12 = (t) => { const [h, m] = (t || '0:0').split(':').map(Number); const ap = h < 12 ? 'AM' : 'PM'; const hh = h % 12 || 12; return `${hh}:${String(m).padStart(2, '0')} ${ap}`; };
export const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
export function periodState(p, nowMin = nowMinutes()) {
  const s = toMin(p.startTime), e = toMin(p.endTime);
  if (nowMin >= s && nowMin < e) return 'live';
  if (nowMin < s) return 'upcoming';
  return 'done';
}

// ---- primitives ----
export function Avatar({ src, name, size = 40, className = '' }) {
  const initials = (name || 'T').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
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
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] font-600 whitespace-nowrap ${tones[tone]}`}>{icon && <Icon name={icon} size={13} strokeWidth={2.25} />}{children}</span>;
}

export function Ring({ value, total, size = 56, stroke = 6, color = '#2563EB', track = '#ECEEF2', children }) {
  const pct = total ? value / total : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function Segmented({ items, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex gap-1.5 ${className}`}>
      {items.map(it => {
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
  return <Tag className={`bg-white rounded-2xl border border-line ${className}`} {...rest}>{children}</Tag>;
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
    danger: 'bg-white text-rose-600 border border-line hover:bg-rose-50',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === 'lg' ? 19 : 17} strokeWidth={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 19 : 17} strokeWidth={2} />}
    </button>
  );
}

export function Logo({ size = 40, src }) {
  if (src) {
    return <div className="rounded-xl overflow-hidden bg-white border border-line grid place-items-center shrink-0" style={{ width: size, height: size }}><img src={src} alt="" className="w-full h-full object-contain" /></div>;
  }
  return (
    <div className="rounded-xl grid place-items-center bg-blue-600 shrink-0" style={{ width: size, height: size }}>
      <Icon name="graduation-cap" size={size * 0.54} strokeWidth={2} className="text-white" />
    </div>
  );
}
