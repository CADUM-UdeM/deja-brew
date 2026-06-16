import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Reanimated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { ALL_PLACES } from '@/data/places';
import { scorePlace } from '@/data/recommendations';
import { saveStudyVibeProfile } from '@/data/studyProfile';

const C = {
  bg: THEME.bg,
  card: THEME.card,
  text: THEME.text,
  sub: THEME.sub,
  accent: '#C27C4A',
  accentDark: THEME.accentDark,
  border: THEME.border,
  chip: '#F3E7E0',
  glow: '#FFEDE3',
};

const SPRING_FAST  = { damping: 18, stiffness: 260, mass: 0.7 };
const SPRING_SOFT  = { damping: 22, stiffness: 200, mass: 0.9 };
const { width } = Dimensions.get('window');

/* ─── Question definitions ──────────────────────────────── */
type Option = { label: string; emoji: string; hint: string };
type Q = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  multi?: boolean;
  options: Option[];
};

const QUESTIONS: Q[] = [
  {
    id: 'sessionType',
    title: "What are you working on?",
    subtitle: "This shapes your whole match",
    icon: 'book-outline',
    options: [
      { label: 'Light assignment', emoji: '📝', hint: 'Just need a nice spot to get it done' },
      { label: 'Deep research',    emoji: '🔬', hint: 'Full focus, no distractions' },
      { label: 'Exam cram',        emoji: '🔥', hint: 'Need outlets, quiet & fast Wi-Fi' },
      { label: 'Group project',    emoji: '🤝', hint: 'Need a big table, talking is fine' },
    ],
  },
  {
    id: 'noise',
    title: "Noise level you need",
    subtitle: "Be honest — this one matters",
    icon: 'volume-low-outline',
    options: [
      { label: 'Pin-drop quiet',   emoji: '🤫', hint: 'Library-level silence, please' },
      { label: 'Soft background',  emoji: '🎵', hint: 'Music is fine, no loud talkers' },
      { label: 'Café buzz',        emoji: '☕', hint: "Regular chatter doesn't bother me" },
    ],
  },
  {
    id: 'duration',
    title: "How long are you staying?",
    subtitle: "Helps match outlets & hours",
    icon: 'timer-outline',
    options: [
      { label: 'Quick sprint',      emoji: '⚡', hint: 'Under 1 hour, grab & go' },
      { label: 'Standard session',  emoji: '🕐', hint: '1–3 hours, one coffee' },
      { label: 'All-day grind',     emoji: '💪', hint: '3h+ — outlets are non-negotiable' },
    ],
  },
  {
    id: 'group',
    title: "Who are you with?",
    subtitle: "Solo or squad?",
    icon: 'people-outline',
    options: [
      { label: 'Flying solo',       emoji: '🎧', hint: 'Just me, headphones in' },
      { label: 'Duo',               emoji: '👥', hint: 'Me and one friend' },
      { label: 'Small crew (3–4)',  emoji: '🫂', hint: 'Need a few chairs together' },
      { label: 'Full squad (5+)',   emoji: '🏟️', hint: 'Need a big table or full area' },
    ],
  },
  {
    id: 'campus',
    title: "Your campus zone",
    subtitle: "Where are you or what's convenient?",
    icon: 'map-outline',
    options: [
      { label: 'Concordia / SGW',      emoji: '🎓', hint: 'Near Mackay, Guy-Concordia metro' },
      { label: 'McGill / Downtown',     emoji: '🏫', hint: 'Near Peel, McGill metro' },
      { label: 'Plateau / Mile-End',    emoji: '🌿', hint: 'Sherbrooke, Mont-Royal, Rachel' },
      { label: 'Anywhere in Mtl',       emoji: '🗺️', hint: "I'll travel if the spot is worth it" },
    ],
  },
  {
    id: 'mustHave',
    title: "Non-negotiables",
    subtitle: "Pick everything you absolutely need",
    icon: 'checkmark-circle-outline',
    multi: true,
    options: [
      { label: 'Reliable Wi-Fi',  emoji: '📶', hint: 'Strong & stable connection' },
      { label: 'Power outlets',   emoji: '🔌', hint: 'For laptop & phone charging' },
      { label: 'Quiet corners',   emoji: '🤫', hint: 'Somewhere secluded to focus' },
      { label: 'Big tables',      emoji: '📐', hint: 'Room to spread books & laptop' },
      { label: 'Good food & coffee', emoji: '🥐', hint: 'Worth making a trip for' },
      { label: 'Open evenings',   emoji: '🌙', hint: 'Still open past 8pm' },
    ],
  },
  {
    id: 'budget',
    title: "Your budget",
    subtitle: "What are you comfortable spending?",
    icon: 'cash-outline',
    options: [
      { label: '$',   emoji: '💧', hint: 'Small drip coffee, nothing fancy' },
      { label: '$$',  emoji: '☕', hint: 'Latte + maybe a snack' },
      { label: '$$$', emoji: '✨', hint: 'Full brunch, treating myself today' },
    ],
  },
];

/* ─── Animated option button ────────────────────────────── */
function OptionButton({
  opt,
  active,
  multi,
  onPress,
  delay,
}: {
  opt: Option;
  active: boolean;
  multi?: boolean;
  onPress: () => void;
  delay: number;
}) {
  const scale    = useSharedValue(1);
  const entrance = useSharedValue(0);

  useEffect(() => {
    entrance.value = withDelay(delay, withSpring(1, SPRING_FAST));
  }, [delay, entrance]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [
      { translateY: interpolate(entrance.value, [0, 1], [14, 0]) },
      { scale: scale.value },
    ],
  }));

  return (
    <Reanimated.View style={[styles.optionWrap, containerStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => {
          scale.value = withSpring(0.94, SPRING_FAST);
          Haptics.selectionAsync();
        }}
        onPressOut={() => { scale.value = withSpring(1, SPRING_SOFT); }}
        onPress={onPress}
        style={[styles.option, active && styles.optionActive]}
      >
        <View style={[styles.optionEmoji, active && styles.optionEmojiActive]}>
          <Text style={styles.emojiText}>{opt.emoji}</Text>
        </View>
        <View style={styles.optionTextCol}>
          <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
            {opt.label}
          </Text>
          <Text style={[styles.optionHint, active && styles.optionHintActive]}>
            {opt.hint}
          </Text>
        </View>
        {multi && (
          <View style={[styles.checkCircle, active && styles.checkCircleActive]}>
            {active && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
        )}
        {!multi && active && (
          <Ionicons name="radio-button-on" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </Reanimated.View>
  );
}

/* ─── Segmented progress dots ───────────────────────────── */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              done   && styles.dotDone,
              active && styles.dotActive,
            ]}
          />
        );
      })}
    </View>
  );
}

/* ─── Main quiz screen ──────────────────────────────────── */
export default function QuizScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [profileSaved, setProfileSaved] = useState(false);

  const total    = QUESTIONS.length;
  const current  = QUESTIONS[Math.min(step, total - 1)];
  const complete = step >= total;

  // Slide transition
  const slideX   = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: cardOpacity.value,
  }));

  const navigateStep = useCallback(
    (nextStep: number, dir: 'forward' | 'back') => {
      const outX = dir === 'forward' ? -width * 0.25 : width * 0.25;
      const inX  = dir === 'forward' ?  width * 0.25 : -width * 0.25;

      cardOpacity.value = withTiming(0, { duration: 160 });
      slideX.value = withTiming(outX, { duration: 180, easing: Easing.in(Easing.quad) }, () => {
        runOnJS(setStep)(nextStep);
        slideX.value = inX;
        cardOpacity.value = withTiming(1, { duration: 60 });
        slideX.value = withSpring(0, { damping: 20, stiffness: 260 });
      });
    },
    [cardOpacity, slideX]
  );

  const onSelect = (opt: string) => {
    if (current.multi) {
      setAnswers((prev) => {
        const existing = Array.isArray(prev[current.id]) ? (prev[current.id] as string[]) : [];
        const active   = existing.includes(opt);
        const next     = active ? existing.filter((x) => x !== opt) : [...existing, opt];
        return { ...prev, [current.id]: next };
      });
      return;
    }
    setAnswers((prev) => ({ ...prev, [current.id]: opt }));
    // Auto-advance for single-select questions (all steps including last)
    setTimeout(() => {
      navigateStep(step + 1, 'forward');
    }, 340);
  };

  const isAnswered = (id: string) => {
    const v = answers[id];
    if (id === 'mustHave') return Array.isArray(v) && v.length > 0;
    return typeof v === 'string' && v.length > 0;
  };

  const onNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < total - 1) navigateStep(step + 1, 'forward');
    else navigateStep(total, 'forward');
  };

  const onPrev = () => {
    if (step === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigateStep(step - 1, 'back');
  };

  /* ── Top matches for completion screen ── */
  const topMatches = useMemo(() => {
    if (!complete) return [];
    const mustHaveStr = Array.isArray(answers.mustHave)
      ? (answers.mustHave as string[]).join(',')
      : (answers.mustHave as string) ?? '';
    return ALL_PLACES.map((place) => ({
      place,
      ...scorePlace(place, {
        sessionType: answers.sessionType as string,
        noise:    answers.noise    as string,
        duration: answers.duration as string,
        group:    answers.group    as string,
        campus:   answers.campus   as string,
        budget:   answers.budget   as string,
        mustHave: mustHaveStr,
      }),
    }))
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, 3);
  }, [answers, complete]);

  /* ── Save profile on complete ── */
  useEffect(() => {
    if (!complete || profileSaved) return;
    const mustHaveStr = Array.isArray(answers.mustHave)
      ? (answers.mustHave as string[]).join(',')
      : (answers.mustHave as string) ?? '';
    saveStudyVibeProfile({
      sessionType: answers.sessionType as string,
      noise:    answers.noise    as string,
      duration: answers.duration as string,
      group:    answers.group    as string,
      campus:   answers.campus   as string,
      budget:   answers.budget   as string,
      mustHave: mustHaveStr,
    })
      .then(() => setProfileSaved(true))
      .catch(() => {});
  }, [answers, complete, profileSaved]);

  /* ── Result label ── */
  const resultLabel = useMemo(() => {
    const session  = (answers.sessionType as string)?.toLowerCase() ?? '';
    const noise    = (answers.noise as string)?.toLowerCase() ?? '';
    const duration = (answers.duration as string)?.toLowerCase() ?? '';
    const group    = (answers.group as string)?.toLowerCase() ?? '';
    if (session.includes('exam') || session.includes('cram'))              return 'Exam crunch mode 🔥';
    if (session.includes('group') || group.includes('squad') || group.includes('crew')) return 'Group project HQ 🤝';
    if (session.includes('research') || session.includes('deep'))          return 'Deep focus session 🔬';
    if (duration.includes('all') || duration.includes('3h'))               return 'All-day laptop grind 💪';
    if (noise.includes('quiet') || noise.includes('pin-drop'))             return 'Silent focus corner 🤫';
    if (group.includes('duo'))                                             return 'Study date vibes 👥';
    return 'Balanced study spot ☕';
  }, [answers]);

  /* ── Completion entrance ── */
  const completionScale   = useSharedValue(0.8);
  const completionOpacity = useSharedValue(0);
  useEffect(() => {
    if (!complete) return;
    completionScale.value   = withSpring(1, { damping: 16, stiffness: 220 });
    completionOpacity.value = withTiming(1, { duration: 340 });
  }, [complete, completionOpacity, completionScale]);
  const completionStyle = useAnimatedStyle(() => ({
    opacity: completionOpacity.value,
    transform: [{ scale: completionScale.value }],
  }));

  /* ── Render ── */
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => router.back()}
        rightIcon={null}
        showLogo={false}
        title="Study Match"
        subtitle="Find your perfect café"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress header */}
        <View style={styles.progressHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepLabel}>
              {complete ? 'Done!' : `Question ${step + 1} of ${total}`}
            </Text>
            <Text style={styles.stepHint}>
              {complete ? 'Here are your personalized café picks' : current.subtitle}
            </Text>
          </View>
          {!complete && (
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>{step + 1}/{total}</Text>
            </View>
          )}
        </View>

        <ProgressDots total={total} current={Math.min(step, total)} />

        {/* Question card */}
        {!complete ? (
          <Reanimated.View style={[styles.card, slideStyle]}>
            {/* Card header */}
            <View style={styles.cardHeader}>
              <View style={styles.iconBubble}>
                <Ionicons name={current.icon} size={20} color={C.accentDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.qTitle}>{current.title}</Text>
                {current.multi && (
                  <Text style={styles.multiHint}>Select all that apply</Text>
                )}
              </View>
            </View>

            {/* Options */}
            <View style={styles.optionList}>
              {current.options.map((opt, i) => {
                const active = current.multi
                  ? Array.isArray(answers[current.id]) && (answers[current.id] as string[]).includes(opt.label)
                  : answers[current.id] === opt.label;
                return (
                  <OptionButton
                    key={opt.label}
                    opt={opt}
                    active={active}
                    multi={current.multi}
                    onPress={() => onSelect(opt.label)}
                    delay={i * 55}
                  />
                );
              })}
            </View>

            {/* Navigation */}
            <View style={styles.navRow}>
              <TouchableOpacity
                onPress={onPrev}
                disabled={step === 0}
                style={[styles.navBack, step === 0 && { opacity: 0.3 }]}
              >
                <Ionicons name="chevron-back" size={18} color={C.text} />
                <Text style={styles.navBackText}>Back</Text>
              </TouchableOpacity>

              {/* Always visible — disabled until answered, auto-advance handles single-select */}
              <TouchableOpacity
                onPress={onNext}
                disabled={!isAnswered(current.id)}
                style={[styles.navNext, !isAnswered(current.id) && { opacity: 0.35 }]}
              >
                <Text style={styles.navNextText}>
                  {step === total - 1 ? 'See my matches' : current.multi ? 'Confirm' : 'Next'}
                </Text>
                <Ionicons name={step === total - 1 ? 'sparkles' : 'chevron-forward'} size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </Reanimated.View>
        ) : (
          /* ── Completion card ── */
          <Reanimated.View style={[styles.resultCard, completionStyle]}>
            <View style={styles.resultIconRow}>
              <View style={styles.resultIcon}>
                <Text style={{ fontSize: 24 }}>
                  {resultLabel.split(' ').pop()}
                </Text>
              </View>
            </View>

            <Text style={styles.resultEyebrow}>Your study profile</Text>
            <Text style={styles.resultTitle}>{resultLabel.replace(/[^\x00-\x7F]/g, '').trim()}</Text>

            {/* Answer summary chips */}
            <View style={styles.answerSummary}>
              {(Object.entries(answers) as [string, string | string[]][]).flatMap(([key, val]) => {
                const vals = Array.isArray(val) ? val : val ? [val] : [];
                return vals.map((v) => (
                  <View key={`${key}-${v}`} style={styles.answerChip}>
                    <Text style={styles.answerChipText}>{v}</Text>
                  </View>
                ));
              })}
            </View>

            {/* Top 3 matches preview */}
            <View style={styles.matchPreview}>
              <Text style={styles.matchPreviewTitle}>Top café picks</Text>
              {topMatches.length === 0 ? (
                <View style={{ paddingVertical: 12, alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 22 }}>☕</Text>
                  <Text style={{ fontSize: 13, color: C.sub, textAlign: 'center' }}>
                    Tap "Full ranked list" to browse all spots
                  </Text>
                </View>
              ) : (
                topMatches.map(({ place, matchPercent, reasons }) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.matchRow}
                    onPress={() => router.push({ pathname: '/place', params: { id: place.id } })}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.matchRowTop}>
                        <Text style={styles.matchName}>{place.name}</Text>
                        <Text style={styles.matchPct}>{matchPercent}%</Text>
                      </View>
                      <View style={styles.matchBarTrack}>
                        <View style={[styles.matchBarFill, { width: `${Math.max(matchPercent, 8)}%` }]} />
                      </View>
                      {reasons.length > 0 && (
                        <Text style={styles.matchReason} numberOfLines={1}>{reasons[0]}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.sub} style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                ))
              )}
            </View>

            {/* Actions */}
            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.actionSecondary}
                onPress={() =>
                  router.push({
                    pathname: '/quiz/results',
                    params: {
                      sessionType: (answers.sessionType as string) ?? '',
                      noise:       (answers.noise    as string) ?? '',
                      duration:    (answers.duration as string) ?? '',
                      group:       (answers.group    as string) ?? '',
                      campus:      (answers.campus   as string) ?? '',
                      budget:      (answers.budget   as string) ?? '',
                      mustHave: Array.isArray(answers.mustHave)
                        ? (answers.mustHave as string[]).join(',')
                        : (answers.mustHave as string) ?? '',
                    },
                  })
                }
              >
                <Ionicons name="list-outline" size={18} color={C.accentDark} />
                <Text style={styles.actionSecondaryText}>Full ranked list</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionPrimary}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/session/new');
                }}
              >
                <Text style={styles.actionPrimaryText}>Start a session</Text>
                <Ionicons name="people" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => { setStep(0); setAnswers({}); setProfileSaved(false); }}
              style={styles.retakeLink}
            >
              <Ionicons name="refresh-outline" size={14} color={C.accentDark} />
              <Text style={styles.retakeText}>Retake quiz</Text>
            </TouchableOpacity>
          </Reanimated.View>
        )}

        {/* Live answer summary while quizzing */}
        {!complete && Object.keys(answers).length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your picks so far</Text>
            <View style={styles.summaryRow}>
              {(Object.entries(answers) as [string, string | string[]][]).flatMap(([key, val]) => {
                const vals = Array.isArray(val) ? val : val ? [val] : [];
                return vals.map((v) => (
                  <View key={`${key}-${v}`} style={styles.summaryChip}>
                    <Text style={styles.summaryChipText}>{v}</Text>
                  </View>
                ));
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────── */
const styles = StyleSheet.create({
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  stepHint: {
    fontSize: 12,
    color: C.sub,
    marginTop: 2,
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#fff',
  },
  stepPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.accentDark,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 6,
    width: 20,
    borderRadius: 3,
    backgroundColor: '#EBE0DA',
  },
  dotDone: {
    backgroundColor: C.accentDark,
    opacity: 0.4,
  },
  dotActive: {
    backgroundColor: C.accentDark,
    width: 32,
    opacity: 1,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.text,
    lineHeight: 24,
  },
  multiHint: {
    fontSize: 11,
    color: C.accent,
    fontWeight: '700',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  optionList: {
    gap: 10,
  },
  optionWrap: {
    // container for entrance animation
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: '#fff',
  },
  optionActive: {
    backgroundColor: C.accentDark,
    borderColor: C.accentDark,
  },
  optionEmoji: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3E7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmojiActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  emojiText: {
    fontSize: 20,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  optionLabelActive: {
    color: '#fff',
  },
  optionHint: {
    fontSize: 11,
    color: C.sub,
    marginTop: 2,
    lineHeight: 15,
  },
  optionHintActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  navRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  navBack: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBackText: {
    color: C.text,
    fontWeight: '700',
    fontSize: 14,
  },
  navNext: {
    height: 46,
    borderRadius: 14,
    backgroundColor: C.accentDark,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
    shadowColor: C.accentDark,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  navNextText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },

  /* ── Completion card ── */
  resultCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  resultIconRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: C.sub,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: C.accentDark,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  answerSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  answerChip: {
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  answerChipText: {
    fontSize: 11,
    color: C.accentDark,
    fontWeight: '600',
  },
  matchPreview: {
    backgroundColor: '#FFFDFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  matchPreviewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: C.text,
    marginBottom: 4,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EBE0DA',
  },
  matchRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  matchPct: {
    fontSize: 13,
    fontWeight: '800',
    color: C.accentDark,
  },
  matchBarTrack: {
    height: 5,
    borderRadius: 99,
    backgroundColor: '#F1E5DE',
    marginTop: 5,
    overflow: 'hidden',
  },
  matchBarFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: C.accentDark,
  },
  matchReason: {
    fontSize: 11,
    color: C.sub,
    marginTop: 4,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionSecondaryText: {
    color: C.accentDark,
    fontWeight: '700',
    fontSize: 13,
  },
  actionPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.accentDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: C.accentDark,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  actionPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  retakeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: 4,
  },
  retakeText: {
    color: C.accentDark,
    fontWeight: '700',
    fontSize: 13,
  },

  /* ── Summary while quizzing ── */
  summaryCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: C.sub,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  summaryChip: {
    backgroundColor: C.chip,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryChipText: {
    fontSize: 11,
    color: C.accentDark,
    fontWeight: '600',
  },
});
