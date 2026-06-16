import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '@/data/THEME';
import type { SessionFeedItem } from '@/data/sessions';
import { fetchMySessions } from '@/data/api';
import SessionCard from '@/components/SessionCard';
import EmptyState from '@/components/EmptyState';

export default function MySessionsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionFeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchMySessions()
      .then((data) => {
        if (mounted) setSessions(data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      {loading && sessions.length === 0 && (
        <Text style={styles.loadingText}>Loading your sessions...</Text>
      )}

      {!loading && sessions.length === 0 && (
        <EmptyState
          icon="calendar-outline"
          title="No sessions yet"
          message="Create a study date, pick a cafe, then invite friends right away."
          actionLabel="Create session"
          onAction={() => router.push('/session/new')}
        />
      )}

      {sessions.map((session) => (
        <SessionCard key={session._id} session={session} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    color: THEME.sub,
    fontSize: 12,
    marginTop: 4,
  },
});
