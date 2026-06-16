import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { THEME } from '@/data/THEME';
import type { SessionFeedItem } from '@/data/sessions';
import { getSessionUrgency } from '@/data/recommendations';

const SPRING = { damping: 18, stiffness: 180, mass: 0.8 };

type Props = {
  session: SessionFeedItem;
  index?: number;
};

export default function SessionCard({ session, index = 0 }: Props) {
  const router = useRouter();
  const urgency = getSessionUrgency(session);
  const isUrgent = urgency.toLowerCase().includes('spot') || urgency.toLowerCase().includes('last');

  const progress = useSharedValue(0);
  const pressed = useSharedValue(0);
  const urgentPulse = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(Math.min(index * 70, 560), withSpring(1, SPRING));
    if (isUrgent) {
      urgentPulse.value = withDelay(
        Math.min(index * 70, 560) + 400,
        withRepeat(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          -1,
          true
        )
      );
    }
  }, [index, isUrgent, progress, urgentPulse]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [18, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.972]) },
    ],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(urgentPulse.value, [0, 1], [1, 1.06]) }],
  }));

  return (
    <Reanimated.View style={cardStyle}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={1}
        onPressIn={() => { pressed.value = withTiming(1, { duration: 80 }); }}
        onPressOut={() => { pressed.value = withSpring(0, { damping: 14, stiffness: 200 }); }}
        onPress={() => router.push(`/sessions/${session._id}`)}
      >
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.cardTitle}>{session.title}</Text>
            <Text style={styles.cardSub}>
              {session.course} · {session.vibe}
            </Text>
          </View>
          <Reanimated.View
            style={[
              styles.statusPill,
              session.status === 'full' && styles.statusPillMuted,
              session.joinStatusByMe !== 'none' && styles.statusPillJoined,
              pillStyle,
            ]}
          >
            <Text style={styles.statusText}>{urgency}</Text>
          </Reanimated.View>
        </View>
        <View style={styles.hostRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={13} color="#fff" />
          </View>
          <Text style={styles.creatorText}>Hosted by @{session.createdBy.username}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={THEME.sub} />
            <Text style={styles.metaText}>{session.timeSlot}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={THEME.sub} />
            <Text style={styles.metaText}>{session.participantsCount}/{session.maxPeople}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={THEME.sub} />
          <Text style={styles.metaText}>{session.locationLabel}</Text>
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: THEME.text },
  statusPill: {
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, color: THEME.accentDark, fontWeight: '700' },
  statusPillMuted: { backgroundColor: '#E7DFDA' },
  statusPillJoined: { backgroundColor: '#FFE0C4' },
  cardSub: { fontSize: 12, color: THEME.sub, marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: THEME.sub },
  creatorText: { fontSize: 11, color: THEME.sub, fontWeight: '600' },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 9,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
