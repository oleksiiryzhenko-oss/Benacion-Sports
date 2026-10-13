import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { ChevronRight, UserPlus } from 'lucide-react-native';

import colors from '../utils/colors';
import TeamBadge from './TeamBadge';
import SheetModal, { SheetOption } from './SheetModal';
import PrimaryButton from './PrimaryButton';

// value: { teamId, name }. Lets user pick a saved team or just type a name.
const TeamSelect = ({ label, value, teams, excludeId, onChange, onCreateTeam, sportKey }) => {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');

  const team = teams.find((t) => t.id === value?.teamId);
  const displayName = team?.name || value?.name;

  const sorted = [...teams]
    .filter((t) => t.id !== excludeId)
    .sort((a, b) => Number(b.sport === sportKey) - Number(a.sport === sportKey) || a.name.localeCompare(b.name));

  return (
    <>
      <TouchableOpacity style={styles.box} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.row}>
          <TeamBadge uri={team?.logo} name={displayName || '?'} color={team?.color || colors.textMuted} size={40} />
          <Text style={[styles.name, !displayName && styles.placeholder]} numberOfLines={1}>
            {displayName || 'Select team'}
          </Text>
          <ChevronRight color={colors.textSecondary} size={18} />
        </View>
      </TouchableOpacity>

      <SheetModal visible={open} onClose={() => setOpen(false)} title={label}>
        <View style={styles.quick}>
          <TextInput
            style={styles.input}
            placeholder="Quick: type a team name"
            placeholderTextColor={colors.textMuted}
            value={typed}
            onChangeText={setTyped}
          />
          <PrimaryButton
            title="Use"
            small
            disabled={!typed.trim()}
            onPress={() => {
              onChange({ teamId: null, name: typed.trim() });
              setTyped('');
              setOpen(false);
            }}
          />
        </View>

        {sorted.map((t) => (
          <SheetOption
            key={t.id}
            label={t.name}
            sublabel={[t.city, t.players?.length ? `${t.players.length} players` : null].filter(Boolean).join(' · ')}
            active={t.id === value?.teamId}
            onPress={() => {
              onChange({ teamId: t.id, name: t.name });
              setOpen(false);
            }}
            right={<TeamBadge uri={t.logo} name={t.name} color={t.color} size={32} />}
          />
        ))}

        {onCreateTeam ? (
          <TouchableOpacity
            style={styles.create}
            onPress={() => {
              setOpen(false);
              onCreateTeam();
            }}
          >
            <UserPlus color={colors.primary} size={18} />
            <Text style={styles.createText}>Create a new team with full details</Text>
          </TouchableOpacity>
        ) : null}
      </SheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  quick: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    height: 40,
  },
  create: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    justifyContent: 'center',
  },
  createText: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default TeamSelect;
