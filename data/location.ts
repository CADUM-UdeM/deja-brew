import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocation from 'expo-location';
import type { CafePlace } from './places';

const KEY_COORDS = 'userLocation_coords';
const KEY_LABEL  = 'userLocation_label';
const KEY_MODE   = 'userLocation_mode'; // 'gps' | 'manual'

export type UserCoords = { latitude: number; longitude: number };
export type SavedLocation = {
  coords: UserCoords;
  label:  string;
  mode:   'gps' | 'manual';
};

/* ─── Haversine distance (km) ─────────────────────────────────── */
export const getDistanceKm = (
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number => {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dO = ((lon2 - lon1) * Math.PI) / 180;
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dO / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ─── Human-readable distance ─────────────────────────────────── */
export const formatDistance = (km: number): string => {
  if (km < 0.1)  return 'Right here';
  if (km < 1)    return `${Math.round(km * 1000)} m`;
  if (km < 10)   return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

/* Walk-time estimate (avg 5 km/h) */
export const formatWalkTime = (km: number): string => {
  const mins = Math.round((km / 5) * 60);
  if (mins <= 1)  return '1 min walk';
  if (mins < 60)  return `${mins} min walk`;
  return `${Math.round(mins / 60)}h walk`;
};

/* ─── GPS ─────────────────────────────────────────────────────── */
export const requestGpsLocation = async (): Promise<UserCoords | null> => {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const loc = await ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.Balanced,
  });

  const coords: UserCoords = {
    latitude:  loc.coords.latitude,
    longitude: loc.coords.longitude,
  };

  await saveLocation(coords, 'Your location', 'gps');
  return coords;
};

/* ─── Persist ─────────────────────────────────────────────────── */
export const saveLocation = async (
  coords: UserCoords,
  label:  string,
  mode:   'gps' | 'manual' = 'manual',
) => {
  await AsyncStorage.multiSet([
    [KEY_COORDS, JSON.stringify(coords)],
    [KEY_LABEL,  label],
    [KEY_MODE,   mode],
  ]);
};

export const getSavedLocation = async (): Promise<SavedLocation | null> => {
  try {
    const [[, rawCoords], [, label], [, mode]] = await AsyncStorage.multiGet([
      KEY_COORDS, KEY_LABEL, KEY_MODE,
    ]);
    if (!rawCoords) return null;
    const coords = JSON.parse(rawCoords) as UserCoords;
    if (typeof coords.latitude !== 'number') return null;
    return { coords, label: label ?? 'Your location', mode: (mode ?? 'manual') as 'gps' | 'manual' };
  } catch {
    return null;
  }
};

export const clearLocation = async () => {
  await AsyncStorage.multiRemove([KEY_COORDS, KEY_LABEL, KEY_MODE]);
};

/* ─── Sort places by distance ─────────────────────────────────── */
export type PlaceWithDistance = CafePlace & { distanceKm: number };

export const sortByDistance = (
  places: CafePlace[],
  coords: UserCoords,
): PlaceWithDistance[] =>
  places
    .filter(p => p.coords)
    .map(p => ({
      ...p,
      distanceKm: getDistanceKm(
        coords.latitude,
        coords.longitude,
        p.coords!.latitude,
        p.coords!.longitude,
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
