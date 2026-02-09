// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
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

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAuthUser<UserProfile>()
      .then((cached) => {
        if (mounted && cached) setUser(cached);
      })
      .finally(() => setLoading(false));

    fetchMe()
      .then((res) => {
        if (mounted) setUser(res.data.user);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

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
          <View style={styles.avatar}>
            <Ionicons name="cafe-outline" size={32} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            {loading && !user ? (
              <ActivityIndicator color={THEME.accentDark} />
            ) : (
              <>
                <Text style={styles.name}>{user?.displayName ?? 'Deja Brew guest'}</Text>
                <Text style={styles.handle}>@{user?.username ?? 'studylover'}</Text>
              </>
            )}
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Study preferences</Text>
        <View style={styles.chipsRow}>
          {(user?.preferences?.noise ? [user.preferences.noise] : ['Quiet'])
            .concat(user?.preferences?.wifi ? ['Wi‑Fi stable'] : [])
            .concat(user?.preferences?.outlets ? ['Many outlets'] : [])
            .concat(user?.preferences?.tags ?? ['Open late'])
            .slice(0, 4)
            .map((pref) => (
              <View key={pref} style={styles.chip}>
                <Text style={styles.chipText}>{pref}</Text>
              </View>
            ))}
        </View>

        {/* Actions */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Account & app</Text>

        <TouchableOpacity
          style={styles.rowItem}
          activeOpacity={0.7}
          onPress={() => router.push('/profile/edit')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="options-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Edit study profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rowItem}
          activeOpacity={0.7}
          onPress={() => router.push('/friends')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="people-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Friends</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rowItem}
          activeOpacity={0.7}
          onPress={() => router.push('/users/search')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="search-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Find users</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rowItem}
          activeOpacity={0.7}
          onPress={() => router.push('/sessions')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="calendar-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Study sessions</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Notification settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
          <View style={styles.rowLeft}>
            <Ionicons name="shield-checkmark-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Privacy & data</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Auth</Text>

        <TouchableOpacity
          style={styles.rowItem}
          activeOpacity={0.7}
          onPress={() => router.push('/auth/login')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="log-in-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Log in</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rowItem}
          activeOpacity={0.7}
          onPress={() => router.push('/auth/register')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="person-add-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Create account</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rowItem, { marginTop: 10 }]}
          activeOpacity={0.7}
          onPress={async () => {
            await clearAuth();
            setUser(null);
          }}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="log-out-outline" size={20} color="#C05621" />
            <Text style={[styles.rowText, { color: '#C05621' }]}>Log out</Text>
          </View>
        </TouchableOpacity>
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
  rowText: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '500',
  },
});
