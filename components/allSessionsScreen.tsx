import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '@/data/THEME';
import { SESSION_FEED, SessionFeedItem } from '@/data/sessions';
import { fetchSessions } from '@/data/api';
import SessionCard from '@/components/SessionCard';

export default function AllSessionsScreen() {
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [sessionsData, setSessionsData] = useState<SessionFeedItem[]>(SESSION_FEED);
  const [loading, setLoading] = useState(false);

  const courses = useMemo(() => {
    const set = new Set(sessionsData.map((s) => s.course));
    return Array.from(set);
  }, [sessionsData]);

  const sessions = useMemo(() => {
    if (!courseFilter) return sessionsData;
    return sessionsData.filter((session) => session.course === courseFilter);
  }, [courseFilter, sessionsData]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchSessions()
      .then((data) => {
        if (!mounted) return;
        if (data.length > 0) {
          setSessionsData(data);
        } else {
          setSessionsData(SESSION_FEED);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!courseFilter) return;
    const exists = sessionsData.some((session) => session.course === courseFilter);
    if (!exists) setCourseFilter(null);
  }, [courseFilter, sessionsData]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      {courses.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity onPress={() => setCourseFilter(null)}>
            <View style={[styles.chip, !courseFilter && styles.chipActive]}>
              <Text style={[styles.chipText, !courseFilter && styles.chipTextActive]}>
                All
              </Text>
            </View>
          </TouchableOpacity>
          {courses.map((course) => {
            const active = course === courseFilter;
            return (
              <TouchableOpacity
                key={course}
                onPress={() => setCourseFilter(active ? null : course)}
              >
                <View style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {course}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  chipsRow: {
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: THEME.accentDark,
    borderColor: THEME.accentDark,
  },
  chipText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
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
