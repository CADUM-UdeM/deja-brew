// app/(tabs)/promos.tsx
import SavedPromosScreen from '@/components/savedPromos';
import { getCafeName } from '@/data/places';
import { formatDateEN, PROMOS } from '@/data/promos';
import { THEME } from '@/data/THEME';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import AppHeader from '../../components/AppHeader';

const routes = [
  {key: 'promos', title: 'All promos'},
  {key: 'saved', title: 'My saved promos'},
];

function PromoTab() {
  const router = useRouter();
  return(
    <ScrollView>
      {PROMOS.map((promo) => (
          <TouchableOpacity onPress={()=> router.push({pathname: '/place', params: {id: promo.cafe_id}})} key={promo.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>{promo.tag}</Text>
              <Text style={styles.name}>by {getCafeName(promo.cafe_id)}</Text>
            </View>
            <Text style={styles.cardTitle}>{promo.title}</Text>
            <Text style={styles.cardText}>{promo.description}</Text>
            {/* Time limit date */}
            <View style={styles.cardBottom}>
              <Text style={styles.name}>from {formatDateEN(promo.promoStart)} to {formatDateEN(promo.promoEnd)}</Text>
              {/* liked by many users */}
              <View style={{flexDirection: 'row', gap: 4}}>
                <Ionicons name='heart'
                          color={THEME.sub}></Ionicons>
                <Text style={styles.name}>number</Text>
              </View>
            </View> 
          </TouchableOpacity>
        ))}
    </ScrollView>
      
  )
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

      >
      </TabBar>
  )


export default function PromosScreen() {
  // const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  
  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 20, /* paddingBottom: 120 */ }}>
      <AppHeader rightIcon="pricetag-outline" />

      {/* <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      > */}
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

        {/* <View style={{flexDirection: 'row' }}>

          <View style={{flex: 1,
                        borderWidth: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 18,
                        // paddingStart: 8,
                        alignItems: 'center',
                        borderColor: THEME.accentDark,
                        backgroundColor: THEME.border}}>

            <Text>Promos</Text>
          </View>
          <View style={{flex: 1,
                        borderWidth: 1, 
                        paddingVertical: 14,
                        paddingHorizontal: 18,
                        alignItems: 'center',
                        borderColor: THEME.accentDark,
                        backgroundColor: THEME.border,}}>

            <Text onPress={() => router.push({pathname: '/savedPromos'})}>Saved promos</Text>
          </View>
        </View> */}
        
{/* 
        {PROMOS.map((promo) => (
          <TouchableOpacity onPress={()=> router.push({pathname: '/place', params: {id: promo.cafe_id}})} key={promo.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTag}>{promo.tag}</Text>
              <Text style={styles.name}>by {getCafeName(promo.cafe_id)}</Text>
            </View>
            <Text style={styles.cardTitle}>{promo.title}</Text>
            <Text style={styles.cardText}>{promo.description}</Text>
            {/* Time limit date *
            <View style={styles.cardBottom}>
              <Text style={styles.name}>from {formatDateEN(promo.promoStart)} to {formatDateEN(promo.promoEnd)}</Text>
              {/* liked by many users *
              <View style={{flexDirection: 'row', gap: 4}}>
                <Ionicons name='heart'
                          color={THEME.sub}></Ionicons>
                <Text style={styles.name}>number</Text>
              </View>
            </View> 
          </TouchableOpacity>
        ))}
         */} 
        
      {/* </ScrollView> */}
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
  name: {
    color: THEME.sub,
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  cardTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    color: THEME.accentDark,
    fontSize: 11,
    fontWeight: '700',
    // marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.accentDark,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    color: THEME.text,
    padding: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between', 
    paddingTop: 4,
  }
});
