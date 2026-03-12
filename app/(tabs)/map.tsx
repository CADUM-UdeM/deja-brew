// app/(tabs)/map.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import AppHeader from '../../components/AppHeader';
import { ALL_PLACES, CafePlace, OSM_ATTRIBUTION } from '../../data/places';
import { fetchPlaces } from '../../data/api';
import { PlatformMap } from '@/components/platform-map';
import type { PlatformMapMarker } from '@/components/platform-map';

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

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [query, setQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [markerLimit, setMarkerLimit] = useState(250);
  const [places, setPlaces] = useState<CafePlace[]>(ALL_PLACES);

  const rawSelectMode = params?.selectMode;
  const isSelectMode =
    typeof rawSelectMode === 'string' ? rawSelectMode === 'place' : false;
  const serializeParam = (value: unknown) => {
    if (value === undefined) return undefined;
    return encodeURIComponent(JSON.stringify(value));
  };

  const baseParams = useMemo(() => {
    const next: Record<string, string | string[]> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'selectMode') return;
      next[key] = value as string | string[];
    });
    return next;
  }, [params]);

  // --- districts pour les filtres ---
  const districts = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => set.add(p.district));
    return Array.from(set).sort();
  }, [places]);

  // --- filtrage des cafés (search + district) ---
  const filteredPlaces: CafePlace[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    return places.filter((p) => {
      if (districtFilter && p.district !== districtFilter) return false;
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
  }, [query, districtFilter, places]);

  const displayPlaces = useMemo(() => {
    const withCoords = filteredPlaces.filter((p) => Boolean(p.coords));
    const withAddress = withCoords.filter(
      (p) => p.source === 'curated' || (p.address && p.address.length > 0)
    );
    return withAddress.slice(0, markerLimit);
  }, [filteredPlaces, markerLimit]);

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
              <View
                style={[
                  styles.markerBubble,
                  selected && styles.markerBubbleActive,
                ]}
              >
                <Ionicons
                  name="cafe"
                  size={14}
                  color={selected ? '#7F3B00' : '#FFFFFF'}
                />
              </View>
            ),
          };
        })
        .filter((marker): marker is PlatformMapMarker => marker !== null),
    [displayPlaces, selectedId]
  );

  // --- région initiale de la map (Montréal ou 1er café) ---
  const initialRegion = useMemo(() => {
    const first: any = places[0];

    const lat =
      first?.latitude ??
      first?.lat ??
      first?.coords?.latitude ??
      45.5019; // Montréal fallback
    const lng =
      first?.longitude ??
      first?.lng ??
      first?.coords?.longitude ??
      -73.5674; // Montréal fallback

    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [places]);

  // --- helper coords pour chaque café ---
  const getCoords = (place: CafePlace) => {
    const p: any = place;
    const lat =
      p.latitude ??
      p.lat ??
      p.coords?.latitude;
    const lng =
      p.longitude ??
      p.lng ??
      p.coords?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return { latitude: lat, longitude: lng };
  };

  // --- quand on clique sur un café (card ou marker) ---
  const handlePlacePress = (place: CafePlace) => {
    if (isSelectMode) {
      const locationLabel = `${place.name} · ${place.district}`;

      // on renvoie toujours vers /session/new avec des params
      router.push({
        pathname: '/session/new',
        params: {
          ...baseParams,
          location: serializeParam(locationLabel),
          placeId: serializeParam(String(place.id)),
        },
      });
    } else {
      // on ouvre la page détail du café
      router.push({
        pathname: '/place',
        params: { id: String(place.id) },
      });
    }
  };

  const handleMarkerPress = (place: CafePlace) => {
    setSelectedId(place.id);
    handlePlacePress(place);
  };

  useEffect(() => {
    let mounted = true;
    fetchPlaces()
      .then((data) => {
        if (mounted && data.length > 0) setPlaces(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: THEME.bg }]}>
      <AppHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Titre / sous-titre */}
        <View style={styles.padH}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>
                {isSelectMode ? 'Pick a café' : 'Explore cafés'}
              </Text>
              <Text style={styles.subtitle}>
                {isSelectMode
                  ? 'Tap a spot to fill your study date.'
                  : 'See Wi-Fi friendly spots around Montréal.'}
              </Text>
            </View>
            <Ionicons name="map-outline" size={24} color={THEME.text} />
          </View>
        </View>

        {/* Search */}
        <View style={[styles.padH, { marginTop: 8 }]}>
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
        </View>

        {/* Filtres de district */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <TouchableOpacity onPress={() => setDistrictFilter(null)}>
            <View
              style={[
                styles.chip,
                !districtFilter && { backgroundColor: THEME.accentDark },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  !districtFilter && { color: '#fff', fontWeight: '700' },
                ]}
              >
                All districts
              </Text>
            </View>
          </TouchableOpacity>

          {districts.map((d) => {
            const active = districtFilter === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDistrictFilter(active ? null : d)}
              >
                <View
                  style={[
                    styles.chip,
                    active && { backgroundColor: THEME.accentDark },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#fff', fontWeight: '700' },
                    ]}
                  >
                    {d}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* MAP + MARKERS */}
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

        {/* Liste des cafés */}
        <View style={[styles.padH, { marginTop: 16 }]}>
          {filteredPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              activeOpacity={0.9}
              onPress={() => handlePlacePress(place)}
            >
              <View
                style={[
                  styles.card,
                  selectedId === place.id && styles.cardSelected,
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <View style={styles.badge}>
                    <Ionicons
                      name={
                        isSelectMode
                          ? 'checkmark-circle-outline'
                          : 'cafe-outline'
                      }
                      size={14}
                      color="#fff"
                    />
                    <Text style={styles.badgeText}>
                      {isSelectMode ? 'Select' : 'Details'}
                    </Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={THEME.sub}
                  />
                  <Text style={styles.placeMeta}>{place.district}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.placeMeta}>
                    {place.address || 'Address not listed'}
                  </Text>
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
          ))}

          {filteredPlaces.length === 0 && (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={styles.subtitle}>
                No cafés match this search yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------- styles ------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padH: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 2,
  },
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
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: THEME.text,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: THEME.pill,
  },
  chipText: {
    fontSize: 12,
    color: THEME.text,
  },
  map: {
    borderRadius: 18,
    height: 260,
    overflow: 'hidden',
  },
  attribution: {
    marginTop: 8,
    marginLeft: 20,
    fontSize: 11,
    color: THEME.sub,
  },
  mapMetaRow: {
    marginTop: 8,
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCount: {
    fontSize: 11,
    color: THEME.sub,
  },
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
  moreText: {
    color: THEME.accentDark,
    fontWeight: '700',
    fontSize: 12,
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
  markerBubbleActive: {
    backgroundColor: '#FFE0C4',
  },
  card: {
    marginBottom: 12,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
  },
  cardSelected: {
    borderColor: THEME.accentDark,
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: THEME.accentDark,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  placeMeta: {
    fontSize: 12,
    color: THEME.sub,
  },
  dot: {
    fontSize: 12,
    color: THEME.sub,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: THEME.pill,
  },
  tagText: {
    fontSize: 11,
    color: THEME.text,
  },
});
