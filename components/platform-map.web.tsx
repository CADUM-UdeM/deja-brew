import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

export type PlatformMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type PlatformMapMarker = {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  highlighted?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
};

type PlatformMapProps = {
  initialRegion: PlatformMapRegion;
  markers: PlatformMapMarker[];
  style?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
};

export function PlatformMap({ initialRegion, markers, style }: PlatformMapProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Map preview</Text>
      <Text style={styles.subtitle}>
        Interactive maps are limited on web here. Use the place list below.
      </Text>
      <Text style={styles.coords}>
        Center {initialRegion.latitude.toFixed(4)}, {initialRegion.longitude.toFixed(4)}
      </Text>
      <View style={styles.markerList}>
        {markers.slice(0, 8).map((marker) => (
          <Pressable
            key={marker.id}
            style={[styles.markerChip, marker.highlighted && styles.markerChipActive]}
            onPress={marker.onPress}
          >
            <Text style={[styles.markerText, marker.highlighted && styles.markerTextActive]}>
              {marker.title ?? 'Cafe'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7EBDD',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8D9D1',
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A1C17',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: '#7A6B62',
  },
  coords: {
    marginTop: 10,
    fontSize: 12,
    color: '#7A6B62',
  },
  markerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  markerChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D6B8A5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markerChipActive: {
    backgroundColor: '#7F3B00',
    borderColor: '#7F3B00',
  },
  markerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F3B00',
  },
  markerTextActive: {
    color: '#FFFFFF',
  },
});
