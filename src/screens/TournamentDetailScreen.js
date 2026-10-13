import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, ChevronsRight } from 'lucide-react-native';

import colors from '../utils/colors';
import { formatShortDate, withAlpha } from '../utils/helpers';
import {
  computeStandings,
  getGameScore,
  getGameResult,
  getTournamentChampion,
  knockoutRoundName,
} from '../utils/gameLogic';
import { getRules } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import Segmented from '../components/Segmented';
import SectionHeader from '../components/SectionHeader';
import GameCard from '../components/GameCard';
import TeamBadge from '../components/TeamBadge';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { FormBadges } from '../components/StatTile';

const TournamentDetailScreen = ({ navigation, route }) => {
  const { tournamentId } = route.params;
  const { tournaments, games, teams, customSports, advanceKnockout } = useApp();
  const tournament = tournaments.find((t) => t.id === tournamentId);
  const [tab, setTab] = useState('main');

  const tGames = useMemo(
    () => games.filter((g) => g.tournamentId === tournamentId).sort((a, b) => a.round - b.round || new Date(a.date) - new Date(b.date)),
    [games, tournamentId]
  );

  if (!tournament) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Tournament" onBack={() => navigation.goBack()} />
        <EmptyState emoji="🤷" title="Tournament not found" />
      </SafeAreaView>
    );
  }

  const rules = getRules(tournament.sport, customSports);
  const isLeague = tournament.format === 'league';
  const standings = computeStandings(tournament.teamIds, tGames, rules);
  const championId = getTournamentChampion(tournament, games, standings);
  const champion = teams.find((t) => t.id === championId);
  const team = (id) => teams.find((t) => t.id === id);
  const finished = tGames.filter((g) => g.status === 'finished').length;

  const rounds = [...new Set(tGames.map((g) => g.round))].sort((a, b) => a - b);
  const lastRound = rounds[rounds.length - 1];
  const lastRoundGames = tGames.filter((g) => g.round === lastRound);
  const canAdvance =
    !isLeague &&
    !champion &&
    lastRoundGames.length > 0 &&
    lastRoundGames.every((g) => g.status === 'finished');

  // Teams entering a knockout round = 2 * games + byes
  const roundSize = (r) => tGames.filter((g) => g.round === r).length * 2 + (tournament.byes?.[r]?.length || 0);

  const onAdvance = () => {
    const ok = advanceKnockout(tournament.id);
    if (!ok) Alert.alert('Not ready', 'Finish all games of the current round first.');
  };

  const renderTable = () => (
    <View style={styles.table}>
      <View style={[styles.tr, styles.thead]}>
        <Text style={[styles.th, styles.colRank]}>#</Text>
        <Text style={[styles.th, styles.colTeam]}>Team</Text>
        <Text style={[styles.th, styles.colNum]}>P</Text>
        <Text style={[styles.th, styles.colNum]}>W</Text>
        <Text style={[styles.th, styles.colNum]}>D</Text>
        <Text style={[styles.th, styles.colNum]}>L</Text>
        <Text style={[styles.th, styles.colNum]}>+/-</Text>
        <Text style={[styles.th, styles.colPts]}>Pts</Text>
      </View>
      {standings.map((r, i) => {
        const t = team(r.teamId);
        return (
          <TouchableOpacity
            key={r.teamId}
            style={[styles.tr, i === 0 && finished > 0 && styles.leaderRow]}
            onPress={() => t && navigation.navigate('MyTeam', { teamId: t.id })}
          >
            <Text style={[styles.td, styles.colRank, i === 0 && finished > 0 && { color: colors.primary }]}>{i + 1}</Text>
            <View style={[styles.colTeam, styles.teamCell]}>
              <TeamBadge uri={t?.logo} name={t?.name || '?'} color={t?.color} size={22} />
              <View style={{ flexShrink: 1 }}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {t?.name || 'Deleted team'}
                </Text>
                {r.form.length ? <FormBadges form={r.form} /> : null}
              </View>
            </View>
            <Text style={[styles.td, styles.colNum]}>{r.played}</Text>
            <Text style={[styles.td, styles.colNum]}>{r.won}</Text>
            <Text style={[styles.td, styles.colNum]}>{r.drawn}</Text>
            <Text style={[styles.td, styles.colNum]}>{r.lost}</Text>
            <Text style={[styles.td, styles.colNum]}>{r.diff > 0 ? `+${r.diff}` : r.diff}</Text>
            <Text style={[styles.td, styles.colPts]}>{r.points}</Text>
          </TouchableOpacity>
        );
      })}
      <Text style={styles.tableNote}>
        Win {rules.pointsWin} · Draw {rules.pointsDraw} · Loss {rules.pointsLoss} pts
      </Text>
    </View>
  );

  const renderBracket = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bracket}>
      {rounds.map((r) => (
        <View key={r} style={styles.bracketCol}>
          <Text style={styles.roundTitle}>{knockoutRoundName(roundSize(r))}</Text>
          {tGames
            .filter((g) => g.round === r)
            .map((g) => {
              const score = getGameScore(g);
              const result = getGameResult(g);
              const sideRow = (side) => {
                const t = team(side === 'home' ? g.homeTeamId : g.awayTeamId);
                const win = result === side;
                return (
                  <View style={styles.matchRow}>
                    <TeamBadge uri={t?.logo} name={t?.name || '?'} color={t?.color} size={20} />
                    <Text style={[styles.matchName, result && !win && styles.loser]} numberOfLines={1}>
                      {t?.name || 'TBD'}
                    </Text>
                    <Text style={[styles.matchScore, win && { color: colors.primary }]}>
                      {g.status === 'scheduled' ? '–' : score[side]}
                    </Text>
                  </View>
                );
              };
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.match, g.status === 'live' && { borderColor: colors.live }]}
                  onPress={() => navigation.navigate('LiveGame', { gameId: g.id })}
                >
                  {sideRow('home')}
                  <View style={styles.matchDivider} />
                  {sideRow('away')}
                  <Text style={styles.matchDate}>
                    {g.status === 'live' ? '● LIVE' : g.status === 'finished' ? 'Final' : formatShortDate(g.date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          {(tournament.byes?.[r] || []).map((id) => (
            <View key={id} style={[styles.match, styles.bye]}>
              <View style={styles.matchRow}>
                <TeamBadge uri={team(id)?.logo} name={team(id)?.name || '?'} color={team(id)?.color} size={20} />
                <Text style={styles.matchName} numberOfLines={1}>
                  {team(id)?.name || 'Team'}
                </Text>
              </View>
              <Text style={styles.matchDate}>Bye — advances</Text>
            </View>
          ))}
        </View>
      ))}
      {champion ? (
        <View style={[styles.bracketCol, { justifyContent: 'center' }]}>
          <Text style={styles.roundTitle}>Champion</Text>
          <View style={[styles.match, { borderColor: colors.warning, alignItems: 'center' }]}>
            <Text style={{ fontSize: 30 }}>🏆</Text>
            <Text style={[styles.matchName, { textAlign: 'center', marginTop: 6 }]}>{champion.name}</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );

  const renderGames = () =>
    rounds.map((r) => (
      <View key={r}>
        <SectionHeader title={isLeague ? `Round ${r}` : knockoutRoundName(roundSize(r))} />
        {tGames
          .filter((g) => g.round === r)
          .map((g) => (
            <GameCard key={g.id} game={g} onPress={() => navigation.navigate('LiveGame', { gameId: g.id })} />
          ))}
      </View>
    ));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={tournament.name}
        subtitle={`${rules.emoji} ${rules.name} · ${isLeague ? 'League' : 'Knockout'}`}
        onBack={() => navigation.goBack()}
        right={<HeaderButton icon={Pencil} onPress={() => navigation.navigate('AddEditTournament', { tournamentId })} />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {champion ? (
          <View style={styles.championCard}>
            <Text style={styles.trophy}>🏆</Text>
            <TeamBadge uri={champion.logo} name={champion.name} color={champion.color} size={56} />
            <Text style={styles.championLabel}>CHAMPION</Text>
            <Text style={styles.championName}>{champion.name}</Text>
          </View>
        ) : null}

        <View style={styles.summary}>
          <View style={styles.sumItem}>
            <Text style={styles.sumValue}>{tournament.teamIds.length}</Text>
            <Text style={styles.sumLabel}>Teams</Text>
          </View>
          <View style={styles.sumItem}>
            <Text style={styles.sumValue}>
              {finished}/{tGames.length}
            </Text>
            <Text style={styles.sumLabel}>Played</Text>
          </View>
          <View style={styles.sumItem}>
            <Text style={styles.sumValue}>{rounds.length}</Text>
            <Text style={styles.sumLabel}>Rounds</Text>
          </View>
        </View>

        {tournament.description ? <Text style={styles.description}>{tournament.description}</Text> : null}

        {canAdvance ? (
          <PrimaryButton
            title={`Generate ${knockoutRoundName(lastRoundGames.length + (tournament.byes?.[lastRound]?.length || 0))}`}
            icon={ChevronsRight}
            onPress={onAdvance}
            style={{ marginHorizontal: 16, marginBottom: 14 }}
          />
        ) : null}

        <Segmented
          options={[
            { value: 'main', label: isLeague ? 'Table' : 'Bracket' },
            { value: 'games', label: 'Games' },
          ]}
          value={tab}
          onChange={setTab}
          style={{ marginBottom: 14 }}
        />

        {tab === 'main' ? (isLeague ? renderTable() : renderBracket()) : renderGames()}
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
  championCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: withAlpha(colors.primary, 0.1),
  },
  trophy: {
    fontSize: 40,
    marginBottom: 8,
  },
  championLabel: {
    color: colors.warning,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 10,
    fontSize: 12,
  },
  championName: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 22,
    marginTop: 4,
  },
  summary: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sumItem: {
    flex: 1,
    alignItems: 'center',
  },
  sumValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  sumLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  description: {
    color: colors.textSecondary,
    marginHorizontal: 16,
    marginBottom: 14,
    lineHeight: 20,
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
  leaderRow: {
    backgroundColor: withAlpha(colors.primary, 0.08),
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
    width: 22,
  },
  colTeam: {
    flex: 1,
  },
  colNum: {
    width: 28,
    textAlign: 'center',
  },
  colPts: {
    width: 32,
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
    marginBottom: 3,
  },
  tableNote: {
    color: colors.textMuted,
    fontSize: 11,
    padding: 10,
    textAlign: 'center',
  },
  bracket: {
    paddingHorizontal: 16,
    gap: 14,
  },
  bracketCol: {
    width: 210,
    gap: 10,
  },
  roundTitle: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  match: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bye: {
    borderStyle: 'dashed',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  matchName: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
    fontSize: 13,
  },
  loser: {
    color: colors.textMuted,
  },
  matchScore: {
    color: colors.text,
    fontWeight: '900',
    width: 24,
    textAlign: 'right',
  },
  matchDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 3,
  },
  matchDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
});

export default TournamentDetailScreen;
