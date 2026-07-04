// Today's calendar date in the user's LOCAL timezone as YYYY-MM-DD.
// Using toISOString() returns the UTC date, so in IST (UTC+5:30) between local
// 00:00 and 05:30 it rolls back to "yesterday" — attendance/diary/homework would
// then default to the wrong day. Build the string from local parts instead.
export const todayLocal = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export default todayLocal;
