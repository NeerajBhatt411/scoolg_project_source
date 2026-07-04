// Subdomain slug from a school name. Uses the first word, lowercased, a-z0-9 only.
// "Gajera International School" -> "gajera". Only a FALLBACK now — schools pick
// their own website address during onboarding (see normalizeSlug / validateSlug).
export const slugify = (name) => {
  if (!name) return '';
  return String(name).trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Normalise an owner-typed website address into a valid subdomain label:
// lowercase, only a-z/0-9/hyphen, collapsed and trimmed hyphens.
// "Pt. G. P. Nayak" -> "pt-g-p-nayak"; "ptgpnayak" stays "ptgpnayak".
export const normalizeSlug = (raw) => {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // any other char -> hyphen
    .replace(/-+/g, '-')         // collapse repeats
    .replace(/^-+|-+$/g, '');    // no leading/trailing hyphen
};

// Reserved labels that must never become a school subdomain.
const RESERVED_SLUGS = new Set([
  'www', 'api', 'admin', 'app', 'apps', 'mail', 'email', 'ftp', 'scoolg',
  'dashboard', 'portal', 'static', 'assets', 'cdn', 'blog', 'help', 'support',
  'status', 'test', 'staging', 'dev', 'demo', 'school', 'schools', 'teacher',
  'student', 'login', 'signup', 'onboarding',
]);

// Validate a desired website address. Returns { ok, slug, error }.
export const validateSlug = (raw) => {
  const slug = normalizeSlug(raw);
  if (!slug) return { ok: false, slug: '', error: 'Please enter a website address.' };
  if (slug.length < 3) return { ok: false, slug, error: 'Website address must be at least 3 characters.' };
  if (slug.length > 40) return { ok: false, slug, error: 'Website address must be 40 characters or fewer.' };
  if (RESERVED_SLUGS.has(slug)) return { ok: false, slug, error: 'That website address is reserved. Please choose another.' };
  return { ok: true, slug, error: '' };
};
