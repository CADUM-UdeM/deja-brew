import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '@/data/THEME';

type Props = {
  text: string;
  tone?: 'info' | 'warning';
};

export default function InlineNotice({ text, tone = 'info' }: Props) {
  return (
    <View style={[styles.wrap, tone === 'warning' && styles.warning]}>
      <Ionicons
        name={tone === 'warning' ? 'alert-circle-outline' : 'information-circle-outline'}
        size={16}
        color={THEME.accentDark}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFF8F3',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  warning: {
    backgroundColor: '#FFF3E6',
  },
  text: {
    flex: 1,
    color: THEME.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
