import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../utils/colors';

const StatTile = ({ label, value, color = colors.text, style }) => (
  <View style={[styles.tile, style]}>
    <Text style={[styles.value, { color }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

export const FormBadges = ({ form = [] }) => (
  <View style={styles.form}>
    {form.map((r, i) => (
      <View
        key={`${r}${i}`}
        style={[
          styles.formItem,
          { backgroundColor: r === 'W' ? colors.success : r === 'L' ? colors.danger : colors.textMuted },
        ]}
      >
        <Text style={styles.formText}>{r}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  form: {
    flexDirection: 'row',
    gap: 4,
  },
  formItem: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '900',
  },
});

export default StatTile;
