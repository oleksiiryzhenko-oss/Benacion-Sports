import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ChevronRight } from 'lucide-react-native';

import colors from '../utils/colors';
import { dayKey, formatShortDate } from '../utils/helpers';
import { getSport } from '../data/sports';
import { getEventsByDay } from '../api/sportsApi';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import DateStrip from '../components/DateStrip';
import EventCard from '../components/EventCard';
import LeagueBadge from '../components/LeagueBadge';
import EmptyState from '../components/EmptyState';
import { LoadingView, ErrorView } from '../components/LoadingView';

const SportDetailScreen = ({ navigation, route }) => {
  const { sportName } = route.params;
  const sport = getSport(sportName);
  const { settings, toggleFollowSport } = useApp();
  const followed = settings.followedSports.includes(sportName);

  const [date, setDate] = useState(dayKey(new Date()));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (force = false) => {
      try {
        setError(false);
        const list = await getEventsByDay(date, sportName, { force });
        setEvents(list);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [date, sportName]
  );

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={`${sport?.emoji || ''} ${sport?.title || sportName}`}
        subtitle={followed ? 'Following' : 'Tap ♥ to follow'}
        onBack={() => navigation.goBack()}
        right={
          <HeaderButton icon={Heart} active={followed} onPress={() => toggleFollowSport(sportName)} />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(true);
            }}
            tintColor={colors.primary}
          />
        }
      >
        <SectionHeader title="Leagues" style={{ marginTop: 4 }} />
        {(sport?.leagues || []).map((l) => (
          <TouchableOpacity
            key={l.id}
            style={styles.league}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('League', { leagueId: l.id, leagueName: l.name })}
          >
            <LeagueBadge leagueId={l.id} name={l.name} size={40} color={sport?.color} />
            <View style={{ flex: 1 }}>
              <Text style={styles.leagueName}>{l.name}</Text>
              <Text style={styles.leagueMeta}>{l.country}</Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={18} />
          </TouchableOpacity>
        ))}

        <SectionHeader title="Matches" />
        <DateStrip value={date} onChange={setDate} />
        <Text style={styles.dayLabel}>{formatShortDate(new Date(`${date}T12:00:00`))}</Text>

        {loading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView onRetry={() => { setLoading(true); load(true); }} />
        ) : events.length ? (
          events.map((e) => (
            <EventCard key={e.id} event={e} onPress={() => navigation.navigate('EventDetail', { event: e })} />
          ))
        ) : (
          <EmptyState emoji="🗓️" title="No matches this day" text="Try another date or open a league to see its fixtures." />
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
  league: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leagueName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  leagueMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  dayLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
});

export default SportDetailScreen;
