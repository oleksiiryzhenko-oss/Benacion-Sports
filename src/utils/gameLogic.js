import { genId } from './helpers';

// ================= SCORE =================
// Quick-entered result (manualScore) is the base; recorded events add on top of it
export const getGameScore = (game) => {
  const score = {
    home: Number(game.manualScore?.home) || 0,
    away: Number(game.manualScore?.away) || 0,
  };
  (game.events || []).forEach((e) => {
    if (e.side === 'home' || e.side === 'away') score[e.side] += Number(e.points) || 0;
  });
  return score;
};

// 'home' | 'away' | 'draw' | null (not finished)
export const getGameResult = (game) => {
  if (game.status !== 'finished') return null;
  if (game.winnerSide) return game.winnerSide;
  const { home, away } = getGameScore(game);
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
};

// Live "who's winning" line
export const getLeaderText = (game, homeName, awayName) => {
  const { home, away } = getGameScore(game);
  if (home === away) return home === 0 ? 'No score yet' : `All square at ${home}–${away}`;
  const diff = Math.abs(home - away);
  const leader = home > away ? homeName : awayName;
  if (game.status === 'finished') return `${leader} won by ${diff}`;
  return `${leader} lead by ${diff}`;
};

export const getSideName = (game, side, teams = []) => {
  const teamId = side === 'home' ? game.homeTeamId : game.awayTeamId;
  const team = teams.find((t) => t.id === teamId);
  if (team) return team.name;
  return (side === 'home' ? game.homeName : game.awayName) || (side === 'home' ? 'Home' : 'Away');
};

export const getSideTeam = (game, side, teams = []) => {
  const teamId = side === 'home' ? game.homeTeamId : game.awayTeamId;
  return teams.find((t) => t.id === teamId) || null;
};

// ================= STANDINGS =================
export const computeStandings = (teamIds, games, rules) => {
  const rows = {};
  teamIds.forEach((id) => {
    rows[id] = { teamId: id, played: 0, won: 0, drawn: 0, lost: 0, scored: 0, conceded: 0, points: 0, form: [] };
  });

  const finished = games
    .filter((g) => g.status === 'finished' && rows[g.homeTeamId] && rows[g.awayTeamId])
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  finished.forEach((g) => {
    const { home, away } = getGameScore(g);
    const result = getGameResult(g);
    const h = rows[g.homeTeamId];
    const a = rows[g.awayTeamId];

    h.played += 1;
    a.played += 1;
    h.scored += home;
    h.conceded += away;
    a.scored += away;
    a.conceded += home;

    if (result === 'home') {
      h.won += 1; a.lost += 1;
      h.points += rules.pointsWin; a.points += rules.pointsLoss;
      h.form.push('W'); a.form.push('L');
    } else if (result === 'away') {
      a.won += 1; h.lost += 1;
      a.points += rules.pointsWin; h.points += rules.pointsLoss;
      a.form.push('W'); h.form.push('L');
    } else {
      h.drawn += 1; a.drawn += 1;
      h.points += rules.pointsDraw; a.points += rules.pointsDraw;
      h.form.push('D'); a.form.push('D');
    }
  });

  return Object.values(rows)
    .map((r) => ({ ...r, diff: r.scored - r.conceded, form: r.form.slice(-5) }))
    .sort((x, y) => y.points - x.points || y.diff - x.diff || y.scored - x.scored);
};

// ================= TEAM STATS =================
export const computeTeamStats = (teamId, games) => {
  const stats = { played: 0, won: 0, drawn: 0, lost: 0, scored: 0, conceded: 0, form: [], winRate: 0 };
  games
    .filter((g) => g.status === 'finished' && (g.homeTeamId === teamId || g.awayTeamId === teamId))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((g) => {
      const side = g.homeTeamId === teamId ? 'home' : 'away';
      const { home, away } = getGameScore(g);
      const result = getGameResult(g);
      stats.played += 1;
      stats.scored += side === 'home' ? home : away;
      stats.conceded += side === 'home' ? away : home;
      if (result === 'draw') {
        stats.drawn += 1;
        stats.form.push('D');
      } else if (result === side) {
        stats.won += 1;
        stats.form.push('W');
      } else {
        stats.lost += 1;
        stats.form.push('L');
      }
    });
  stats.form = stats.form.slice(-5);
  stats.winRate = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;
  return stats;
};

// ================= TOURNAMENT GENERATION =================
const baseGame = (tournament, homeTeamId, awayTeamId, round, date) => ({
  id: genId(),
  sport: tournament.sport,
  homeTeamId,
  awayTeamId,
  date: date.toISOString(),
  venue: tournament.venue || '',
  notes: '',
  status: 'scheduled',
  period: 1,
  clock: { running: false, startedAt: null, elapsed: 0 },
  events: [],
  tournamentId: tournament.id,
  round,
  remind: false,
  createdAt: new Date().toISOString(),
});

// Circle method round-robin. Returns games with consecutive round numbers.
export const generateRoundRobin = (tournament) => {
  const ids = [...tournament.teamIds];
  if (ids.length % 2 === 1) ids.push(null); // bye
  const n = ids.length;
  const rounds = n - 1;
  const half = n / 2;
  const games = [];
  const start = new Date(tournament.startDate || Date.now());
  const dayStep = Number(tournament.daysBetweenRounds) || 7;

  let arr = [...ids];
  for (let r = 0; r < rounds; r++) {
    const roundDate = new Date(start.getTime() + r * dayStep * 86400000);
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a && b) {
        // alternate home/away for fairness
        const [home, away] = r % 2 === 0 ? [a, b] : [b, a];
        games.push(baseGame(tournament, home, away, r + 1, roundDate));
      }
    }
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }

  if (tournament.doubleRound) {
    const offset = rounds;
    const firstLeg = [...games];
    firstLeg.forEach((g) => {
      const date = new Date(new Date(g.date).getTime() + offset * dayStep * 86400000);
      games.push(baseGame(tournament, g.awayTeamId, g.homeTeamId, g.round + offset, date));
    });
  }
  return games;
};

export const knockoutRoundName = (teamsInRound) => {
  if (teamsInRound <= 2) return 'Final';
  if (teamsInRound <= 4) return 'Semi-finals';
  if (teamsInRound <= 8) return 'Quarter-finals';
  return `Round of ${teamsInRound}`;
};

// First knockout round. Odd team count -> top seed gets a bye (advances automatically).
export const generateKnockoutRound = (tournament, teamIds, round, date) => {
  const ids = [...teamIds];
  const games = [];
  const byes = [];
  if (ids.length % 2 === 1) byes.push(ids.shift());
  for (let i = 0; i < ids.length; i += 2) {
    games.push(baseGame(tournament, ids[i], ids[i + 1], round, date));
  }
  return { games, byes };
};

// Winner team id of a finished game (knockout)
export const getWinnerTeamId = (game) => {
  const r = getGameResult(game);
  if (r === 'home') return game.homeTeamId;
  if (r === 'away') return game.awayTeamId;
  return null;
};

export const getTournamentChampion = (tournament, games, standings) => {
  if (tournament.format === 'league') {
    const all = games.filter((g) => g.tournamentId === tournament.id);
    if (!all.length || all.some((g) => g.status !== 'finished')) return null;
    return standings[0]?.teamId || null;
  }
  const tGames = games.filter((g) => g.tournamentId === tournament.id);
  const maxRound = Math.max(0, ...tGames.map((g) => g.round));
  const last = tGames.filter((g) => g.round === maxRound);
  if (last.length === 1 && last[0].status === 'finished' && (tournament.byes?.[maxRound] || []).length === 0) {
    return getWinnerTeamId(last[0]);
  }
  return null;
};
