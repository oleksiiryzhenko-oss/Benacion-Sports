import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import colors from '../utils/colors';

const ScreenHeader = ({ title, subtitle, onBack, right, large = false }) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity style={styles.iconBtn} onPress={onBack} hitSlop={10}>
        <ChevronLeft color={colors.text} size={24} />
      </TouchableOpacity>
    ) : null}

    <View style={styles.titleWrap}>
      <Text style={[styles.title, large && styles.titleLarge]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>

    {right ? <View style={styles.right}>{right}</View> : null}
  </View>
);

export const HeaderButton = ({ icon: Icon, onPress, color = colors.text, active = false }) => (
  <TouchableOpacity style={[styles.iconBtn, active && styles.iconBtnActive]} onPress={onPress} hitSlop={8}>
    <Icon color={active ? colors.onPrimary : color} size={20} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  titleLarge: {
    fontSize: 28,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default ScreenHeader;
