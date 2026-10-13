import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Trash2, Check, Plus } from 'lucide-react-native';

import colors from '../utils/colors';
import { getAllGameSports } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import FormInput, { FieldLabel } from '../components/FormInput';
import Chip from '../components/Chip';
import Segmented from '../components/Segmented';
import TeamBadge from '../components/TeamBadge';
import DateTimeField from '../components/DateTimeField';
import PrimaryButton from '../components/PrimaryButton';

const AddEditTournamentScreen = ({ navigation, route }) => {
  const tournamentId = route.params?.tournamentId;
  const { tournaments, teams, customSports, addTournament, updateTournament, deleteTournament } = useApp();
  const existing = tournaments.find((t) => t.id === tournamentId);

  const [name, setName] = useState(existing?.name || '');
  const [sport, setSport] = useState(existing?.sport || 'football');
  const [format, setFormat] = useState(existing?.format || 'league');
  const [doubleRound, setDoubleRound] = useState(existing?.doubleRound || false);
  const [teamIds, setTeamIds] = useState(existing?.teamIds || []);
  const [startDate, setStartDate] = useState(existing ? new Date(existing.startDate) : new Date());
  const [days, setDays] = useState(existing?.daysBetweenRounds || 7);
  const [venue, setVenue] = useState(existing?.venue || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [showAll, setShowAll] = useState(false);

  const sports = getAllGameSports(customSports);
  const sportTeams = teams.filter((t) => t.sport === sport);
  const visibleTeams = showAll || !sportTeams.length ? teams : sportTeams;
  const minTeams = format === 'league' ? 3 : 2;

  const toggleTeam = (id) =>
    setTeamIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your tournament a name.');
      return;
    }
    if (existing) {
      updateTournament(existing.id, { name: name.trim(), venue: venue.trim(), description: description.trim() });
      navigation.goBack();
      return;
    }
    if (teamIds.length < minTeams) {
      Alert.alert('Not enough teams', `Select at least ${minTeams} teams.`);
      return;
    }
    const id = addTournament({
      name: name.trim(),
      sport,
      format,
      doubleRound: format === 'league' && doubleRound,
      teamIds,
      startDate: startDate.toISOString(),
      daysBetweenRounds: days,
      venue: venue.trim(),
      description: description.trim(),
    });
    navigation.replace('TournamentDetail', { tournamentId: id });
  };

  const remove = () =>
    Alert.alert('Delete tournament?', 'All of its games will be deleted too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTournament(existing.id);
          navigation.pop(2);
        },
      },
    ]);

  const n = teamIds.length;
  const gamesCount =
    format === 'league' ? ((n * (n - 1)) / 2) * (doubleRound ? 2 : 1) : Math.max(0, n - 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={existing ? 'Edit tournament' : 'New tournament'}
        onBack={() => navigation.goBack()}
        right={existing ? <HeaderButton icon={Trash2} color={colors.danger} onPress={remove} /> : null}
      />

      <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        <FormInput label="Name" placeholder="e.g. Summer Cup 2026" value={name} onChangeText={setName} />

        {!existing ? (
          <>
            <FieldLabel>Sport</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {sports.map((s) => (
                <Chip key={s.key} label={s.name} emoji={s.emoji} active={sport === s.key} onPress={() => setSport(s.key)} />
              ))}
            </ScrollView>

            <FieldLabel style={{ marginTop: 18 }}>Format</FieldLabel>
            <Segmented
              options={[
                { value: 'league', label: '📊 League' },
                { value: 'knockout', label: '🥊 Knockout' },
              ]}
              value={format}
              onChange={setFormat}
              style={{ marginHorizontal: 0 }}
            />
            <Text style={styles.hint}>
              {format === 'league'
                ? 'Everyone plays everyone. Points table updates automatically.'
                : 'Lose and you are out. Winners advance until the final.'}
            </Text>

            {format === 'league' ? (
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Home & away (double round)</Text>
                <Switch
                  value={doubleRound}
                  onValueChange={setDoubleRound}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor={colors.text}
                />
              </View>
            ) : null}

            <View style={styles.teamsHead}>
              <FieldLabel style={{ marginBottom: 0 }}>Teams · {n} selected</FieldLabel>
              {sportTeams.length && sportTeams.length !== teams.length ? (
                <TouchableOpacity onPress={() => setShowAll((v) => !v)}>
                  <Text style={styles.link}>{showAll ? 'Only this sport' : 'Show all teams'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.teamGrid}>
              {visibleTeams.map((t) => {
                const active = teamIds.includes(t.id);
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.teamTile, active && { borderColor: colors.primary }]}
                    onPress={() => toggleTeam(t.id)}
                    activeOpacity={0.85}
                  >
                    {active ? (
                      <View style={styles.check}>
                        <Check color={colors.onPrimary} size={12} strokeWidth={3} />
                      </View>
                    ) : null}
                    <TeamBadge uri={t.logo} name={t.name} color={t.color} size={40} />
                    <Text style={styles.teamName} numberOfLines={2}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.teamTile, styles.addTile]}
                onPress={() => navigation.navigate('AddEditTeam', { sport })}
              >
                <Plus color={colors.primary} size={26} />
                <Text style={[styles.teamName, { color: colors.primary }]}>New team</Text>
              </TouchableOpacity>
            </View>

            <DateTimeField label="Start date" value={startDate} onChange={setStartDate} />

            <FieldLabel>Days between rounds</FieldLabel>
            <View style={[styles.chips, { marginBottom: 16 }]}>
              {[1, 3, 7, 14].map((d) => (
                <Chip key={d} label={d === 1 ? 'Daily' : `${d} days`} active={days === d} onPress={() => setDays(d)} />
              ))}
            </View>
          </>
        ) : null}

        <FormInput label="Venue" placeholder="Where games are played" value={venue} onChangeText={setVenue} />
        <FormInput label="Description" placeholder="Rules, prizes, notes…" value={description} onChangeText={setDescription} multiline />

        {!existing && n >= minTeams ? (
          <Text style={styles.summary}>
            {gamesCount} games will be generated{format === 'knockout' ? ' in total' : ''}.
          </Text>
        ) : null}

        <PrimaryButton title={existing ? 'Save' : 'Create tournament'} onPress={save} style={{ marginTop: 12 }} />
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
    flexDirection: 'row',
    gap: 8,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  switchText: {
    color: colors.text,
    fontWeight: '700',
  },
  teamsHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  teamTile: {
    width: '31%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 100,
    justifyContent: 'center',
  },
  addTile: {
    borderStyle: 'dashed',
  },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  summary: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default AddEditTournamentScreen;
