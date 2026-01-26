import PromoCard from '@/components/PromoCard';
import { PROMOS } from '@/data/promos';
import { useSavedPromos } from '@/data/savedPromosContext';
import { THEME } from '@/data/THEME';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SavedPromosScreen() {
  const { savedPromoIds } = useSavedPromos();

  // Filter only saved promos
  const savedPromos = PROMOS.filter(promo => savedPromoIds.includes(promo.id));

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg, padding: 16 }}>
      <Text style={styles.title}>Saved Promos</Text>

      {savedPromos.length === 0 ? (
        <Text style={styles.emptyText}>You haven't saved any promos yet.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {savedPromos.map(promo => (
            <PromoCard key={promo.id} promo={promo} enableCafeRoute={true} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.sub,
  },
});
