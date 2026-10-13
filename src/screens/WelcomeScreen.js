import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronRight, Check } from 'lucide-react-native';

import colors from '../utils/colors';
import { withAlpha } from '../utils/helpers';
import sports from '../data/sports';
import { useApp } from '../context/AppContext';
import PrimaryButton from '../components/PrimaryButton';

const slides = [
  {
    emoji: '📰',
    title: 'All Sports News\nIn One Place',
    description: 'Fresh results, previews and live scores from football, basketball, hockey, F1 and more.',
    color: colors.primary,
  },
  {
    emoji: '🗓️',
    title: 'Find Every Match\nThat Matters',
    description: 'Browse sports and leagues, check fixtures, tables and teams. Get reminded before kick-off.',
    color: colors.info,
  },
  {
    emoji: '⏱️',
    title: 'Run Your Own\nGames Live',
    description: 'Create teams, start a game and record every goal, point and foul in real time. Build tournaments with automatic tables.',
    color: colors.accent,
  },
];

const WelcomeScreen = ({ navigation }) => {
  const { settings, updateSettings, toggleFollowSport } = useApp();
  const [step, setStep] = useState(0);
  const isPicker = step === slides.length;

  const finish = () => {
    updateSettings({ onboarded: true });
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('Home');
  };

  const handleNext = () => {
    if (isPicker) return finish();
    setStep((s) => s + 1);
  };

  if (isPicker) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Pick your sports</Text>
          <Text style={styles.pickerSub}>We'll build your news feed around them. You can change this anytime.</Text>
        </View>
        <ScrollView contentContainerStyle={styles.grid}>
          {sports.map((s) => {
            const active = settings.followedSports.includes(s.name);
            return (
              <TouchableOpacity
                key={s.name}
                style={[styles.sportTile, active && { borderColor: s.color, backgroundColor: withAlpha(s.color, 0.12) }]}
                onPress={() => toggleFollowSport(s.name)}
                activeOpacity={0.85}
              >
                {active ? (
                  <View style={[styles.check, { backgroundColor: s.color }]}>
                    <Check color={colors.background} size={14} strokeWidth={3} />
                  </View>
                ) : null}
                <Text style={styles.sportEmoji}>{s.emoji}</Text>
                <Text style={styles.sportName}>{s.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.bottom}>
          <PrimaryButton
            title={settings.followedSports.length ? `Continue with ${settings.followedSports.length}` : 'Select at least one'}
            onPress={finish}
            disabled={!settings.followedSports.length}
          />
        </View>
      </SafeAreaView>
    );
  }

  const current = slides[step];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && { backgroundColor: current.color, width: 24 }]} />
          ))}
        </View>
        <TouchableOpacity onPress={() => setStep(slides.length)} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <LinearGradient
          colors={[withAlpha(current.color, 0.35), withAlpha(current.color, 0.02)]}
          style={[styles.iconCircle, { borderColor: withAlpha(current.color, 0.5) }]}
        >
          <Text style={styles.emoji}>{current.emoji}</Text>
        </LinearGradient>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.description}</Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: current.color }]} activeOpacity={0.9} onPress={handleNext}>
          <Text style={styles.nextText}>{step === slides.length - 1 ? 'Choose sports' : 'Next'}</Text>
          <ChevronRight color={colors.onPrimary} size={22} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  skip: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 38,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 23,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
  nextBtn: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextText: {
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  pickerHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  pickerTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  pickerSub: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 21,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
  },
  sportTile: {
    width: '30.5%',
    aspectRatio: 0.95,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportEmoji: {
    fontSize: 36,
  },
  sportName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
