import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { getUserById } from '../../data/users';
import { ApiError, fetchUserById, sendFriendRequest } from '../../data/api';
import type { UserProfile } from '../../data/users';
import { SESSIONS } from '../../data/sessions';

const serializeParam = (value: unknown) => encodeURIComponent(JSON.stringify(value));

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    let mounted = true;
    const userId = id?.toString();
    if (!userId) return () => {};
    setRequestSent(false);
    setLoading(true);
    fetchUserById(userId)
      .then((data) => {
        if (!mounted) return;
        setUser(data);
      })
      .catch(() => {
        if (!mounted) return;
        const fallback = getUserById(userId);
        setUser(fallback ?? null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSendRequest = async () => {
    const userId = user?._id ?? id?.toString();
    if (!userId) return;
    setSending(true);
    try {
      await sendFriendRequest(userId);
      setRequestSent(true);
      Alert.alert('Request sent', 'Your friend request has been sent.');
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409) {
        setRequestSent(true);
        Alert.alert('Request already sent', err?.message || 'Please wait for a response.');
      } else {
        Alert.alert('Request failed', err?.message || 'Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Profile"
          subtitle="Study summary"
        />
        <View style={styles.center}>
          {loading ? (
            <>
              <ActivityIndicator color={THEME.accentDark} />
              <Text style={styles.subtitle}>Loading profile...</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>User not found</Text>
              <Text style={styles.subtitle}>Check the id used in /api/users/:id.</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  const preferences = user.preferences ?? {
    noise: 'quiet',
    wifi: false,
    outlets: false,
    favoriteDistricts: [],
    tags: [],
  };
  const personalityBadges = [
    preferences.noise === 'quiet' ? 'Quiet hunter' : null,
    preferences.wifi ? 'Wi-Fi loyalist' : null,
    preferences.outlets ? 'Outlet scout' : null,
    user.stats.sessionsCreated > 2 ? 'Session host' : null,
    user.stats.reviewsCount > 3 ? 'Cafe reviewer' : null,
  ].filter(Boolean) as string[];
  const recentSessions = SESSIONS.filter(
    (session) =>
      session.createdBy._id === user._id ||
      session.participants.some((participant) => participant.userId === user._id)
  ).slice(0, 3);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Profile"
          subtitle="Study summary"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user.displayName}</Text>
              <Text style={styles.handle}>@{user.username}</Text>
            </View>
          </View>

          <Text style={styles.bio}>{user.bio}</Text>
          <Text style={styles.meta}>{user.school}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.stats.sessionsCreated}</Text>
              <Text style={styles.statLabel}>Sessions created</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.stats.sessionsJoined}</Text>
              <Text style={styles.statLabel}>Sessions joined</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{user.stats.reviewsCount}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Study preferences</Text>
          <View style={styles.chipRow}>
            {personalityBadges.map((badge) => (
              <View key={badge} style={styles.badgeChip}>
                <Ionicons name="sparkles-outline" size={12} color={THEME.accentDark} />
                <Text style={styles.chipText}>{badge}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Noise: {preferences.noise}</Text>
            </View>
            {preferences.wifi && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>Wi-Fi</Text>
              </View>
            )}
            {preferences.outlets && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>Outlets</Text>
              </View>
            )}
          </View>
          <View style={styles.chipRow}>
            {preferences.tags.map((tag) => (
              <View key={tag} style={styles.chip}>
                <Text style={styles.chipText}>{tag}</Text>
              </View>
            ))}
          </View>
          {preferences.favoriteDistricts.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Favorite districts</Text>
              <Text style={styles.infoText}>{preferences.favoriteDistricts.join(' · ')}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Recent study activity</Text>
          {recentSessions.length === 0 ? (
            <Text style={styles.emptyText}>No recent sessions yet.</Text>
          ) : (
            recentSessions.map((session) => (
              <TouchableOpacity
                key={session._id}
                style={styles.activityCard}
                onPress={() => router.push(`/sessions/${session._id}`)}
              >
                <Text style={styles.activityTitle}>{session.title}</Text>
                <Text style={styles.activitySub}>
                  {session.course} · {session.locationLabel}
                </Text>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (sending || requestSent) && styles.primaryBtnDisabled,
            ]}
            onPress={handleSendRequest}
            disabled={sending || requestSent}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {requestSent ? 'Request sent' : 'Send friend request'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              router.push({
                pathname: '/session/new',
                params: {
                  title: serializeParam(`Study with ${user.displayName}`),
                  notes: serializeParam(`Invite @${user.username} to this study session.`),
                },
              })
            }
          >
            <Ionicons name="people-outline" size={16} color={THEME.accentDark} />
            <Text style={styles.secondaryBtnText}>Invite to a session</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 12,
    color: THEME.sub,
  },
  bio: {
    marginTop: 12,
    fontSize: 13,
    color: THEME.text,
  },
  meta: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.accentDark,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.sub,
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '600',
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFF3E6',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  infoCard: {
    marginTop: 14,
    backgroundColor: THEME.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
  },
  infoTitle: {
    color: THEME.text,
    fontWeight: '800',
    fontSize: 13,
  },
  infoText: {
    color: THEME.sub,
    fontSize: 12,
    marginTop: 4,
  },
  activityCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.card,
    padding: 12,
  },
  activityTitle: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: '800',
  },
  activitySub: {
    color: THEME.sub,
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: THEME.sub,
    fontSize: 12,
    marginTop: 8,
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: THEME.accentDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  secondaryBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
  },
  secondaryBtnText: {
    color: THEME.accentDark,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 6,
    textAlign: 'center',
  },
});
