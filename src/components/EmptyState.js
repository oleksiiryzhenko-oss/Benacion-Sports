import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../utils/colors';
import PrimaryButton from './PrimaryButton';

const EmptyState = ({ emoji = '🏟️', title, text, actionLabel, onAction, style }) => (
  <View style={[styles.wrap, style]}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.title}>{title}</Text>
    {text ? <Text style={styles.text}>{text}</Text> : null}
    {actionLabel ? <PrimaryButton title={actionLabel} onPress={onAction} style={styles.btn} /> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  btn: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});

export default EmptyState;
