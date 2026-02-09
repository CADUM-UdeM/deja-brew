import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { getSessionById } from '../../data/sessions';
import {
  acceptSessionParticipant,
  declineSessionParticipant,
  fetchSessionById,
  joinSession,
  leaveSession,
} from '../../data/api';
import type { SessionDetail } from '../../data/sessions';
import { getAuthUser } from '../../data/auth';
import type { UserProfile } from '../../data/users';

export default function SessionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const fallbackSession = useMemo(() => getSessionById(id), [id]);
  const [session, setSession] = useState<SessionDetail | null>(fallbackSession ?? null);
  const [loading, setLoading] = useState(false);
  const [joinStatus, setJoinStatus] = useState(session?.joinStatusByMe ?? 'none');
  const [joinLoading, setJoinLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState<string | null>(null);
  const [me, setMe] = useState<UserProfile | null>(null);

  const participants = session?.participants ?? [];

  const acceptedCount =
    participants.length > 0
      ? participants.filter((participant) => participant.status === 'accepted').length
      : session?.participantsCount ?? session?.acceptedCount ?? 0;

  const derivedJoinStatus = useMemo(() => {
    if (!session) return 'none';
    if (session.joinStatusByMe && session.joinStatusByMe !== 'none') {
      return session.joinStatusByMe;
    }
    if (!me) return 'none';
    const participant = participants.find(
      (item) => item.userId === me._id || item.username === me.username
    );
    if (!participant) return 'none';
    if (participant.status === 'accepted' || participant.status === 'pending') {
      return participant.status;
    }
    return 'none';
  }, [me, participants, session]);

  const isCreator = useMemo(() => {
    if (!session || !me) return false;
    const s: any = session;
    const creator =
      s.createdBy ??
      s.creator ??
      s.user ??
      s.owner ??
      s.createdById ??
      s.creatorId ??
      s.userId ??
      s.ownerId;
    if (typeof creator === 'string') {
      return creator === me._id || creator === me.username;
    }
    if (creator && typeof creator === 'object') {
      const creatorId = creator._id ?? creator.id;
      const creatorUsername = creator.username ?? creator.handle;
      if (creatorId && String(creatorId) === String(me._id)) return true;
      if (creatorUsername && creatorUsername === me.username) return true;
    }
    const creatorId = s.createdById ?? s.creatorId ?? s.userId ?? s.ownerId;
    if (creatorId && String(creatorId) === String(me._id)) return true;
    return false;
  }, [me, session]);

  useEffect(() => {
    if (!session) return;
    setJoinStatus(derivedJoinStatus);
  }, [derivedJoinStatus, session]);

  useEffect(() => {
    let mounted = true;
    getAuthUser<UserProfile>()
      .then((user) => {
        if (mounted) setMe(user);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const sessionId = id?.toString();
    if (!sessionId) return () => {};
    setLoading(true);
    fetchSessionById(sessionId)
      .then((data) => {
        if (mounted) setSession(data);
      })
      .catch(() => {
        if (mounted) setSession(getSessionById(sessionId) ?? null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Session details"
          subtitle="Join or invite friends"
        />
        <View style={styles.center}>
          {loading ? (
            <>
              <ActivityIndicator color={THEME.accentDark} />
              <Text style={styles.subtitle}>Loading session...</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Session not found</Text>
              <Text style={styles.subtitle}>Check the id used in /api/sessions/:id.</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  const status = session?.status ?? 'open';
  const isClosed = status === 'full' || status === 'cancelled' || status === 'ended';
  const canJoin = !isClosed && joinStatus === 'none' && !isCreator && Boolean(me);
  const canLeave = joinStatus === 'accepted' || joinStatus === 'pending';

  const updateParticipants = (
    updater: (items: SessionDetail['participants']) => SessionDetail['participants']
  ) => {
    setSession((prev) => {
      if (!prev) return prev;
      const nextParticipants = updater(prev.participants ?? []);
      const nextAccepted = nextParticipants.filter((p) => p.status === 'accepted').length;
      let nextStatus = prev.status;
      if (nextAccepted >= prev.maxPeople) nextStatus = 'full';
      if (nextAccepted < prev.maxPeople && prev.status === 'full') nextStatus = 'open';
      return {
        ...prev,
        participants: nextParticipants,
        participantsCount: nextAccepted,
        acceptedCount: nextAccepted,
        status: nextStatus,
      };
    });
  };

  const handleJoin = async () => {
    if (!session || !canJoin) return;
    if (isCreator) {
      Alert.alert('You are the host', 'You cannot request to join your own session.');
      return;
    }
    setJoinLoading(true);
    try {
      await joinSession(session._id);
      if (me) {
        updateParticipants((items) => {
          const exists = items.find((item) => item.userId === me._id);
          if (exists) {
            return items.map((item) =>
              item.userId === me._id ? { ...item, status: 'pending' } : item
            );
          }
          return [
            ...items,
            {
              userId: me._id,
              displayName: me.displayName ?? 'You',
              username: me.username ?? 'you',
              status: 'pending',
            },
          ];
        });
      }
      setJoinStatus('pending');
    } catch (err: any) {
      Alert.alert('Request failed', err?.message || 'Please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!session || !canLeave) return;
    setJoinLoading(true);
    try {
      await leaveSession(session._id);
      if (me) {
        updateParticipants((items) => items.filter((item) => item.userId !== me._id));
      }
      setJoinStatus('none');
    } catch (err: any) {
      Alert.alert('Leave failed', err?.message || 'Please try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleDecision = async (userId: string, action: 'accepted' | 'declined') => {
    if (!session) return;
    setDecisionLoading(userId);
    try {
      if (action === 'accepted') {
        await acceptSessionParticipant(session._id, userId);
      } else {
        await declineSessionParticipant(session._id, userId);
      }
      updateParticipants((items) =>
        items.map((item) =>
          item.userId === userId ? { ...item, status: action } : item
        )
      );
    } catch (err: any) {
      Alert.alert('Update failed', err?.message || 'Please try again.');
    } finally {
      setDecisionLoading(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader rightIcon="close" onRightPress={() => router.back()} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>{session.title}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{session.course} · {session.vibe}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={THEME.sub} />
            <Text style={styles.metaText}>{session.timeSlot}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={THEME.sub} />
            <Text style={styles.metaText}>{session.locationLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={14} color={THEME.sub} />
            <Text style={styles.metaText}>
              {acceptedCount}/{session.maxPeople} accepted
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color={THEME.sub} />
            <Text style={styles.metaText}>Join status: {joinStatus}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.cardText}>{session.notes}</Text>
          </View>

          {isCreator && participants.filter((p) => p.status === 'pending').length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Requests to join</Text>
              {participants
                .filter((participant) => participant.status === 'pending')
                .map((participant) => (
                  <View key={participant.userId} style={styles.requestRow}>
                    <View style={styles.participantRow}>
                      <View style={styles.avatar}>
                        <Ionicons name="person" size={14} color="#fff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.participantName}>{participant.displayName}</Text>
                        <Text style={styles.participantSub}>@{participant.username}</Text>
                      </View>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={[
                          styles.acceptBtn,
                          decisionLoading === participant.userId && styles.actionDisabled,
                        ]}
                        onPress={() => handleDecision(participant.userId, 'accepted')}
                        disabled={decisionLoading === participant.userId}
                      >
                        <Text style={styles.acceptText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.declineBtn,
                          decisionLoading === participant.userId && styles.actionDisabled,
                        ]}
                        onPress={() => handleDecision(participant.userId, 'declined')}
                        disabled={decisionLoading === participant.userId}
                      >
                        <Text style={styles.declineText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Participants</Text>
            {participants
              .filter((participant) => participant.status === 'accepted')
              .map((participant) => (
                <View key={participant.userId} style={styles.participantRow}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={14} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.participantName}>{participant.displayName}</Text>
                    <Text style={styles.participantSub}>@{participant.username}</Text>
                  </View>
                  <Text style={styles.participantStatus}>{participant.status}</Text>
                </View>
              ))}
            {participants.filter((participant) => participant.status === 'accepted').length ===
              0 && <Text style={styles.emptyText}>No participants yet.</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!canJoin && joinStatus === 'none') || isCreator ? styles.disabledBtn : null,
            ]}
            onPress={handleJoin}
            disabled={!canJoin || joinLoading || isCreator}
          >
            {joinLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isCreator && 'You are the host'}
                {!isCreator && joinStatus === 'none' && !isClosed && 'Request to join'}
                {!isCreator && joinStatus === 'none' && isClosed && 'Session closed'}
                {joinStatus === 'pending' && 'Request pending'}
                {joinStatus === 'accepted' && 'You are in'}
              </Text>
            )}
          </TouchableOpacity>

          {canLeave && !isCreator && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleLeave}>
              <Ionicons name="log-out-outline" size={16} color={THEME.accentDark} />
              <Text style={styles.secondaryBtnText}>
                {joinStatus === 'pending' ? 'Cancel request' : 'Leave session'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push(`/sessions/${session._id}/invite`)}
          >
            <Ionicons name="person-add-outline" size={16} color={THEME.accentDark} />
            <Text style={styles.secondaryBtnText}>Invite a friend</Text>
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
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.sub,
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: THEME.sub,
  },
  card: {
    marginTop: 16,
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 12,
    color: THEME.sub,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.text,
  },
  participantSub: {
    fontSize: 11,
    color: THEME.sub,
  },
  participantStatus: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 8,
  },
  requestRow: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
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
  actionDisabled: {
    opacity: 0.6,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: THEME.accentDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
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
});
