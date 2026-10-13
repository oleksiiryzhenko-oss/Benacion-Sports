// ================= IDS =================
export const genId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// ================= DATES =================
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n) => String(n).padStart(2, '0');

// YYYY-MM-DD in local time
export const dayKey = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const isSameDay = (a, b) => dayKey(a) === dayKey(b);

export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatShortDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const today = new Date();
  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, addDays(today, 1))) return 'Tomorrow';
  if (isSameDay(d, addDays(today, -1))) return 'Yesterday';
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatShortDate(date)} · ${formatTime(date)}`;
};

export const weekdayShort = (date) => WEEKDAYS[new Date(date).getDay()];
export const monthShort = (date) => MONTHS[new Date(date).getMonth()];

export const relativeTime = (date) => {
  if (!date) return '';
  const diff = new Date(date).getTime() - Date.now();
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60000);
  const hrs = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  let value;
  if (min < 1) return 'just now';
  if (min < 60) value = `${min}m`;
  else if (hrs < 24) value = `${hrs}h`;
  else value = `${days}d`;

  return diff < 0 ? `${value} ago` : `in ${value}`;
};

// ================= CLOCK =================
export const getElapsed = (clock) => {
  if (!clock) return 0;
  const running = clock.running && clock.startedAt ? Date.now() - clock.startedAt : 0;
  return (clock.elapsed || 0) + running;
};

export const formatClock = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

// ================= STRINGS =================
export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase() || '?';

export const withAlpha = (hex, alpha) => {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${a}`;
};

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ================= API EVENT HEADLINES =================
export const eventHeadline = (e) => {
  if (!e.home || !e.away) return e.name;
  if (e.isFinished) {
    const hs = Number(e.homeScore);
    const as = Number(e.awayScore);
    if (hs === as) return `${e.home} and ${e.away} share the points in a ${hs}–${as} draw`;
    const homeWin = hs > as;
    const winner = homeWin ? e.home : e.away;
    const loser = homeWin ? e.away : e.home;
    const margin = Math.abs(hs - as);
    const verb = margin >= 3 ? 'thrash' : margin === 1 ? 'edge' : 'beat';
    return `${winner} ${verb} ${loser} ${Math.max(hs, as)}–${Math.min(hs, as)}${homeWin ? '' : ' away'}`;
  }
  if (e.isLive) return `LIVE: ${e.home} ${e.homeScore ?? 0}–${e.awayScore ?? 0} ${e.away}`;
  return `Preview: ${e.home} host ${e.away}`;
};

export const eventStory = (e) => {
  const parts = [];
  const where = e.venue ? ` at ${e.venue}` : '';
  const round = e.round ? `round ${e.round} of ` : '';
  const season = e.season ? `the ${e.season} ` : '';

  if (e.isFinished && e.home && e.away) {
    const hs = Number(e.homeScore);
    const as = Number(e.awayScore);
    if (hs === as) {
      parts.push(`${e.home} and ${e.away} played out a ${hs}–${as} draw${where} in ${round}${season}${e.league}.`);
    } else {
      const winner = hs > as ? e.home : e.away;
      const loser = hs > as ? e.away : e.home;
      parts.push(
        `${winner} claimed a ${Math.max(hs, as)}–${Math.min(hs, as)} victory over ${loser}${where} in ${round}${season}${e.league}.`
      );
    }
  } else if (e.home && e.away) {
    parts.push(
      `${e.home} welcome ${e.away}${where} on ${formatDate(e.date)} at ${formatTime(e.date)} in ${round}${season}${e.league}.`
    );
  } else {
    parts.push(`${e.name} — ${e.league}${where}, ${formatDate(e.date)}.`);
  }

  if (e.spectators) parts.push(`Attendance: ${Number(e.spectators).toLocaleString()}.`);
  if (e.referee) parts.push(`Referee: ${e.referee}.`);
  if (e.description) parts.push(e.description);
  return parts.join('\n\n');
};
