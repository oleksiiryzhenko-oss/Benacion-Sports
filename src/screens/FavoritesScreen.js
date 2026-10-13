import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import colors from '../utils/colors';
import { sportEmoji } from '../data/sports';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../components/ScreenHeader';
import Segmented from '../components/Segmented';
import EventCard from '../components/EventCard';
import TeamBadge from '../components/TeamBadge';
import EmptyState from '../components/EmptyState';

const FavoritesScreen = ({ navigation }) => {
  const { favorites, toggleFavorite } = useApp();
  const [tab, setTab] = useState('teams');

  const list = favorites[tab] || [];

  const renderItem = (item) => {
    if (tab === 'events') {
      return (
        <View key={item.id}>
          <EventCard event={item} onPress={() => navigation.navigate('EventDetail', { event: item })} />
        </View>
      );
    }
    const isTeam = tab === 'teams';
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.row}
        onPress={() =>
          isTeam
            ? navigation.navigate('TeamDetail', { teamId: item.id, teamName: item.name })
            : navigation.navigate('League', { leagueId: item.id, leagueName: item.name })
        }
      >
        <TeamBadge uri={item.badge} name={item.name} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {sportEmoji(item.sport)} {isTeam ? item.league || item.sport : item.sport}
          </Text>
        </View>
        <TouchableOpacity hitSlop={10} onPress={() => toggleFavorite(tab, item)}>
          <X color={colors.textMuted} size={18} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Favorites" onBack={() => navigation.goBack()} />
      <Segmented
        options={[
          { value: 'teams', label: 'Teams', count: favorites.teams.length },
          { value: 'events', label: 'Matches', count: favorites.events.length },
          { value: 'leagues', label: 'Leagues', count: favorites.leagues.length },
        ]}
        value={tab}
        onChange={setTab}
        style={{ marginBottom: 14 }}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {list.length ? (
          list.map(renderItem)
        ) : (
          <EmptyState
            emoji="⭐"
            title="Nothing saved yet"
            text="Tap the star on any team, match or league to keep it here."
            actionLabel="Search teams"
            onAction={() => navigation.navigate('Search')}
          />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
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

export default FavoritesScreen;
