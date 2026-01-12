import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const C = {
  bg: '#FFF7F0',        // latte foam
  card: '#FFFFFF',
  text: '#1F1A17',
  sub: '#6F6159',
  accent: '#C27C4A',    // caramel
  accentDark: '#7F3B00',// espresso
  border: '#E8D9D1',
  chip: '#F6E9E1',
};

type Q = { id: string; title: string; options: string[]; icon?: keyof typeof Ionicons.glyphMap };
const QUESTIONS: Q[] = [
  { id:'noise',   title:'What noise level suits you today?', options:['Pin-drop quiet','Soft chatter','Lively café'], icon: 'volume-low' },
  { id:'session', title:'How long do you want to study?',   options:['Quick sprint (30–45m)','Medium (1–2h)','Long (3h+)'], icon: 'timer-outline' },
  { id:'vibe',    title:'Pick a vibe',                       options:['Warm & cozy','Bright & modern','Green & airy'],   icon: 'leaf-outline' },
];

const { width } = Dimensions.get('window');

export default function QuizScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string,string>>({});

  const complete = step >= QUESTIONS.length;
  const result = useMemo(() => {
    if (!complete) return '';
    const a = answers;
    if (a.noise === 'Pin-drop quiet') return 'Library nook nearby';
    if (a.vibe === 'Warm & cozy')     return 'Cozy café booth';
    if (a.session === 'Long (3h+)')   return 'Spacious café with outlets';
    return 'Any chill coffee shop around you';
  }, [answers, complete]);

  // ---------- tiny animations (steam + bean wobble) ----------
  const steam1 = useRef(new Animated.Value(0)).current;
  const steam2 = useRef(new Animated.Value(0)).current;
  const beanY  = useRef(new Animated.Value(0)).current;
  const beanR  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopSteam = () => {
      Animated.parallel([
        Animated.timing(steam1, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(steam2, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]).start(() => { steam1.setValue(0); steam2.setValue(0); loopSteam(); });
    };
    const loopBean = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(beanY, { toValue: -6, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(beanY, { toValue: 0,  duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(beanR, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(beanR, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ]).start(() => loopBean());
    };
    loopSteam();
    loopBean();
  }, [steam1, steam2, beanY, beanR]);

  const steamStyle1 = {
    opacity: steam1.interpolate({ inputRange: [0,1], outputRange: [0.0, 0.9] }),
    transform: [
      { translateY: steam1.interpolate({ inputRange: [0,1], outputRange: [0, -12] }) },
      { translateX: steam1.interpolate({ inputRange: [0,1], outputRange: [0,  4]  }) },
    ],
  };
  const steamStyle2 = {
    opacity: steam2.interpolate({ inputRange: [0,1], outputRange: [0.0, 0.9] }),
    transform: [
      { translateY: steam2.interpolate({ inputRange: [0,1], outputRange: [0, -10] }) },
      { translateX: steam2.interpolate({ inputRange: [0,1], outputRange: [0, -4]  }) },
    ],
  };
  const beanRotate = beanR.interpolate({ inputRange: [0,1], outputRange: ['-8deg','8deg'] });

  // ---------- helpers ----------
  const onSelect = (opt: string) => {
    const q = QUESTIONS[step];
    setAnswers(prev => ({ ...prev, [q.id]: opt }));
  };

  const onNext = () => setStep(prev => Math.min(prev + 1, QUESTIONS.length));
  const onPrev = () => setStep(prev => Math.max(prev - 1, 0));

  // ---------- UI ----------
  return (
    <ScrollView style={{ flex:1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

      {/* Header with cup + steam + bean */}
      <View style={styles.heroHeader}>
        <View style={styles.heroRow}>
          <View style={styles.cup}>
            <Ionicons name="cafe" size={30} color={C.accentDark} />
            <Animated.View style={[styles.steamDot, steamStyle1]} />
            <Animated.View style={[styles.steamDot, steamStyle2]} />
          </View>

          <Animated.View style={{ transform: [{ translateY: beanY }, { rotate: beanRotate }] }}>
            <View style={styles.beanBadge}>
              <Ionicons name="cafe" size={16} color="#fff" />
            </View>
          </Animated.View>
        </View>

        <Text style={styles.title}>Find your study vibe</Text>
        <Text style={styles.subtitle}>Tiny coffee quiz to match your mood <Text>☕️</Text></Text>
      </View>

      {/* Progress beans */}
      <View style={styles.progressRow}>
        {QUESTIONS.map((_, i) => {
          const active = i <= step - 1 || (i === step && !complete);
          const done   = i < step;
        return (
          <View key={i} style={[styles.progressBean, active && { backgroundColor: C.accent }, done && { backgroundColor: C.accentDark }]} />
        );})}
      </View>

      {/* Card – show current question OR result */}
      {!complete ? (
        <View style={styles.card}>
          <View style={styles.qHeader}>
            <View style={styles.qIcon}>
              <Ionicons name={(QUESTIONS[step].icon ?? 'help-circle-outline') as any} size={18} color={C.accentDark} />
            </View>
            <Text style={styles.qTitle}>{QUESTIONS[step].title}</Text>
          </View>

          <View style={{ gap: 10, marginTop: 6 }}>
            {QUESTIONS[step].options.map(opt => {
              const active = answers[QUESTIONS[step].id] === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => onSelect(opt)}
                  activeOpacity={0.9}
                  style={[styles.opt, active && styles.optActive]}>
                  <View style={styles.optIcon}>
                    <Ionicons name="cafe-outline" size={16} color={active ? '#fff' : C.accentDark} />
                  </View>
                  <Text style={[styles.optLabel, active && { color:'#fff' }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.navRow}>
            <TouchableOpacity disabled={step===0} onPress={onPrev} style={[styles.secondaryBtn, step===0 && { opacity: .5 }]}>
              <Ionicons name="chevron-back" size={18} color={C.text} />
              <Text style={styles.secondaryText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNext}
              disabled={!answers[QUESTIONS[step].id]}
              style={[
                styles.primaryBtn,
                !answers[QUESTIONS[step].id] && { opacity: .5 }
              ]}>
              <Text style={styles.primaryText}>{step === QUESTIONS.length - 1 ? 'See my match' : 'Next'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.resultCard}>
          <View style={styles.resultIcon}>
            <Ionicons name="cafe" size={22} color="#fff" />
          </View>
          <Text style={styles.resultTitle}>Your vibe</Text>
          <Text style={styles.resultText}>{result}</Text>

          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)/map')}>
              <Ionicons name="map" size={18} color={C.text} />
              <Text style={styles.secondaryText}>Open map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/session/new')}>
              <Text style={styles.primaryText}>Start a session</Text>
              <Ionicons name="people" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => { setStep(0); setAnswers({}); }} style={styles.resetLink}>
            <Text style={{ color: C.accentDark, fontWeight: '700' }}>Retake quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  heroHeader: { marginTop: 6, marginBottom: 8 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cup: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFEDE3', alignItems: 'center', justifyContent: 'center' },
  steamDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#E3B79D', top: 6 },
  beanBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.accentDark, alignItems:'center', justifyContent:'center' },

  title: { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: .2 },
  subtitle: { color: C.sub, marginTop: 2 },

  progressRow: { flexDirection: 'row', gap: 6, marginTop: 4, marginBottom: 10 },
  progressBean: { width: 14, height: 10, borderRadius: 8, backgroundColor: C.chip },

  card: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 18, padding: 16,
    shadowColor: '#7F3B00', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },

  qHeader: { flexDirection:'row', alignItems:'center', gap:10 },
  qIcon: { width:28, height:28, borderRadius:14, backgroundColor:'#FFEDE3', alignItems:'center', justifyContent:'center' },
  qTitle: { color: C.text, fontWeight:'800', flexShrink: 1 },

  opt: {
    height: 50, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingHorizontal: 12,
  },
  optActive: { backgroundColor: C.accentDark, borderColor: C.accentDark },
  optLabel: { color: C.text, fontWeight: '700' },
  optIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFEDE3', alignItems:'center', justifyContent:'center' },

  navRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop: 14 },
  secondaryBtn: {
    height: 48, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, backgroundColor: '#fff', flexDirection:'row', alignItems:'center', gap:8,
  },
  secondaryText: { color: C.text, fontWeight:'700' },
  primaryBtn: {
    height: 48, borderRadius: 14, backgroundColor: C.accentDark,
    paddingHorizontal: 16, flexDirection:'row', alignItems:'center', gap:8,
  },
  primaryText: { color:'#fff', fontWeight:'800' },

  resultCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 18, padding: 18, alignItems:'flex-start',
  },
  resultIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.accentDark, alignItems:'center', justifyContent:'center', marginBottom: 8 },
  resultTitle: { color: C.text, fontWeight: '900', fontSize: 18 },
  resultText: { color: C.sub, fontWeight: '700', marginTop: 4 },

  resultActions: { flexDirection:'row', alignItems:'center', gap:10, marginTop: 16 },
  resetLink: { marginTop: 10 },
});
