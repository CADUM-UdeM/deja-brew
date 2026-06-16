import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { ALL_PLACES } from '../../data/places';
import { SESSION_FEED } from '@/data/sessions';
import {
  getSessionUrgency,
  scorePlace,
  type StudyProfileParams,
  type ScoreResult,
} from '@/data/recommendations';
import { getStudyVibeProfile, deriveStudyVibeLabel, type StudyVibeProfile } from '@/data/studyProfile';

const C = {
  text:       THEME.text,
  sub:        THEME.sub,
  border:     THEME.border,
  accentDark: THEME.accentDark,
  card:       THEME.card,
  bg:         THEME.bg,
  chip:       '#F3E7E0',
};

const SPRING = { damping: 18, stiffness: 180, mass: 0.8 };

/* ─── Animated match bar ─────────────────────────────────── */
function MatchBar({ percent, delay }: { percent: number; delay: number }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withDelay(delay, withTiming(percent, { duration: 700 }));
  }, [delay, percent, width]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));
  const color =
    percent >= 75 ? '#2F6B3F' :
    percent >= 50 ? C.accentDark :
                   '#9A6B3A';
  return (
    <View style={styles.barTrack}>
      <Reanimated.View style={[styles.barFill, { backgroundColor: color }, barStyle]} />
    </View>
  );
}

/* ─── Animated result card ───────────────────────────────── */
function ResultCard({
  place,
  score,
  rank,
  index,
  onPress,
  onStudyHere,
}: {
  place: Parameters<typeof scorePlace>[0];
  score: ScoreResult;
  rank: number;
  index: number;
  onPress: () => void;
  onStudyHere: () => void;
}) {
  const { reasons, warnings } = score;
  const progress = useSharedValue(0);
  const pressed  = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(index * 90, withSpring(1, SPRING));
  }, [index, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [20, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.975]) },
    ],
  }));

  const matchColor =
    score.matchPercent >= 75 ? '#2F6B3F' :
    score.matchPercent >= 50 ? C.accentDark :
                               '#9A6B3A';

  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  return (
    <Reanimated.View style={cardStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { pressed.value = withTiming(1, { duration: 80 }); }}
        onPressOut={() => { pressed.value = withSpring(0, { damping: 14, stiffness: 200 }); }}
        onPress={onPress}
        style={styles.card}
      >
        {/* Card header: rank + name + match % */}
        <View style={styles.cardTopRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankEmoji}>{rankEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{place.name}</Text>
            <Text style={styles.cardSub}>{place.district} · {place.priceLevel ?? '$$'}</Text>
          </View>
          <View style={[styles.pctBadge, { backgroundColor: matchColor + '18', borderColor: matchColor + '40' }]}>
            <Text style={[styles.pctText, { color: matchColor }]}>{score.matchPercent}%</Text>
          </View>
        </View>

        {/* Match bar */}
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Match</Text>
          <MatchBar percent={score.matchPercent} delay={index * 90 + 300} />
          <Text style={[styles.barPct, { color: matchColor }]}>{score.matchPercent}%</Text>
        </View>

        {/* Quick signals */}
        <View style={styles.signalsRow}>
          <View style={styles.signalItem}>
            <Ionicons name="wifi-outline" size={13} color={place.wifi ? '#2F6B3F' : C.sub} />
            <Text style={[styles.signalText, { color: place.wifi ? '#2F6B3F' : C.sub }]}>
              {place.wifi ? 'Wi-Fi ✓' : 'No Wi-Fi'}
            </Text>
          </View>
          <View style={styles.signalItem}>
            <Ionicons name="flash-outline" size={13} color={place.outlets ? '#2F6B3F' : C.sub} />
            <Text style={[styles.signalText, { color: place.outlets ? '#2F6B3F' : C.sub }]}>
              {place.outlets ? 'Outlets ✓' : 'Limited outlets'}
            </Text>
          </View>
          {place.priceLevel && (
            <View style={styles.signalItem}>
              <Ionicons name="cash-outline" size={13} color={C.sub} />
              <Text style={styles.signalText}>{place.priceLevel}</Text>
            </View>
          )}
        </View>

        {/* Why it works */}
        {reasons.length > 0 && (
          <View style={styles.reasonSection}>
            <Text style={styles.reasonSectionLabel}>Why this works for you</Text>
            <View style={styles.reasonChips}>
              {reasons.slice(0, 4).map((r: string) => (
                <View key={r} style={styles.reasonChip}>
                  <Ionicons name="checkmark-circle" size={11} color="#2F6B3F" />
                  <Text style={styles.reasonText}>{r}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Deal-breaker warnings */}
        {warnings.length > 0 && (
          <View style={styles.warningSection}>
            {warnings.slice(0, 2).map((w: string) => (
              <View key={w} style={styles.warningChip}>
                <Ionicons name="warning-outline" size={11} color="#9A3A12" />
                <Text style={styles.warningText}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action row */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.cardActionSecondary}
            onPress={onStudyHere}
          >
            <Ionicons name="people-outline" size={14} color={C.accentDark} />
            <Text style={styles.cardActionSecondaryText}>Study here</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardActionPrimary} onPress={onPress}>
            <Text style={styles.cardActionPrimaryText}>See details</Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

/* ─── Animated session card ──────────────────────────────── */
import type { SessionFeedItem } from '@/data/sessions';

function AnimatedSessionCard({
  session,
  delay,
  onPress,
}: {
  session: SessionFeedItem;
  delay: number;
  onPress: () => void;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withSpring(1, SPRING));
  }, [delay, progress]);
  const sessionStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [16, 0]) }],
  }));

  return (
    <Reanimated.View style={sessionStyle}>
      <TouchableOpacity style={styles.sessionCard} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.sessionTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionTitle}>{session.title}</Text>
            <Text style={styles.sessionSub}>{session.course} · {session.timeSlot}</Text>
          </View>
          <View style={styles.sessionStatus}>
            <Text style={styles.sessionStatusText}>{getSessionUrgency(session)}</Text>
          </View>
        </View>
        <View style={styles.sessionMeta}>
          <View style={styles.sessionMetaItem}>
            <Ionicons name="location-outline" size={13} color={C.sub} />
            <Text style={styles.sessionMetaText}>{session.locationLabel}</Text>
          </View>
          <View style={styles.sessionMetaItem}>
            <Ionicons name="people-outline" size={13} color={C.sub} />
            <Text style={styles.sessionMetaText}>
              {session.participantsCount}/{session.maxPeople}
            </Text>
          </View>
          <View style={styles.sessionMetaItem}>
            <Ionicons name="person-outline" size={13} color={C.sub} />
            <Text style={styles.sessionMetaText}>@{session.createdBy.username}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

/* ─── Main results screen ────────────────────────────────── */
export default function QuizResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionType?: string;
    noise?: string;
    time?: string;
    duration?: string;
    group?: string;
    campus?: string;
    vibe?: string;
    food?: string;
    budget?: string;
    mustHave?: string;
  }>();
  const [savedProfile, setSavedProfile] = useState<StudyVibeProfile | null>(null);

  const headerProgress = useSharedValue(0);
  useEffect(() => {
    headerProgress.value = withTiming(1, { duration: 400 });
  }, [headerProgress]);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerProgress.value,
    transform: [{ translateY: interpolate(headerProgress.value, [0, 1], [-12, 0]) }],
  }));

  useEffect(() => {
    getStudyVibeProfile().then(setSavedProfile).catch(() => {});
  }, []);

  const effectiveParams: StudyProfileParams = useMemo(() => {
    const hasRouteParams = Object.values(params).some(Boolean);
    return hasRouteParams ? params : savedProfile ?? {};
  }, [params, savedProfile]);

  const profileLabel = useMemo(() => deriveStudyVibeLabel(effectiveParams), [effectiveParams]);

  const matches = useMemo(() => {
    return ALL_PLACES.map((place) => ({
      place,
      ...scorePlace(place, effectiveParams),
    }))
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 7);
  }, [effectiveParams]);

  const recommendedSessions = useMemo(() => {
    const group    = effectiveParams.group?.toLowerCase() ?? '';
    const duration = effectiveParams.duration?.toLowerCase() ?? '';
    return [...SESSION_FEED]
      .sort((a, b) => {
        const aFit =
          ((group.includes('group') || group.includes('crew') || group.includes('squad')) && a.maxPeople >= 4 ? 2 : 0) +
          ((duration.includes('all') || duration.includes('3h')) && a.status === 'open' ? 1 : 0);
        const bFit =
          ((group.includes('group') || group.includes('crew') || group.includes('squad')) && b.maxPeople >= 4 ? 2 : 0) +
          ((duration.includes('all') || duration.includes('3h')) && b.status === 'open' ? 1 : 0);
        return bFit - aFit;
      })
      .slice(0, 3);
  }, [effectiveParams]);

  // Active params summary chips
  const paramChips = useMemo(() => {
    const chips: string[] = [];
    if (effectiveParams.sessionType)  chips.push(effectiveParams.sessionType);
    if (effectiveParams.noise)        chips.push(effectiveParams.noise);
    if (effectiveParams.duration)     chips.push(effectiveParams.duration);
    if (effectiveParams.group)        chips.push(effectiveParams.group);
    if (effectiveParams.campus)       chips.push(effectiveParams.campus);
    if (effectiveParams.budget)       chips.push(effectiveParams.budget);
    (effectiveParams.mustHave ?? '').split(',').filter(Boolean).forEach((m) => chips.push(m.trim()));
    return chips.filter(Boolean);
  }, [effectiveParams]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Café matches"
          subtitle="Tailored to your vibe"
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <Reanimated.View style={[styles.hero, headerStyle]}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={20} color={C.accentDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>{profileLabel}</Text>
              <Text style={styles.heroSub}>
                {matches.length} spots ranked just for you
              </Text>
            </View>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => router.push('/quiz')}
            >
              <Ionicons name="refresh-outline" size={14} color={C.accentDark} />
              <Text style={styles.retakeBtnText}>Retake</Text>
            </TouchableOpacity>
          </Reanimated.View>

          {/* Your criteria chips */}
          {paramChips.length > 0 && (
            <Reanimated.View style={[styles.criteriaRow, headerStyle]}>
              {paramChips.map((c) => (
                <View key={c} style={styles.criteriaChip}>
                  <Text style={styles.criteriaChipText}>{c}</Text>
                </View>
              ))}
            </Reanimated.View>
          )}

          {/* Ranked café cards */}
          <View style={styles.cardsSection}>
            {matches.map(({ place, score, matchPercent, reasons, warnings }, index) => (
              <ResultCard
                key={place.id}
                place={place}
                score={{ score, matchPercent, reasons, warnings } satisfies ScoreResult}
                rank={index + 1}
                index={index}
                onPress={() => router.push({ pathname: '/place', params: { id: place.id } })}
                onStudyHere={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: '/session/new',
                    params: {
                      location: encodeURIComponent(JSON.stringify(`${place.name} · ${place.district}`)),
                      placeId:  encodeURIComponent(JSON.stringify(String(place.id))),
                    },
                  });
                }}
              />
            ))}
          </View>

          {/* Map CTA */}
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(tabs)/map');
            }}
          >
            <Ionicons name="map-outline" size={18} color="#fff" />
            <Text style={styles.mapBtnText}>Explore all spots on the map</Text>
          </TouchableOpacity>

          {/* Sessions for this vibe */}
          {recommendedSessions.length > 0 && (
            <View style={styles.sessionsSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionBadge}>
                  <Ionicons name="people-outline" size={16} color={C.accentDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Study sessions for this vibe</Text>
                  <Text style={styles.sectionSub}>People that fit your plan</Text>
                </View>
              </View>

              {recommendedSessions.map((session, i) => (
                <AnimatedSessionCard
                  key={session._id}
                  session={session}
                  delay={matches.length * 90 + i * 70 + 200}
                  onPress={() => router.push(`/sessions/${session._id}`)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  heroSub: {
    fontSize: 12,
    color: C.sub,
    marginTop: 2,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  retakeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.accentDark,
  },
  criteriaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  criteriaChip: {
    backgroundColor: C.chip,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  criteriaChipText: {
    fontSize: 11,
    color: C.accentDark,
    fontWeight: '600',
  },
  cardsSection: {
    gap: 12,
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  cardSub: {
    fontSize: 12,
    color: C.sub,
    marginTop: 2,
  },
  pctBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pctText: {
    fontSize: 13,
    fontWeight: '800',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  barLabel: {
    fontSize: 10,
    color: C.sub,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    width: 36,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#F1E5DE',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
  },
  barPct: {
    fontSize: 12,
    fontWeight: '800',
    width: 32,
    textAlign: 'right',
  },
  signalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalText: {
    fontSize: 11,
    color: C.sub,
    fontWeight: '600',
  },
  reasonSection: {
    marginBottom: 8,
  },
  reasonSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: C.sub,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  reasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F5EA',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reasonText: {
    fontSize: 11,
    color: '#2F6B3F',
    fontWeight: '600',
  },
  warningSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  warningChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0EB',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFD4C4',
  },
  warningText: {
    fontSize: 10,
    color: '#9A3A12',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cardActionSecondary: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardActionSecondaryText: {
    fontSize: 12,
    color: C.accentDark,
    fontWeight: '700',
  },
  cardActionPrimary: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.accentDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardActionPrimaryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '800',
  },
  mapBtn: {
    marginTop: 20,
    backgroundColor: C.accentDark,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    shadowColor: C.accentDark,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  mapBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  sessionsSection: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  sectionSub: {
    fontSize: 12,
    color: C.sub,
    marginTop: 2,
  },
  sessionCard: {
    marginBottom: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  sessionSub: {
    fontSize: 11,
    color: C.sub,
    marginTop: 2,
  },
  sessionStatus: {
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sessionStatusText: {
    fontSize: 11,
    color: C.accentDark,
    fontWeight: '700',
  },
  sessionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    fontSize: 11,
    color: C.sub,
  },
});
