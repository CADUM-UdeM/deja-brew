// components/AppHeader.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  accent: '#C27C4A',
};

// keyof typeof Ionicons.glyphMap = n'importe quel nom d'icône Ionicons valide
type Props = {
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

export default function AppHeader({ rightIcon = 'notifications-outline', onRightPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      <View style={styles.leftRow}>
        <View style={styles.logoCircle}>
          <Ionicons name="cafe-outline" size={18} />
        </View>
        <View>
          <Text style={styles.title}>Deja Brew</Text>
          <Text style={styles.subtitle}>bean there, learned that.</Text>
        </View>
      </View>

      {rightIcon && (
        <Pressable onPress={onRightPress} hitSlop={8}>
          <Ionicons name={rightIcon} size={22} style={styles.rightIcon} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.bg,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2D6C2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  subtitle: {
    fontSize: 11,
    color: C.sub,
  },
  rightIcon: {
    color: C.accent,
  },
});
