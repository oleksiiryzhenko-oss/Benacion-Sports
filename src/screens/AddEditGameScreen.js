import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Trash2 } from 'lucide-react-native';

import colors from '../utils/colors';
import { getAllGameSports } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import FormInput, { FieldLabel } from '../components/FormInput';
import Chip from '../components/Chip';
import TeamSelect from '../components/TeamSelect';
import DateTimeField from '../components/DateTimeField';
import PrimaryButton from '../components/PrimaryButton';

const AddEditGameScreen = ({ navigation, route }) => {
  const gameId = route.params?.gameId;
  const { games, teams, customSports, addGame, updateGame, deleteGame } = useApp();
  const existing = games.find((g) => g.id === gameId);

  const [sport, setSport] = useState(existing?.sport || 'football');
  const [home, setHome] = useState(
    existing ? { teamId: existing.homeTeamId, name: existing.homeName } : { teamId: null, name: '' }
  );
  const [away, setAway] = useState(
    existing ? { teamId: existing.awayTeamId, name: existing.awayName } : { teamId: null, name: '' }
  );
  const [date, setDate] = useState(existing ? new Date(existing.date) : new Date(Date.now() + 3600000));
  const [venue, setVenue] = useState(existing?.venue || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [remind, setRemind] = useState(existing?.remind ?? true);

  const sports = getAllGameSports(customSports);
  const hasHome = home.teamId || home.name?.trim();
  const hasAway = away.teamId || away.name?.trim();

  const save = () => {
    if (!hasHome || !hasAway) {
      Alert.alert('Teams required', 'Select or type both teams.');
      return;
    }
    if (home.teamId && home.teamId === away.teamId) {
      Alert.alert('Same team', 'Home and away teams must be different.');
      return;
    }
    const data = {
      sport,
      homeTeamId: home.teamId || null,
      homeName: home.name?.trim() || '',
      awayTeamId: away.teamId || null,
      awayName: away.name?.trim() || '',
      date: date.toISOString(),
      venue: venue.trim(),
      notes: notes.trim(),
      remind,
    };

    if (existing) {
      updateGame(existing.id, data);
      navigation.goBack();
    } else {
      const id = addGame(data);
      navigation.replace('LiveGame', { gameId: id });
    }
  };

  const remove = () =>
    Alert.alert('Delete game?', 'The game and its timeline will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGame(existing.id);
          navigation.pop(2);
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={existing ? 'Edit game' : 'New game'}
        onBack={() => navigation.goBack()}
        right={existing ? <HeaderButton icon={Trash2} color={colors.danger} onPress={remove} /> : null}
      />

      <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        <FieldLabel>Sport</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {sports.map((s) => (
            <Chip key={s.key} label={s.name} emoji={s.emoji} active={sport === s.key} onPress={() => setSport(s.key)} />
          ))}
          <Chip label="New sport" emoji="➕" onPress={() => navigation.navigate('CustomSports', { openForm: true })} />
        </ScrollView>

        <FieldLabel style={{ marginTop: 18 }}>Teams</FieldLabel>
        <View style={styles.teamsRow}>
          <TeamSelect
            label="Home"
            value={home}
            teams={teams}
            excludeId={away.teamId}
            sportKey={sport}
            onChange={setHome}
            onCreateTeam={() => navigation.navigate('AddEditTeam', { sport })}
          />
          <Text style={styles.vs}>VS</Text>
          <TeamSelect
            label="Away"
            value={away}
            teams={teams}
            excludeId={home.teamId}
            sportKey={sport}
            onChange={setAway}
            onCreateTeam={() => navigation.navigate('AddEditTeam', { sport })}
          />
        </View>

        <View style={{ height: 18 }} />
        <DateTimeField label="Date & time" value={date} onChange={setDate} />

        <FormInput label="Venue" placeholder="Stadium, gym, park…" value={venue} onChangeText={setVenue} />
        <FormInput
          label="Details"
          placeholder="Format, rules, stakes, anything worth remembering…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Remind me before start</Text>
            <Text style={styles.switchSub}>Get a notification so you don't miss the kick-off</Text>
          </View>
          <Switch
            value={remind}
            onValueChange={setRemind}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.text}
          />
        </View>

        <PrimaryButton title={existing ? 'Save changes' : 'Create game'} onPress={save} style={{ marginTop: 24 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 60,
  },
  chips: {
    gap: 8,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vs: {
    color: colors.textMuted,
    fontWeight: '900',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  switchSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export default AddEditGameScreen;
