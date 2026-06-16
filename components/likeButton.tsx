import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useLikedPromos } from '@/data/likedPromosContext';
import { THEME } from '@/data/THEME';

type Props = {
  promoId: string;
};

export default function LikeButton({ promoId }: Props) {
  const { isLiked, toggleLikedPromo } = useLikedPromos();
  const liked = isLiked(promoId);

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        toggleLikedPromo(promoId);
      }}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={16}
        color={liked ? '#C05621' : THEME.accentDark}
      />
      <Text style={[styles.label, liked && styles.labelActive]}>
        {liked ? 'Liked' : 'Like'}
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
    color: '#C05621',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
