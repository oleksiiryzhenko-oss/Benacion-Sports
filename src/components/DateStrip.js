import React, { useMemo, useRef, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

import colors from '../utils/colors';
import { addDays, dayKey, weekdayShort } from '../utils/helpers';

// Horizontal day selector: `past` days back, `future` days ahead
const DateStrip = ({ value, onChange, past = 3, future = 7 }) => {
  const scrollRef = useRef(null);
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: past + future + 1 }, (_, i) => addDays(today, i - past));
  }, [past, future]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollTo({ x: Math.max(0, (past - 1) * 62), animated: false }), 50);
    return () => clearTimeout(t);
  }, [past]);

  const todayKey = dayKey(new Date());

  return (
    <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((d) => {
        const key = dayKey(d);
        const active = key === value;
        return (
          <TouchableOpacity key={key} style={[styles.day, active && styles.dayActive]} onPress={() => onChange(key)}>
            <Text style={[styles.weekday, active && styles.textActive]}>{key === todayKey ? 'Today' : weekdayShort(d)}</Text>
            <Text style={[styles.num, active && styles.textActive]}>{d.getDate()}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 8,
  },
  day: {
    width: 54,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  weekday: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  num: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  textActive: {
    color: colors.onPrimary,
  },
});

export default DateStrip;
