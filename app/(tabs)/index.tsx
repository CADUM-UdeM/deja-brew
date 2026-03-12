// app/(tabs)/index.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AppHeader from '../../components/AppHeader';
import { fetchPlaces, fetchSessions } from '../../data/api';
import { ALL_PLACES, CafePlace } from '../../data/places';
import { SESSION_FEED, SessionFeedItem } from '../../data/sessions';

const THEME = {
  bg: '#FFF6EF',
  card: '#FFFFFF',
  text: '#2A1C17',
  sub: '#7A6B62',
  accent: '#C27C4A',
  accentDark: '#7F3B00',
  pill: '#F3E7E0',
  border: '#E8D9D1',
};

const CATEGORIES = ['Tous', 'Calme', 'Coworking', 'Brunch', 'Aesthetic'] as const;
type Category = (typeof CATEGORIES)[number];

const IMAGES = {
  heroStudy: require('../../assets/images/home-hero-study.png'),
} as const;

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<Category>('Tous');
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<CafePlace[]>(ALL_PLACES);
  const [sessions, setSessions] = useState<SessionFeedItem[]>(SESSION_FEED);

  const items: CafePlace[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    return places.filter((p) => {
      // filtre par catégorie "vibe"
      if (selected !== 'Tous') {
        const label = selected.toLowerCase();
        const inTags = p.tags.some((tag) => tag.toLowerCase().includes(label));
        const inVibe = p.vibe.toLowerCase().includes(label);
        const inAtmosphere = p.studyAtmosphere.some((s) =>
          s.toLowerCase().includes(label)
        );
        if (!inTags && !inVibe && !inAtmosphere) return false;
      }

      if (!q) return true;

      const haystack = (
        p.name +
        ' ' +
        p.address +
        ' ' +
        p.district +
        ' ' +
        p.tags.join(' ')
      ).toLowerCase();

      return haystack.includes(q);
    });
  }, [selected, query, places]);

  const quickResults = useMemo(() => {
    if (!query.trim()) return [];
    return items.slice(0, 4);
  }, [items, query]);

  // simple sélection de cafés mis de l’avant
  const featuredPlaces = useMemo(() => places.slice(0, 3), [places]);
  const featuredSessions = useMemo(() => sessions.slice(0, 3), [sessions]);

  // cute coffee bean animation (bounce + wobble)
  const beanY = useRef(new Animated.Value(0)).current;
  const beanR = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(beanY, {
            toValue: -6,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(beanY, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(beanR, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(beanR, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(loop);
    };

    loop();
  }, [beanY, beanR]);

  useEffect(() => {
    let mounted = true;
    fetchPlaces()
      .then((data) => {
        if (mounted) setPlaces(data);
      })
      .catch(() => { });

    fetchSessions()
      .then((data) => {
        if (mounted) setSessions(data);
      })
      .catch(() => { });

    return () => {
      mounted = false;
    };
  }, []);

  const beanRotate = beanR.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: THEME.bg }]}>
      {/* App header */}
      <AppHeader onRightPress={() => router.push('/notifications')} />

      <ScrollView
        style={{ flex: 1, backgroundColor: THEME.bg }}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.padH}>
          <View
            style={[
              styles.hero,
              { backgroundColor: '#FFEDE3', borderColor: THEME.border },
            ]}
          >
            <View style={styles.rowBetween}>
              {/* what you do / value prop */}
              <View style={styles.rowLeft}>
                <Animated.View
                  style={{ transform: [{ translateY: beanY }, { rotate: beanRotate }] }}
                >
                  <View style={styles.beanBadge}>
                    <Ionicons name="location-outline" size={16} color="#fff" />
                  </View>
                </Animated.View>
                <View>
                  <Text style={styles.appName}>Find a spot to study</Text>
                  <Text style={styles.tagline}>
                    Montréal · {places.length} curated cafés
                  </Text>
                </View>
              </View>

            </View>

            {/* Search */}
            <View
              style={[
                styles.searchBox,
                { backgroundColor: '#fff', borderColor: THEME.border },
              ]}
            >
              <Ionicons name="search-outline" size={18} color={THEME.sub} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Wi-Fi, calme, prises, brunch..."
                placeholderTextColor={THEME.sub}
                returnKeyType="search"
                style={[styles.input, { color: THEME.text }]}
              />
              <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
                <Ionicons name="cafe-outline" size={18} color={THEME.accentDark} />
              </TouchableOpacity>
            </View>

            {/* Instant search results */}
            {query.trim().length > 0 && (
              <View style={styles.instantResults}>
                {quickResults.length === 0 ? (
                  <Text style={styles.instantEmpty}>No cafes found. Try another keyword.</Text>
                ) : (
                  quickResults.map((place) => (
                    <TouchableOpacity
                      key={place.id}
                      style={styles.instantRow}
                      onPress={() =>
                        router.push({ pathname: '/place', params: { id: place.id } })
                      }
                    >
                      <View>
                        <Text style={styles.instantTitle}>{place.name}</Text>
                        <Text style={styles.instantSub}>
                          {place.district} · {place.tags.slice(0, 2).join(' · ')}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={THEME.sub} />
                    </TouchableOpacity>
                  ))
                )}
                {quickResults.length > 0 && (
                  <Text style={styles.instantHint}>
                    Showing {quickResults.length} results · keep typing to refine
                  </Text>
                )}
              </View>
            )}

            {/* Illustration tasse + livre */}
            <View style={styles.heroIllustrationWrapper}>
              <Image
                source={IMAGES.heroStudy}
                contentFit="cover"
                style={styles.heroIllustration}
              />
            </View>

            {/* main CTAs */}
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => router.push('/quiz')}
            >
              <Text style={styles.primaryCtaText}>Find your study vibe</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => router.push('/session/new')}
            >
              <Text style={[styles.primaryCtaText, { color: THEME.accentDark }]}>
                Start a study session
              </Text>
            </TouchableOpacity>

            {/* quick filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingTop: 12 }}
            >
              {['Popular', 'Recent', 'Long sessions', 'Morning', 'Near metro'].map(
                (label) => (
                  <View
                    key={label}
                    style={[
                      styles.quick,
                      { backgroundColor: '#fff', borderColor: THEME.border },
                    ]}
                  >
                    <Text style={{ color: THEME.text, fontSize: 12 }}>{label}</Text>
                  </View>
                )
              )}
            </ScrollView>
          </View>
        </View>

        {/* Featured cafés & deals */}
        <View style={[styles.padH, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Featured cafés & deals</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 12,
            paddingHorizontal: 20,
            paddingVertical: 8,
          }}
        >
          {/* Card linking straight to promos tab */}
          <TouchableOpacity
            style={[
              styles.featuredCard,
              {
                backgroundColor: '#FBD3BF',
                borderColor: THEME.border,
                width: 230,
              },
            ]}
            onPress={() => router.push('/(tabs)/promos')}
            activeOpacity={0.9}
          >
            <Text style={[styles.featuredLabel, { color: THEME.text }]}>
              Today’s deals
            </Text>
            <Text style={styles.featuredSub}>Student discounts & happy hours</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Ionicons name="pricetag-outline" size={14} color={THEME.accentDark} />
              <Text style={[styles.featuredSub, { marginLeft: 4 }]}>
                See all promos
              </Text>
            </View>
          </TouchableOpacity>

          {featuredPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.featuredCard,
                {
                  backgroundColor: '#F6EDE6',
                  borderColor: THEME.border,
                  width: 230,
                },
              ]}
              onPress={() =>
                router.push({ pathname: '/place', params: { id: place.id } })
              }
              activeOpacity={0.9}
            >
              <Text
                style={[styles.featuredLabel, { color: THEME.text }]}
                numberOfLines={1}
              >
                {place.name}
              </Text>

              <Text style={styles.featuredSub} numberOfLines={1}>
                {place.district} · {place.tags.slice(0, 2).join(' · ')}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Ionicons name="cafe-outline" size={14} color={THEME.accentDark} />
                <Text style={[styles.featuredSub, { marginLeft: 4 }]}>
                  Great for study sessions
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Match to Study */}
        <View style={[styles.padH, { marginTop: 12 }]}>
          <View style={styles.matchCard}>
            <View style={styles.matchBgBubble} />
            <View style={styles.matchBgBubbleTwo} />

            <View style={styles.matchHeader}>
              <View>
                <Text style={styles.matchTitle}>Match to Study</Text>
                <Text style={styles.matchSubtitle}>Find people studying now</Text>
              </View>
              <TouchableOpacity
                style={styles.matchGhostBtn}
                onPress={() => router.push('/sessions')}
              >
                <Text style={styles.matchGhostText}>Browse</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.matchStatsRow}>
              <View style={styles.matchStat}>
                <Text style={styles.matchStatValue}>{sessions.length}</Text>
                <Text style={styles.matchStatLabel}>Active sessions</Text>
              </View>
              <View style={styles.matchStat}>
                <Text style={styles.matchStatValue}>Montréal</Text>
                <Text style={styles.matchStatLabel}>City vibe</Text>
              </View>
              <TouchableOpacity
                style={styles.matchPrimaryBtn}
                onPress={() => router.push('/session/new')}
              >
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <Text style={styles.matchPrimaryText}>Start a session</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
            >
              {featuredSessions.map((session) => (
                <TouchableOpacity
                  key={session._id}
                  style={styles.sessionCard}
                  onPress={() => router.push(`/sessions/${session._id}`)}
                >
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionSub}>
                    {session.course} · {session.timeSlot}
                  </Text>
                  <View style={styles.sessionMetaRow}>
                    <Ionicons name="location-outline" size={14} color={THEME.sub} />
                    <Text style={styles.sessionMetaText}>{session.locationLabel}</Text>
                  </View>
                  <View style={styles.sessionMetaRow}>
                    <Ionicons name="people-outline" size={14} color={THEME.sub} />
                    <Text style={styles.sessionMetaText}>
                      {session.participantsCount}/{session.maxPeople} · {session.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.matchTagsRow}>
              {['IFT3355', 'Linear Algebra', 'Exam cram'].map((tag) => (
                <View key={tag} style={styles.matchTag}>
                  <Ionicons name="people-outline" size={14} color={THEME.accentDark} />
                  <Text style={styles.matchTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Popular places */}
        <View style={[styles.padH, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>
            {selected === 'Tous'
              ? 'Lieux populaires'
              : `${selected} spots populaires`}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 10,
            paddingHorizontal: 10,
            paddingVertical: 12,
          }}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity key={category} onPress={() => setSelected(category)}>
              <View
                style={[
                  styles.catChip,
                  {
                    backgroundColor:
                      selected === category ? THEME.accentDark : '#CFC7C2',
                  },
                ]}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>{category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Brown place cards */}
        <View style={{ marginBottom: 32 }}>
          {items.map((place) => (
            <TouchableOpacity
              key={place.id}
              onPress={() =>
                router.push({ pathname: '/place', params: { id: place.id } })
              }
            >
              <View
                style={[styles.brownCard, { backgroundColor: THEME.accentDark }]}
              >
                <Text style={styles.placeTitle}>{place.name}</Text>

                <View style={styles.placeLocationRow}>
                  <Ionicons name="location-outline" size={16} color="#fff" />
                  <Text style={styles.placeLocationText}>
                    {place.district} · {place.address}
                  </Text>
                </View>

                <View style={styles.placeIconBadge}>
                  <Ionicons name="cafe" size={24} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  padH: { paddingHorizontal: 20 },

  hero: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    marginTop: 12,
  },

  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },

  beanBadge: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: 24, fontWeight: '800', color: THEME.text },
  tagline: { fontSize: 12, color: THEME.sub },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    marginTop: 12,
  },
  input: { flex: 1, paddingVertical: 8 },

  heroIllustrationWrapper: {
    marginTop: 14,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FADAC6',
    height: 130,
  },
  heroIllustration: {
    width: '100%',
    height: '100%',
  },

  quick: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryCta: {
    marginTop: 14,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.accentDark,
  },
  primaryCtaText: { color: '#fff', fontWeight: '800', letterSpacing: 0.3 },

  secondaryCta: {
    marginTop: 8,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME.border,
  },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: THEME.text },
  sectionSubtitle: { fontSize: 12, color: THEME.sub, marginTop: 2 },
  link: { color: THEME.accentDark, fontWeight: '700' },
  matchCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFF7F2',
    padding: 16,
    overflow: 'hidden',
  },
  matchBgBubble: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE7D8',
    opacity: 0.7,
  },
  matchBgBubbleTwo: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F7DCCB',
    opacity: 0.6,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
  },
  matchSubtitle: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 2,
  },
  matchGhostBtn: {
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  matchGhostText: {
    color: THEME.accentDark,
    fontWeight: '700',
    fontSize: 12,
  },
  matchStatsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  matchStat: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  matchStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.accentDark,
  },
  matchStatLabel: {
    fontSize: 11,
    color: THEME.sub,
    marginTop: 2,
  },
  matchPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.accentDark,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  matchPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  sessionCard: {
    width: 230,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  sessionSub: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 2,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  sessionMetaText: {
    fontSize: 11,
    color: THEME.sub,
  },
  matchTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  matchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  matchTagText: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '600',
  },

  featuredCard: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    rowGap: 4,
  },
  featuredLabel: { fontSize: 16, fontWeight: '700' },
  featuredSub: { fontSize: 12, color: THEME.sub },
  instantResults: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
    padding: 10,
    rowGap: 10,
  },
  instantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instantTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },
  instantSub: {
    fontSize: 11,
    color: THEME.sub,
    marginTop: 2,
  },
  instantEmpty: {
    fontSize: 12,
    color: THEME.sub,
  },
  instantHint: {
    fontSize: 11,
    color: THEME.sub,
    marginTop: 4,
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.pill,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },

  brownCard: {
    width: '90%',
    alignSelf: 'center',
    padding: 20,
    borderRadius: 22,
    marginTop: 16,
    height: 200,
    overflow: 'hidden',
  },
  placeTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 22,
  },
  placeLocationRow: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  placeLocationText: { color: '#fff' },
  placeIconBadge: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: '#00000033',
    padding: 8,
    borderRadius: 8,
  },
});
