import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { FRIEND_REQUESTS } from '../../data/friends';
import { getUserById } from '../../data/users';
import { acceptFriendRequest, declineFriendRequest, fetchFriendRequests } from '../../data/api';

export default function FriendRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchFriendRequests()
      .then((data) => {
        if (mounted) setRequests(data);
      })
      .catch(() => {
        if (mounted) setRequests(FRIEND_REQUESTS);
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
    setRequests((prev) =>
      prev.map((req) => (req._id === id ? { ...req, status } : req))
    );
    try {
      if (status === 'accepted') await acceptFriendRequest(id);
      if (status === 'declined') await declineFriendRequest(id);
    } catch {
      // keep optimistic UI
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
          title="Friend requests"
          subtitle="Incoming requests"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {loading && requests.length === 0 && (
            <Text style={styles.loadingText}>Loading requests...</Text>
          )}
          {!loading && requests.length === 0 && (
            <Text style={styles.loadingText}>No friend requests yet.</Text>
          )}
          {requests.map((request: any) => {
            const fromUser =
              request.fromUser ??
              request.from ??
              request.sender ??
              request.requester ??
              request.user ??
              getUserById(request.fromUserId);
            const displayName =
              fromUser?.displayName ??
              fromUser?.name ??
              request.fromDisplayName ??
              request.fromName ??
              'Unknown user';
            const username =
              fromUser?.username ??
              request.fromUsername ??
              request.fromHandle ??
              'unknown';
            const requestKey = String(
              request._id ??
                request.id ??
                `${request.fromUserId ?? 'req'}-${request.createdAt ?? ''}`
            );
            const apiRequestId = request._id ?? request.id;
            const canAct = request.status === 'pending' && Boolean(apiRequestId);
            return (
              <View key={requestKey} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{displayName}</Text>
                    <Text style={styles.cardSub}>@{username}</Text>
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.acceptBtn,
                      !canAct && styles.actionDisabled,
                    ]}
                    disabled={!canAct}
                    onPress={() => apiRequestId && updateStatus(apiRequestId, 'accepted')}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.declineBtn,
                      !canAct && styles.actionDisabled,
                    ]}
                    disabled={!canAct}
                    onPress={() => apiRequestId && updateStatus(apiRequestId, 'declined')}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                </View>
                {request.status !== 'pending' && (
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{request.status}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    color: THEME.sub,
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTop: {
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
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: THEME.accentDark,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '700',
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  declineText: {
    color: THEME.sub,
    fontWeight: '600',
  },
  statusPill: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
  },
  statusText: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
