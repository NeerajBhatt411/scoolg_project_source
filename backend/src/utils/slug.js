// Subdomain slug from a school name. Uses the first word, lowercased, a-z0-9 only.
// "Gajera International School" -> "gajera"
export const slugify = (name) => {
  if (!name) return '';
  return String(name).trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
};
