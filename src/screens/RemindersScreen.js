import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, BellOff } from 'lucide-react-native';

import colors from '../utils/colors';
import { formatDateTime, relativeTime, withAlpha } from '../utils/helpers';
import { getSideName } from '../utils/gameLogic';
import { sportEmoji } from '../data/sports';
import { getRules } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';

const RemindersScreen = ({ navigation }) => {
  const { eventReminders, removeEventReminder, games, teams, customSports, updateGame, settings } = useApp();
  const now = Date.now();

  const eventItems = eventReminders.filter((r) => r.timestamp > now).sort((a, b) => a.timestamp - b.timestamp);
  const gameItems = games
    .filter((g) => g.remind && g.status === 'scheduled' && new Date(g.date).getTime() > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const empty = !eventItems.length && !gameItems.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Reminders" subtitle={`${settings.reminderMinutes} min before start`} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {!settings.notificationsEnabled ? (
          <View style={styles.warning}>
            <BellOff color={colors.warning} size={20} />
            <Text style={styles.warningText}>Notifications are turned off. Reminders won't fire.</Text>
            <PrimaryButton title="Settings" small variant="secondary" onPress={() => navigation.navigate('Settings')} />
          </View>
        ) : null}

        {empty ? (
          <EmptyState
            emoji="🔔"
            title="No reminders"
            text={'Tap "Remind me" on any upcoming match or turn on reminders for your own games.'}
          />
        ) : null}

        {eventItems.length ? (
          <>
            <SectionHeader title="Matches" />
            {eventItems.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.row}
                onPress={() => navigation.navigate('EventDetail', { event: r.event })}
              >
                <Text style={styles.emoji}>{sportEmoji(r.sport)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{r.title}</Text>
                  <Text style={styles.meta}>
                    {formatDateTime(r.timestamp)} · {relativeTime(r.timestamp)}
                  </Text>
                  {r.league ? <Text style={styles.league}>{r.league}</Text> : null}
                </View>
                <TouchableOpacity hitSlop={10} onPress={() => removeEventReminder(r.id)}>
                  <Trash2 color={colors.textMuted} size={18} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        {gameItems.length ? (
          <>
            <SectionHeader title="My games" />
            {gameItems.map((g) => (
              <TouchableOpacity key={g.id} style={styles.row} onPress={() => navigation.navigate('LiveGame', { gameId: g.id })}>
                <Text style={styles.emoji}>{getRules(g.sport, customSports).emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    {getSideName(g, 'home', teams)} vs {getSideName(g, 'away', teams)}
                  </Text>
                  <Text style={styles.meta}>
                    {formatDateTime(g.date)} · {relativeTime(g.date)}
                  </Text>
                </View>
                <TouchableOpacity hitSlop={10} onPress={() => updateGame(g.id, { remind: false })}>
                  <Trash2 color={colors.textMuted} size={18} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        ) : null}
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
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: withAlpha(colors.warning, 0.12),
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
  },
  row: {
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
  emoji: {
    fontSize: 24,
  },
  title: {
    color: colors.text,
    fontWeight: '800',
  },
  meta: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  league: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default RemindersScreen;
