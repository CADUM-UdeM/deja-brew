import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEME } from '@/data/THEME';
import { SESSION_FEED, SessionFeedItem } from '@/data/sessions';
import { fetchSessions } from '@/data/api';
import SessionCard from '@/components/SessionCard';
import EmptyState from '@/components/EmptyState';

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
      <View style={styles.nearbyStrip}>
        <View style={styles.nearbyIcon}>
          <Text style={styles.nearbyDot}>●</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nearbyTitle}>{sessionsData.length} people studying nearby</Text>
          <Text style={styles.nearbySub}>Mocked city signal for now · Montréal study pulse</Text>
        </View>
      </View>

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
        <EmptyState
          icon="people-outline"
          title="No sessions match this filter"
          message="Start a session and it will appear here for other students to join."
        />
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
  nearbyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    backgroundColor: '#FFF8F3',
    padding: 12,
    marginBottom: 12,
  },
  nearbyIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyDot: {
    color: THEME.accentDark,
    fontSize: 16,
  },
  nearbyTitle: {
    color: THEME.text,
    fontSize: 13,
    fontWeight: '800',
  },
  nearbySub: {
    color: THEME.sub,
    fontSize: 11,
    marginTop: 2,
  },
});
