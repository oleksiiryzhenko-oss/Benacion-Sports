import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import colors from '../utils/colors';

const FormInput = ({ label, style, inputStyle, multiline, ...props }) => (
  <View style={[styles.wrap, style]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[styles.input, multiline && styles.multiline, inputStyle]}
      multiline={multiline}
      {...props}
    />
  </View>
);

export const FieldLabel = ({ children, style }) => <Text style={[styles.label, style]}>{children}</Text>;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default FormInput;
