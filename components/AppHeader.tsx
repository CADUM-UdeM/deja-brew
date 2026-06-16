// components/AppHeader.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const C = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  accent: '#C27C4A',
};

const SPRING = { damping: 14, stiffness: 200, mass: 0.7 };

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

  const logoScale = useSharedValue(0.4);
  const logoRotate = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleX = useSharedValue(-14);
  const rightOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, SPRING);
    logoRotate.value = withDelay(
      120,
      withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    titleOpacity.value = withDelay(80, withTiming(1, { duration: 320 }));
    titleX.value = withDelay(80, withSpring(0, SPRING));
    rightOpacity.value = withDelay(160, withTiming(1, { duration: 280 }));
  }, [logoRotate, logoScale, rightOpacity, titleOpacity, titleX]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${interpolate(logoRotate.value, [0, 1], [-6, 6])}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateX: titleX.value }],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    opacity: rightOpacity.value,
  }));

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
            <Reanimated.View style={[styles.logoCircle, logoStyle]}>
              <Ionicons name="cafe-outline" size={18} />
            </Reanimated.View>
            <Reanimated.View style={titleStyle}>
              <Text style={styles.title}>Deja Brew</Text>
              <Text style={styles.subtitle}>bean there, learned that.</Text>
            </Reanimated.View>
          </>
        ) : (
          <Reanimated.View style={titleStyle}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </Reanimated.View>
        )}
      </View>

      {resolvedRightIcon && (
        <Reanimated.View style={rightStyle}>
          <Pressable onPress={onRightPress} hitSlop={8}>
            <Ionicons name={resolvedRightIcon} size={22} style={styles.rightIcon} />
          </Pressable>
        </Reanimated.View>
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
