import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSavedPromos } from '@/data/savedPromosContext';
import { THEME } from '@/data/THEME';

type Props = {
  promoId: string;
};

export default function SaveButton({ promoId }: Props) {
  const { isSaved, toggleSavedPromo } = useSavedPromos();
  const saved = isSaved(promoId);

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        toggleSavedPromo(promoId);
      }}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={16}
        color={saved ? THEME.accentDark : THEME.sub}
      />
      <Text style={[styles.label, saved && styles.labelActive]}>
        {saved ? 'Saved' : 'Save'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.accentDark,
  },
  labelActive: {
    color: THEME.accentDark,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
