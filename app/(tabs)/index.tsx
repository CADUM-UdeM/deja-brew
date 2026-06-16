// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Reanimated, {
  Easing as ReanimatedEasing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import AppHeader from '../../components/AppHeader';
import LocationBanner from '@/components/LocationBanner';
import InlineNotice from '@/components/InlineNotice';
import { ALL_PLACES, CafePlace } from '../../data/places';
import { SESSION_FEED, SessionFeedItem } from '../../data/sessions';
import { fetchPlaces, fetchSessions } from '../../data/api';
import {
  getGoodForBadges,
  getSessionUrgency,
  getWhyPicked,
  scorePlace,
} from '@/data/recommendations';
import { getStudyVibeProfile, type StudyVibeProfile } from '@/data/studyProfile';
import {
  getSavedLocation,
  sortByDistance,
  formatWalkTime,
  formatDistance,
  type UserCoords,
  type PlaceWithDistance,
} from '@/data/location';

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
const QUICK_FILTERS = ['Calme', 'Coworking', 'Brunch', 'Aesthetic', 'Long sessions'] as const;
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Tous: [],
  Calme: ['calme', 'calm', 'quiet', 'silent'],
  Coworking: ['cowork', 'group work', 'laptop'],
  Brunch: ['brunch'],
  Aesthetic: ['aesthetic', 'chic', 'cute', 'design'],
};

const IMAGES = {
  heroStudy: require('../../assets/images/home-hero-study.png'),
} as const;

const AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);
const SPRING = {
  damping: 18,
  stiffness: 170,
  mass: 0.8,
};

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: any;
};

function Reveal({ children, delay = 0, distance = 14, style }: RevealProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withSpring(1, SPRING));
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [distance, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.985, 1]) },
    ],
  }));

  return (
    <Reanimated.View style={[style, animatedStyle]}>
      {children}
    </Reanimated.View>
  );
}

type MotionTouchableProps = TouchableOpacityProps & {
  delay?: number;
  children: React.ReactNode;
  style?: any;
  pressScale?: number;
};

function MotionTouchable({
  delay = 0,
  children,
  style,
  pressScale = 0.975,
  onPressIn,
  onPressOut,
  ...props
}: MotionTouchableProps) {
  const mounted = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    mounted.value = withDelay(delay, withSpring(1, SPRING));
  }, [delay, mounted]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: mounted.value,
    transform: [
      { translateY: interpolate(mounted.value, [0, 1], [10, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, pressScale]) },
    ],
  }));

  return (
    <AnimatedTouchable
      {...props}
      activeOpacity={1}
      onPressIn={(event) => {
        pressed.value = withTiming(1, { duration: 90 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(0, { damping: 16, stiffness: 220 });
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
}

type PlaceCardProps = {
  place: CafePlace;
  index: number;
  onPress: () => void;
};

const CARD_ACCENTS = ['#7F3B00', '#5C2E00', '#924520', '#6B3310'] as const;

function PlaceCard({ place, index, onPress }: PlaceCardProps) {
  const progress = useSharedValue(0);
  const pressed = useSharedValue(0);
  const shimmer = useSharedValue(0);

  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  useEffect(() => {
    progress.value = withDelay(Math.min(index * 80, 640), withSpring(1, SPRING));
    shimmer.value = withDelay(
      Math.min(index * 80, 640) + 600,
      withRepeat(
        withTiming(1, { duration: 2600, easing: ReanimatedEasing.inOut(ReanimatedEasing.quad) }),
        -1,
        true
      )
    );
  }, [index, progress, shimmer]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [28, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.968]) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.08, 0.18, 0.08]),
  }));

  const WIFI = place.tags.some((t) => t.toLowerCase().includes('wifi') || t.toLowerCase().includes('wi-fi'));
  const QUIET = place.tags.some((t) => t.toLowerCase().includes('quiet') || t.toLowerCase().includes('calme'));

  return (
    <Reanimated.View style={[styles.placeCardWrap, cardStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 80 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => { pressed.value = withSpring(0, { damping: 14, stiffness: 200 }); }}
        onPress={onPress}
      >
        <View style={[styles.placeCard, { backgroundColor: accent }]}>
          {/* Glow overlay */}
          <Reanimated.View style={[styles.placeCardGlow, glowStyle]} />

          <View style={styles.placeCardInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.placeTitle} numberOfLines={1}>{place.name}</Text>
              <View style={styles.placeLocationRow}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.placeLocationText} numberOfLines={1}>
                  {place.district}
                </Text>
              </View>
              <View style={styles.placeBadgeRow}>
                {WIFI && (
                  <View style={styles.placeBadge}>
                    <Ionicons name="wifi-outline" size={11} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.placeBadgeText}>Wi-Fi</Text>
                  </View>
                )}
                {QUIET && (
                  <View style={styles.placeBadge}>
                    <Ionicons name="volume-mute-outline" size={11} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.placeBadgeText}>Quiet</Text>
                  </View>
                )}
                {place.tags.slice(0, 1).filter(t => !t.toLowerCase().includes('wifi') && !t.toLowerCase().includes('quiet')).map(t => (
                  <View key={t} style={styles.placeBadge}>
                    <Text style={styles.placeBadgeText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.placeIconBadge}>
              <Ionicons name="cafe" size={22} color="rgba(255,255,255,0.9)" />
            </View>
          </View>

          <View style={styles.placeAddressRow}>
            <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
            <View style={styles.placeArrow}>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState<Category>('Tous');
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<CafePlace[]>(ALL_PLACES);
  const [sessions, setSessions] = useState<SessionFeedItem[]>(SESSION_FEED);
  const [studyProfile, setStudyProfile] = useState<StudyVibeProfile | null>(null);
  const [profileApplied, setProfileApplied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<UserCoords | null>(null);

  const items: CafePlace[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    return places.filter((p) => {
      // filtre par catégorie "vibe"
      if (selected !== 'Tous') {
        const keywords = CATEGORY_KEYWORDS[selected];
        const matchesKeyword = (value: string) => {
          const normalized = value.toLowerCase();
          return keywords.some((keyword) => normalized.includes(keyword));
        };
        const inTags = p.tags.some(matchesKeyword);
        const inVibe = matchesKeyword(p.vibe);
        const inAtmosphere = p.studyAtmosphere.some(matchesKeyword);
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

  const featuredPlaces = useMemo(() => {
    if (!studyProfile) return places.slice(0, 3);
    return places
      .map((place) => ({ place, score: scorePlace(place, studyProfile).score }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.place)
      .slice(0, 3);
  }, [places, studyProfile]);

  const featuredSessions = useMemo(() => {
    if (!studyProfile?.group && !studyProfile?.duration) return sessions.slice(0, 3);
    return [...sessions]
      .sort((a, b) => {
        const aFit =
          (studyProfile.group?.includes('group') && a.maxPeople >= 4 ? 2 : 0) +
          (studyProfile.duration?.includes('Long') && a.maxPeople > a.participantsCount ? 1 : 0);
        const bFit =
          (studyProfile.group?.includes('group') && b.maxPeople >= 4 ? 2 : 0) +
          (studyProfile.duration?.includes('Long') && b.maxPeople > b.participantsCount ? 1 : 0);
        return bFit - aFit;
      })
      .slice(0, 3);
  }, [sessions, studyProfile]);

  const nearbyPlaces: PlaceWithDistance[] = useMemo(() => {
    if (!userCoords) return [];
    return sortByDistance(places, userCoords).slice(0, 5);
  }, [places, userCoords]);

  const heroIn = useSharedValue(0);
  const badgeLoop = useSharedValue(0);
  const imageLoop = useSharedValue(0);
  const steamLoop = useSharedValue(0);

  useEffect(() => {
    heroIn.value = withTiming(1, {
      duration: 520,
      easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
    });
    badgeLoop.value = withRepeat(
      withTiming(1, {
        duration: 2400,
        easing: ReanimatedEasing.inOut(ReanimatedEasing.quad),
      }),
      -1,
      true
    );
    imageLoop.value = withRepeat(
      withTiming(1, {
        duration: 3200,
        easing: ReanimatedEasing.inOut(ReanimatedEasing.quad),
      }),
      -1,
      true
    );
    steamLoop.value = withRepeat(
      withTiming(1, {
        duration: 2600,
        easing: ReanimatedEasing.inOut(ReanimatedEasing.quad),
      }),
      -1,
      false
    );
  }, [badgeLoop, heroIn, imageLoop, steamLoop]);

  useEffect(() => {
    let mounted = true;
    fetchPlaces()
      .then((data) => {
        if (mounted) setPlaces(data);
      })
      .catch(() => {
        if (mounted) setNotice('Using curated fallback cafes while the API is unavailable.');
      });

    fetchSessions()
      .then((data) => {
        if (mounted) setSessions(data);
      })
      .catch(() => {
        if (mounted) setNotice('Using local study sessions while the API is unavailable.');
      });

    getStudyVibeProfile()
      .then((profile) => {
        if (mounted) setStudyProfile(profile);
      })
      .catch(() => {});

    getSavedLocation()
      .then((loc) => {
        if (mounted && loc) setUserCoords(loc.coords);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroIn.value,
    transform: [
      { translateY: interpolate(heroIn.value, [0, 1], [20, 0]) },
      { scale: interpolate(heroIn.value, [0, 1], [0.985, 1]) },
    ],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(badgeLoop.value, [0, 1], [0, -7]) },
      { rotate: `${interpolate(badgeLoop.value, [0, 1], [-7, 8])}deg` },
      { scale: interpolate(badgeLoop.value, [0, 1], [1, 1.04]) },
    ],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    opacity: interpolate(heroIn.value, [0.2, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(heroIn.value, [0.2, 1], [12, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(imageLoop.value, [0, 1], [1, 1.025]) },
      { translateY: interpolate(imageLoop.value, [0, 1], [0, -2]) },
    ],
  }));

  const steamOneStyle = useAnimatedStyle(() => ({
    opacity: interpolate(steamLoop.value, [0, 0.25, 0.75, 1], [0, 0.36, 0.22, 0]),
    transform: [
      { translateY: interpolate(steamLoop.value, [0, 1], [16, -18]) },
      { translateX: interpolate(steamLoop.value, [0, 1], [0, 8]) },
      { scaleY: interpolate(steamLoop.value, [0, 1], [0.8, 1.2]) },
    ],
  }));

  const steamTwoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(steamLoop.value, [0, 0.25, 0.7, 1], [0, 0.25, 0.18, 0]),
    transform: [
      { translateY: interpolate(steamLoop.value, [0, 1], [22, -12]) },
      { translateX: interpolate(steamLoop.value, [0, 1], [0, -7]) },
      { scaleY: interpolate(steamLoop.value, [0, 1], [0.75, 1.15]) },
    ],
  }));

  useEffect(() => {
    if (!studyProfile || profileApplied || query.trim()) return;
    const noise = studyProfile.noise?.toLowerCase() ?? '';
    const group = studyProfile.group?.toLowerCase() ?? '';
    const food = studyProfile.food?.toLowerCase() ?? '';
    const vibe = studyProfile.vibe?.toLowerCase() ?? '';

    if (noise.includes('quiet')) setSelected('Calme');
    else if (group.includes('group')) setSelected('Coworking');
    else if (food.includes('brunch')) setSelected('Brunch');
    else if (vibe.includes('modern') || vibe.includes('cozy')) setSelected('Aesthetic');
    setProfileApplied(true);
  }, [profileApplied, query, studyProfile]);

  const handleQuickFilter = (label: (typeof QUICK_FILTERS)[number]) => {
    const category = CATEGORIES.find((item) => item === label);
    if (category) {
      setSelected(category);
      setQuery('');
      return;
    }

    setSelected('Tous');
    setQuery(label);
  };

  return (
    <View style={[styles.container, { backgroundColor: THEME.bg }]}>
      {/* App header */}
      <AppHeader onRightPress={() => router.push('/notifications')} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {notice && (
          <View style={[styles.padH, { marginBottom: 10 }]}>
            <InlineNotice text={notice} tone="warning" />
          </View>
        )}

        {/* Hero card */}
        <View style={styles.padH}>
          <Reanimated.View
            style={[
              styles.hero,
              { backgroundColor: '#FFEDE3', borderColor: THEME.border },
              heroStyle,
            ]}
          >
            <View style={styles.rowBetween}>
              {/* what you do / value prop */}
              <View style={styles.rowLeft}>
                <Reanimated.View style={badgeStyle}>
                  <View style={styles.beanBadge}>
                    <Ionicons name="location-outline" size={16} color="#fff" />
                  </View>
                </Reanimated.View>
                <View>
                  <Text style={styles.appName}>Find a spot to study</Text>
                  <Text style={styles.tagline}>
                    Montréal · {places.length} curated cafés
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => router.push('/notifications')} hitSlop={10}>
                <Ionicons name="notifications-outline" size={22} color={THEME.text} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <Reanimated.View
              style={[
                styles.searchBox,
                { backgroundColor: '#fff', borderColor: THEME.border },
                searchStyle,
              ]}
            >
              <Ionicons name="search-outline" size={18} color={THEME.sub} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Wi-Fi, calme, prises, brunch, Vieux-Montréal..."
                placeholderTextColor={THEME.sub}
                returnKeyType="search"
                style={[styles.input, { color: THEME.text }]}
              />
              <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
                <Ionicons name="cafe-outline" size={18} color={THEME.accentDark} />
              </TouchableOpacity>
            </Reanimated.View>

            {/* Instant search results */}
            {query.trim().length > 0 && (
              <View style={styles.instantResults}>
                {quickResults.length === 0 ? (
                  <Text style={styles.instantEmpty}>No cafes found. Try another keyword.</Text>
                ) : (
                  quickResults.map((place, index) => (
                    <MotionTouchable
                      key={place.id}
                      style={styles.instantRow}
                      delay={index * 45}
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
                    </MotionTouchable>
                  ))
                )}
                {quickResults.length > 0 && (
                  <Text style={styles.instantHint}>
                    Showing {quickResults.length} results · keep typing to refine
                  </Text>
                )}
              </View>
            )}

            {studyProfile && (
              <Reveal delay={140} style={styles.vibeCard}>
                <View style={styles.vibeHeader}>
                  <View>
                    <Text style={styles.vibeEyebrow}>Your study vibe today</Text>
                    <Text style={styles.vibeTitle}>{studyProfile.label}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.vibeButton}
                    onPress={() => router.push('/quiz/results')}
                  >
                    <Ionicons name="sparkles-outline" size={15} color={THEME.accentDark} />
                    <Text style={styles.vibeButtonText}>Matches</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.vibeChips}>
                  {[studyProfile.noise, studyProfile.group, studyProfile.mustHave]
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((item) => (
                      <View key={String(item)} style={styles.vibeChip}>
                        <Text style={styles.vibeChipText}>{String(item)}</Text>
                      </View>
                    ))}
                </View>
              </Reveal>
            )}

            {/* Illustration tasse + livre */}
            <View style={styles.heroIllustrationWrapper}>
              <Reanimated.View style={[styles.heroIllustrationMotion, imageStyle]}>
                <Image
                  source={IMAGES.heroStudy}
                  contentFit="cover"
                  style={styles.heroIllustration}
                />
              </Reanimated.View>
              <Reanimated.View style={[styles.steamLine, styles.steamLineOne, steamOneStyle]} />
              <Reanimated.View style={[styles.steamLine, styles.steamLineTwo, steamTwoStyle]} />
            </View>

            {/* main CTAs */}
            <MotionTouchable
              style={styles.primaryCta}
              delay={180}
              pressScale={0.96}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/quiz');
              }}
            >
              <Ionicons name="sparkles-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryCtaText}>Find your study vibe</Text>
            </MotionTouchable>

            <MotionTouchable
              style={styles.secondaryCta}
              delay={230}
              pressScale={0.96}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/session/new');
              }}
            >
              <Ionicons name="people-outline" size={16} color={THEME.accentDark} style={{ marginRight: 6 }} />
              <Text style={[styles.primaryCtaText, { color: THEME.accentDark }]}>
                Start a study session
              </Text>
            </MotionTouchable>

            {/* quick filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingTop: 12 }}
            >
              {QUICK_FILTERS.map((label, index) => {
                const active = selected === label || query === label;
                return (
                  <MotionTouchable
                    key={label}
                    onPress={() => handleQuickFilter(label)}
                    delay={260 + index * 35}
                    style={[
                      styles.quick,
                      active ? styles.quickActive : styles.quickIdle,
                    ]}
                  >
                    <Text style={[styles.quickText, active && styles.quickTextActive]}>
                      {label}
                    </Text>
                  </MotionTouchable>
                );
              })}
            </ScrollView>
          </Reanimated.View>
        </View>

        {/* Location banner */}
        <Reveal delay={240}>
          <LocationBanner
            onLocationChange={(coords) => setUserCoords(coords)}
            onPickOnMap={() => router.push('/(tabs)/map')}
          />
        </Reveal>

        {/* Near you section */}
        {nearbyPlaces.length > 0 && (
          <>
            <Reveal delay={280} style={[styles.padH, { marginTop: 16 }]}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Near you</Text>
                  <Text style={styles.sectionSubtitle}>Sorted by walking distance</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/map')} style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <Ionicons name="chevron-forward" size={13} color={THEME.accentDark} />
                </TouchableOpacity>
              </View>
            </Reveal>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 20, paddingVertical: 8 }}
            >
              {nearbyPlaces.map((place, index) => (
                <MotionTouchable
                  key={place.id}
                  delay={300 + index * 50}
                  style={styles.nearbyCard}
                  onPress={() => router.push({ pathname: '/place', params: { id: place.id } })}
                >
                  <View style={styles.nearbyDistRow}>
                    <View style={styles.nearbyDistBadge}>
                      <Ionicons name="walk-outline" size={12} color={THEME.accentDark} />
                      <Text style={styles.nearbyDistText}>{formatWalkTime(place.distanceKm)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {place.wifi && <Ionicons name="wifi-outline" size={13} color="#2F6B3F" />}
                      {place.outlets && <Ionicons name="flash-outline" size={13} color={THEME.accentDark} />}
                    </View>
                  </View>
                  <Text style={styles.nearbyName} numberOfLines={1}>{place.name}</Text>
                  <Text style={styles.nearbyDistrict} numberOfLines={1}>{place.district}</Text>
                  <Text style={styles.nearbyRaw}>{formatDistance(place.distanceKm)} away</Text>
                </MotionTouchable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Featured cafés & deals */}
        <Reveal delay={260} style={[styles.padH, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Featured cafés & deals</Text>
        </Reveal>

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
          <MotionTouchable
            style={[
              styles.featuredCard,
              {
                backgroundColor: '#FBD3BF',
                borderColor: THEME.border,
                width: 230,
              },
            ]}
            delay={310}
            onPress={() => router.push('/(tabs)/promos')}
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
          </MotionTouchable>

          {featuredPlaces.map((place, index) => (
            <MotionTouchable
              key={place.id}
              style={[
                styles.featuredCard,
                {
                  backgroundColor: '#F6EDE6',
                  borderColor: THEME.border,
                  width: 230,
                },
              ]}
              delay={360 + index * 55}
              onPress={() =>
                router.push({ pathname: '/place', params: { id: place.id } })
              }
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
              <Text style={styles.featuredReason} numberOfLines={2}>
                {getWhyPicked(place, studyProfile ?? undefined)}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Ionicons name="cafe-outline" size={14} color={THEME.accentDark} />
                <Text style={[styles.featuredSub, { marginLeft: 4 }]}>
                  {getGoodForBadges(place)[0] ?? 'Study-friendly'}
                </Text>
              </View>
            </MotionTouchable>
          ))}
        </ScrollView>

        {/* Match to Study */}
        <Reveal delay={440} style={[styles.padH, { marginTop: 12 }]}>
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
              {featuredSessions.map((session, index) => (
                <MotionTouchable
                  key={session._id}
                  style={styles.sessionCard}
                  delay={520 + index * 50}
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
                      {session.participantsCount}/{session.maxPeople} · {getSessionUrgency(session)}
                    </Text>
                  </View>
                </MotionTouchable>
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
        </Reveal>

        {/* Popular places */}
        <Reveal delay={560} style={[styles.padH, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>
            {selected === 'Tous'
              ? 'Lieux populaires'
              : `${selected} spots populaires`}
          </Text>
        </Reveal>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 10,
            paddingHorizontal: 10,
            paddingVertical: 12,
          }}
        >
          {CATEGORIES.map((category, index) => (
            <MotionTouchable
              key={category}
              delay={590 + index * 35}
              onPress={() => setSelected(category)}
            >
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
            </MotionTouchable>
          ))}
        </ScrollView>

        {/* Animated place cards */}
        <View style={{ marginBottom: 32, paddingHorizontal: 20 }}>
          {items.map((place, index) => (
            <PlaceCard
              key={place.id}
              place={place}
              index={index}
              onPress={() => router.push({ pathname: '/place', params: { id: place.id } })}
            />
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
  vibeCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFFDFB',
    padding: 12,
  },
  vibeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  vibeEyebrow: {
    color: THEME.sub,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  vibeTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  vibeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  vibeButtonText: {
    color: THEME.accentDark,
    fontSize: 11,
    fontWeight: '800',
  },
  vibeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  vibeChip: {
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  vibeChipText: {
    color: THEME.accentDark,
    fontSize: 11,
    fontWeight: '700',
  },

  heroIllustrationWrapper: {
    marginTop: 14,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FADAC6',
    height: 130,
  },
  heroIllustrationMotion: {
    width: '100%',
    height: '100%',
  },
  heroIllustration: {
    width: '100%',
    height: '100%',
  },
  steamLine: {
    position: 'absolute',
    width: 2,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#FFFFFFAA',
  },
  steamLineOne: {
    top: 52,
    left: 76,
  },
  steamLineTwo: {
    top: 48,
    left: 106,
    height: 32,
  },

  quick: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIdle: {
    backgroundColor: '#fff',
    borderColor: THEME.border,
  },
  quickActive: {
    backgroundColor: THEME.accentDark,
    borderColor: THEME.accentDark,
  },
  quickText: {
    color: THEME.text,
    fontSize: 12,
    fontWeight: '600',
  },
  quickTextActive: {
    color: '#fff',
    fontWeight: '800',
  },

  primaryCta: {
    marginTop: 14,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: THEME.accentDark,
    shadowColor: THEME.accentDark,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryCtaText: { color: '#fff', fontWeight: '800', letterSpacing: 0.3 },

  secondaryCta: {
    marginTop: 8,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME.border,
  },

  sectionTitle: { fontSize: 20, fontWeight: '800', color: THEME.text },
  sectionSubtitle: { fontSize: 12, color: THEME.sub, marginTop: 2 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '700',
  },
  nearbyCard: {
    width: 158,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 4,
  },
  nearbyDistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nearbyDistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  nearbyDistText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.accentDark,
  },
  nearbyName: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.text,
  },
  nearbyDistrict: {
    fontSize: 11,
    color: THEME.sub,
    fontWeight: '500',
  },
  nearbyRaw: {
    fontSize: 10,
    color: THEME.sub,
    marginTop: 2,
  },
  link: { color: THEME.accentDark, fontWeight: '700' },
  featuredReason: {
    color: THEME.sub,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
  },
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

  placeCardWrap: {
    marginBottom: 12,
  },
  placeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 16,
    minHeight: 130,
    justifyContent: 'space-between',
    shadowColor: '#3A1800',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  placeCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  placeCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  placeTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.2,
  },
  placeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  placeLocationText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  placeBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  placeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  placeBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '700',
  },
  placeIconBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 12,
  },
  placeAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  placeAddress: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    flex: 1,
  },
  placeArrow: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    padding: 4,
  },
});
