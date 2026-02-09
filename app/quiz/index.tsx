import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { CURRENT_USER_ID, USERS } from '../../data/users';

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

type Q = {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
  icon?: keyof typeof Ionicons.glyphMap;
};

const QUESTIONS: Q[] = [
  {
    id: 'noise',
    title: 'Noise level',
    subtitle: 'How quiet do you need it today?',
    options: ['Pin-drop quiet', 'Soft chatter', 'Lively café'],
    icon: 'volume-low',
  },
  {
    id: 'time',
    title: 'Time of day',
    subtitle: 'When are you studying?',
    options: ['Morning', 'Afternoon', 'Evening', 'Late night'],
    icon: 'time-outline',
  },
  {
    id: 'duration',
    title: 'Duration',
    subtitle: 'How long is your session?',
    options: ['Quick sprint (30–45m)', 'Medium (1–2h)', 'Long (3h+)'],
    icon: 'timer-outline',
  },
  {
    id: 'group',
    title: 'Group size',
    subtitle: 'Solo or squad?',
    options: ['Solo', 'Duo', 'Small group (3–4)', 'Big group (5+)'],
    icon: 'people-outline',
  },
  {
    id: 'vibe',
    title: 'Vibe',
    subtitle: 'Pick an atmosphere',
    options: ['Warm & cozy', 'Bright & modern', 'Industrial', 'Green & airy'],
    icon: 'leaf-outline',
  },
  {
    id: 'food',
    title: 'Food priorities',
    subtitle: 'Snacks or full menu?',
    options: ['Coffee only', 'Pastries', 'Brunch', 'Full menu'],
    icon: 'restaurant-outline',
  },
  {
    id: 'budget',
    title: 'Budget',
    subtitle: 'Pick your price comfort',
    options: ['$', '$$', '$$$'],
    icon: 'cash-outline',
  },
  {
    id: 'mustHave',
    title: 'Must-haves',
    subtitle: 'One essential detail',
    options: ['Wi‑Fi', 'Outlets', 'Quiet corners', 'Big tables'],
    icon: 'options-outline',
  },
];

const { width } = Dimensions.get('window');

const mapNoisePref = (noise?: string) => {
  if (!noise) return undefined;
  if (noise === 'quiet') return 'Pin-drop quiet';
  if (noise === 'medium') return 'Soft chatter';
  if (noise === 'lively') return 'Lively café';
  return undefined;
};

export default function QuizScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const currentUser = USERS.find((u) => u._id === CURRENT_USER_ID);
  const presetMust = [
    currentUser?.preferences.wifi ? 'Wi‑Fi' : null,
    currentUser?.preferences.outlets ? 'Outlets' : null,
  ].filter(Boolean) as string[];

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    noise: mapNoisePref(currentUser?.preferences.noise) ?? '',
    mustHave: presetMust,
  });

  const total = QUESTIONS.length;
  const current = QUESTIONS[Math.min(step, total - 1)];
  const progress = Math.round((step / total) * 100);
  const complete = step >= total;

  const resultLabel = useMemo(() => {
    if (!complete) return '';
    const a = answers;
    if (a.noise === 'Pin-drop quiet') return 'Silent-focus corner';
    if (a.vibe === 'Warm & cozy') return 'Cozy booth vibes';
    if (a.duration === 'Long (3h+)') return 'All‑day friendly cafe';
    return 'Balanced study spot';
  }, [answers, complete]);

  const onSelect = (opt: string) => {
    if (current.id === 'mustHave') {
      setAnswers((prev) => {
        const existing = Array.isArray(prev.mustHave) ? prev.mustHave : [];
        const active = existing.includes(opt);
        const next = active ? existing.filter((item) => item !== opt) : [...existing, opt];
        return { ...prev, mustHave: next };
      });
      return;
    }
    setAnswers((prev) => ({ ...prev, [current.id]: opt }));
  };

  const isAnswered = (id: string) => {
    const value = answers[id];
    if (id === 'mustHave') return Array.isArray(value) && value.length > 0;
    return typeof value === 'string' && value.length > 0;
  };

  const onNext = () => setStep((prev) => Math.min(prev + 1, total));
  const onPrev = () => setStep((prev) => Math.max(prev - 1, 0));

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cardAnim.setValue(0);
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, cardAnim]);

  const cardStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => router.back()}
        rightIcon={null}
        showLogo={false}
        title="Study Match"
        subtitle="Curate your perfect cafe"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ambient blobs */}
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        <View style={styles.heroRow}>
          <View style={styles.heroBadge}>
            <Ionicons name="cafe-outline" size={18} color={C.accentDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Find your study vibe</Text>
            <Text style={styles.heroSub}>Answer a few taps, we’ll curate the best spots.</Text>
          </View>
          <View style={styles.stepPill}>
            <Text style={styles.stepText}>{Math.min(step + 1, total)}/{total}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Question card */}
        {!complete ? (
          <Animated.View style={[styles.card, cardStyle]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBubble}>
                <Ionicons name={current.icon ?? 'help-circle-outline'} size={18} color={C.accentDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.qTitle}>{current.title}</Text>
                <Text style={styles.qSubtitle}>{current.subtitle}</Text>
              </View>
            </View>

            <View style={styles.optionGrid}>
              {current.options.map((opt) => {
                const active =
                  current.id === 'mustHave'
                    ? Array.isArray(answers.mustHave) && answers.mustHave.includes(opt)
                    : answers[current.id] === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => onSelect(opt)}
                    activeOpacity={0.9}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.navRow}>
              <TouchableOpacity
                disabled={step === 0}
                onPress={onPrev}
                style={[styles.secondaryBtn, step === 0 && { opacity: 0.5 }]}
              >
                <Ionicons name="chevron-back" size={18} color={C.text} />
                <Text style={styles.secondaryText}>Back</Text>
              </TouchableOpacity>

            <TouchableOpacity
              onPress={onNext}
              disabled={!isAnswered(current.id)}
              style={[styles.primaryBtn, !isAnswered(current.id) && { opacity: 0.5 }]}
            >
              <Text style={styles.primaryText}>{step === total - 1 ? 'See matches' : 'Next'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          </Animated.View>
        ) : (
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <Ionicons name="sparkles" size={22} color="#fff" />
            </View>
            <Text style={styles.resultTitle}>Your match type</Text>
            <Text style={styles.resultText}>{resultLabel}</Text>

            <View style={styles.topMatches}>
              <Text style={styles.topMatchesTitle}>Top cafe picks</Text>
              <Text style={styles.topMatchesSub}>We’ll show the full list next.</Text>
              <View style={styles.topMatchList}>
                {[
                  { name: 'Savsav', id: 'savsav' },
                  { name: 'Accio Cup', id: 'accio' },
                  { name: 'Café Constance', id: 'constance' },
                ].map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.topMatchChip}
                    onPress={() =>
                      router.push({ pathname: '/place', params: { id: place.id } })
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.topMatchText}>{place.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() =>
                  router.push({
                    pathname: '/quiz/results',
                    params: {
                      noise: (answers.noise as string) ?? '',
                      time: (answers.time as string) ?? '',
                      duration: (answers.duration as string) ?? '',
                      group: (answers.group as string) ?? '',
                      vibe: (answers.vibe as string) ?? '',
                      food: (answers.food as string) ?? '',
                      budget: (answers.budget as string) ?? '',
                      mustHave: Array.isArray(answers.mustHave)
                        ? answers.mustHave.join(',')
                        : (answers.mustHave as string) ?? '',
                    },
                  })
                }
              >
                <Ionicons name="map" size={18} color={C.text} />
                <Text style={styles.secondaryText}>View cafe list</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/session/new')}>
                <Text style={styles.primaryText}>Start a session</Text>
                <Ionicons name="people" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => { setStep(0); setAnswers({}); }} style={styles.resetLink}>
              <Text style={styles.resetText}>Retake quiz</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Live summary */}
        {!complete && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your current picks</Text>
            <View style={styles.summaryRow}>
              {Object.entries(answers).flatMap(([key, value]) => {
                if (Array.isArray(value)) {
                  return value.map((item) => (
                    <View key={`${key}-${item}`} style={styles.summaryChip}>
                      <Text style={styles.summaryText}>{item}</Text>
                    </View>
                  ));
                }
                if (!value) return [];
                return (
                  <View key={key} style={styles.summaryChip}>
                    <Text style={styles.summaryText}>{value}</Text>
                  </View>
                );
              })}
              {Object.keys(answers).length === 0 && (
                <Text style={styles.summaryEmpty}>Pick options to build your vibe.</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  blobTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFEDE3',
    opacity: 0.8,
  },
  blobBottom: {
    position: 'absolute',
    bottom: 140,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F9E2D6',
    opacity: 0.6,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },
  heroSub: {
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
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.accentDark,
  },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#F1E5DE',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.accentDark,
    borderRadius: 999,
  },
  card: {
    marginTop: 16,
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  qSubtitle: {
    fontSize: 12,
    color: C.sub,
    marginTop: 2,
  },
  optionGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    width: width > 500 ? '48%' : '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#fff',
  },
  optionActive: {
    backgroundColor: C.accentDark,
    borderColor: C.accentDark,
  },
  optionText: {
    color: C.text,
    fontWeight: '700',
    fontSize: 13,
  },
  optionTextActive: {
    color: '#fff',
  },
  navRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryText: {
    color: C.text,
    fontWeight: '700',
  },
  primaryBtn: {
    height: 46,
    borderRadius: 14,
    backgroundColor: C.accentDark,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: C.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  resultIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '800',
    color: C.accentDark,
    marginTop: 4,
  },
  resultActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  topMatches: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#fff',
  },
  topMatchesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },
  topMatchesSub: {
    fontSize: 11,
    color: C.sub,
    marginTop: 2,
  },
  topMatchList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  topMatchChip: {
    backgroundColor: C.chip,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  topMatchText: {
    fontSize: 11,
    color: C.accentDark,
    fontWeight: '600',
  },
  resetLink: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  resetText: {
    color: C.accentDark,
    fontWeight: '700',
  },
  summaryCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.sub,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  summaryChip: {
    backgroundColor: C.chip,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryText: {
    fontSize: 11,
    color: C.accentDark,
    fontWeight: '600',
  },
  summaryEmpty: {
    fontSize: 12,
    color: C.sub,
  },
});
