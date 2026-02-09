// app/(tabs)/promos.tsx
import AllPromosScreen from '@/components/allPromosScreen';
import SavedPromosScreen from '@/components/savedPromosScreen';
import { THEME } from '@/data/THEME';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

// routes for the tabs
const routes = [
  { key: 'promos', title: 'All promos' },
  { key: 'saved', title: 'My saved promos' },
];

// renders screen of all promos 
function PromoTab() {
  return (
    <AllPromosScreen />)
}

// renders screen of saved promos
function SavedPromoTab() {
  return (
    <SavedPromosScreen />
  )
}

// does the rendering (i think...)
const renderScene = SceneMap({
  promos: PromoTab,
  saved: SavedPromoTab,
});

// modification (styles) fait à la tab bar
const renderTabBar = (props: any) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: THEME.accentDark, height: 3 }}
    activeColor={THEME.accentDark}
    inactiveColor={THEME.sub}
    style={{
      backgroundColor: THEME.bg,
      elevation: 0, // removes the shadow on android
      shadowOpacity: 0, // removes the shadow on IOS
      marginBottom: 8,
    }}
  />
)


export default function PromosScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 20 }}>
      {/* <AppHeader rightIcon="pricetag-outline" /> */}

      <View style={{ paddingTop: useSafeAreaInsets().top }}>
        <Text style={styles.title}>Promos & perks</Text>
        <Text style={styles.subtitle}>
          Coffee deals, late-night discounts and student perks picked just for your study sessions.
        </Text>
      </View>

      {/* Tab all promos and saved promos done here! */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      >
      </TabView>

    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.sub,
    marginBottom: 8,
  },

});
