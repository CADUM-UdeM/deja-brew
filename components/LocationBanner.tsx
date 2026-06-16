import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { THEME } from '@/data/THEME';
import {
  getSavedLocation,
  requestGpsLocation,
  clearLocation,
  type SavedLocation,
  type UserCoords,
} from '@/data/location';

type Props = {
  onLocationChange: (coords: UserCoords | null) => void;
  onPickOnMap?: () => void;
};

export default function LocationBanner({ onLocationChange, onPickOnMap }: Props) {
  const [saved, setSaved]     = useState<SavedLocation | null>(null);
  const [loading, setLoading] = useState(false);

  const pulse  = useSharedValue(0);
  const slideY = useSharedValue(-20);
  const opac   = useSharedValue(0);

  useEffect(() => {
    getSavedLocation().then(loc => {
      setSaved(loc);
      onLocationChange(loc?.coords ?? null);
    });
    slideY.value = withSpring(0, { damping: 18, stiffness: 200 });
    opac.value   = withTiming(1, { duration: 320 });
  }, [onLocationChange, opac, slideY]);

  useEffect(() => {
    if (!saved) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    );
  }, [pulse, saved]);

  const bannerStyle = useAnimatedStyle(() => ({
    opacity:   opac.value,
    transform: [{ translateY: slideY.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.5]) }],
    opacity:   interpolate(pulse.value, [0, 1], [1, 0.3]),
  }));

  const handleGps = async () => {
    setLoading(true);
    const coords = await requestGpsLocation();
    if (coords) {
      const loc: SavedLocation = { coords, label: 'Your location', mode: 'gps' };
      setSaved(loc);
      onLocationChange(coords);
    }
    setLoading(false);
  };

  const handleClear = async () => {
    await clearLocation();
    setSaved(null);
    onLocationChange(null);
  };

  if (saved) {
    return (
      <Reanimated.View style={[styles.activeBanner, bannerStyle]}>
        <View style={styles.activeLeft}>
          <View style={styles.dotWrap}>
            <Reanimated.View style={[styles.dotRing, dotStyle]} />
            <View style={styles.dot} />
          </View>
          <View>
            <Text style={styles.activeLabel}>{saved.label}</Text>
            <Text style={styles.activeMode}>
              {saved.mode === 'gps' ? 'GPS · live' : 'Chosen spot'}
            </Text>
          </View>
        </View>
        <View style={styles.activeActions}>
          {onPickOnMap && (
            <TouchableOpacity style={styles.changeBtn} onPress={onPickOnMap}>
              <Ionicons name="map-outline" size={14} color={THEME.accentDark} />
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleClear} hitSlop={8}>
            <Ionicons name="close-circle-outline" size={20} color={THEME.sub} />
          </TouchableOpacity>
        </View>
      </Reanimated.View>
    );
  }

  return (
    <Reanimated.View style={[styles.banner, bannerStyle]}>
      <View style={styles.bannerLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name="location-outline" size={18} color={THEME.accentDark} />
        </View>
        <View>
          <Text style={styles.bannerTitle}>Find cafés near you</Text>
          <Text style={styles.bannerSub}>Use GPS or pick a spot on the map</Text>
        </View>
      </View>
      <View style={styles.bannerActions}>
        <TouchableOpacity
          style={styles.gpsBtn}
          onPress={handleGps}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="navigate-outline" size={14} color="#fff" />
              <Text style={styles.gpsBtnText}>GPS</Text>
            </>
          )}
        </TouchableOpacity>
        {onPickOnMap && (
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={onPickOnMap}
            activeOpacity={0.85}
          >
            <Ionicons name="map-outline" size={14} color={THEME.accentDark} />
            <Text style={styles.mapBtnText}>Pick spot</Text>
          </TouchableOpacity>
        )}
      </View>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#FFF7F2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.text,
  },
  bannerSub: {
    fontSize: 11,
    color: THEME.sub,
    marginTop: 1,
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.accentDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: THEME.accentDark,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  gpsBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  mapBtnText: {
    color: THEME.accentDark,
    fontWeight: '700',
    fontSize: 12,
  },

  /* active state */
  activeBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#F0FFF4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#B7E4C7',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dotWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2F6B3F',
    position: 'absolute',
  },
  dotRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2F6B3F',
    position: 'absolute',
  },
  activeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A4731',
  },
  activeMode: {
    fontSize: 10,
    color: '#2F6B3F',
    fontWeight: '600',
    marginTop: 1,
  },
  activeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B7E4C7',
  },
  changeBtnText: {
    fontSize: 11,
    color: THEME.accentDark,
    fontWeight: '700',
  },
});
