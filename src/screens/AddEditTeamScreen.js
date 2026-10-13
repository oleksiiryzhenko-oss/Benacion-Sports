import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Trash2, ImagePlus, X, Plus } from 'lucide-react-native';

import colors, { teamColors } from '../utils/colors';
import { genId } from '../utils/helpers';
import { pickTeamLogo } from '../utils/imageStorage';
import { getAllGameSports } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import FormInput, { FieldLabel } from '../components/FormInput';
import Chip from '../components/Chip';
import TeamBadge from '../components/TeamBadge';
import PrimaryButton from '../components/PrimaryButton';

const AddEditTeamScreen = ({ navigation, route }) => {
  const teamId = route.params?.teamId;
  const { teams, customSports, addTeam, updateTeam, deleteTeam } = useApp();
  const existing = teams.find((t) => t.id === teamId);

  const [name, setName] = useState(existing?.name || '');
  const [shortName, setShortName] = useState(existing?.shortName || '');
  const [sport, setSport] = useState(existing?.sport || route.params?.sport || 'football');
  const [color, setColor] = useState(existing?.color || teamColors[0]);
  const [logo, setLogo] = useState(existing?.logo || null);
  const [city, setCity] = useState(existing?.city || '');
  const [coach, setCoach] = useState(existing?.coach || '');
  const [founded, setFounded] = useState(existing?.founded || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [players, setPlayers] = useState(existing?.players || []);
  const [newPlayer, setNewPlayer] = useState({ name: '', number: '', position: '' });

  const sports = getAllGameSports(customSports);

  const chooseLogo = async () => {
    try {
      const uri = await pickTeamLogo();
      if (uri) setLogo(uri);
    } catch (e) {
      Alert.alert('Photo access needed', 'Allow photo library access in Settings to add a logo.');
    }
  };

  const addPlayer = () => {
    if (!newPlayer.name.trim()) return;
    setPlayers((prev) => [
      ...prev,
      { id: genId(), name: newPlayer.name.trim(), number: newPlayer.number.trim(), position: newPlayer.position.trim() },
    ]);
    setNewPlayer({ name: '', number: '', position: '' });
  };

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Team name required', 'Give your team a name.');
      return;
    }
    const data = {
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      sport,
      color,
      logo,
      city: city.trim(),
      coach: coach.trim(),
      founded: founded.trim(),
      description: description.trim(),
      players,
    };
    if (existing) updateTeam(existing.id, data);
    else addTeam(data);
    navigation.goBack();
  };

  const remove = () =>
    Alert.alert('Delete team?', 'Past games keep the team name, but the team and its roster will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTeam(existing.id);
          navigation.pop(2);
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={existing ? 'Edit team' : 'New team'}
        onBack={() => navigation.goBack()}
        right={existing ? <HeaderButton icon={Trash2} color={colors.danger} onPress={remove} /> : null}
      />

      <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        <View style={styles.logoRow}>
          <TouchableOpacity onPress={chooseLogo} activeOpacity={0.85}>
            <TeamBadge uri={logo} name={name || '?'} color={color} size={96} />
            <View style={styles.logoEdit}>
              <ImagePlus color={colors.onPrimary} size={16} />
            </View>
          </TouchableOpacity>
          {logo ? (
            <TouchableOpacity onPress={() => setLogo(null)}>
              <Text style={styles.removeLogo}>Remove logo</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.logoHint}>Tap to add a logo</Text>
          )}
        </View>

        <FormInput label="Team name" placeholder="e.g. Thunder FC" value={name} onChangeText={setName} />
        <View style={styles.row2}>
          <FormInput
            label="Short name"
            placeholder="THU"
            value={shortName}
            onChangeText={setShortName}
            maxLength={4}
            autoCapitalize="characters"
            style={{ flex: 1 }}
          />
          <FormInput
            label="Founded"
            placeholder="2024"
            value={founded}
            onChangeText={setFounded}
            keyboardType="number-pad"
            maxLength={4}
            style={{ flex: 1 }}
          />
        </View>

        <FieldLabel>Sport</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {sports.map((s) => (
            <Chip key={s.key} label={s.name} emoji={s.emoji} active={sport === s.key} onPress={() => setSport(s.key)} />
          ))}
        </ScrollView>

        <FieldLabel style={{ marginTop: 16 }}>Team color</FieldLabel>
        <View style={styles.colors}>
          {teamColors.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColor(c)}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorActive]}
            />
          ))}
        </View>

        <FormInput label="City" placeholder="Home city" value={city} onChangeText={setCity} />
        <FormInput label="Coach / captain" placeholder="Name" value={coach} onChangeText={setCoach} />
        <FormInput
          label="About the team"
          placeholder="History, style of play, achievements…"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <FieldLabel>Roster · {players.length}</FieldLabel>
        {players.map((p) => (
          <View key={p.id} style={styles.player}>
            <Text style={styles.playerNum}>{p.number ? `#${p.number}` : '—'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.playerName}>{p.name}</Text>
              {p.position ? <Text style={styles.playerPos}>{p.position}</Text> : null}
            </View>
            <TouchableOpacity hitSlop={10} onPress={() => setPlayers((prev) => prev.filter((x) => x.id !== p.id))}>
              <X color={colors.textMuted} size={18} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addPlayer}>
          <TextInput
            style={[styles.pInput, { width: 56 }]}
            placeholder="#"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={3}
            value={newPlayer.number}
            onChangeText={(v) => setNewPlayer((p) => ({ ...p, number: v }))}
          />
          <TextInput
            style={[styles.pInput, { flex: 1 }]}
            placeholder="Player name"
            placeholderTextColor={colors.textMuted}
            value={newPlayer.name}
            onChangeText={(v) => setNewPlayer((p) => ({ ...p, name: v }))}
            onSubmitEditing={addPlayer}
          />
        </View>
        <View style={styles.addPlayer}>
          <TextInput
            style={[styles.pInput, { flex: 1 }]}
            placeholder="Position (optional)"
            placeholderTextColor={colors.textMuted}
            value={newPlayer.position}
            onChangeText={(v) => setNewPlayer((p) => ({ ...p, position: v }))}
            onSubmitEditing={addPlayer}
          />
          <TouchableOpacity
            style={[styles.addBtn, !newPlayer.name.trim() && { opacity: 0.4 }]}
            onPress={addPlayer}
            disabled={!newPlayer.name.trim()}
          >
            <Plus color={colors.onPrimary} size={20} />
          </TouchableOpacity>
        </View>

        <PrimaryButton title={existing ? 'Save team' : 'Create team'} onPress={save} style={{ marginTop: 24 }} />
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
  logoRow: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  logoEdit: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  logoHint: {
    color: colors.textMuted,
    fontSize: 13,
  },
  removeLogo: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  row2: {
    flexDirection: 'row',
    gap: 12,
  },
  chips: {
    gap: 8,
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorActive: {
    borderWidth: 3,
    borderColor: colors.text,
    transform: [{ scale: 1.1 }],
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  playerNum: {
    color: colors.primary,
    fontWeight: '900',
    width: 36,
  },
  playerName: {
    color: colors.text,
    fontWeight: '700',
  },
  playerPos: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  addPlayer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  pInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    height: 44,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddEditTeamScreen;
