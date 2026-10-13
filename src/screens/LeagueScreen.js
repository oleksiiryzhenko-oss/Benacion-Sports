import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Star, ExternalLink } from 'lucide-react-native';

import colors from '../utils/colors';
import {
  getLeague,
  getNextLeagueEvents,
  getPastLeagueEvents,
  getRoundEvents,
  getSeasonEvents,
  getLeagueTable,
  getLeagueTeams,
} from '../api/sportsApi';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import Segmented from '../components/Segmented';
import EventCard from '../components/EventCard';
import TeamBadge from '../components/TeamBadge';
import EmptyState from '../components/EmptyState';
import { LoadingView, ErrorView } from '../components/LoadingView';

const TABS = [
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'results', label: 'Results' },
  { value: 'table', label: 'Table' },
  { value: 'teams', label: 'Teams' },
];

const LeagueScreen = ({ navigation, route }) => {
  const { leagueId, leagueName } = route.params;
  const { isFavorite, toggleFavorite } = useApp();

  const [league, setLeague] = useState(null);
  const [tab, setTab] = useState('fixtures');
  const [round, setRound] = useState(null);
  const [baseRounds, setBaseRounds] = useState({ next: null, last: null });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // League info + detect current round
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [info, next, past] = await Promise.all([
          getLeague(leagueId),
          getNextLeagueEvents(leagueId).catch(() => []),
          getPastLeagueEvents(leagueId).catch(() => []),
        ]);
        if (!alive) return;
        setLeague(info);
        const nextRound = next[0]?.round ? Number(next[0].round) : null;
        const lastRound = past[0]?.round ? Number(past[0].round) : null;
        setBaseRounds({ next: nextRound, last: lastRound, nextEvents: next, pastEvents: past });
        setRound(nextRound || lastRound);
      } catch (e) {
        if (alive) setError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [leagueId, reloadKey]);

  const season = league?.currentSeason;

  const load = useCallback(
    async (force = false) => {
      if (!league) return;
      setError(false);
      try {
        if (tab === 'table') {
          setItems(await getLeagueTable(leagueId, season, { force }));
        } else if (tab === 'teams') {
          setItems(await getLeagueTeams(league.name));
        } else if (round) {
          const list = await getRoundEvents(leagueId, round, season, { force });
          setItems(list);
        } else {
          // Leagues without rounds (motorsport, tennis, fighting): use season + next/past
          const seasonEvents = await getSeasonEvents(leagueId, season, { force }).catch(() => []);
          const pool = [...(baseRounds.nextEvents || []), ...(baseRounds.pastEvents || []), ...seasonEvents];
          const unique = Array.from(new Map(pool.map((e) => [e.id, e])).values());
          const list =
            tab === 'fixtures'
              ? unique.filter((e) => !e.isFinished).sort((a, b) => a.timestamp - b.timestamp)
              : unique.filter((e) => e.isFinished).sort((a, b) => b.timestamp - a.timestamp);
          setItems(list);
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [league, tab, round, leagueId, season, baseRounds]
  );

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Switching between Fixtures/Results jumps to the matching round
  const changeTab = (value) => {
    setTab(value);
    if (value === 'fixtures' && baseRounds.next) setRound(baseRounds.next);
    if (value === 'results' && baseRounds.last) setRound(baseRounds.last);
  };

  const retry = () => {
    setError(false);
    setLoading(true);
    if (!league) setReloadKey((k) => k + 1);
    else load(true);
  };

  const fav = isFavorite('leagues', leagueId);
  const showRoundNav = (tab === 'fixtures' || tab === 'results') && round;

  const renderContent = () => {
    if (error) return <ErrorView onRetry={retry} />;
    if (loading || !league) return <LoadingView />;

    if (tab === 'table') {
      if (!items.length) return <EmptyState emoji="📊" title="No table available" text="This competition doesn't have a standings table." />;
      return (
        <View style={styles.table}>
          <View style={[styles.tr, styles.thead]}>
            <Text style={[styles.th, styles.colRank]}>#</Text>
            <Text style={[styles.th, styles.colTeam]}>Team</Text>
            <Text style={[styles.th, styles.colNum]}>P</Text>
            <Text style={[styles.th, styles.colNum]}>W</Text>
            <Text style={[styles.th, styles.colNum]}>D</Text>
            <Text style={[styles.th, styles.colNum]}>L</Text>
            <Text style={[styles.th, styles.colNum]}>GD</Text>
            <Text style={[styles.th, styles.colPts]}>Pts</Text>
          </View>
          {items.map((r) => (
            <TouchableOpacity
              key={r.teamId}
              style={styles.tr}
              onPress={() => navigation.navigate('TeamDetail', { teamId: r.teamId, teamName: r.team })}
            >
              <Text style={[styles.td, styles.colRank, r.rank <= 4 && { color: colors.primary }]}>{r.rank}</Text>
              <View style={[styles.colTeam, styles.teamCell]}>
                <TeamBadge uri={r.badge} name={r.team} size={20} />
                <Text style={styles.teamName} numberOfLines={1}>
                  {r.team}
                </Text>
              </View>
              <Text style={[styles.td, styles.colNum]}>{r.played}</Text>
              <Text style={[styles.td, styles.colNum]}>{r.won}</Text>
              <Text style={[styles.td, styles.colNum]}>{r.drawn}</Text>
              <Text style={[styles.td, styles.colNum]}>{r.lost}</Text>
              <Text style={[styles.td, styles.colNum]}>{r.diff > 0 ? `+${r.diff}` : r.diff}</Text>
              <Text style={[styles.td, styles.colPts]}>{r.points}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (tab === 'teams') {
      if (!items.length) return <EmptyState emoji="👥" title="No teams found" />;
      return (
        <View style={styles.teamsGrid}>
          {items.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.teamTile}
              onPress={() => navigation.navigate('TeamDetail', { teamId: t.id, teamName: t.name })}
            >
              <TeamBadge uri={t.badge} name={t.name} size={52} />
              <Text style={styles.teamTileName} numberOfLines={2}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (!items.length) {
      return <EmptyState emoji="🗓️" title={tab === 'fixtures' ? 'No upcoming matches' : 'No results yet'} />;
    }
    return items.map((e) => (
      <EventCard key={e.id} event={e} showLeague={false} onPress={() => navigation.navigate('EventDetail', { event: e })} />
    ));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={league?.name || leagueName}
        subtitle={league ? `${league.country || ''}${season ? ` · ${season}` : ''}` : ''}
        onBack={() => navigation.goBack()}
        right={
          <HeaderButton
            icon={Star}
            active={fav}
            onPress={() =>
              toggleFavorite('leagues', { id: leagueId, name: league?.name || leagueName, badge: league?.badge, sport: league?.sport })
            }
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.primary} />
        }
      >
        {league ? (
          <TouchableOpacity style={styles.hero} activeOpacity={0.9} onPress={() => setShowAbout((v) => !v)}>
            {league.badge ? <Image source={{ uri: league.badge }} style={styles.heroBadge} resizeMode="contain" /> : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{league.name}</Text>
              <Text style={styles.heroMeta}>
                {league.sport}
                {league.formed ? ` · since ${league.formed}` : ''}
              </Text>
              <Text style={styles.heroMore}>{showAbout ? 'Hide info' : 'About this league'}</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {showAbout && league ? (
          <View style={styles.about}>
            <Text style={styles.aboutText}>{league.description || 'No description available.'}</Text>
            {league.website ? (
              <TouchableOpacity
                style={styles.website}
                onPress={() => Linking.openURL(league.website.startsWith('http') ? league.website : `https://${league.website}`)}
              >
                <ExternalLink color={colors.primary} size={16} />
                <Text style={styles.websiteText}>{league.website}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <Segmented options={TABS} value={tab} onChange={changeTab} style={{ marginBottom: 12 }} />

        {showRoundNav ? (
          <View style={styles.roundNav}>
            <TouchableOpacity style={styles.roundBtn} disabled={round <= 1} onPress={() => setRound((r) => Math.max(1, r - 1))}>
              <ChevronLeft color={round <= 1 ? colors.textMuted : colors.text} size={20} />
            </TouchableOpacity>
            <Text style={styles.roundText}>Round {round}</Text>
            <TouchableOpacity style={styles.roundBtn} onPress={() => setRound((r) => r + 1)}>
              <ChevronRight color={colors.text} size={20} />
            </TouchableOpacity>
          </View>
        ) : null}

        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 60,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroBadge: {
    width: 64,
    height: 64,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  heroMeta: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  heroMore: {
    color: colors.primary,
    marginTop: 6,
    fontWeight: '700',
    fontSize: 13,
  },
  about: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  aboutText: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  website: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  websiteText: {
    color: colors.primary,
    fontWeight: '700',
  },
  roundNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  roundBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    minWidth: 90,
    textAlign: 'center',
  },
  table: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  thead: {
    backgroundColor: colors.surface2,
  },
  th: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  td: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  colRank: {
    width: 24,
  },
  colTeam: {
    flex: 1,
  },
  colNum: {
    width: 28,
    textAlign: 'center',
  },
  colPts: {
    width: 34,
    textAlign: 'center',
    fontWeight: '900',
  },
  teamCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
    flexShrink: 1,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  teamTile: {
    width: '31%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamTileName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LeagueScreen;
