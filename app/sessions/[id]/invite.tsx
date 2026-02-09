import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../../components/AppHeader';
import { THEME } from '../../../data/THEME';
import { fetchFriends, inviteSessionFriend } from '../../../data/api';
import type { UserSummary } from '../../../data/users';

export default function InviteFriendScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [query, setQuery] = useState('');
  const [friends, setFriends] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchFriends()
      .then((data) => {
        if (!mounted) return;
        setFriends(data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    return friends.filter((friend) =>
      `${friend?.displayName ?? ''} ${friend?.username ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [friends, query]);

  const handleInvite = async (friendId?: string) => {
    const sessionId = id?.toString();
    if (!sessionId || !friendId) return;
    if (invitedIds.has(friendId)) return;
    setSendingId(friendId);
    try {
      await inviteSessionFriend(sessionId, friendId);
      setInvitedIds((prev) => new Set(prev).add(friendId));
      Alert.alert('Invite sent', 'Your friend has been invited.');
    } catch (err: any) {
      Alert.alert('Invite failed', err?.message || 'Please try again.');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Invite a friend"
          subtitle="Send a session invite"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Invite a friend</Text>
          <Text style={styles.subtitle}>Session: {id}</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={THEME.sub} />
            <TextInput
              style={styles.input}
              placeholder="Search friends"
              placeholderTextColor={THEME.sub}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {loading && friends.length === 0 && (
            <Text style={styles.loadingText}>Loading friends...</Text>
          )}

          {!loading && filteredFriends.length === 0 && (
            <Text style={styles.loadingText}>No friends found.</Text>
          )}

          {filteredFriends.map((friend) => {
            const invited = invitedIds.has(friend._id);
            const isSending = sendingId === friend._id;
            return (
            <View key={friend?._id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{friend?.displayName}</Text>
                  <Text style={styles.cardSub}>@{friend?.username}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.inviteBtn, (invited || isSending) && styles.inviteBtnDisabled]}
                  onPress={() => handleInvite(friend?._id)}
                  disabled={invited || isSending}
                >
                  {isSending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.inviteText}>
                      {invited ? 'Invited' : 'Invite'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )})}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.sub,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: THEME.text,
  },
  card: {
    marginTop: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  cardSub: {
    fontSize: 12,
    color: THEME.sub,
  },
  inviteBtn: {
    backgroundColor: THEME.accentDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  inviteBtnDisabled: {
    opacity: 0.6,
  },
  inviteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  loadingText: {
    marginTop: 12,
    color: THEME.sub,
    fontSize: 12,
  },
});
