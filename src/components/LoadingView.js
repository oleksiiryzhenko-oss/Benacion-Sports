import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { RefreshCw } from 'lucide-react-native';

import colors from '../utils/colors';
import PrimaryButton from './PrimaryButton';

export const LoadingView = ({ text = 'Loading…', style }) => (
  <View style={[styles.wrap, style]}>
    <ActivityIndicator color={colors.primary} size="large" />
    <Text style={styles.text}>{text}</Text>
  </View>
);

export const ErrorView = ({ text = "Couldn't load data. Check your connection.", onRetry, style }) => (
  <View style={[styles.wrap, style]}>
    <Text style={styles.emoji}>📡</Text>
    <Text style={styles.text}>{text}</Text>
    {onRetry ? <PrimaryButton title="Try again" icon={RefreshCw} onPress={onRetry} small style={styles.btn} /> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 40,
  },
  text: {
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  btn: {
    marginTop: 16,
  },
});

export default LoadingView;
