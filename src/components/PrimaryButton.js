import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native';

import colors from '../utils/colors';
import { withAlpha } from '../utils/helpers';

// variant: primary | secondary | danger | ghost
const PrimaryButton = ({ title, onPress, variant = 'primary', icon: Icon, disabled, loading, style, small }) => {
  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.surface2, fg: colors.text, border: colors.border },
    light: { bg: colors.text, fg: colors.onPrimary, border: colors.text },
    danger: { bg: withAlpha(colors.danger, 0.15), fg: colors.danger, border: colors.danger },
    ghost: { bg: 'transparent', fg: colors.primary, border: colors.border },
  }[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        small && styles.small,
        { backgroundColor: palette.bg, borderColor: palette.border },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon color={palette.fg} size={small ? 16 : 18} /> : null}
          <Text style={[styles.text, small && styles.textSmall, { color: palette.fg }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  small: {
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
  },
  textSmall: {
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PrimaryButton;
