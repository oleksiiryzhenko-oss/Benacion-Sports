import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2 } from 'lucide-react-native';

import colors from '../utils/colors';
import { BUILT_IN_GAME_SPORTS } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import FormInput, { FieldLabel } from '../components/FormInput';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import SheetModal from '../components/SheetModal';

const EMOJIS = ['🏓', '🏸', '🎳', '⛳', '🥏', '🎯', '🏑', '🥍', '🤺', '🏊', '🚴', '♟️', '🎮', '🏆', '🛹', '🏅'];
const PERIOD_NAMES = ['Period', 'Half', 'Quarter', 'Set', 'Round', 'Game', 'Inning'];
const SCORING = [1, 2, 3, 5, 6, 10];

const emptyForm = { name: '', emoji: '🏓', periods: '3', periodName: 'Set', periodMinutes: '15', allowDraw: false, scoring: [1] };

const CustomSportsScreen = ({ navigation, route }) => {
  const { customSports, addCustomSport, deleteCustomSport, games, teams } = useApp();
  const [open, setOpen] = useState(!!route.params?.openForm);
  const [form, setForm] = useState(emptyForm);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleScoring = (p) =>
    setForm((f) => {
      const next = f.scoring.includes(p) ? f.scoring.filter((x) => x !== p) : [...f.scoring, p].sort((a, b) => a - b);
      return { ...f, scoring: next.length ? next : f.scoring };
    });

  const save = () => {
    if (!form.name.trim()) {
      Alert.alert('Name required', 'What is the sport called?');
      return;
    }
    addCustomSport({
      name: form.name.trim(),
      emoji: form.emoji || '🏅',
      periods: Math.max(1, Number(form.periods) || 1),
      periodName: form.periodName,
      periodMinutes: Math.max(1, Number(form.periodMinutes) || 10),
      allowDraw: form.allowDraw,
      scoring: form.scoring,
    });
    setForm(emptyForm);
    setOpen(false);
  };

  const remove = (s) => {
    const used = games.some((g) => g.sport === s.key) || teams.some((t) => t.sport === s.key);
    Alert.alert(
      `Delete ${s.name}?`,
      used ? 'Games and teams using this sport will fall back to generic rules.' : undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCustomSport(s.key) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="My Sports"
        subtitle="Rules for your own games"
        onBack={() => navigation.goBack()}
        right={<HeaderButton icon={Plus} active onPress={() => setOpen(true)} />}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <SectionHeader title="Custom sports" style={{ marginTop: 4 }} />
        {customSports.length ? (
          customSports.map((s) => (
            <View key={s.key} style={styles.row}>
              <Text style={styles.emoji}>{s.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.meta}>
                  {s.periods} × {s.periodName} · scoring {s.scoring.map((p) => `+${p}`).join(' ')}
                  {s.allowDraw ? ' · draws' : ''}
                </Text>
              </View>
              <TouchableOpacity hitSlop={10} onPress={() => remove(s)}>
                <Trash2 color={colors.textMuted} size={18} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <TouchableOpacity style={styles.addCard} onPress={() => setOpen(true)}>
            <Plus color={colors.primary} size={22} />
            <Text style={styles.addText}>Add a sport you play</Text>
          </TouchableOpacity>
        )}

        <SectionHeader title="Built-in" />
        {BUILT_IN_GAME_SPORTS.map((s) => (
          <View key={s.key} style={styles.row}>
            <Text style={styles.emoji}>{s.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{s.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {s.periods} × {s.periodName} · {s.actions.map((a) => a.label).join(', ')}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <SheetModal visible={open} onClose={() => setOpen(false)} title="New sport">
        <FormInput label="Name" placeholder="e.g. Table tennis" value={form.name} onChangeText={(v) => set('name', v)} />

        <FieldLabel>Icon</FieldLabel>
        <View style={styles.emojiGrid}>
          {EMOJIS.map((e) => (
            <TouchableOpacity key={e} style={[styles.emojiBtn, form.emoji === e && styles.emojiActive]} onPress={() => set('emoji', e)}>
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FieldLabel>Period name</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {PERIOD_NAMES.map((p) => (
            <Chip key={p} label={p} active={form.periodName === p} onPress={() => set('periodName', p)} />
          ))}
        </ScrollView>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <FieldLabel>{form.periodName}s</FieldLabel>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(form.periods)}
              onChangeText={(v) => set('periods', v.replace(/\D/g, ''))}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>Minutes each</FieldLabel>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(form.periodMinutes)}
              onChangeText={(v) => set('periodMinutes', v.replace(/\D/g, ''))}
            />
          </View>
        </View>

        <FieldLabel>Scoring buttons</FieldLabel>
        <View style={[styles.chips, { marginBottom: 16 }]}>
          {SCORING.map((p) => (
            <Chip key={p} label={`+${p}`} active={form.scoring.includes(p)} onPress={() => toggleScoring(p)} />
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.name}>Draws allowed</Text>
          <Switch
            value={form.allowDraw}
            onValueChange={(v) => set('allowDraw', v)}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.text}
          />
        </View>

        <PrimaryButton title="Add sport" onPress={save} style={{ marginTop: 16 }} />
      </SheetModal>
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
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 26,
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  addText: {
    color: colors.primary,
    fontWeight: '800',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emojiActive: {
    borderColor: colors.primary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  row2: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 16,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
  },
});

export default CustomSportsScreen;
