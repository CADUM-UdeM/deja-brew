import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type PlatformDateTimePickerProps = {
  value: Date;
  mode: 'date' | 'time';
  display?: 'default' | 'spinner' | 'calendar' | 'clock' | 'compact' | 'inline';
  minimumDate?: Date;
  onChange: (event: unknown, date?: Date) => void;
};

const clampDate = (value: Date, minimumDate?: Date) => {
  if (!minimumDate) return value;
  return value < minimumDate ? minimumDate : value;
};

export function PlatformDateTimePicker({
  value,
  mode,
  minimumDate,
  onChange,
  display: _display,
}: PlatformDateTimePickerProps) {
  const step = (amount: number) => {
    const next = new Date(value);

    if (mode === 'date') {
      next.setDate(next.getDate() + amount);
      onChange(null, clampDate(next, minimumDate));
      return;
    }

    next.setMinutes(next.getMinutes() + amount);
    onChange(null, next);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {mode === 'date'
          ? value.toLocaleDateString()
          : value.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
      </Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => step(mode === 'date' ? -1 : -30)}>
          <Text style={styles.buttonText}>{mode === 'date' ? 'Previous' : '-30 min'}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => step(mode === 'date' ? 1 : 30)}>
          <Text style={styles.buttonText}>{mode === 'date' ? 'Next' : '+30 min'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8D9D1',
    backgroundColor: '#FFF6EF',
    padding: 12,
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A1C17',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#7F3B00',
    paddingVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
