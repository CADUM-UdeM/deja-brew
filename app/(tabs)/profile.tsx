// app/(tabs)/profile.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthModal from '../../components/AuthModal';
import { fetchMe } from '../../data/api';
import { clearAuth } from '../../data/auth';
import { useAuth } from '../../data/AuthContext';
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
  const { user: authUser, loading: authLoading, refreshAuth } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(authUser ?? null);
  const [loading, setLoading] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setLoading(true);
      fetchMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setUser(null);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authLoading && !authUser) {
      setAuthModalVisible(true);
    }
  }, [authLoading, authUser]);

  const handleAuthSuccess = () => {
    refreshAuth();
    setAuthModalVisible(false);
  };

  if (authLoading) {
    return (
      <View style={[styles.centered, { flex: 1, backgroundColor: THEME.bg, paddingTop: insets.top }]}>
        <ActivityIndicator color={THEME.accentDark} size="large" />
      </View>
    );
  }

  if (!authUser) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.bg, paddingTop: insets.top }}>
        <View style={[styles.centered, styles.guestContainer]}>
          <View style={styles.avatar}>
            <Ionicons name="cafe-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.guestTitle}>Create an account</Text>
          <Text style={styles.guestSubtitle}>
            Sign up to save your study preferences, find friends, and join sessions.
          </Text>
          <TouchableOpacity
            style={styles.createAccountBtn}
            onPress={() => setAuthModalVisible(true)}
          >
            <Text style={styles.createAccountBtnText}>Create account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => setAuthModalVisible(true)}
          >
            <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
        <AuthModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          onSuccess={handleAuthSuccess}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg, paddingTop: insets.top }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: THEME.bg }}
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
          style={[styles.rowItem, { marginTop: 10 }]}
          activeOpacity={0.7}
          onPress={async () => {
            await clearAuth();
            refreshAuth();
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestContainer: {
    padding: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 15,
    color: THEME.sub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  createAccountBtn: {
    backgroundColor: THEME.accentDark,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  createAccountBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  loginLink: {
    paddingVertical: 8,
  },
  loginLinkText: {
    color: THEME.accentDark,
    fontWeight: '600',
    fontSize: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    columnGap: 14,
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
