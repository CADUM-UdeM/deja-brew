// app/(tabs)/map.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import AppHeader from '../../components/AppHeader';
import LocationBanner from '@/components/LocationBanner';
import { ALL_PLACES, CafePlace, OSM_ATTRIBUTION } from '../../data/places';
import { fetchPlaces } from '../../data/api';
import { PlatformMap } from '@/components/platform-map';
import type { PlatformMapMarker } from '@/components/platform-map';
import { getGoodForBadges, getPlaceImage, getStudySignals } from '@/data/recommendations';
import {
  sortByDistance,
  formatWalkTime,
  saveLocation,
  type UserCoords,
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

const SPRING = { damping: 18, stiffness: 180, mass: 0.8 };

function AnimatedChip({
  label,
  active,
  index,
  onPress,
}: {
  label: string;
  active: boolean;
  index: number;
  onPress: () => void;
}) {
  const progress = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(index * 45 + 100, withSpring(1, SPRING));
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.6, 1]) * interpolate(pressed.value, [0, 1], [1, 0.92]) },
      { translateY: interpolate(progress.value, [0, 1], [10, 0]) },
    ],
  }));

  return (
    <Reanimated.View style={style}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { pressed.value = withTiming(1, { duration: 80 }); }}
        onPressOut={() => { pressed.value = withSpring(0, { damping: 14, stiffness: 200 }); }}
        onPress={onPress}
      >
        <View style={[styles.chip, active && { backgroundColor: THEME.accentDark }]}>
          <Text style={[styles.chipText, active && { color: '#fff', fontWeight: '700' }]}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

function AnimatedPlaceCard({
  place,
  selected,
  index,
  isSelectMode,
  distanceKm,
  onPress,
}: {
  place: CafePlace;
  selected: boolean;
  index: number;
  isSelectMode: boolean;
  distanceKm?: number;
  onPress: () => void;
}) {
  const progress = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(Math.min(index * 60, 600), withSpring(1, SPRING));
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [24, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.975]) },
    ],
  }));

  return (
    <Reanimated.View style={style}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => { pressed.value = withTiming(1, { duration: 80 }); }}
        onPressOut={() => { pressed.value = withSpring(0, { damping: 14, stiffness: 200 }); }}
        onPress={onPress}
      >
        <View style={[styles.card, selected && styles.cardSelected]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.placeName}>{place.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {distanceKm !== undefined && (
                <View style={styles.distanceBadge}>
                  <Ionicons name="walk-outline" size={11} color={THEME.accentDark} />
                  <Text style={styles.distanceBadgeText}>{formatWalkTime(distanceKm)}</Text>
                </View>
              )}
              <View style={styles.badge}>
                <Ionicons
                  name={isSelectMode ? 'checkmark-circle-outline' : 'cafe-outline'}
                  size={14}
                  color="#fff"
                />
                <Text style={styles.badgeText}>{isSelectMode ? 'Select' : 'Details'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={THEME.sub} />
            <Text style={styles.placeMeta}>{place.district}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.placeMeta}>{place.address || 'Address not listed'}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, marginTop: 8 }}
          >
            {place.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

function AnimatedBottomSheet({
  place,
  isSelectMode,
  onClose,
  onStudyHere,
  onDetails,
  serializeParam,
}: {
  place: CafePlace | null;
  isSelectMode: boolean;
  onClose: () => void;
  onStudyHere: (place: CafePlace) => void;
  onDetails: (place: CafePlace) => void;
  serializeParam: (v: unknown) => string | undefined;
}) {
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (place) {
      const isNew = prevIdRef.current !== place.id;
      prevIdRef.current = place.id;
      if (isNew) {
        translateY.value = 60;
        opacity.value = 0;
      }
      translateY.value = withSpring(0, { damping: 20, stiffness: 240 });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      prevIdRef.current = null;
      translateY.value = withTiming(80, { duration: 200, easing: Easing.in(Easing.quad) });
      opacity.value = withTiming(0, { duration: 160 });
    }
  }, [opacity, place, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!place && opacity.value === 0) return null;

  return (
    <Reanimated.View style={[styles.bottomSheet, sheetStyle]}>
      <TouchableOpacity
        style={styles.sheetClose}
        onPress={onClose}
        hitSlop={8}
      >
        <Ionicons name="close" size={16} color={THEME.sub} />
      </TouchableOpacity>

      {place && (
        <>
          <Image
            source={getPlaceImage(place)}
            style={styles.sheetImage}
            contentFit="cover"
          />
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>{place.name}</Text>
            <Text style={styles.sheetSub}>
              {place.district} · {place.priceLevel ?? '$$'}
            </Text>
            <View style={styles.sheetSignalRow}>
              {Object.entries(getStudySignals(place)).slice(0, 3).map(([key, value]) => (
                <View key={key} style={styles.sheetSignal}>
                  <Text style={styles.sheetSignalText}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.sheetBadges}>
              {getGoodForBadges(place).slice(0, 3).map((badge) => (
                <View key={badge} style={styles.tagPill}>
                  <Text style={styles.tagText}>{badge}</Text>
                </View>
              ))}
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.sheetSecondary} onPress={() => onStudyHere(place)}>
                <Ionicons name="people-outline" size={16} color={THEME.accentDark} />
                <Text style={styles.sheetSecondaryText}>Study here</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetPrimary} onPress={() => onDetails(place)}>
                <Text style={styles.sheetPrimaryText}>Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </Reanimated.View>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [query, setQuery]                 = useState('');
  const [districtFilter, setDistrictFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [markerLimit, setMarkerLimit]     = useState(250);
  const [places, setPlaces]               = useState<CafePlace[]>(ALL_PLACES);
  const [userCoords, setUserCoords]       = useState<UserCoords | null>(null);
  const [sortMode, setSortMode]           = useState<'default' | 'distance'>('default');
  const [pickingSpot, setPickingSpot]     = useState(false);

  const headerProgress = useSharedValue(0);
  const searchProgress = useSharedValue(0);

  useEffect(() => {
    headerProgress.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) });
    searchProgress.value = withDelay(100, withSpring(1, SPRING));
  }, [headerProgress, searchProgress]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerProgress.value,
    transform: [{ translateY: interpolate(headerProgress.value, [0, 1], [-16, 0]) }],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    opacity: searchProgress.value,
    transform: [{ translateY: interpolate(searchProgress.value, [0, 1], [12, 0]) }],
  }));

  const rawSelectMode = params?.selectMode;
  const isSelectMode =
    typeof rawSelectMode === 'string' ? rawSelectMode === 'place' : false;
  const serializeParam = useCallback((value: unknown) => {
    if (value === undefined) return undefined;
    return encodeURIComponent(JSON.stringify(value));
  }, []);

  const baseParams = useMemo(() => {
    const next: Record<string, string | string[]> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'selectMode') return;
      next[key] = value as string | string[];
    });
    return next;
  }, [params]);

  const districts = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => set.add(p.district));
    return Array.from(set).sort();
  }, [places]);

  const filteredPlaces: CafePlace[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    let results = places.filter((p) => {
      if (districtFilter && p.district !== districtFilter) return false;
      if (!q) return true;
      const haystack = (p.name + ' ' + p.address + ' ' + p.district + ' ' + p.tags.join(' ')).toLowerCase();
      return haystack.includes(q);
    });
    if (sortMode === 'distance' && userCoords) {
      results = sortByDistance(results, userCoords);
    }
    return results;
  }, [query, districtFilter, places, sortMode, userCoords]);

  const displayPlaces = useMemo(() => {
    const withCoords = filteredPlaces.filter((p) => Boolean(p.coords));
    const withAddress = withCoords.filter(
      (p) => p.source === 'curated' || (p.address && p.address.length > 0)
    );
    return withAddress.slice(0, markerLimit);
  }, [filteredPlaces, markerLimit]);

  const selectedPlace = useMemo(
    () => filteredPlaces.find((place) => place.id === selectedId) ?? null,
    [filteredPlaces, selectedId]
  );

  const getCoords = (place: CafePlace) => {
    const p = place as CafePlace & { latitude?: number; lat?: number; longitude?: number; lng?: number };
    const lat = p.latitude ?? p.lat ?? p.coords?.latitude;
    const lng = p.longitude ?? p.lng ?? p.coords?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return { latitude: lat, longitude: lng };
  };

  const choosePlaceForSession = useCallback(
    (place: CafePlace) => {
      const locationLabel = `${place.name} · ${place.district}`;
      router.push({
        pathname: '/session/new',
        params: {
          ...baseParams,
          location: serializeParam(locationLabel),
          placeId: serializeParam(String(place.id)),
        },
      });
    },
    [baseParams, router, serializeParam]
  );

  const handlePlacePress = useCallback(
    (place: CafePlace) => {
      if (isSelectMode) { choosePlaceForSession(place); return; }
      setSelectedId(place.id);
    },
    [choosePlaceForSession, isSelectMode]
  );

  const handleMarkerPress = useCallback(
    (place: CafePlace) => {
      setSelectedId(place.id);
      if (isSelectMode) choosePlaceForSession(place);
    },
    [choosePlaceForSession, isSelectMode]
  );

  const mapMarkers = useMemo(
    () =>
      displayPlaces
        .map((place): PlatformMapMarker | null => {
          const coords = getCoords(place);
          if (!coords) return null;
          const selected = selectedId === place.id;
          return {
            id: place.id,
            coordinate: coords,
            title: place.name,
            description: `${place.district} · ${place.address}`,
            highlighted: selected,
            onPress: () => handleMarkerPress(place),
            icon: (
              <View style={[styles.markerBubble, selected && styles.markerBubbleActive]}>
                <Ionicons name="cafe" size={14} color={selected ? '#7F3B00' : '#FFFFFF'} />
              </View>
            ),
          };
        })
        .filter((marker): marker is PlatformMapMarker => marker !== null),
    [displayPlaces, handleMarkerPress, selectedId]
  );

  const initialRegion = useMemo(() => {
    const first = places[0] as any;
    const lat = first?.latitude ?? first?.lat ?? first?.coords?.latitude ?? 45.5019;
    const lng = first?.longitude ?? first?.lng ?? first?.coords?.longitude ?? -73.5674;
    return { latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }, [places]);

  useEffect(() => {
    let mounted = true;
    fetchPlaces()
      .then((data) => { if (mounted && data.length > 0) setPlaces(data); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: THEME.bg }]}>
      <AppHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Reanimated.View style={[styles.padH, headerStyle]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>
                {pickingSpot ? 'Pick your spot' : isSelectMode ? 'Pick a café' : 'Explore cafés'}
              </Text>
              <Text style={styles.subtitle}>
                {pickingSpot
                  ? 'Tap any café below to set it as your location'
                  : isSelectMode
                  ? 'Tap a spot to fill your study date.'
                  : 'Wi-Fi friendly spots around Montréal.'}
              </Text>
            </View>
            {pickingSpot ? (
              <TouchableOpacity onPress={() => setPickingSpot(false)} hitSlop={10}>
                <Ionicons name="close-circle" size={26} color={THEME.accentDark} />
              </TouchableOpacity>
            ) : (
              <Ionicons name="map-outline" size={24} color={THEME.text} />
            )}
          </View>
        </Reanimated.View>

        {/* Location banner */}
        {!isSelectMode && (
          <LocationBanner
            onLocationChange={(coords) => {
              setUserCoords(coords);
              if (coords) setSortMode('distance');
              else setSortMode('default');
            }}
            onPickOnMap={() => setPickingSpot(true)}
          />
        )}

        {/* Search */}
        <Reanimated.View style={[styles.padH, { marginTop: 8 }, searchStyle]}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={THEME.sub} />
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search café, district, vibe..."
              placeholderTextColor={THEME.sub}
            />
          </View>
        </Reanimated.View>

        {/* Sort toggle (only when location known) */}
        {userCoords && !isSelectMode && (
          <View style={styles.sortRow}>
            <TouchableOpacity
              style={[styles.sortBtn, sortMode === 'default' && styles.sortBtnActive]}
              onPress={() => setSortMode('default')}
            >
              <Ionicons name="star-outline" size={13} color={sortMode === 'default' ? '#fff' : THEME.sub} />
              <Text style={[styles.sortBtnText, sortMode === 'default' && { color: '#fff' }]}>Best match</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, sortMode === 'distance' && styles.sortBtnActive]}
              onPress={() => setSortMode('distance')}
            >
              <Ionicons name="navigate-outline" size={13} color={sortMode === 'distance' ? '#fff' : THEME.sub} />
              <Text style={[styles.sortBtnText, sortMode === 'distance' && { color: '#fff' }]}>Nearest first</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* District chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 10 }}
        >
          <AnimatedChip
            label="All districts"
            active={!districtFilter}
            index={0}
            onPress={() => setDistrictFilter(null)}
          />
          {districts.map((d, i) => (
            <AnimatedChip
              key={d}
              label={d}
              active={districtFilter === d}
              index={i + 1}
              onPress={() => setDistrictFilter(districtFilter === d ? null : d)}
            />
          ))}
        </ScrollView>

        {/* Map */}
        <View style={[styles.padH, { marginTop: 12 }]}>
          <PlatformMap
            style={styles.map}
            initialRegion={initialRegion}
            markers={mapMarkers}
          />
        </View>
        <View style={styles.mapMetaRow}>
          <Text style={styles.attribution}>{OSM_ATTRIBUTION}</Text>
          <Text style={styles.metaCount}>
            Showing {displayPlaces.length} of {filteredPlaces.length} places
          </Text>
        </View>
        {filteredPlaces.length > markerLimit && (
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => setMarkerLimit((prev) => prev + 250)}
          >
            <Text style={styles.moreText}>Show more on map</Text>
          </TouchableOpacity>
        )}

        {/* Place cards */}
        <View style={[styles.padH, { marginTop: 16 }]}>
          {filteredPlaces.map((place, index) => {
            const distKm = userCoords && place.coords
              ? Math.round(
                  (() => {
                    const R = 6371;
                    const dL = ((place.coords.latitude - userCoords.latitude) * Math.PI) / 180;
                    const dO = ((place.coords.longitude - userCoords.longitude) * Math.PI) / 180;
                    const a =
                      Math.sin(dL / 2) ** 2 +
                      Math.cos((userCoords.latitude * Math.PI) / 180) *
                      Math.cos((place.coords.latitude * Math.PI) / 180) *
                      Math.sin(dO / 2) ** 2;
                    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                  })() * 100,
                ) / 100
              : undefined;

            return (
              <AnimatedPlaceCard
                key={place.id}
                place={place}
                selected={selectedId === place.id}
                index={index}
                isSelectMode={isSelectMode || pickingSpot}
                distanceKm={distKm}
                onPress={async () => {
                  if (pickingSpot && place.coords) {
                    await saveLocation(
                      { latitude: place.coords.latitude, longitude: place.coords.longitude },
                      `${place.name}, ${place.district}`,
                      'manual',
                    );
                    setUserCoords({ latitude: place.coords.latitude, longitude: place.coords.longitude });
                    setSortMode('distance');
                    setPickingSpot(false);
                  } else {
                    handlePlacePress(place);
                  }
                }}
              />
            );
          })}
          {filteredPlaces.length === 0 && (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={styles.subtitle}>No cafés match this search yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Animated bottom sheet */}
      {!isSelectMode && (
        <AnimatedBottomSheet
          place={selectedPlace}
          isSelectMode={isSelectMode}
          onClose={() => setSelectedId(null)}
          onStudyHere={(place) =>
            router.push({
              pathname: '/session/new',
              params: {
                location: serializeParam(`${place.name} · ${place.district}`),
                placeId: serializeParam(String(place.id)),
              },
            })
          }
          onDetails={(place) =>
            router.push({ pathname: '/place', params: { id: String(place.id) } })
          }
          serializeParam={serializeParam}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padH: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: THEME.text },
  subtitle: { fontSize: 12, color: THEME.sub, marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  input: { flex: 1, paddingVertical: 8, fontSize: 14, color: THEME.text },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: THEME.pill,
  },
  chipText: { fontSize: 12, color: THEME.text },
  map: { borderRadius: 18, height: 260, overflow: 'hidden' },
  attribution: { marginTop: 8, marginLeft: 20, fontSize: 11, color: THEME.sub },
  mapMetaRow: {
    marginTop: 8,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCount: { fontSize: 11, color: THEME.sub },
  moreBtn: {
    marginTop: 8,
    marginHorizontal: 20,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  moreText: { color: THEME.accentDark, fontWeight: '700', fontSize: 12 },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  sortBtnActive: {
    backgroundColor: THEME.accentDark,
    borderColor: THEME.accentDark,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.sub,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  distanceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.accentDark,
  },
  markerBubble: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF6EF',
  },
  markerBubbleActive: { backgroundColor: '#FFE0C4' },
  card: {
    marginBottom: 12,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
  },
  cardSelected: { borderColor: THEME.accentDark, borderWidth: 1.5 },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: { fontSize: 16, fontWeight: '700', color: THEME.text, flexShrink: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: THEME.accentDark,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  placeMeta: { fontSize: 12, color: THEME.sub },
  dot: { fontSize: 12, color: THEME.sub },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: THEME.pill,
  },
  tagText: { fontSize: 11, color: THEME.text },
  bottomSheet: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 82,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFDFB',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 20,
    padding: 12,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  sheetClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  sheetImage: {
    width: 92,
    height: 128,
    borderRadius: 16,
    backgroundColor: THEME.pill,
  },
  sheetContent: { flex: 1, minWidth: 0, paddingRight: 18 },
  sheetTitle: { fontSize: 16, color: THEME.text, fontWeight: '800', paddingRight: 16 },
  sheetSub: { color: THEME.sub, fontSize: 12, marginTop: 2 },
  sheetSignalRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  sheetSignal: {
    backgroundColor: '#F3E7E0',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sheetSignalText: { color: THEME.accentDark, fontSize: 10, fontWeight: '700' },
  sheetBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  sheetActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  sheetSecondary: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  sheetSecondaryText: { color: THEME.accentDark, fontWeight: '800', fontSize: 12 },
  sheetPrimary: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  sheetPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
