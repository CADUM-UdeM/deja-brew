// app/(tabs)/promos.tsx
import React from 'react';
<<<<<<< Updated upstream
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppHeader from '../../components/AppHeader';
=======
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/AppHeader';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

const THEME = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  card: '#FFFFFF',
  border: '#E8D9D1',
  accentDark: '#7F3B00',
};

const PROMOS = [
  {
    id: 1,
    title: '☕ -15% sur les lattés étudiants Café Central',
    description: 'Tous les jours après 16h avec une carte étudiante valide.',
    tag: 'Étudiants',
  },
  {
    id: 2,
    title: '📚 2h détude = 1 café filtre gratuit',
    description: 'Scanne le QR Deja Brew à lentrée de certains cafés partenaires.',
    tag: 'Loyalty',
  },
  {
    id: 3,
    title: '🌙 Night owls -10% après 20h',
    description: 'Pour les cafés ouverts tard listés sur Deja Brew.',
    tag: 'Night study',
  },
  {
    id: 4,
    title: '👯‍♀️ Study date : 2 pour 1',
    description: 'Un dessert offert à lachat de 2 boissons dans des spots sélectionnés.',
    tag: 'Friends',
  },
];

export default function PromosScreen() {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <AppHeader rightIcon="pricetag-outline" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <AppHeader onRightPress={() => router.push('/notifications')} />

      <View style={{paddingTop: 12, paddingHorizontal: 20}}>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        <Text style={styles.title}>Promos & perks</Text>
        <Text style={styles.subtitle}>
          Coffee deals, late-night discounts and student perks picked just for your study sessions.
        </Text>

        {PROMOS.map((promo) => (
          <View key={promo.id} style={styles.card}>
            <Text style={styles.cardTag}>{promo.tag}</Text>
            <Text style={styles.cardTitle}>{promo.title}</Text>
            <Text style={styles.cardText}>{promo.description}</Text>
          </View>
        ))}
      </ScrollView>
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
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginTop: 12,
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
    marginBottom: 6,
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
  },
});
