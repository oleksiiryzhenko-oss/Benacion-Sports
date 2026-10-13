import React, { useMemo, useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users } from 'lucide-react-native';

import colors from '../utils/colors';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import Segmented from '../components/Segmented';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';

const GamesScreen = ({ navigation }) => {
  const { games, liveGames, teams } = useApp();
  const [tab, setTab] = useState(liveGames.length ? 'live' : 'upcoming');

  useEffect(() => {
    if (liveGames.length && tab === 'upcoming') setTab('live');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveGames.length]);

  const lists = useMemo(() => {
    const byDate = (a, b) => new Date(a.date) - new Date(b.date);
    return {
      live: games.filter((g) => g.status === 'live').sort(byDate),
      upcoming: games.filter((g) => g.status === 'scheduled').sort(byDate),
      finished: games
        .filter((g) => g.status === 'finished')
        .sort((a, b) => new Date(b.finishedAt || b.date) - new Date(a.finishedAt || a.date)),
    };
  }, [games]);

  const data = lists[tab];

  const empty = {
    live: { emoji: '⏱️', title: 'No live games', text: 'Start one of your upcoming games or create a new one to record the score in real time.' },
    upcoming: { emoji: '🗓️', title: 'No upcoming games', text: 'Create a game, add the teams and details — then go live when it starts.' },
    finished: { emoji: '🏁', title: 'No finished games yet', text: 'Your completed games and their full timelines will appear here.' },
  }[tab];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="My Games"
        subtitle={`${games.length} games · ${teams.length} teams`}
        large
        right={
          <>
            <HeaderButton icon={Users} onPress={() => navigation.navigate('Teams')} />
            <HeaderButton icon={Plus} active onPress={() => navigation.navigate('AddEditGame')} />
          </>
        }
      />

      <Segmented
        options={[
          { value: 'live', label: 'Live', count: lists.live.length },
          { value: 'upcoming', label: 'Upcoming', count: lists.upcoming.length },
          { value: 'finished', label: 'Finished', count: lists.finished.length },
        ]}
        value={tab}
        onChange={setTab}
        style={{ marginBottom: 14 }}
      />

      <FlatList
        data={data}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <GameCard game={item} onPress={() => navigation.navigate('LiveGame', { gameId: item.id })} />
        )}
        ListEmptyComponent={
          <EmptyState
            {...empty}
            actionLabel="Create a game"
            onAction={() => navigation.navigate('AddEditGame')}
          />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEditGame')} activeOpacity={0.9}>
        <Plus color={colors.onPrimary} size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 140,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 110,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});

export default GamesScreen;
