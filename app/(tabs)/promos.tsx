// app/(tabs)/promos.tsx
import AllPromosScreen from '@/components/allPromosScreen';
import SavedPromosScreen from '@/components/savedPromosScreen';
import { THEME } from '@/data/THEME';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import AppHeader from '../../components/AppHeader';

const routes = [
  {key: 'promos', title: 'All promos'},
  {key: 'saved', title: 'My saved promos'},
];

function PromoTab() {
  return(
  <AllPromosScreen />)
}

function SavedPromoTab() {
  return(
   <SavedPromosScreen />
  )
}

const renderScene = SceneMap({
  promos: PromoTab,
  saved: SavedPromoTab,
});

 const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: THEME.accentDark, height: 3}}
      activeColor={THEME.accentDark}
      inactiveColor={THEME.sub}
      style={{backgroundColor: THEME.bg,
              elevation: 0,
      }}
      />
  )


export default function PromosScreen() {
  // const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  
  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 20, /* paddingBottom: 120 */ }}>
      <AppHeader rightIcon="pricetag-outline" />

        <Text style={styles.title}>Promos & perks</Text>
        <Text style={styles.subtitle}>
          Coffee deals, late-night discounts and student perks picked just for your study sessions.
        </Text>

        <TabView 
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: layout.width}}
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
    marginBottom: 16,
  },

});
