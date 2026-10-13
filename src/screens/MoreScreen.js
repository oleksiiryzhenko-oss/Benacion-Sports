import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, ChartColumn, Brain, Bell, Users, Settings, Shapes, ChevronRight } from 'lucide-react-native';

import colors from '../utils/colors';
import { withAlpha } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import { useRemoteConfig, RC_KEYS } from '../utils/remoteConfig';
import ScreenHeader from '../components/ScreenHeader';

const MoreScreen = ({ navigation }) => {
  const { games, teams, tournaments, favorites, eventReminders, quizStats, customSports } = useApp();
  const remote = useRemoteConfig();
  const quizEnabled = remote.getBoolean(RC_KEYS.QUIZ_ENABLED);
  const finished = games.filter((g) => g.status === 'finished').length;
  const favCount = favorites.teams.length + favorites.events.length + favorites.leagues.length;
  const upcomingReminders =
    eventReminders.filter((r) => r.timestamp > Date.now()).length +
    games.filter((g) => g.remind && g.status === 'scheduled' && new Date(g.date) > new Date()).length;

  const items = [
    { icon: Star, title: 'Favorites', sub: `${favCount} saved`, color: colors.warning, route: 'Favorites' },
    { icon: ChartColumn, title: 'Statistics', sub: `${finished} games played`, color: colors.info, route: 'Stats' },
    { icon: Brain, title: 'Sports Quiz', sub: quizStats.best ? `Best score ${quizStats.best}` : 'Test your knowledge', color: colors.primary, route: 'Quiz' },
    { icon: Bell, title: 'Reminders', sub: `${upcomingReminders} upcoming`, color: colors.accent, route: 'Reminders' },
    { icon: Users, title: 'My Teams', sub: `${teams.length} teams`, color: colors.success, route: 'Teams' },
    { icon: Shapes, title: 'My Sports', sub: `${customSports.length} custom sports`, color: colors.info, route: 'CustomSports' },
    { icon: Settings, title: 'Settings', sub: 'Notifications, data, about', color: colors.text, route: 'Settings' },
  ].filter((it) => it.route !== 'Quiz' || quizEnabled);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="More" large />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profile}>
          <Image source={require('../../assets/logo-rounded.png')} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>Benacion Sports</Text>
            <Text style={styles.brandSub}>
              {games.length} games · {teams.length} teams · {tournaments.length} tournaments
            </Text>
          </View>
        </View>

        {items.map((it) => (
          <TouchableOpacity key={it.route} style={styles.row} onPress={() => navigation.navigate(it.route)} activeOpacity={0.85}>
            <View style={[styles.icon, { backgroundColor: withAlpha(it.color, 0.15) }]}>
              <it.icon color={it.color} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{it.title}</Text>
              <Text style={styles.sub}>{it.sub}</Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={18} />
          </TouchableOpacity>
        ))}
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
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    width: 56,
    height: 56,
  },
  brand: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 18,
  },
  brandSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});

export default MoreScreen;
