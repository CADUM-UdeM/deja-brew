// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
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
import AppHeader from '../../components/AppHeader';
import { fetchMe } from '../../data/api';
import { clearAuth, getAuthUser } from '../../data/auth';
import type { UserProfile } from '../../data/users';

const THEME = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  card: '#FFFFFF',
  border: '#E8D9D1',
  accentDark: '#7F3B00',
};

const SPRING = { damping: 16, stiffness: 190, mass: 0.75 };

function AnimatedChip({ label, index }: { label: string; index: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(index * 55 + 120, withSpring(1, SPRING));
  }, [index, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.7, 1]) },
      { translateY: interpolate(progress.value, [0, 1], [8, 0]) },
    ],
  }));
  return (
    <Reanimated.View style={[styles.chip, style]}>
      <Text style={styles.chipText}>{label}</Text>
    </Reanimated.View>
  );
}

function AnimatedRow({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(index * 50 + 200, withSpring(1, SPRING));
  }, [index, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: interpolate(progress.value, [0, 1], [20, 0]) }],
  }));
  return <Reanimated.View style={style}>{children}</Reanimated.View>;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const avatarScale = useSharedValue(0);
  const avatarFloat = useSharedValue(0);
  const ringScale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);
  const nameOpacity = useSharedValue(0);
  const nameY = useSharedValue(10);

  useEffect(() => {
    avatarScale.value = withDelay(60, withSpring(1, { damping: 12, stiffness: 220, mass: 0.6 }));
    avatarFloat.value = withDelay(
      400,
      withRepeat(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    ringScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 120 }));
    ringOpacity.value = withDelay(300, withTiming(0.5, { duration: 400 }));
    nameOpacity.value = withDelay(160, withTiming(1, { duration: 340 }));
    nameY.value = withDelay(160, withSpring(0, SPRING));
  }, [avatarFloat, avatarScale, nameOpacity, nameY, ringOpacity, ringScale]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAuthUser<UserProfile>()
      .then((cached) => {
        if (mounted && cached) setUser(cached);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    fetchMe()
      .then((res) => {
        if (mounted) setUser(res.data.user);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: avatarScale.value },
      { translateY: interpolate(avatarFloat.value, [0, 1], [0, -5]) },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const nameStyle = useAnimatedStyle(() => ({
    opacity: nameOpacity.value,
    transform: [{ translateY: nameY.value }],
  }));

  const prefs = (user?.preferences?.noise ? [user.preferences.noise] : ['Quiet'])
    .concat(user?.preferences?.wifi ? ['Wi‑Fi stable'] : [])
    .concat(user?.preferences?.outlets ? ['Many outlets'] : [])
    .concat(user?.preferences?.tags ?? ['Open late'])
    .slice(0, 4);

  const rows = [
    { icon: 'options-outline' as const, label: 'Edit study profile', onPress: () => router.push('/profile/edit') },
    { icon: 'people-outline' as const, label: 'Friends', onPress: () => router.push('/friends') },
    { icon: 'search-outline' as const, label: 'Find users', onPress: () => router.push('/users/search') },
    { icon: 'calendar-outline' as const, label: 'Study sessions', onPress: () => router.push('/sessions') },
    { icon: 'notifications-outline' as const, label: 'Notification settings', onPress: () => router.push('/notifications') },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'Privacy & data',
      onPress: () => Alert.alert('Privacy & data', 'Privacy controls are not available in this prototype yet.'),
    },
  ];

  const authRows = [
    { icon: 'log-in-outline' as const, label: 'Log in', onPress: () => router.push('/auth/login'), color: THEME.accentDark },
    { icon: 'person-add-outline' as const, label: 'Create account', onPress: () => router.push('/auth/register'), color: THEME.accentDark },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <AppHeader rightIcon={null} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top user section */}
        <View style={styles.topRow}>
          <View style={styles.avatarWrapper}>
            <Reanimated.View style={[styles.avatarRing, ringStyle]} />
            <Reanimated.View style={[styles.avatar, avatarStyle]}>
              <Ionicons name="cafe-outline" size={32} color="#fff" />
            </Reanimated.View>
          </View>
          <Reanimated.View style={[{ flex: 1 }, nameStyle]}>
            {loading && !user ? (
              <ActivityIndicator color={THEME.accentDark} />
            ) : (
              <>
                <Text style={styles.name}>{user?.displayName ?? 'Deja Brew guest'}</Text>
                <Text style={styles.handle}>@{user?.username ?? 'studylover'}</Text>
              </>
            )}
          </Reanimated.View>
        </View>

        {/* Preferences */}
        <AnimatedRow index={0}>
          <Text style={styles.sectionTitle}>Study preferences</Text>
        </AnimatedRow>
        <View style={styles.chipsRow}>
          {prefs.map((pref, i) => (
            <AnimatedChip key={pref} label={pref} index={i} />
          ))}
        </View>

        {/* Actions */}
        <AnimatedRow index={1}>
          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Account & app</Text>
        </AnimatedRow>

        {rows.map((row, i) => (
          <AnimatedRow key={row.label} index={i + 2}>
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={row.onPress}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconPill}>
                  <Ionicons name={row.icon} size={18} color={THEME.accentDark} />
                </View>
                <Text style={styles.rowText}>{row.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
            </TouchableOpacity>
          </AnimatedRow>
        ))}

        <AnimatedRow index={rows.length + 2}>
          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Auth</Text>
        </AnimatedRow>

        {authRows.map((row, i) => (
          <AnimatedRow key={row.label} index={rows.length + i + 3}>
            <TouchableOpacity
              style={styles.rowItem}
              activeOpacity={0.7}
              onPress={row.onPress}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconPill}>
                  <Ionicons name={row.icon} size={18} color={row.color} />
                </View>
                <Text style={[styles.rowText, { color: row.color }]}>{row.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
            </TouchableOpacity>
          </AnimatedRow>
        ))}

        <AnimatedRow index={rows.length + authRows.length + 3}>
          <TouchableOpacity
            style={[styles.rowItem, { marginTop: 10 }]}
            activeOpacity={0.7}
            onPress={async () => {
              await clearAuth();
              setUser(null);
            }}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconPill, { backgroundColor: '#FFF0EB' }]}>
                <Ionicons name="log-out-outline" size={18} color="#C05621" />
              </View>
              <Text style={[styles.rowText, { color: '#C05621' }]}>Log out</Text>
            </View>
          </TouchableOpacity>
        </AnimatedRow>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    columnGap: 14,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: THEME.accentDark,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
  },
  handle: {
    fontSize: 13,
    color: THEME.sub,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  chipText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '600',
  },
  rowItem: {
    marginTop: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE0DA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3E7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '500',
  },
});
