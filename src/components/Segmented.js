import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import colors from '../utils/colors';

// options: [{ value, label, count? }]
const Segmented = ({ options, value, onChange, style }) => (
  <View style={[styles.wrap, style]}>
    {options.map((o) => {
      const active = o.value === value;
      return (
        <TouchableOpacity
          key={o.value}
          style={[styles.item, active && styles.itemActive]}
          onPress={() => onChange(o.value)}
          activeOpacity={0.85}
        >
          <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
            {o.label}
            {o.count ? ` · ${o.count}` : ''}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  item: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  itemActive: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  labelActive: {
    color: colors.onPrimary,
  },
});

export default Segmented;
