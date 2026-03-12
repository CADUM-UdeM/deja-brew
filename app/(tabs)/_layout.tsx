
// app/(tabs)/_layout.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { View } from 'react-native';

const THEME = {
  bg: '#FFF6EF',
  active: '#7F3B00',    // caramel/brown
  inactive: '#8C8681',  // gris chaud
  indicator: '#F3E7E0',
};

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <NativeTabs
        tintColor={THEME.active}
        iconColor={{ default: THEME.inactive, selected: THEME.active }}
        disableTransparentOnScrollEdge
        backgroundColor={THEME.bg}
        blurEffect="systemChromeMaterialLight"
        indicatorColor={THEME.indicator}
        labelVisibilityMode='labeled'
      >
        <NativeTabs.Trigger name="index">
          <Icon
            sf={{ default: 'house', selected: 'house.fill' }}
            androidSrc={<VectorIcon family={Ionicons} name="home" />}
          />
          <Label>Home</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="promos">
          <Icon
            sf={{ default: 'tag', selected: 'tag.fill' }}
            androidSrc={<VectorIcon family={Ionicons} name="pricetag" />}
          />
          <Label>Promos</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="map">
          <Icon
            sf={{ default: 'map', selected: 'map.fill' }}
            androidSrc={<VectorIcon family={Ionicons} name="map" />}
          />
          <Label>Map</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Icon
            sf={{ default: 'person', selected: 'person.fill' }}
            androidSrc={<VectorIcon family={Ionicons} name="person" />}
          />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
