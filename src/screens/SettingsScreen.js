import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';

import colors from '../utils/colors';
import { clearApiCache } from '../api/sportsApi';
import { initNotifications } from '../utils/notifeeNotifications';
import { PRIVACY_POLICY_URL } from '../utils/config';
import { useApp } from '../context/AppContext';
import ScreenHeader from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import Chip from '../components/Chip';

const { version } = require('../../package.json');

const Row = ({ title, sub, right, onPress, danger }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.85}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.rowTitle, danger && { color: colors.danger }]}>{title}</Text>
      {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
    </View>
    {right !== undefined ? right : <ChevronRight color={colors.textSecondary} size={18} />}
  </TouchableOpacity>
);

const SettingsScreen = ({ navigation }) => {
  const { settings, updateSettings, resetAllData } = useApp();

  const toggleNotifications = async (value) => {
    if (value) {
      const granted = await initNotifications();
      if (!granted) {
        Alert.alert('Permission needed', 'Allow notifications for Benacion Sports in system settings.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ]);
        return;
      }
    }
    updateSettings({ notificationsEnabled: value });
  };

  const openPrivacyPolicy = () => {
    if (PRIVACY_POLICY_URL) Linking.openURL(PRIVACY_POLICY_URL);
    else Alert.alert('Privacy Policy', 'Our Privacy Policy will be available here soon.');
  };

  const clearCache = () =>
    Alert.alert('Clear cache?', 'Downloaded matches and news will be loaded again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: async () => {
          await clearApiCache();
          Alert.alert('Done', 'Cache cleared.');
        },
      },
    ]);

  const reset = () =>
    Alert.alert('Reset all data?', 'Teams, games, tournaments, favorites and quiz stats will be deleted. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAllData },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <SectionHeader title="Notifications" style={{ marginTop: 4 }} />
        <Row
          title="Match reminders"
          sub="Favorite matches and your own games"
          right={
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.text}
            />
          }
        />
        <Text style={styles.label}>Remind me before start</Text>
        <View style={styles.chips}>
          {[10, 15, 30, 60, 120].map((m) => (
            <Chip
              key={m}
              label={m >= 60 ? `${m / 60} h` : `${m} min`}
              active={settings.reminderMinutes === m}
              onPress={() => updateSettings({ reminderMinutes: m })}
            />
          ))}
        </View>

        <SectionHeader title="Content" />
        <Row title="Followed sports" sub={settings.followedSports.join(', ') || 'None'} onPress={() => navigation.navigate('Home', { screen: 'SportsTab' })} />
        <Row title="Show onboarding again" onPress={() => navigation.navigate('Welcome')} />
        <Row title="Clear cached data" sub="Re-download news and matches" onPress={clearCache} />

        <SectionHeader title="Danger zone" />
        <Row title="Reset all data" danger onPress={reset} right={null} />

        <SectionHeader title="About" />
        <Row title="Version" right={<Text style={styles.value}>{version}</Text>} />
        <Row title="Privacy Policy" onPress={openPrivacyPolicy} />
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
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  rowSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  value: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
});

export default SettingsScreen;
