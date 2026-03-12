// components/AppHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  accent: '#C27C4A',
};

// keyof typeof Ionicons.glyphMap = n'importe quel nom d'icône Ionicons valide
type Props = {
  leftIcon?: keyof typeof Ionicons.glyphMap | null;
  onLeftPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap | null;
  onRightPress?: () => void;
  showLogo?: boolean;
  title?: string;
  subtitle?: string;
};

export default function AppHeader({
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  showLogo = true,
  title,
  subtitle,
}: Props) {
  const insets = useSafeAreaInsets();
  const resolvedRightIcon =
    rightIcon === undefined ? 'notifications-outline' : rightIcon;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      <View style={styles.leftRow}>
        {leftIcon && (
          <Pressable onPress={onLeftPress} hitSlop={8} style={styles.leftIcon}>
            <Ionicons name={leftIcon} size={22} color={C.accent} />
          </Pressable>
        )}
        {showLogo ? (
          <>
            <View style={styles.logoCircle}>
              <Ionicons name="cafe-outline" size={18} />
            </View>
            <View>
              <Text style={styles.title}>Deja Brew</Text>
              <Text style={styles.subtitle}>bean there, learned that.</Text>
            </View>
          </>
        ) : (
          <View>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>

      {resolvedRightIcon && (
        <Pressable onPress={onRightPress} hitSlop={8}>
          <Ionicons name={resolvedRightIcon} size={22} style={styles.rightIcon} />
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
    borderBottomWidth: 1,
    borderBottomColor: '#E8D9D1',
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
  leftIcon: {
    marginRight: 6,
  },
});
