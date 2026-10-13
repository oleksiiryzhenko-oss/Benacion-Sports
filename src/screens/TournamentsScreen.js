import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ChevronRight } from 'lucide-react-native';

import colors from '../utils/colors';
import { formatDate } from '../utils/helpers';
import { computeStandings, getTournamentChampion } from '../utils/gameLogic';
import { getRules } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import EmptyState from '../components/EmptyState';

const TournamentsScreen = ({ navigation }) => {
  const { tournaments, games, teams, customSports } = useApp();

  const items = [...tournaments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((t) => {
      const rules = getRules(t.sport, customSports);
      const tGames = games.filter((g) => g.tournamentId === t.id);
      const finished = tGames.filter((g) => g.status === 'finished').length;
      const standings = computeStandings(t.teamIds, tGames, rules);
      const championId = getTournamentChampion(t, games, standings);
      return {
        t,
        rules,
        total: tGames.length,
        finished,
        live: tGames.some((g) => g.status === 'live'),
        champion: teams.find((x) => x.id === championId),
        leader: t.format === 'league' && finished ? teams.find((x) => x.id === standings[0]?.teamId) : null,
      };
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Tournaments"
        subtitle="Leagues & knockout cups"
        large
        right={<HeaderButton icon={Plus} active onPress={() => navigation.navigate('AddEditTournament')} />}
      />

      <FlatList
        data={items}
        keyExtractor={(i) => i.t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const progress = item.total ? item.finished / item.total : 0;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('TournamentDetail', { tournamentId: item.t.id })}
            >
              <View style={styles.top}>
                <Text style={styles.emoji}>{item.champion ? '🏆' : item.rules.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.t.name}</Text>
                  <Text style={styles.meta}>
                    {item.t.format === 'league' ? 'League' : 'Knockout'} · {item.t.teamIds.length} teams · {formatDate(item.t.startDate)}
                  </Text>
                </View>
                <ChevronRight color={colors.textSecondary} size={18} />
              </View>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { flex: progress }]} />
                <View style={{ flex: 1 - progress }} />
              </View>
              <View style={styles.bottom}>
                <Text style={styles.progressText}>
                  {item.finished}/{item.total} games played
                </Text>
                {item.live ? <Text style={styles.live}>● LIVE</Text> : null}
              </View>

              {item.champion ? (
                <Text style={styles.champion}>Champion: {item.champion.name}</Text>
              ) : item.leader ? (
                <Text style={styles.leader}>Leader: {item.leader.name}</Text>
              ) : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            emoji="🏆"
            title="No tournaments yet"
            text="Create a league with an automatic table or a knockout cup with a bracket. Fixtures are generated for you."
            actionLabel="Create tournament"
            onAction={() => navigation.navigate('AddEditTournament')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 120,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  progressBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface2,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    backgroundColor: colors.primary,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  live: {
    color: colors.live,
    fontSize: 12,
    fontWeight: '800',
  },
  champion: {
    color: colors.warning,
    fontWeight: '800',
    marginTop: 10,
  },
  leader: {
    color: colors.primary,
    fontWeight: '700',
    marginTop: 10,
  },
});

export default TournamentsScreen;
