import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, ChevronRight, Megaphone } from 'lucide-react-native';

import colors from '../utils/colors';
import { formatDate, withAlpha } from '../utils/helpers';
import sports, { getSport } from '../data/sports';
import { getNewsFeed } from '../api/sportsApi';
import { useRemoteConfig, RC_KEYS } from '../utils/remoteConfig';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import Chip from '../components/Chip';
import NewsCard from '../components/NewsCard';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import LiveDot from '../components/LiveDot';
import { LoadingView, ErrorView } from '../components/LoadingView';

const NewsScreen = ({ navigation }) => {
  const { settings, liveGames, eventReminders } = useApp();
  const followed = settings.followedSports;
  const remote = useRemoteConfig();
  const bannerText = remote.getString(RC_KEYS.NEWS_BANNER_TEXT).trim();

  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(
    async (force = false) => {
      if (!followed.length) {
        setFeed({ live: [], results: [], upcoming: [] });
        setLoading(false);
        return;
      }
      try {
        setError(false);
        const data = await getNewsFeed(followed, sports, { force });
        setFeed(data);
      } catch (e) {
        console.log('Feed error:', e?.message);
        setError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [followed]
  );

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (filter !== 'all' && !followed.includes(filter)) setFilter('all');
  }, [followed, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const filtered = useMemo(() => {
    if (!feed) return { live: [], results: [], upcoming: [] };
    const f = (list) => (filter === 'all' ? list : list.filter((e) => e.sport === filter));
    return { live: f(feed.live), results: f(feed.results), upcoming: f(feed.upcoming) };
  }, [feed, filter]);

  const topStories = filtered.results.filter((e) => e.thumb).slice(0, 6);
  const topIds = new Set(topStories.map((e) => e.id));
  const moreResults = filtered.results.filter((e) => !topIds.has(e.id));

  const openEvent = (event) => navigation.navigate('EventDetail', { event });

  const renderBody = () => {
    if (loading) return <LoadingView text="Loading the latest news…" style={{ marginTop: 60 }} />;
    if (error) return <ErrorView onRetry={() => { setLoading(true); load(true); }} style={{ marginTop: 60 }} />;
    if (!followed.length) {
      return (
        <EmptyState
          emoji="🏟️"
          title="No sports followed"
          text="Follow a few sports to build your personal news feed."
          actionLabel="Choose sports"
          onAction={() => navigation.navigate('SportsTab')}
        />
      );
    }
    if (!filtered.results.length && !filtered.upcoming.length && !filtered.live.length) {
      return <EmptyState emoji="📭" title="Nothing here yet" text="Pull down to refresh or follow more sports." />;
    }

    return (
      <>
        {filtered.live.length ? (
          <>
            <SectionHeader title="🔴 Live now" />
            {filtered.live.map((e) => (
              <EventCard key={e.id} event={e} onPress={() => openEvent(e)} />
            ))}
          </>
        ) : null}

        {topStories.length ? (
          <>
            <SectionHeader title="Top stories" />
            <FlatList
              horizontal
              data={topStories}
              keyExtractor={(e) => e.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => <NewsCard compact event={item} onPress={() => openEvent(item)} />}
            />
          </>
        ) : null}

        {filtered.upcoming.length ? (
          <>
            <SectionHeader
              title="Coming up"
              actionLabel={eventReminders.length ? `${eventReminders.length} reminders` : null}
              onAction={() => navigation.navigate('Reminders')}
            />
            {filtered.upcoming.slice(0, 8).map((e) => (
              <EventCard key={e.id} event={e} onPress={() => openEvent(e)} />
            ))}
          </>
        ) : null}

        {moreResults.length ? (
          <>
            <SectionHeader title="Latest results" />
            {moreResults.slice(0, 12).map((e) =>
              e.thumb ? (
                <NewsCard key={e.id} event={e} onPress={() => openEvent(e)} />
              ) : (
                <EventCard key={e.id} event={e} onPress={() => openEvent(e)} />
              )
            )}
          </>
        ) : null}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Benacion Sports"
        subtitle={formatDate(new Date())}
        large
        right={
          <>
            <HeaderButton icon={Search} onPress={() => navigation.navigate('Search')} />
            <HeaderButton icon={Bell} onPress={() => navigation.navigate('Reminders')} />
          </>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          {followed.map((name) => {
            const s = getSport(name);
            return (
              <Chip
                key={name}
                label={s?.title || name}
                emoji={s?.emoji}
                color={s?.color}
                active={filter === name}
                onPress={() => setFilter(name)}
              />
            );
          })}
        </ScrollView>

        {bannerText ? (
          <View style={styles.promoBanner}>
            <Megaphone color={colors.onPrimary} size={18} />
            <Text style={styles.promoText}>{bannerText}</Text>
          </View>
        ) : null}

        {liveGames.length ? (
          <TouchableOpacity style={styles.liveBanner} onPress={() => navigation.navigate('GamesTab')} activeOpacity={0.85}>
            <LiveDot />
            <Text style={styles.liveText}>
              {liveGames.length === 1 ? 'Your game is live' : `${liveGames.length} of your games are live`}
            </Text>
            <ChevronRight color={colors.text} size={18} />
          </TouchableOpacity>
        ) : null}

        {renderBody()}
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
    paddingBottom: 120,
  },
  chips: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  promoText: {
    color: colors.onPrimary,
    fontWeight: '700',
    flex: 1,
    lineHeight: 20,
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: withAlpha(colors.live, 0.14),
    borderWidth: 1,
    borderColor: colors.live,
  },
  liveText: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
});

export default NewsScreen;
