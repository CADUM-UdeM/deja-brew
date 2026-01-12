// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import AppHeader from '../../components/AppHeader';
import { PLACES, CafePlace } from '../../data/places';

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

  const items: CafePlace[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    return PLACES.filter((p) => {
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
  }, [selected, query]);

  // simple sélection de cafés mis de l’avant
  const featuredPlaces = useMemo(() => PLACES.slice(0, 3), []);

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

  const beanRotate = beanR.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: THEME.bg }]}>
      {/* global brand header */}
      <AppHeader />

      <ScrollView
        style={{ flex: 1 }}
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
                    Montréal · {PLACES.length} curated cafés
                  </Text>
                </View>
              </View>

              <Ionicons name="notifications-outline" size={22} color={THEME.text} />
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
                placeholder="Wi-Fi, calme, prises, brunch, Vieux-Montréal..."
                placeholderTextColor={THEME.sub}
                returnKeyType="search"
                style={[styles.input, { color: THEME.text }]}
              />
              <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
                <Ionicons name="cafe-outline" size={18} color={THEME.accentDark} />
              </TouchableOpacity>
            </View>

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
        </ScrollView>

        {/* Match to Study */}
        <View style={[styles.padH, { marginTop: 12 }]}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Match to Study</Text>
            <Text style={styles.link} onPress={() => router.push('/session/new')}>
              Start a study date
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>Meet classmates nearby</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
          >
            {['IFT3355', 'Linear Algebra', 'Exam cram'].map((tag) => (
              <View key={tag} style={styles.pill}>
                <Ionicons name="people-outline" size={14} color={THEME.accentDark} />
                <Text style={{ color: THEME.accentDark }}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
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
