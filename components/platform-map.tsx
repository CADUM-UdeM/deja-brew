import React from 'react';
import MapView, { Marker } from 'react-native-maps';
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

export function PlatformMap({
  initialRegion,
  markers,
  style,
  scrollEnabled = true,
  zoomEnabled = true,
}: PlatformMapProps) {
  return (
    <MapView
      style={style}
      initialRegion={initialRegion}
      scrollEnabled={scrollEnabled}
      zoomEnabled={zoomEnabled}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
          onPress={marker.onPress}
        >
          {marker.icon}
        </Marker>
      ))}
    </MapView>
  );
}
