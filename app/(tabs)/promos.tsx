// app/(tabs)/promos.tsx
import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import AllPromosScreen from '@/components/allPromosScreen';
import SavedPromosScreen from '@/components/savedPromosScreen';
import { THEME } from '@/data/THEME';
<<<<<<< Updated upstream
=======
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/AppHeader';
>>>>>>> Stashed changes

const routes = [
  { key: 'promos', title: 'All promos' },
  { key: 'saved', title: 'Saved' },
];

const renderScene = SceneMap({
  promos: AllPromosScreen,
  saved: SavedPromosScreen,
});

const renderTabBar = (props: any) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: THEME.accentDark, height: 3 }}
    activeColor={THEME.accentDark}
    inactiveColor={THEME.sub}
    style={{
      backgroundColor: THEME.bg,
      elevation: 0,
      shadowOpacity: 0,
    }}
  />
);

export default function PromosScreen() {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <AppHeader onRightPress={() => router.push('/notifications')} />

<<<<<<< Updated upstream
      <View style={styles.header}>
=======
      <View style={{paddingTop: 12, paddingHorizontal: 20}}>
>>>>>>> Stashed changes
        <Text style={styles.title}>Promos & perks</Text>
        <Text style={styles.subtitle}>
          Coffee deals, late-night discounts and student perks picked for your study sessions.
        </Text>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.sub,
    marginBottom: 12,
  },
});
