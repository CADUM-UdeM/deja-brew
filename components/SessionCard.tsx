import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { THEME } from '@/data/THEME';
import type { SessionFeedItem } from '@/data/sessions';

type Props = {
  session: SessionFeedItem;
};

export default function SessionCard({ session }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/sessions/${session._id}`)}
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle}>{session.title}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{session.status}</Text>
        </View>
      </View>
      <Text style={styles.cardSub}>
        {session.course} · {session.timeSlot}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color={THEME.sub} />
        <Text style={styles.metaText}>{session.locationLabel}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={14} color={THEME.sub} />
        <Text style={styles.metaText}>
          {session.participantsCount}/{session.maxPeople} · {session.joinStatusByMe}
        </Text>
      </View>
      <Text style={styles.creatorText}>@{session.createdBy.username}</Text>
    </TouchableOpacity>
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
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
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
  cardSub: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: THEME.sub,
  },
  creatorText: {
    marginTop: 6,
    fontSize: 11,
    color: THEME.sub,
  },
});
