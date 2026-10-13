import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../utils/colors';
import { formatShortDate } from '../utils/helpers';
import { computeTeamStats, getGameScore, getSideName } from '../utils/gameLogic';
import { getAllGameSports, getRules } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import StatTile, { FormBadges } from '../components/StatTile';
import TeamBadge from '../components/TeamBadge';
import EmptyState from '../components/EmptyState';

const StatsScreen = ({ navigation }) => {
  const { games, teams, tournaments, customSports, quizStats, favorites } = useApp();

  const data = useMemo(() => {
    const finished = games.filter((g) => g.status === 'finished');
    const events = games.flatMap((g) => g.events || []);
    const totalPoints = finished.reduce((sum, g) => {
      const s = getGameScore(g);
      return sum + s.home + s.away;
    }, 0);

    const bySport = getAllGameSports(customSports)
      .map((s) => ({ ...s, count: games.filter((g) => g.sport === s.key).length }))
      .filter((s) => s.count)
      .sort((a, b) => b.count - a.count);

    const topTeams = teams
      .map((t) => ({ team: t, stats: computeTeamStats(t.id, games) }))
      .filter((x) => x.stats.played)
      .sort((a, b) => b.stats.won - a.stats.won || b.stats.winRate - a.stats.winRate)
      .slice(0, 5);

    const eventCounts = {};
    events.forEach((e) => {
      const key = `${e.icon} ${e.label}`;
      eventCounts[key] = (eventCounts[key] || 0) + 1;
    });
    const topEvents = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    let biggestWin = null;
    let highestScoring = null;
    finished.forEach((g) => {
      const s = getGameScore(g);
      const margin = Math.abs(s.home - s.away);
      const total = s.home + s.away;
      if (!biggestWin || margin > biggestWin.margin) biggestWin = { game: g, margin, s };
      if (!highestScoring || total > highestScoring.total) highestScoring = { game: g, total, s };
    });

    const scorers = {};
    events
      .filter((e) => e.points > 0 && e.player)
      .forEach((e) => {
        scorers[e.player] = (scorers[e.player] || 0) + e.points;
      });
    const topScorers = Object.entries(scorers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { finished, events, totalPoints, bySport, topTeams, topEvents, biggestWin, highestScoring, topScorers };
  }, [games, teams, customSports]);

  const maxSport = Math.max(1, ...data.bySport.map((s) => s.count));
  const maxEvent = Math.max(1, ...data.topEvents.map(([, c]) => c));

  const gameLine = (g, s) =>
    `${getSideName(g, 'home', teams)} ${s.home}–${s.away} ${getSideName(g, 'away', teams)}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Statistics" subtitle="Your games at a glance" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.tiles}>
          <StatTile label="Games" value={games.length} />
          <StatTile label="Finished" value={data.finished.length} color={colors.success} />
          <StatTile label="Tournaments" value={tournaments.length} color={colors.warning} />
        </View>
        <View style={styles.tiles}>
          <StatTile label="Teams" value={teams.length} color={colors.info} />
          <StatTile label="Events logged" value={data.events.length} color={colors.accent} />
          <StatTile label="Points scored" value={data.totalPoints} color={colors.primary} />
        </View>

        {!games.length ? (
          <EmptyState
            emoji="📊"
            title="No games yet"
            text="Create and track games — your stats will build up here automatically."
            actionLabel="Create a game"
            onAction={() => navigation.navigate('AddEditGame')}
          />
        ) : null}

        {data.bySport.length ? (
          <>
            <SectionHeader title="Games by sport" />
            <View style={styles.card}>
              {data.bySport.map((s) => (
                <View key={s.key} style={styles.barRow}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {s.emoji} {s.name}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(s.count / maxSport) * 100}%` }]} />
                  </View>
                  <Text style={styles.barValue}>{s.count}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {data.topTeams.length ? (
          <>
            <SectionHeader title="Top teams" />
            <View style={styles.card}>
              {data.topTeams.map(({ team, stats }, i) => (
                <TouchableOpacity key={team.id} style={styles.teamRow} onPress={() => navigation.navigate('MyTeam', { teamId: team.id })}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <TeamBadge uri={team.logo} name={team.name} color={team.color} size={30} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamMeta}>
                      {stats.won}W {stats.drawn}D {stats.lost}L · {stats.winRate}%
                    </Text>
                  </View>
                  <FormBadges form={stats.form} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        {data.topScorers.length ? (
          <>
            <SectionHeader title="Top scorers" />
            <View style={styles.card}>
              {data.topScorers.map(([name, pts], i) => (
                <View key={name} style={styles.teamRow}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <Text style={[styles.teamName, { flex: 1 }]}>{name}</Text>
                  <Text style={styles.points}>{pts}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {data.biggestWin || data.highestScoring ? (
          <>
            <SectionHeader title="Records" />
            {data.biggestWin ? (
              <TouchableOpacity style={styles.record} onPress={() => navigation.navigate('LiveGame', { gameId: data.biggestWin.game.id })}>
                <Text style={styles.recordLabel}>💥 Biggest win · {formatShortDate(data.biggestWin.game.date)}</Text>
                <Text style={styles.recordValue}>{gameLine(data.biggestWin.game, data.biggestWin.s)}</Text>
              </TouchableOpacity>
            ) : null}
            {data.highestScoring ? (
              <TouchableOpacity
                style={styles.record}
                onPress={() => navigation.navigate('LiveGame', { gameId: data.highestScoring.game.id })}
              >
                <Text style={styles.recordLabel}>
                  🎯 Highest scoring · {getRules(data.highestScoring.game.sport, customSports).name}
                </Text>
                <Text style={styles.recordValue}>{gameLine(data.highestScoring.game, data.highestScoring.s)}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}

        {data.topEvents.length ? (
          <>
            <SectionHeader title="Most logged events" />
            <View style={styles.card}>
              {data.topEvents.map(([label, count]) => (
                <View key={label} style={styles.barRow}>
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {label}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(count / maxEvent) * 100}%`, backgroundColor: colors.accent }]} />
                  </View>
                  <Text style={styles.barValue}>{count}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <SectionHeader title="Other" />
        <View style={styles.tiles}>
          <StatTile label="Quiz best" value={quizStats.best} color={colors.primary} />
          <StatTile label="Quizzes" value={quizStats.played} />
          <StatTile label="Favorites" value={favorites.teams.length + favorites.events.length + favorites.leagues.length} color={colors.warning} />
        </View>
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
  tiles: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  barLabel: {
    color: colors.text,
    fontWeight: '600',
    width: 120,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  barValue: {
    color: colors.text,
    fontWeight: '800',
    width: 28,
    textAlign: 'right',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  rank: {
    color: colors.primary,
    fontWeight: '900',
    width: 18,
  },
  teamName: {
    color: colors.text,
    fontWeight: '700',
  },
  teamMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  points: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  record: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  recordValue: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
    marginTop: 4,
  },
});

export default StatsScreen;
