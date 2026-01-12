

// app/(tabs)/_layout.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME = {
  bg: '#FFF6EF',
  border: '#E8D9D1',
  active: '#7F3B00',    // caramel/brown
  inactive: '#8C8681',  // gris chaud
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const getTabBarHeight = () => {
    if (Platform.OS === 'android') {
      // If bottom inset is 0, device uses button navigation
      // If bottom inset > 0, device uses gesture navigation
      const hasButtonNavigation = insets.bottom === 0;
      return hasButtonNavigation ? 60 : 55 + insets.bottom;
    }
    return undefined; // Let iOS handle it automatically
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // on utilise notre AppHeader custom dans chaque écran
        tabBarActiveTintColor: THEME.active,
        tabBarInactiveTintColor: THEME.inactive,
        tabBarStyle: {
          backgroundColor: THEME.bg,
          borderTopColor: THEME.border,
          ...Platform.select({
            ios: { padding: 6, height: "10%" },
            android: { padding: 8, height: getTabBarHeight(), paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }
          })
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="promos"
        options={{
          title: 'Promos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'pricetags' : 'pricetag-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
