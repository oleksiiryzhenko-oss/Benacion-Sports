import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, Plus } from 'lucide-react-native';

import colors from '../utils/colors';
import { withAlpha } from '../utils/helpers';
import { computeTeamStats } from '../utils/gameLogic';
import { getRules } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import TeamBadge from '../components/TeamBadge';
import StatTile, { FormBadges } from '../components/StatTile';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';

const MyTeamScreen = ({ navigation, route }) => {
  const { teamId } = route.params;
  const { teams, games, customSports } = useApp();
  const team = teams.find((t) => t.id === teamId);

  const stats = useMemo(() => computeTeamStats(teamId, games), [teamId, games]);
  const teamGames = useMemo(
    () =>
      games
        .filter((g) => g.homeTeamId === teamId || g.awayTeamId === teamId)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [games, teamId]
  );

  // Top scorers from recorded events
  const scorers = useMemo(() => {
    const map = {};
    teamGames.forEach((g) => {
      const side = g.homeTeamId === teamId ? 'home' : 'away';
      (g.events || [])
        .filter((e) => e.side === side && e.points > 0 && e.player)
        .forEach((e) => {
          map[e.player] = (map[e.player] || 0) + e.points;
        });
    });
    return Object.entries(map)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [teamGames, teamId]);

  if (!team) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Team" onBack={() => navigation.goBack()} />
        <EmptyState emoji="🤷" title="Team not found" />
      </SafeAreaView>
    );
  }

  const rules = getRules(team.sport, customSports);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={team.name}
        subtitle={`${rules.emoji} ${rules.name}`}
        onBack={() => navigation.goBack()}
        right={<HeaderButton icon={Pencil} onPress={() => navigation.navigate('AddEditTeam', { teamId })} />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { borderColor: team.color, backgroundColor: withAlpha(team.color, 0.08) }]}>
          <TeamBadge uri={team.logo} name={team.name} color={team.color} size={92} />
          <Text style={styles.name}>{team.name}</Text>
          <Text style={styles.meta}>
            {[team.shortName, team.city, team.founded ? `est. ${team.founded}` : null].filter(Boolean).join(' · ')}
          </Text>
          {team.coach ? <Text style={styles.coach}>Coach / captain: {team.coach}</Text> : null}
          {stats.form.length ? (
            <View style={{ marginTop: 10 }}>
              <FormBadges form={stats.form} />
            </View>
          ) : null}
        </View>

        <View style={styles.tiles}>
          <StatTile label="Played" value={stats.played} />
          <StatTile label="Won" value={stats.won} color={colors.success} />
          <StatTile label="Drawn" value={stats.drawn} color={colors.textSecondary} />
          <StatTile label="Lost" value={stats.lost} color={colors.danger} />
        </View>
        <View style={styles.tiles}>
          <StatTile label="Scored" value={stats.scored} color={colors.primary} />
          <StatTile label="Conceded" value={stats.conceded} color={colors.accent} />
          <StatTile label="Win rate" value={`${stats.winRate}%`} color={colors.info} />
        </View>

        {team.description ? (
          <>
            <SectionHeader title="About" />
            <View style={styles.card}>
              <Text style={styles.about}>{team.description}</Text>
            </View>
          </>
        ) : null}

        {scorers.length ? (
          <>
            <SectionHeader title="Top scorers" />
            <View style={styles.card}>
              {scorers.map((s, i) => (
                <View key={s.name} style={styles.scorer}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <Text style={styles.scorerName}>{s.name}</Text>
                  <Text style={styles.points}>{s.points}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <SectionHeader title={`Roster · ${team.players?.length || 0}`} />
        {team.players?.length ? (
          <View style={styles.card}>
            {team.players.map((p) => (
              <View key={p.id} style={styles.scorer}>
                <Text style={styles.rank}>{p.number ? `#${p.number}` : '—'}</Text>
                <Text style={styles.scorerName}>{p.name}</Text>
                <Text style={styles.pos}>{p.position}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No players yet. Add them in edit mode to tag scorers during live games.</Text>
        )}

        <SectionHeader title="Games" />
        <PrimaryButton
          title="New game with this team"
          icon={Plus}
          variant="ghost"
          small
          style={{ marginHorizontal: 16, marginBottom: 12 }}
          onPress={() => navigation.navigate('AddEditGame')}
        />
        {teamGames.length ? (
          teamGames.map((g) => <GameCard key={g.id} game={g} onPress={() => navigation.push('LiveGame', { gameId: g.id })} />)
        ) : (
          <Text style={styles.muted}>This team hasn't played yet.</Text>
        )}
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
    marginHorizontal: 16,
    alignItems: 'center',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
  },
  meta: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  coach: {
    color: colors.textSecondary,
    marginTop: 6,
    fontSize: 13,
  },
  tiles: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  about: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  scorer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  rank: {
    color: colors.primary,
    fontWeight: '900',
    width: 36,
  },
  scorerName: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  points: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  pos: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  muted: {
    color: colors.textMuted,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});

export default MyTeamScreen;
