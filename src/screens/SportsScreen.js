import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Heart, Plus, ChevronRight } from 'lucide-react-native';

import colors from '../utils/colors';
import { withAlpha } from '../utils/helpers';
import sports from '../data/sports';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';

const SportsScreen = ({ navigation }) => {
  const { settings, toggleFollowSport, customSports } = useApp();
  const followed = settings.followedSports;

  const sorted = [...sports].sort(
    (a, b) => Number(followed.includes(b.name)) - Number(followed.includes(a.name))
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Sports"
        subtitle={`Following ${followed.length} of ${sports.length}`}
        large
        right={<HeaderButton icon={Search} onPress={() => navigation.navigate('Search')} />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          {sorted.map((s) => {
            const active = followed.includes(s.name);
            return (
              <TouchableOpacity
                key={s.name}
                style={[styles.card, { borderColor: active ? s.color : colors.border }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('SportDetail', { sportName: s.name })}
              >
                <View style={[styles.glow, { backgroundColor: withAlpha(s.color, active ? 0.18 : 0.06) }]} />
                <View style={styles.cardTop}>
                  <Text style={styles.emoji}>{s.emoji}</Text>
                  <TouchableOpacity
                    hitSlop={10}
                    onPress={() => toggleFollowSport(s.name)}
                    style={[styles.follow, active && { backgroundColor: s.color }]}
                  >
                    <Heart size={16} color={active ? colors.background : colors.textSecondary} fill={active ? colors.background : 'transparent'} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.name}>{s.title}</Text>
                <Text style={styles.meta}>
                  {s.leagues.length} {s.leagues.length === 1 ? 'league' : 'leagues'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionHeader
          title="Your own sports"
          actionLabel="Manage"
          onAction={() => navigation.navigate('CustomSports')}
        />
        <Text style={styles.hint}>Add any sport you play — table tennis, padel, esports — and track your games live.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.customRow}>
          <TouchableOpacity style={styles.addCustom} onPress={() => navigation.navigate('CustomSports', { openForm: true })}>
            <Plus color={colors.onPrimary} size={20} />
            <Text style={styles.addCustomText}>Add sport</Text>
          </TouchableOpacity>
          {customSports.map((s) => (
            <TouchableOpacity key={s.key} style={styles.customChip} onPress={() => navigation.navigate('CustomSports')}>
              <Text style={styles.customEmoji}>{s.emoji}</Text>
              <Text style={styles.customName}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Favorites')}>
          <Text style={styles.linkText}>⭐ Favorite teams & matches</Text>
          <ChevronRight color={colors.textSecondary} size={18} />
        </TouchableOpacity>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: '47.8%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 38,
  },
  follow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginTop: 14,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: 16,
    marginTop: -4,
    marginBottom: 12,
    lineHeight: 18,
  },
  customRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  addCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addCustomText: {
    color: colors.onPrimary,
    fontWeight: '800',
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  customEmoji: {
    fontSize: 18,
  },
  customName: {
    color: colors.text,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default SportsScreen;
