import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_FOLLOWED_SPORTS } from '../data/sports';
import { genId } from '../utils/helpers';
import {
  generateRoundRobin,
  generateKnockoutRound,
  getWinnerTeamId,
} from '../utils/gameLogic';
import { scheduleMatchReminders, cancelAllReminders } from '../utils/notifeeNotifications';

const AppContext = createContext();

const DEFAULT_SETTINGS = {
  onboarded: false,
  followedSports: DEFAULT_FOLLOWED_SPORTS,
  notificationsEnabled: true,
  reminderMinutes: 30,
};

const DEFAULT_FAVORITES = { teams: [], events: [], leagues: [] };

const DEFAULT_QUIZ = {
  played: 0,
  best: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  byCategory: {},
  history: [],
};

const STORAGE_KEYS = {
  settings: 'settings',
  customSports: 'customSports',
  teams: 'teams',
  games: 'games',
  tournaments: 'tournaments',
  favorites: 'favorites',
  eventReminders: 'eventReminders',
  quizStats: 'quizStats',
};

const freshClock = () => ({ running: false, startedAt: null, elapsed: 0 });

const usePersist = (key, value, hydrated) => {
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch((e) => console.log(`Error saving ${key}:`, e));
  }, [key, value, hydrated]);
};

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [customSports, setCustomSports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [games, setGames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [favorites, setFavorites] = useState(DEFAULT_FAVORITES);
  const [eventReminders, setEventReminders] = useState([]);
  const [quizStats, setQuizStats] = useState(DEFAULT_QUIZ);

  const [hydrated, setHydrated] = useState(false);

  // LOAD
  useEffect(() => {
    const loadData = async () => {
      try {
        const entries = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
        const data = Object.fromEntries(entries.map(([k, v]) => [k, v ? JSON.parse(v) : null]));

        if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        if (data.customSports) setCustomSports(data.customSports);
        if (data.teams) setTeams(data.teams);
        if (data.games) setGames(data.games);
        if (data.tournaments) setTournaments(data.tournaments);
        if (data.favorites) setFavorites({ ...DEFAULT_FAVORITES, ...data.favorites });
        if (data.eventReminders) setEventReminders(data.eventReminders);
        if (data.quizStats) setQuizStats({ ...DEFAULT_QUIZ, ...data.quizStats });
      } catch (e) {
        console.log('Error loading data:', e);
      } finally {
        setHydrated(true);
      }
    };

    loadData();
  }, []);

  // SAVE — one effect per key so a fast sequence of updates never gets dropped
  usePersist(STORAGE_KEYS.settings, settings, hydrated);
  usePersist(STORAGE_KEYS.customSports, customSports, hydrated);
  usePersist(STORAGE_KEYS.teams, teams, hydrated);
  usePersist(STORAGE_KEYS.games, games, hydrated);
  usePersist(STORAGE_KEYS.tournaments, tournaments, hydrated);
  usePersist(STORAGE_KEYS.favorites, favorites, hydrated);
  usePersist(STORAGE_KEYS.eventReminders, eventReminders, hydrated);
  usePersist(STORAGE_KEYS.quizStats, quizStats, hydrated);

  /* ================= NOTIFICATIONS ================= */
  const teamName = useCallback(
    (id, fallback) => teams.find((t) => t.id === id)?.name || fallback || 'TBD',
    [teams]
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!settings.notificationsEnabled) {
      cancelAllReminders();
      return;
    }

    const gameItems = games
      .filter((g) => g.remind && g.status === 'scheduled')
      .map((g) => ({
        id: `game_${g.id}`,
        title: `⏰ ${teamName(g.homeTeamId, g.homeName)} vs ${teamName(g.awayTeamId, g.awayName)}`,
        body: `Your game starts in ${settings.reminderMinutes} min${g.venue ? ` at ${g.venue}` : ''}. Get ready to track it live!`,
        timestamp: new Date(g.date).getTime(),
      }));

    const eventItems = eventReminders.map((r) => ({
      id: `event_${r.id}`,
      title: `🔔 ${r.title}`,
      body: `Kick-off in ${settings.reminderMinutes} min · ${r.league || ''}`,
      timestamp: r.timestamp,
    }));

    scheduleMatchReminders([...gameItems, ...eventItems], settings.reminderMinutes);
  }, [games, eventReminders, settings.notificationsEnabled, settings.reminderMinutes, hydrated, teamName]);

  /* ================= SETTINGS ================= */
  const updateSettings = (fields) => setSettings((prev) => ({ ...prev, ...fields }));

  const toggleFollowSport = (name) =>
    setSettings((prev) => {
      const followed = prev.followedSports.includes(name)
        ? prev.followedSports.filter((s) => s !== name)
        : [...prev.followedSports, name];
      return { ...prev, followedSports: followed };
    });

  /* ================= CUSTOM SPORTS ================= */
  const addCustomSport = (sport) => {
    const key = `custom_${genId()}`;
    setCustomSports((prev) => [...prev, { ...sport, key, createdAt: new Date().toISOString() }]);
    return key;
  };

  const deleteCustomSport = (key) => setCustomSports((prev) => prev.filter((s) => s.key !== key));

  /* ================= TEAMS ================= */
  const addTeam = (team) => {
    const id = genId();
    setTeams((prev) => [...prev, { players: [], ...team, id, createdAt: new Date().toISOString() }]);
    return id;
  };

  const updateTeam = (id, fields) => setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));

  const deleteTeam = (id) => {
    const team = teams.find((t) => t.id === id);
    // keep team names on existing games so history stays readable
    setGames((prev) =>
      prev.map((g) => {
        if (g.homeTeamId === id) return { ...g, homeTeamId: null, homeName: team?.name || g.homeName };
        if (g.awayTeamId === id) return { ...g, awayTeamId: null, awayName: team?.name || g.awayName };
        return g;
      })
    );
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  /* ================= GAMES ================= */
  const addGame = (game) => {
    const id = genId();
    setGames((prev) => [
      ...prev,
      {
        status: 'scheduled',
        period: 1,
        clock: freshClock(),
        events: [],
        remind: false,
        ...game,
        id,
        createdAt: new Date().toISOString(),
      },
    ]);
    return id;
  };

  const updateGame = (id, fields) => setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...fields } : g)));

  const patchGame = (id, fn) => setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...fn(g) } : g)));

  const deleteGame = (id) => setGames((prev) => prev.filter((g) => g.id !== id));

  const startGame = (id) =>
    patchGame(id, () => ({
      status: 'live',
      startedAt: new Date().toISOString(),
      clock: { running: true, startedAt: Date.now(), elapsed: 0 },
      period: 1,
      manualScore: null,
    }));

  const toggleClock = (id) =>
    patchGame(id, (g) => {
      const c = g.clock || freshClock();
      if (c.running) {
        return { clock: { running: false, startedAt: null, elapsed: c.elapsed + (Date.now() - c.startedAt) } };
      }
      return { clock: { ...c, running: true, startedAt: Date.now() } };
    });

  const setPeriod = (id, period) =>
    patchGame(id, () => ({ period: Math.max(1, period), clock: freshClock() }));

  const addGameEvent = (id, event) =>
    patchGame(id, (g) => ({
      events: [...(g.events || []), { ...event, id: genId(), period: g.period, createdAt: new Date().toISOString() }],
    }));

  const removeGameEvent = (id, eventId) =>
    patchGame(id, (g) => ({ events: (g.events || []).filter((e) => e.id !== eventId) }));

  const finishGame = (id, extra = {}) =>
    patchGame(id, (g) => {
      const c = g.clock || freshClock();
      const elapsed = c.running ? c.elapsed + (Date.now() - c.startedAt) : c.elapsed;
      return {
        status: 'finished',
        finishedAt: new Date().toISOString(),
        clock: { running: false, startedAt: null, elapsed },
        ...extra,
      };
    });

  const reopenGame = (id) => patchGame(id, () => ({ status: 'live', winnerSide: null, finishedAt: null }));

  const setQuickResult = (id, home, away, winnerSide = null) =>
    patchGame(id, () => ({
      manualScore: { home: Number(home) || 0, away: Number(away) || 0 },
      status: 'finished',
      winnerSide,
      finishedAt: new Date().toISOString(),
    }));

  /* ================= TOURNAMENTS ================= */
  const addTournament = (data) => {
    const tournament = { ...data, id: genId(), createdAt: new Date().toISOString(), byes: {} };
    let newGames = [];
    if (tournament.format === 'league') {
      newGames = generateRoundRobin(tournament);
    } else {
      const { games: firstRound, byes } = generateKnockoutRound(
        tournament,
        tournament.teamIds,
        1,
        new Date(tournament.startDate || Date.now())
      );
      newGames = firstRound;
      tournament.byes = { 1: byes };
    }
    setTournaments((prev) => [...prev, tournament]);
    setGames((prev) => [...prev, ...newGames]);
    return tournament.id;
  };

  const updateTournament = (id, fields) =>
    setTournaments((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));

  const deleteTournament = (id) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    setGames((prev) => prev.filter((g) => g.tournamentId !== id));
  };

  // Knockout: create next round from winners of the latest round (+ byes)
  const advanceKnockout = (id) => {
    const tournament = tournaments.find((t) => t.id === id);
    if (!tournament) return false;
    const tGames = games.filter((g) => g.tournamentId === id);
    const round = Math.max(...tGames.map((g) => g.round));
    const current = tGames.filter((g) => g.round === round);
    if (current.some((g) => g.status !== 'finished')) return false;

    const winners = [...(tournament.byes?.[round] || []), ...current.map(getWinnerTeamId).filter(Boolean)];
    if (winners.length < 2) return false;

    const days = Number(tournament.daysBetweenRounds) || 7;
    const lastDate = Math.max(...current.map((g) => new Date(g.date).getTime()));
    const { games: next, byes } = generateKnockoutRound(
      tournament,
      winners,
      round + 1,
      new Date(lastDate + days * 86400000)
    );
    updateTournament(id, { byes: { ...(tournament.byes || {}), [round + 1]: byes } });
    setGames((prev) => [...prev, ...next]);
    return true;
  };

  /* ================= FAVORITES ================= */
  const isFavorite = (type, id) => favorites[type]?.some((f) => f.id === id);

  const toggleFavorite = (type, item) =>
    setFavorites((prev) => {
      const list = prev[type] || [];
      const exists = list.some((f) => f.id === item.id);
      return {
        ...prev,
        [type]: exists ? list.filter((f) => f.id !== item.id) : [{ ...item, savedAt: new Date().toISOString() }, ...list],
      };
    });

  /* ================= EVENT REMINDERS ================= */
  const hasEventReminder = (eventId) => eventReminders.some((r) => r.id === eventId);

  const toggleEventReminder = (event) =>
    setEventReminders((prev) => {
      if (prev.some((r) => r.id === event.id)) return prev.filter((r) => r.id !== event.id);
      return [
        ...prev,
        {
          id: event.id,
          title: event.home && event.away ? `${event.home} vs ${event.away}` : event.name,
          league: event.league,
          sport: event.sport,
          timestamp: event.timestamp,
          event,
        },
      ];
    });

  const removeEventReminder = (eventId) => setEventReminders((prev) => prev.filter((r) => r.id !== eventId));

  /* ================= QUIZ ================= */
  const saveQuizResult = ({ category, score, correct, total }) =>
    setQuizStats((prev) => ({
      played: prev.played + 1,
      best: Math.max(prev.best, score),
      totalCorrect: prev.totalCorrect + correct,
      totalQuestions: prev.totalQuestions + total,
      byCategory: { ...prev.byCategory, [category]: Math.max(prev.byCategory[category] || 0, score) },
      history: [{ date: new Date().toISOString(), category, score, correct, total }, ...prev.history].slice(0, 30),
    }));

  /* ================= RESET ================= */
  const resetAllData = async () => {
    setCustomSports([]);
    setTeams([]);
    setGames([]);
    setTournaments([]);
    setFavorites(DEFAULT_FAVORITES);
    setEventReminders([]);
    setQuizStats(DEFAULT_QUIZ);
    setSettings((prev) => ({ ...DEFAULT_SETTINGS, onboarded: prev.onboarded }));
    await cancelAllReminders();
  };

  const liveGames = useMemo(() => games.filter((g) => g.status === 'live'), [games]);

  return (
    <AppContext.Provider
      value={{
        hydrated,
        settings,
        customSports,
        teams,
        games,
        liveGames,
        tournaments,
        favorites,
        eventReminders,
        quizStats,
        updateSettings,
        toggleFollowSport,
        addCustomSport,
        deleteCustomSport,
        addTeam,
        updateTeam,
        deleteTeam,
        addGame,
        updateGame,
        deleteGame,
        startGame,
        toggleClock,
        setPeriod,
        addGameEvent,
        removeGameEvent,
        finishGame,
        reopenGame,
        setQuickResult,
        addTournament,
        updateTournament,
        deleteTournament,
        advanceKnockout,
        isFavorite,
        toggleFavorite,
        hasEventReminder,
        toggleEventReminder,
        removeEventReminder,
        saveQuizResult,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
