import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays, Clock } from 'lucide-react-native';

import colors from '../utils/colors';
import { formatDate, formatTime } from '../utils/helpers';

// value: Date. iOS uses the inline compact picker, Android opens native dialogs.
const DateTimeField = ({ label, value, onChange, mode = 'datetime' }) => {
  const openAndroid = (pickMode) =>
    DateTimePickerAndroid.open({
      value,
      mode: pickMode,
      is24Hour: true,
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          const next = new Date(value);
          if (pickMode === 'date') next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
          else next.setHours(date.getHours(), date.getMinutes(), 0, 0);
          onChange(next);
        }
      },
    });

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {Platform.OS === 'ios' ? (
        <View style={styles.box}>
          <DateTimePicker
            value={value}
            mode={mode}
            display="compact"
            themeVariant="dark"
            accentColor={colors.primary}
            onChange={(_, date) => date && onChange(date)}
            style={{ alignSelf: 'flex-start' }}
          />
        </View>
      ) : (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.box, styles.androidBtn]} onPress={() => openAndroid('date')}>
            <CalendarDays color={colors.primary} size={18} />
            <Text style={styles.value}>{formatDate(value)}</Text>
          </TouchableOpacity>
          {mode !== 'date' ? (
            <TouchableOpacity style={[styles.box, styles.androidBtn]} onPress={() => openAndroid('time')}>
              <Clock color={colors.primary} size={18} />
              <Text style={styles.value}>{formatTime(value)}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  androidBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  value: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default DateTimeField;
