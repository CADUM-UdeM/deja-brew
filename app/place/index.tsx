// app/place/index.tsx
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import { Image } from 'expo-image';

import AppHeader from '../../components/AppHeader';
import { PLACES, CafePlace } from '../../data/places';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewsModal } from '@/components/ReviewsModal';

const THEME = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  card: '#FFFFFF',
  border: '#E8D9D1',
  accentDark: '#7F3B00',
};

// petite fonction pour donner une image par café
const getPlaceImage = (id?: string) => {
  switch (id) {
    case 'savsav':
      return 'https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg';
    case 'crew':
      return 'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg';
    case 'accio':
      return 'https://images.pexels.com/photos/3806439/pexels-photo-3806439.jpeg';
    case 'tranquille':
      return 'https://images.pexels.com/photos/2179212/pexels-photo-2179212.jpeg';
    case 'tommy':
      return 'https://images.pexels.com/photos/4352247/pexels-photo-4352247.jpeg';
    case 'amea':
      return 'https://images.pexels.com/photos/4050347/pexels-photo-4050347.jpeg';
    case 'constance':
      return 'https://images.pexels.com/photos/3741475/pexels-photo-3741475.jpeg';
    default:
      return 'https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg';
  }
};

// reviews mock
const MOCK_REVIEWS = [
  {
    name: 'Étudiante Concordia',
    text: 'Super spot calme avec Wi-Fi stable, parfait pour relire mes notes.',
    rating: 5,
  },
  {
    name: 'Étudiant UdeM',
    text: 'Un peu bruyant en fin d’après-midi mais ambiance motivante pour coder.',
    rating: 4,
  },
  {
    name: 'Remote worker',
    text: 'Beaucoup de prises et bons lattés, j’y passe des journées complètes.',
    rating: 5,
  },
  {
    name: 'Exam crammer',
    text: 'Correct pour travailler, mais service un peu lent aux heures de pointe.',
    rating: 3,
  },
];

export default function PlaceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const place = useMemo(() => PLACES.find((p) => p.id === id), [id]);

  const [modalVisible, setModalVisible] = useState(false);

  const averageRating = useMemo(() => {
    if (!MOCK_REVIEWS.length) return '—';
    const total = MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0);
    return (total / MOCK_REVIEWS.length).toFixed(1);
  }, []);

  if (!place) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <Text style={{ color: THEME.text, fontSize: 16, marginBottom: 8 }}>
            Oups… café introuvable.
          </Text>
          <Text style={{ color: THEME.sub, fontSize: 13, textAlign: 'center' }}>
            Vérifie que l’ID existe dans <Text style={{ fontWeight: '700' }}>data/places.ts</Text>.
          </Text>
        </View>
      </View>
    );
  }

  const heroImage = getPlaceImage(place.id);

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <AppHeader rightIcon="close-outline" onRightPress={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO IMAGE + badge open study spot */}
        <View style={styles.heroWrapper}>
          <Image
            source={heroImage}
            style={styles.heroImage}
          />

          <View style={styles.heroBadgeRow}>
            <View style={styles.heroChip}>
              <Ionicons name="location-outline" size={16} color={THEME.accentDark} />
              <Text style={styles.heroChipText}>{place.district}</Text>
            </View>
          </View>
        </View>

        {/* HEADER TEXTE */}
        <View style={{ marginTop: 14 }}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>
                {place.address}
              </Text>
            </View>

            <View style={styles.typeChip}>
              <Ionicons name="cafe-outline" size={16} color={THEME.accentDark} />
              <Text style={styles.typeChipText}>Study café</Text>
            </View>
          </View>
        </View>

        {/* QUICK INFO */}
        <View style={styles.quickInfoRow}>
          <View style={styles.quickInfoChip}>
            <Ionicons name={place.wifi ? 'wifi' : 'wifi-outline'} size={16} color={THEME.accentDark} />
            <Text style={styles.quickInfoText}>{place.wifi ? 'Wi-Fi dispo' : 'Wi-Fi incertain'}</Text>
          </View>
          <View style={styles.quickInfoChip}>
            <Ionicons
              name="flash-outline"
              size={16}
              color={place.outlets ? THEME.accentDark : THEME.sub}
            />
            <Text style={styles.quickInfoText}>
              {place.outlets ? 'Beaucoup de prises' : 'Peu de prises'}
            </Text>
          </View>
          <View style={styles.quickInfoChip}>
            <Ionicons name="time-outline" size={16} color={THEME.accentDark} />
            <Text style={styles.quickInfoText}>Horaires :</Text>
          </View>
        </View>
        <Text style={styles.hoursText}>{place.hours}</Text>

        {/* VIBE */}
        <Text style={styles.sectionTitle}>Vibe</Text>
        <Text style={styles.vibeText}>{place.vibe}</Text>

        {/* AMBIANCE POUR ÉTUDIER */}
        <Text style={styles.sectionTitle}>Ambiance pour étudier</Text>
        {place.studyAtmosphere.map((line, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}

        {/* BOUFFE & CAFÉS */}
        <Text style={styles.sectionTitle}>Bouffe & cafés</Text>
        <View style={styles.tagsRow}>
          {place.food.map((item) => (
            <View key={item} style={styles.foodTag}>
              <Text style={styles.foodTagText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* TAGS DEJA BREW */}
        <Text style={styles.sectionTitle}>Tags Deja Brew</Text>
        <View style={styles.tagsRow}>
          {place.tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* MAP MINIATURE */}
        {place.coords && (
          <>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <View style={styles.mapWrapper}>
              <MapView
                style={{ width: '100%', height: '100%' }}
                initialRegion={{
                  latitude: place.coords.latitude,
                  longitude: place.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={place.coords}
                  title={place.name}
                  description={place.district}
                />
              </MapView>
            </View>
          </>
        )}

        {/* REVIEWS SECTION */}
        <Text style={styles.sectionTitle}>Avis des étudiants</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={18} color="#F6B100" />
          <Text style={styles.ratingText}>{averageRating}/5</Text>
          <Text style={styles.ratingSubText}>
            · {MOCK_REVIEWS.length} avis Deja Brew (mock)
          </Text>
        </View>

        {/* Dernier avis */}
        <View style={{ marginTop: 8 }}>
          <ReviewCard
            name={MOCK_REVIEWS[0].name}
            text={MOCK_REVIEWS[0].text}
            rating={MOCK_REVIEWS[0].rating}
            memberSince="2024"
            showFullHeader={true}
            onViewMore={() => setModalVisible(true)}
          />
        </View>

        {/* PROMOS EN COURS */}
        <Text style={styles.sectionTitle}>Promos en cours</Text>
        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>☕ -15% pour les étudiants</Text>
          <Text style={styles.promoText}>
            Sur présentation de ta carte étudiante, en semaine après 16h. Ajoute ce café à
            ta prochaine session “exam cram”.
          </Text>
        </View>

        <View style={{ height: 40 }} />

        {/* MODAL AVIS COMPLETS */}
        <ReviewsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          reviews={MOCK_REVIEWS}
        />
      </ScrollView>
    </View>
  );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  heroWrapper: {
    width: '100%',
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadgeRow: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFFDD',
  },
  heroChipText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '600',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  placeName: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
  },
  placeAddress: {
    fontSize: 13,
    color: THEME.sub,
    marginTop: 2,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.accentDark,
  },

  quickInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginTop: 12,
  },
  quickInfoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  quickInfoText: {
    fontSize: 12,
    color: THEME.text,
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 13,
    color: THEME.sub,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 18,
    marginBottom: 4,
  },
  vibeText: {
    fontSize: 14,
    color: THEME.text,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    color: THEME.text,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: THEME.text,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  foodTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
  },
  foodTagText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '600',
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFFFFF',
  },
  tagText: {
    fontSize: 12,
    color: THEME.accentDark,
  },

  mapWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },
  ratingSubText: {
    fontSize: 12,
    color: THEME.sub,
  },

  promoCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
    marginTop: 6,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.accentDark,
    marginBottom: 4,
  },
  promoText: {
    fontSize: 13,
    color: THEME.text,
  },
});
