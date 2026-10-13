import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';

import colors from '../utils/colors';
import { withAlpha } from '../utils/helpers';

const LiveDot = ({ label = 'LIVE', small = false }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={[styles.badge, small && styles.small]}>
      <Animated.View style={[styles.dot, { opacity }]} />
      {label ? <Text style={[styles.text, small && styles.textSmall]}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(colors.live, 0.16),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.live,
  },
  text: {
    color: colors.live,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  textSmall: {
    fontSize: 10,
  },
});

export default LiveDot;
