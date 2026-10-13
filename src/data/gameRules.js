// Rules & live-scoring actions for user-created games.
// `points` is added to the side's score; 0 = stat-only event.

export const BUILT_IN_GAME_SPORTS = [
  {
    key: 'football',
    name: 'Football',
    emoji: '⚽',
    periods: 2,
    periodName: 'Half',
    periodMinutes: 45,
    allowDraw: true,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    actions: [
      { type: 'goal', label: 'Goal', points: 1, icon: '⚽' },
      { type: 'yellow', label: 'Yellow', points: 0, icon: '🟨' },
      { type: 'red', label: 'Red', points: 0, icon: '🟥' },
      { type: 'corner', label: 'Corner', points: 0, icon: '🚩' },
      { type: 'foul', label: 'Foul', points: 0, icon: '⚠️' },
      { type: 'sub', label: 'Sub', points: 0, icon: '🔁' },
    ],
  },
  {
    key: 'basketball',
    name: 'Basketball',
    emoji: '🏀',
    periods: 4,
    periodName: 'Quarter',
    periodMinutes: 10,
    allowDraw: false,
    pointsWin: 2,
    pointsDraw: 1,
    pointsLoss: 1,
    actions: [
      { type: 'ft', label: '+1 FT', points: 1, icon: '🎯' },
      { type: 'two', label: '+2', points: 2, icon: '🏀' },
      { type: 'three', label: '+3', points: 3, icon: '🔥' },
      { type: 'foul', label: 'Foul', points: 0, icon: '⚠️' },
      { type: 'rebound', label: 'Rebound', points: 0, icon: '🙌' },
      { type: 'timeout', label: 'Timeout', points: 0, icon: '⏸️' },
    ],
  },
  {
    key: 'hockey',
    name: 'Ice Hockey',
    emoji: '🏒',
    periods: 3,
    periodName: 'Period',
    periodMinutes: 20,
    allowDraw: true,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    actions: [
      { type: 'goal', label: 'Goal', points: 1, icon: '🥅' },
      { type: 'shot', label: 'Shot', points: 0, icon: '🏒' },
      { type: 'penalty', label: 'Penalty', points: 0, icon: '⛔' },
      { type: 'save', label: 'Save', points: 0, icon: '🧤' },
      { type: 'timeout', label: 'Timeout', points: 0, icon: '⏸️' },
    ],
  },
  {
    key: 'volleyball',
    name: 'Volleyball',
    emoji: '🏐',
    periods: 5,
    periodName: 'Set',
    periodMinutes: 25,
    allowDraw: false,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    actions: [
      { type: 'point', label: 'Point', points: 1, icon: '🏐' },
      { type: 'ace', label: 'Ace', points: 1, icon: '⚡' },
      { type: 'block', label: 'Block', points: 1, icon: '🧱' },
      { type: 'error', label: 'Error', points: 0, icon: '❌' },
      { type: 'timeout', label: 'Timeout', points: 0, icon: '⏸️' },
    ],
  },
  {
    key: 'americanfootball',
    name: 'American Football',
    emoji: '🏈',
    periods: 4,
    periodName: 'Quarter',
    periodMinutes: 15,
    allowDraw: true,
    pointsWin: 2,
    pointsDraw: 1,
    pointsLoss: 0,
    actions: [
      { type: 'td', label: 'TD +6', points: 6, icon: '🏈' },
      { type: 'pat', label: 'PAT +1', points: 1, icon: '🎯' },
      { type: 'twopt', label: '2PT +2', points: 2, icon: '✌️' },
      { type: 'fg', label: 'FG +3', points: 3, icon: '🥾' },
      { type: 'safety', label: 'Safety +2', points: 2, icon: '🛡️' },
      { type: 'flag', label: 'Flag', points: 0, icon: '🚩' },
    ],
  },
  {
    key: 'handball',
    name: 'Handball',
    emoji: '🤾',
    periods: 2,
    periodName: 'Half',
    periodMinutes: 30,
    allowDraw: true,
    pointsWin: 2,
    pointsDraw: 1,
    pointsLoss: 0,
    actions: [
      { type: 'goal', label: 'Goal', points: 1, icon: '🤾' },
      { type: 'seven', label: '7m goal', points: 1, icon: '🎯' },
      { type: 'yellow', label: 'Yellow', points: 0, icon: '🟨' },
      { type: 'twomin', label: '2 min', points: 0, icon: '⏱️' },
      { type: 'timeout', label: 'Timeout', points: 0, icon: '⏸️' },
    ],
  },
  {
    key: 'other',
    name: 'Other',
    emoji: '🏅',
    periods: 2,
    periodName: 'Period',
    periodMinutes: 20,
    allowDraw: true,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    actions: [
      { type: 'point', label: '+1', points: 1, icon: '➕' },
      { type: 'foul', label: 'Foul', points: 0, icon: '⚠️' },
      { type: 'timeout', label: 'Timeout', points: 0, icon: '⏸️' },
    ],
  },
];

// Build rules for a user-defined sport.
// custom = { key, name, emoji, periods, periodName, periodMinutes, allowDraw, scoring: [1,2,3] }
export const buildCustomRules = (custom) => ({
  key: custom.key,
  name: custom.name,
  emoji: custom.emoji || '🏅',
  periods: Number(custom.periods) || 2,
  periodName: custom.periodName || 'Period',
  periodMinutes: Number(custom.periodMinutes) || 20,
  allowDraw: custom.allowDraw !== false,
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  custom: true,
  actions: [
    ...(custom.scoring?.length ? custom.scoring : [1]).map((p) => ({
      type: `p${p}`,
      label: `+${p}`,
      points: Number(p),
      icon: '➕',
    })),
    { type: 'foul', label: 'Foul', points: 0, icon: '⚠️' },
    { type: 'timeout', label: 'Timeout', points: 0, icon: '⏸️' },
  ],
});

export const getRules = (key, customSports = []) => {
  const builtIn = BUILT_IN_GAME_SPORTS.find((s) => s.key === key);
  if (builtIn) return builtIn;
  const custom = customSports.find((s) => s.key === key);
  if (custom) return buildCustomRules(custom);
  return BUILT_IN_GAME_SPORTS.find((s) => s.key === 'other');
};

export const getAllGameSports = (customSports = []) => [
  ...BUILT_IN_GAME_SPORTS,
  ...customSports.map(buildCustomRules),
];

// Map TheSportsDB sport name -> local game sport key (used for "Track this match")
export const apiSportToGameKey = (name) =>
  ({
    Soccer: 'football',
    Basketball: 'basketball',
    'Ice Hockey': 'hockey',
    Volleyball: 'volleyball',
    'American Football': 'americanfootball',
    Handball: 'handball',
  }[name] || 'other');
