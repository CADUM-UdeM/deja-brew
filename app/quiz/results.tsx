import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { ALL_PLACES } from '../../data/places';

const scorePlace = (
  place: typeof ALL_PLACES[number],
  params: {
    noise?: string;
    time?: string;
    duration?: string;
    group?: string;
    vibe?: string;
    food?: string;
    budget?: string;
    mustHave?: string;
  }
) => {
  let score = 0;
  const reasons: string[] = [];

  const vibe = params.vibe?.toLowerCase() ?? '';
  if (vibe.includes('cozy') && place.tags.some((t) => t.toLowerCase().includes('cozy'))) {
    score += 2;
    reasons.push('cozy vibe');
  }
  if (vibe.includes('bright') && place.vibe.toLowerCase().includes('lum')) {
    score += 2;
    reasons.push('bright space');
  }
  if (vibe.includes('industrial') && place.vibe.toLowerCase().includes('industri')) {
    score += 2;
    reasons.push('industrial vibe');
  }
  if (vibe.includes('green') && place.vibe.toLowerCase().includes('vert')) {
    score += 2;
    reasons.push('green & airy');
  }

  const noise = params.noise?.toLowerCase() ?? '';
  if (noise.includes('quiet') && place.studyAtmosphere.some((s) => s.toLowerCase().includes('calme'))) {
    score += 2;
    reasons.push('quiet corners');
  }
  if (noise.includes('lively') && place.studyAtmosphere.some((s) => s.toLowerCase().includes('brunch'))) {
    score += 1;
    reasons.push('lively vibe');
  }

  const duration = params.duration?.toLowerCase() ?? '';
  if (duration.includes('long') && place.outlets) {
    score += 2;
    reasons.push('many outlets');
  }

  const group = params.group?.toLowerCase() ?? '';
  if (group.includes('group') && place.tags.some((t) => t.toLowerCase().includes('group'))) {
    score += 2;
    reasons.push('group friendly');
  }

  const food = params.food?.toLowerCase() ?? '';
  if (food.includes('pastries') && place.food.some((f) => f.toLowerCase().includes('pât') || f.toLowerCase().includes('pastr'))) {
    score += 1;
    reasons.push('pastries');
  }
  if (food.includes('brunch') && place.food.some((f) => f.toLowerCase().includes('brunch'))) {
    score += 2;
    reasons.push('brunch');
  }
  if (food.includes('full menu') && place.food.length >= 4) {
    score += 1;
    reasons.push('full menu');
  }

  const budget = params.budget ?? '';
  if (budget && place.priceLevel === budget) {
    score += 2;
    reasons.push(`budget ${budget}`);
  }

  const mustHaveList = (params.mustHave ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const mustHave = mustHaveList.join(' ');
  if (mustHave.includes('wi') && place.wifi) {
    score += 2;
    reasons.push('wifi');
  }
  if (mustHave.includes('out') && place.outlets) {
    score += 2;
    reasons.push('outlets');
  }
  if (mustHave.includes('big') && place.tags.some((t) => t.toLowerCase().includes('table'))) {
    score += 1;
    reasons.push('big tables');
  }

  if (place.source === 'curated') {
    score += 1;
  }
  return { score, reasons };
};

export default function QuizResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    noise?: string;
    time?: string;
    duration?: string;
    group?: string;
    vibe?: string;
    food?: string;
    budget?: string;
    mustHave?: string;
  }>();

  const matches = useMemo(() => {
    return ALL_PLACES.map((place) => {
      const { score, reasons } = scorePlace(place, params);
      return { place, score, reasons };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [params]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Cafe matches"
          subtitle="Tailored to your vibe"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={18} color={THEME.accentDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Top picks for you</Text>
              <Text style={styles.heroSub}>Based on your answers and cafe vibe.</Text>
            </View>
          </View>

          {matches.map(({ place, reasons }, index) => (
            <TouchableOpacity
              key={place.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/place', params: { id: place.id } })}
            >
              <View style={styles.cardRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{place.name}</Text>
                  <Text style={styles.cardSub}>{place.district}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="wifi-outline" size={14} color={THEME.sub} />
                  <Text style={styles.metaText}>{place.wifi ? 'Wi‑Fi' : 'No Wi‑Fi'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flash-outline" size={14} color={THEME.sub} />
                  <Text style={styles.metaText}>{place.outlets ? 'Outlets' : 'Few outlets'}</Text>
                </View>
                {place.priceLevel && (
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={14} color={THEME.sub} />
                    <Text style={styles.metaText}>{place.priceLevel}</Text>
                  </View>
                )}
              </View>

              {reasons.length > 0 && (
                <View style={styles.reasonRow}>
                  {reasons.slice(0, 4).map((reason) => (
                    <View key={reason} style={styles.reasonChip}>
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(tabs)/map')}
          >
            <Text style={styles.primaryText}>Explore on map</Text>
            <Ionicons name="map-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  heroBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
  },
  heroSub: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 2,
  },
  card: {
    marginTop: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankBadge: {
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accentDark,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
  },
  cardSub: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: THEME.sub,
  },
  reasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  reasonChip: {
    backgroundColor: '#F3E7E0',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reasonText: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '600',
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: THEME.accentDark,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
  },
});
