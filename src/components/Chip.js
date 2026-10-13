import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

import colors from '../utils/colors';

const Chip = ({ label, active, onPress, emoji, color = colors.primary, small = false }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[
      styles.chip,
      small && styles.small,
      active && { backgroundColor: color, borderColor: color },
    ]}
  >
    <Text style={[styles.label, small && styles.labelSmall, active && styles.labelActive]}>
      {emoji ? `${emoji} ` : ''}
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  small: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  labelSmall: {
    fontSize: 12,
  },
  labelActive: {
    color: colors.onPrimary,
  },
});

export default Chip;
