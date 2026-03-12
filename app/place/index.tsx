// app/place/index.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AppHeader from '../../components/AppHeader';
import PromoCard from '../../components/PromoCard';
import { PlatformMap } from '@/components/platform-map';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewsModal } from '@/components/ReviewsModal';
import { ALL_PLACES } from '../../data/places';
import type { CafePlace } from '../../data/places';
import type { Promo } from '@/data/promos';
import { fetchPlaceDetail, fetchPromos } from '../../data/api';

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

  const [placeData, setPlaceData] = useState<CafePlace | undefined>(
    ALL_PLACES.find((p) => p.id === id)
  );
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!id) return;

    fetchPlaceDetail(String(id))
      .then((data) => {
        if (mounted) setPlaceData(data);
      })
      .catch(() => {});

    fetchPromos(String(id))
      .then((data) => {
        if (mounted) setPromos(data);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [id]);

  const [modalVisible, setModalVisible] = useState(false);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(
    placeData?.rating ? Math.round(placeData.rating * 20) : 12
  );
  const [savesCount, setSavesCount] = useState(8);

  const averageRating = useMemo(() => {
    if (!reviews.length) return '—';
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleToggleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleToggleSave = () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    setSavesCount((prev) => (nextSaved ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim() || !reviewRating) return;
    const existingIndex = reviews.findIndex((r) => r.name === 'You');
    if (existingIndex >= 0) {
      const next = [...reviews];
      next[existingIndex] = { name: 'You', text: reviewText, rating: reviewRating };
      setReviews(next);
    } else {
      setReviews([{ name: 'You', text: reviewText, rating: reviewRating }, ...reviews]);
    }
    setReviewText('');
    setReviewRating(null);
  };

  if (!placeData) {
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

  const place = placeData;
  const heroImage = place.imageUrl || getPlaceImage(place.id);
  const amenities = [
    place.wifi ? 'Wi‑Fi strong' : 'Limited Wi‑Fi',
    place.outlets ? 'Outlets nearby' : 'Few outlets',
    place.tags.includes('Open late') ? 'Open late' : null,
    place.tags.includes('Seating') ? 'Seating available' : null,
  ].filter(Boolean) as string[];

  const quickFacts = [
    { icon: 'volume-low', label: place.studyAtmosphere?.[0] || 'Balanced sound' },
    { icon: 'battery-charging', label: place.outlets ? 'Outlets friendly' : 'Bring a charger' },
    { icon: 'wifi', label: place.wifi ? 'Wi‑Fi available' : 'Wi‑Fi limited' },
    { icon: 'pricetag', label: place.priceLevel ? `Price ${place.priceLevel}` : 'Price $–$$' },
  ];

  const studyScore = Math.min(
    10,
    Math.round(
      (Number(averageRating) || 4) * 2 +
        (place.outlets ? 1 : 0) +
        (place.wifi ? 1 : 0) +
        (place.tags.includes('Seating') ? 1 : 0)
    )
  );

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => router.back()}
        rightIcon={null}
        showLogo={false}
        title="Cafe details"
        subtitle="Study vibe & perks"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO IMAGE */}
        <View style={styles.heroWrapper}>
          <Image source={heroImage} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroOverlay} />
        </View>

        {/* HERO INFO */}
        <View style={styles.heroInfoCard}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>{place.address}</Text>
              <Text style={styles.hoursText}>Hours · {place.hours || 'Not listed'}</Text>
            </View>
            <View style={styles.ratingBubble}>
              <Ionicons name="star" size={14} color="#F6B100" />
              <Text style={styles.ratingBubbleText}>{averageRating}</Text>
            </View>
          </View>

          <View style={styles.pillRow}>
            <View style={styles.typeChip}>
              <Ionicons name="cafe-outline" size={14} color={THEME.accentDark} />
              <Text style={styles.typeChipText}>Study café</Text>
            </View>
            <View style={styles.typeChip}>
              <Ionicons name="pricetag-outline" size={14} color={THEME.accentDark} />
              <Text style={styles.typeChipText}>{place.priceLevel || '$$'}</Text>
            </View>
            <View style={styles.typeChip}>
              <Ionicons name="location-outline" size={14} color={THEME.accentDark} />
              <Text style={styles.typeChipText}>{place.district}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleToggleLike}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={18}
                color={liked ? '#C05621' : THEME.accentDark}
              />
              <Text style={styles.socialText}>{likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={handleToggleSave}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={THEME.accentDark}
              />
              <Text style={styles.socialText}>{savesCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* QUICK FACTS */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={16} color={THEME.accentDark} />
            <Text style={styles.sectionTitle}>Quick facts</Text>
          </View>
          <View style={styles.factGrid}>
            {quickFacts.map((fact, idx) => (
              <View key={`${fact.label}-${idx}`} style={styles.factItem}>
                <Ionicons name={fact.icon as any} size={16} color={THEME.accentDark} />
                <Text style={styles.factText}>{fact.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* STUDY FIT */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={16} color={THEME.accentDark} />
            <Text style={styles.sectionTitle}>Study fit</Text>
          </View>
          <View style={styles.studyVibeRow}>
            <View style={styles.studyScore}>
              <Text style={styles.studyScoreValue}>{studyScore}</Text>
              <Text style={styles.studyScoreLabel}>Study score</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vibeText}>{place.vibe}</Text>
              {place.studyAtmosphere.map((line, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* FOOD */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant-outline" size={16} color={THEME.accentDark} />
            <Text style={styles.sectionTitle}>Menu & perks</Text>
          </View>
          <View style={styles.tagsRow}>
            {place.food.map((item) => (
              <View key={item} style={styles.foodTag}>
                <Text style={styles.foodTagText}>{item}</Text>
              </View>
            ))}
            {amenities.map((item) => (
              <View key={item} style={styles.tagChip}>
                <Text style={styles.tagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TAGS */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetags-outline" size={16} color={THEME.accentDark} />
            <Text style={styles.sectionTitle}>Tags</Text>
          </View>
          <View style={styles.tagsRow}>
            {place.tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* MAP MINIATURE */}
        {place.coords && (
          <View style={styles.infoCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="map-outline" size={16} color={THEME.accentDark} />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <View style={styles.mapWrapper}>
              <PlatformMap
                style={{ width: '100%', height: '100%' }}
                initialRegion={{
                  latitude: place.coords.latitude,
                  longitude: place.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                markers={[
                  {
                    id: place.id,
                    coordinate: place.coords,
                    title: place.name,
                    description: place.district,
                  },
                ]}
                scrollEnabled={false}
                zoomEnabled={false}
              />
            </View>
          </View>
        )}

        {/* REVIEWS */}
        <View style={styles.reviewPanel}>
          <View style={styles.reviewPanelHeader}>
            <View>
              <Text style={styles.reviewTitle}>Reviews</Text>
              <Text style={styles.reviewSub}>Real study vibes from students</Text>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewHero}>
            <View style={styles.reviewScoreCard}>
              <Text style={styles.reviewScoreText}>{averageRating}</Text>
              <View style={styles.reviewStars}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Ionicons
                    key={idx}
                    name={idx < Math.round(Number(averageRating)) ? 'star' : 'star-outline'}
                    size={14}
                    color={idx < Math.round(Number(averageRating)) ? '#F6B100' : THEME.border}
                  />
                ))}
              </View>
              <Text style={styles.ratingSubText}>{reviews.length} reviews</Text>
            </View>
            <View style={styles.reviewHeroRight}>
              <View style={styles.vibePill}>
                <Ionicons name="sparkles" size={14} color={THEME.accentDark} />
                <Text style={styles.vibePillText}>Study‑friendly</Text>
              </View>
              <Text style={styles.reviewSummaryText}>
                Most say: {place.studyAtmosphere[0] || 'Balanced study atmosphere'}
              </Text>
              <View style={styles.miniStatRow}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{studyScore}/10</Text>
                  <Text style={styles.miniStatLabel}>Study score</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{amenities.length}</Text>
                  <Text style={styles.miniStatLabel}>Amenities</Text>
                </View>
              </View>
            </View>
          </View>

          {reviews.slice(0, 2).map((review) => (
            <ReviewCard
              key={`${review.name}-${review.rating}`}
              name={review.name}
              text={review.text}
              rating={review.rating}
              memberSince="2024"
            />
          ))}
        </View>

        {/* ADD / EDIT REVIEW */}
        <View style={styles.reviewForm}>
          <Text style={styles.sectionTitle}>Your review</Text>
          <View style={styles.ratingPickRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.ratingPick,
                  reviewRating === value && styles.ratingPickActive,
                ]}
                onPress={() => setReviewRating(value)}
              >
                <Text
                  style={[
                    styles.ratingPickText,
                    reviewRating === value && styles.ratingPickTextActive,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your study experience..."
            placeholderTextColor={THEME.sub}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
          />
          <TouchableOpacity style={styles.reviewBtn} onPress={handleSubmitReview}>
            <Text style={styles.reviewBtnText}>
              {reviews.some((r) => r.name === 'You') ? 'Update review' : 'Submit review'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PROMOS EN COURS */}
        <View style={styles.sectionHeader}>
          <Ionicons name="pricetag-outline" size={16} color={THEME.accentDark} />
          <Text style={styles.sectionTitle}>Promos en cours</Text>
        </View>
        {promos.length === 0 ? (
          <Text style={{ color: THEME.sub, marginTop: 4 }}>Aucune promotion en cours.</Text>
        ) : (
          promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} enableCafeRoute={false} />
          ))
        )}

        <View style={{ height: 40 }} />

        {/* MODAL AVIS COMPLETS */}
        <ReviewsModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          reviews={reviews}
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
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  heroInfoCard: {
    marginTop: -22,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFFDFB',
    shadowColor: '#7F3B00',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
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
  ratingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFF3E6',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  ratingBubbleText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.accentDark,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.accentDark,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  socialText: {
    fontSize: 12,
    color: THEME.text,
    fontWeight: '600',
  },

  infoCard: {
    marginTop: 12,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  vibeText: {
    fontSize: 14,
    color: THEME.text,
  },
  studyVibeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  studyScore: {
    width: 86,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFF3E6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  studyScoreValue: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.accentDark,
  },
  studyScoreLabel: {
    fontSize: 11,
    color: THEME.sub,
    marginTop: 2,
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
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFF8F3',
  },
  factText: {
    fontSize: 12,
    color: THEME.text,
    fontWeight: '600',
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
  reviewPanel: {
    marginTop: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFF7F2',
    padding: 14,
  },
  reviewPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.text,
  },
  reviewSub: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 2,
  },
  reviewHero: {
    marginTop: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  reviewScoreCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  reviewScoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.accentDark,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewHeroRight: {
    flex: 1,
  },
  reviewSummaryText: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 6,
  },
  miniStatRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  miniStat: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFF8F3',
  },
  miniStatValue: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.accentDark,
  },
  miniStatLabel: {
    fontSize: 11,
    color: THEME.sub,
    marginTop: 2,
  },
  vibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    borderWidth: 1,
    borderColor: THEME.border,
    alignSelf: 'flex-start',
  },
  vibePillText: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '700',
  },
  reviewForm: {
    marginTop: 12,
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: {
    color: THEME.accentDark,
    fontWeight: '700',
    fontSize: 12,
  },
  ratingPickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  ratingPick: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  ratingPickActive: {
    backgroundColor: THEME.accentDark,
    borderColor: THEME.accentDark,
  },
  ratingPickText: {
    color: THEME.text,
    fontWeight: '700',
  },
  ratingPickTextActive: {
    color: '#fff',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    color: THEME.text,
    backgroundColor: '#fff',
  },
  reviewBtn: {
    marginTop: 10,
    backgroundColor: THEME.accentDark,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#fff',
    fontWeight: '700',
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
