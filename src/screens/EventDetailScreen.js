import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Linking, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Star, Bell, Share2, Youtube, Activity, MapPin, CalendarDays, Trophy, Users } from 'lucide-react-native';

import colors from '../utils/colors';
import { eventHeadline, eventStory, formatDate, formatTime, withAlpha } from '../utils/helpers';
import { getEvent } from '../api/sportsApi';
import { apiSportToGameKey } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import TeamBadge from '../components/TeamBadge';
import LiveDot from '../components/LiveDot';
import PrimaryButton from '../components/PrimaryButton';

const InfoRow = ({ icon: Icon, label, value }) =>
  value ? (
    <View style={styles.infoRow}>
      <Icon color={colors.textSecondary} size={18} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  ) : null;

const EventDetailScreen = ({ navigation, route }) => {
  const [event, setEvent] = useState(route.params.event);
  const { isFavorite, toggleFavorite, hasEventReminder, toggleEventReminder, addGame, settings } = useApp();

  // Refresh for the latest score/status
  useEffect(() => {
    let alive = true;
    getEvent(event.id)
      .then((fresh) => alive && fresh && setEvent(fresh))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [event.id]);

  const fav = isFavorite('events', event.id);
  const reminder = hasEventReminder(event.id);
  const isUpcoming = !event.isFinished && !event.isLive && event.timestamp > Date.now();
  const showScore = (event.isFinished || event.isLive) && event.homeScore !== null;

  const onShare = () => {
    const text = event.isFinished
      ? `${event.home} ${event.homeScore}–${event.awayScore} ${event.away} · ${event.league}`
      : `${event.name} · ${formatDate(event.date)} ${formatTime(event.date)} · ${event.league}`;
    Share.share({ message: `${text}\n\nvia Benacion Sports` });
  };

  const onRemind = () => {
    toggleEventReminder(event);
    if (!reminder && !settings.notificationsEnabled) {
      Alert.alert('Notifications are off', 'Turn on notifications in Settings to receive match reminders.');
    }
  };

  const onTrack = () => {
    const id = addGame({
      sport: apiSportToGameKey(event.sport),
      homeName: event.home || event.name,
      awayName: event.away || 'Opponent',
      date: event.date || new Date().toISOString(),
      venue: event.venue || '',
      notes: `${event.league}${event.round ? ` · Round ${event.round}` : ''}`,
      source: { eventId: event.id, homeBadge: event.homeBadge, awayBadge: event.awayBadge },
    });
    navigation.navigate('LiveGame', { gameId: id });
  };

  const openTeam = (id, name) => id && navigation.navigate('TeamDetail', { teamId: id, teamName: name });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={event.league}
        subtitle={event.season ? `Season ${event.season}${event.round ? ` · Round ${event.round}` : ''}` : ''}
        onBack={() => navigation.goBack()}
        right={
          <>
            <HeaderButton icon={Share2} onPress={onShare} />
            <HeaderButton icon={Star} active={fav} onPress={() => toggleFavorite('events', event)} />
          </>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <ImageBackground
          source={event.thumb ? { uri: event.thumb } : undefined}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <LinearGradient colors={[withAlpha(colors.background, 0.3), withAlpha(colors.background, 0.85), colors.background]} style={styles.heroOverlay}>
            {event.isLive ? <LiveDot label={event.status || 'LIVE'} /> : null}
            {event.home && event.away ? (
              <View style={styles.scoreboard}>
                <TouchableOpacity style={styles.side} onPress={() => openTeam(event.homeId, event.home)}>
                  <TeamBadge uri={event.homeBadge} name={event.home} size={64} />
                  <Text style={styles.teamName} numberOfLines={2}>
                    {event.home}
                  </Text>
                </TouchableOpacity>
                <View style={styles.center}>
                  {showScore ? (
                    <Text style={[styles.score, event.isLive && { color: colors.live }]}>
                      {event.homeScore} – {event.awayScore}
                    </Text>
                  ) : (
                    <>
                      <Text style={styles.kickoff}>{formatTime(event.date)}</Text>
                      <Text style={styles.kickoffDate}>{formatDate(event.date)}</Text>
                    </>
                  )}
                  {event.isFinished ? <Text style={styles.status}>Full time</Text> : null}
                  {event.isCancelled ? <Text style={[styles.status, { color: colors.warning }]}>{event.status || 'Postponed'}</Text> : null}
                </View>
                <TouchableOpacity style={styles.side} onPress={() => openTeam(event.awayId, event.away)}>
                  <TeamBadge uri={event.awayBadge} name={event.away} size={64} />
                  <Text style={styles.teamName} numberOfLines={2}>
                    {event.away}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.eventName}>{event.name}</Text>
            )}
          </LinearGradient>
        </ImageBackground>

        <View style={styles.content}>
          <Text style={styles.headline}>{eventHeadline(event)}</Text>
          <Text style={styles.story}>{eventStory(event)}</Text>

          <View style={styles.actions}>
            {isUpcoming ? (
              <PrimaryButton
                title={reminder ? 'Reminder set' : 'Remind me'}
                icon={Bell}
                variant={reminder ? 'secondary' : 'primary'}
                onPress={onRemind}
                style={styles.actionBtn}
              />
            ) : null}
            {event.video ? (
              <PrimaryButton
                title="Highlights"
                icon={Youtube}
                variant="secondary"
                onPress={() => Linking.openURL(event.video)}
                style={styles.actionBtn}
              />
            ) : null}
          </View>

          <PrimaryButton
            title="Track this match live"
            icon={Activity}
            variant="ghost"
            onPress={onTrack}
            style={{ marginTop: 10 }}
          />
          <Text style={styles.trackHint}>
            Creates a game in "My Games" so you can record goals and events yourself while watching.
          </Text>

          <View style={styles.infoCard}>
            <InfoRow icon={Trophy} label="Competition" value={event.league} />
            <InfoRow icon={CalendarDays} label="Date" value={event.date ? `${formatDate(event.date)}, ${formatTime(event.date)}` : null} />
            <InfoRow icon={MapPin} label="Venue" value={[event.venue, event.city, event.country].filter(Boolean).join(', ')} />
            <InfoRow icon={Users} label="Attendance" value={event.spectators ? Number(event.spectators).toLocaleString() : null} />
          </View>
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
  hero: {
    minHeight: 240,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    borderRadius: 24,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 40,
    gap: 10,
  },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },
  center: {
    width: 110,
    alignItems: 'center',
  },
  score: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
  },
  kickoff: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  kickoffDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  status: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  eventName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  headline: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  story: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
  },
  trackHint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  infoLabel: {
    color: colors.textSecondary,
    width: 95,
  },
  infoValue: {
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});

export default EventDetailScreen;
