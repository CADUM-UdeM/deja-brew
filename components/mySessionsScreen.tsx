import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { THEME } from '@/data/THEME';
import type { SessionFeedItem } from '@/data/sessions';
import { fetchMySessions } from '@/data/api';
import SessionCard from '@/components/SessionCard';

export default function MySessionsScreen() {
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
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No sessions yet.</Text>
        </View>
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
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: THEME.sub,
  },
});
