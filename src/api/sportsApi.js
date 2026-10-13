import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SPORTS_DB_BASE_URL } from '../utils/config';

const client = axios.create({
  baseURL: SPORTS_DB_BASE_URL,
  timeout: 15000,
});

const CACHE_PREFIX = 'api_cache:';
const MINUTE = 60 * 1000;
const memoryCache = new Map();
const inflight = new Map();

// GET with memory + AsyncStorage cache. On network error falls back to stale cache.
const cachedGet = async (path, ttl = 10 * MINUTE, { force = false } = {}) => {
  const now = Date.now();
  const mem = memoryCache.get(path);
  if (!force && mem && now - mem.t < ttl) return mem.data;

  if (!force && !mem) {
    try {
      const raw = await AsyncStorage.getItem(CACHE_PREFIX + path);
      if (raw) {
        const stored = JSON.parse(raw);
        memoryCache.set(path, stored);
        if (now - stored.t < ttl) return stored.data;
      }
    } catch (e) {
      // ignore broken cache
    }
  }

  if (inflight.has(path)) return inflight.get(path);

  const request = client
    .get(path)
    .then(({ data }) => {
      const entry = { t: Date.now(), data };
      memoryCache.set(path, entry);
      AsyncStorage.setItem(CACHE_PREFIX + path, JSON.stringify(entry)).catch(() => {});
      return data;
    })
    .catch((err) => {
      const stale = memoryCache.get(path);
      if (stale) return stale.data;
      throw err;
    })
    .finally(() => inflight.delete(path));

  inflight.set(path, request);
  return request;
};

export const clearApiCache = async () => {
  memoryCache.clear();
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(CACHE_PREFIX)));
};

// ================= NORMALIZERS =================
const FINISHED = ['FT', 'AET', 'AOT', 'PEN', 'AP', 'Match Finished', 'FINISHED', 'Finished', 'AWD', 'WO'];
const NOT_STARTED = ['NS', 'Not Started', 'TBD', '', null, undefined];
const CANCELLED = ['PST', 'CANC', 'ABD', 'Postponed', 'Cancelled', 'Abandoned'];

const toTimestamp = (e) => {
  if (e.strTimestamp) {
    const iso = e.strTimestamp.endsWith('Z') || e.strTimestamp.includes('+') ? e.strTimestamp : `${e.strTimestamp}Z`;
    const t = Date.parse(iso);
    if (!Number.isNaN(t)) return t;
  }
  if (e.dateEvent) {
    const t = Date.parse(`${e.dateEvent}T${e.strTime && e.strTime !== '00:00:00' ? e.strTime : '12:00:00'}Z`);
    if (!Number.isNaN(t)) return t;
  }
  return null;
};

const clean = (v) => (v === '' || v === null || v === undefined ? null : v);

export const normalizeEvent = (e) => {
  const timestamp = toTimestamp(e);
  const hasScore = clean(e.intHomeScore) !== null && clean(e.intAwayScore) !== null;
  const status = clean(e.strStatus);
  const isCancelled = CANCELLED.includes(status) || e.strPostponed === 'yes';
  const isFinished =
    !isCancelled && (FINISHED.includes(status) || (hasScore && NOT_STARTED.includes(status) && timestamp < Date.now() - 3 * 3600000));
  const isLive = !isCancelled && !isFinished && !NOT_STARTED.includes(status) && hasScore;

  return {
    id: e.idEvent,
    name: e.strEvent,
    sport: e.strSport,
    leagueId: e.idLeague,
    league: e.strLeague,
    leagueBadge: clean(e.strLeagueBadge),
    season: clean(e.strSeason),
    round: clean(e.intRound) && e.intRound !== '0' ? e.intRound : null,
    home: clean(e.strHomeTeam),
    away: clean(e.strAwayTeam),
    homeId: clean(e.idHomeTeam),
    awayId: clean(e.idAwayTeam),
    homeBadge: clean(e.strHomeTeamBadge),
    awayBadge: clean(e.strAwayTeamBadge),
    homeScore: clean(e.intHomeScore),
    awayScore: clean(e.intAwayScore),
    date: timestamp ? new Date(timestamp).toISOString() : null,
    timestamp,
    venue: clean(e.strVenue),
    city: clean(e.strCity),
    country: clean(e.strCountry),
    thumb: clean(e.strThumb) || clean(e.strBanner) || clean(e.strPoster) || clean(e.strSquare),
    poster: clean(e.strPoster),
    video: clean(e.strVideo),
    spectators: clean(e.intSpectators),
    referee: clean(e.strOfficial),
    description: clean(e.strDescriptionEN),
    status,
    isFinished,
    isLive,
    isCancelled,
  };
};

export const normalizeTeam = (t) => ({
  id: t.idTeam,
  name: t.strTeam,
  shortName: clean(t.strTeamShort),
  alternate: clean(t.strTeamAlternate),
  sport: t.strSport,
  league: clean(t.strLeague),
  leagueId: clean(t.idLeague),
  country: clean(t.strCountry),
  formed: clean(t.intFormedYear),
  stadium: clean(t.strStadium),
  stadiumCapacity: clean(t.intStadiumCapacity),
  location: clean(t.strLocation),
  badge: clean(t.strBadge),
  logo: clean(t.strLogo),
  banner: clean(t.strBanner),
  fanart: clean(t.strFanart1) || clean(t.strFanart2) || clean(t.strEquipment),
  website: clean(t.strWebsite),
  description: clean(t.strDescriptionEN),
  colour: clean(t.strColour1),
});

export const normalizeLeague = (l) => ({
  id: l.idLeague,
  name: l.strLeague,
  sport: l.strSport,
  country: clean(l.strCountry),
  currentSeason: clean(l.strCurrentSeason),
  formed: clean(l.intFormedYear),
  badge: clean(l.strBadge),
  logo: clean(l.strLogo),
  banner: clean(l.strBanner),
  fanart: clean(l.strFanart1),
  description: clean(l.strDescriptionEN),
  website: clean(l.strWebsite),
});

export const normalizeStanding = (r) => ({
  rank: Number(r.intRank),
  teamId: r.idTeam,
  team: r.strTeam,
  badge: clean(r.strBadge),
  played: Number(r.intPlayed) || 0,
  won: Number(r.intWin) || 0,
  drawn: Number(r.intDraw) || 0,
  lost: Number(r.intLoss) || 0,
  goalsFor: Number(r.intGoalsFor) || 0,
  goalsAgainst: Number(r.intGoalsAgainst) || 0,
  diff: Number(r.intGoalDifference) || 0,
  points: Number(r.intPoints) || 0,
  form: clean(r.strForm),
  description: clean(r.strDescription),
});

export const normalizePlayer = (p) => ({
  id: p.idPlayer,
  name: p.strPlayer,
  position: clean(p.strPosition),
  number: clean(p.strNumber),
  nationality: clean(p.strNationality),
  thumb: clean(p.strCutout) || clean(p.strThumb) || clean(p.strRender),
});

const sortByDate = (events, desc = false) =>
  events.sort((a, b) => ((a.timestamp || 0) - (b.timestamp || 0)) * (desc ? -1 : 1));

const uniqueEvents = (events) => {
  const seen = new Set();
  return events.filter((e) => (seen.has(e.id) ? false : seen.add(e.id)));
};

const enc = encodeURIComponent;

// ================= EVENTS =================
export const getEventsByDay = async (date, sport, opts) => {
  const path = `/eventsday.php?d=${date}${sport ? `&s=${enc(sport)}` : ''}`;
  const data = await cachedGet(path, 10 * MINUTE, opts);
  return sortByDate((data?.events || []).map(normalizeEvent));
};

export const getNextLeagueEvents = async (leagueId, opts) => {
  const data = await cachedGet(`/eventsnextleague.php?id=${leagueId}`, 30 * MINUTE, opts);
  return sortByDate((data?.events || []).map(normalizeEvent));
};

export const getPastLeagueEvents = async (leagueId, opts) => {
  const data = await cachedGet(`/eventspastleague.php?id=${leagueId}`, 30 * MINUTE, opts);
  return sortByDate((data?.events || []).map(normalizeEvent), true);
};

export const getRoundEvents = async (leagueId, round, season, opts) => {
  const data = await cachedGet(`/eventsround.php?id=${leagueId}&r=${round}&s=${enc(season)}`, 15 * MINUTE, opts);
  return sortByDate((data?.events || []).map(normalizeEvent));
};

export const getSeasonEvents = async (leagueId, season, opts) => {
  const data = await cachedGet(`/eventsseason.php?id=${leagueId}&s=${enc(season)}`, 60 * MINUTE, opts);
  return sortByDate((data?.events || []).map(normalizeEvent));
};

export const getEvent = async (eventId) => {
  const data = await cachedGet(`/lookupevent.php?id=${eventId}`, 5 * MINUTE);
  const e = data?.events?.[0];
  return e ? normalizeEvent(e) : null;
};

export const searchEvents = async (query) => {
  const q = query.trim().replace(/\s+/g, '_');
  if (!q) return [];
  const data = await cachedGet(`/searchevents.php?e=${enc(q)}`, 30 * MINUTE);
  return sortByDate(uniqueEvents((data?.event || []).map(normalizeEvent)), true);
};

// ================= LEAGUES =================
export const getLeague = async (leagueId) => {
  const data = await cachedGet(`/lookupleague.php?id=${leagueId}`, 24 * 60 * MINUTE);
  const l = data?.leagues?.[0];
  return l ? normalizeLeague(l) : null;
};

export const getLeagueTable = async (leagueId, season, opts) => {
  const data = await cachedGet(`/lookuptable.php?l=${leagueId}&s=${enc(season)}`, 30 * MINUTE, opts);
  return (data?.table || []).map(normalizeStanding).sort((a, b) => a.rank - b.rank);
};

export const getLeagueTeams = async (leagueName) => {
  const data = await cachedGet(`/search_all_teams.php?l=${enc(leagueName)}`, 24 * 60 * MINUTE);
  return (data?.teams || []).map(normalizeTeam);
};

// ================= TEAMS =================
export const searchTeams = async (query) => {
  const q = query.trim();
  if (!q) return [];
  const data = await cachedGet(`/searchteams.php?t=${enc(q)}`, 60 * MINUTE);
  return (data?.teams || []).map(normalizeTeam);
};

export const getTeam = async (teamId) => {
  const data = await cachedGet(`/lookupteam.php?id=${teamId}`, 24 * 60 * MINUTE);
  const t = data?.teams?.[0];
  return t ? normalizeTeam(t) : null;
};

export const getTeamNextEvents = async (teamId, opts) => {
  const data = await cachedGet(`/eventsnext.php?id=${teamId}`, 30 * MINUTE, opts);
  return sortByDate((data?.events || []).map(normalizeEvent));
};

export const getTeamLastEvents = async (teamId, opts) => {
  const data = await cachedGet(`/eventslast.php?id=${teamId}`, 30 * MINUTE, opts);
  return sortByDate((data?.results || []).map(normalizeEvent), true);
};

export const getTeamPlayers = async (teamId) => {
  const data = await cachedGet(`/lookup_all_players.php?id=${teamId}`, 24 * 60 * MINUTE);
  return (data?.player || []).map(normalizePlayer);
};

// ================= FEED =================
// Builds the news feed for the followed sports: results, today and upcoming.
export const getNewsFeed = async (sports, catalog, opts) => {
  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const yesterday = fmt(new Date(today.getTime() - 86400000));
  const todayKey = fmt(today);
  const tomorrow = fmt(new Date(today.getTime() + 86400000));

  const jobs = [];
  sports.forEach((sport) => {
    [yesterday, todayKey, tomorrow].forEach((d) => jobs.push(getEventsByDay(d, sport, opts)));
    const leagues = catalog.find((s) => s.name === sport)?.leagues || [];
    leagues.slice(0, 2).forEach((l) => {
      jobs.push(getPastLeagueEvents(l.id, opts));
      jobs.push(getNextLeagueEvents(l.id, opts));
    });
  });

  const settled = await Promise.allSettled(jobs);
  const failed = settled.filter((r) => r.status === 'rejected').length;
  if (failed === settled.length && settled.length > 0) {
    throw settled[0].reason;
  }

  const all = uniqueEvents(settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])));
  const now = Date.now();

  return {
    live: all.filter((e) => e.isLive),
    results: sortByDate(all.filter((e) => e.isFinished), true),
    upcoming: sortByDate(all.filter((e) => !e.isFinished && !e.isLive && !e.isCancelled && (e.timestamp || 0) > now - 3 * 3600000)),
    all,
  };
};
