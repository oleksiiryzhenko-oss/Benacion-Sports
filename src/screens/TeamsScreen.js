import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ChevronRight } from 'lucide-react-native';

import colors from '../utils/colors';
import { computeTeamStats } from '../utils/gameLogic';
import { getAllGameSports } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import TeamBadge from '../components/TeamBadge';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import { FormBadges } from '../components/StatTile';

const TeamsScreen = ({ navigation }) => {
  const { teams, games, customSports } = useApp();
  const [sport, setSport] = useState('all');
  const sports = getAllGameSports(customSports).filter((s) => teams.some((t) => t.sport === s.key));

  const list = useMemo(
    () =>
      teams
        .filter((t) => sport === 'all' || t.sport === sport)
        .map((t) => ({ team: t, stats: computeTeamStats(t.id, games) }))
        .sort((a, b) => a.team.name.localeCompare(b.team.name)),
    [teams, games, sport]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="My Teams"
        subtitle={`${teams.length} teams`}
        onBack={() => navigation.goBack()}
        right={<HeaderButton icon={Plus} active onPress={() => navigation.navigate('AddEditTeam')} />}
      />

      {sports.length > 1 ? (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label="All" active={sport === 'all'} onPress={() => setSport('all')} />
            {sports.map((s) => (
              <Chip key={s.key} label={s.name} emoji={s.emoji} active={sport === s.key} onPress={() => setSport(s.key)} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <FlatList
        data={list}
        keyExtractor={(i) => i.team.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: { team, stats } }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('MyTeam', { teamId: team.id })} activeOpacity={0.85}>
            <TeamBadge uri={team.logo} name={team.name} color={team.color} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{team.name}</Text>
              <Text style={styles.meta}>
                {stats.played ? `${stats.won}W ${stats.drawn}D ${stats.lost}L · ` : ''}
                {team.players?.length || 0} players
                {team.city ? ` · ${team.city}` : ''}
              </Text>
              {stats.form.length ? (
                <View style={{ marginTop: 6 }}>
                  <FormBadges form={stats.form} />
                </View>
              ) : null}
            </View>
            <ChevronRight color={colors.textSecondary} size={18} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="👥"
            title="No teams yet"
            text="Create teams with logo, colors, roster and details — then use them in games and tournaments."
            actionLabel="Create team"
            onAction={() => navigation.navigate('AddEditTeam')}
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
  chips: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 12,
  },
  list: {
    paddingBottom: 60,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});

export default TeamsScreen;
