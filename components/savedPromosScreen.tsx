import PromoCard from '@/components/PromoCard';
import { PROMOS } from '@/data/promos';
import { useSavedPromos } from '@/data/savedPromosContext';
import { THEME } from '@/data/THEME';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// screen for the saved promos tab
export default function SavedPromosScreen() {
  const { savedPromoIds } = useSavedPromos();

  // Filter only saved promos
  const savedPromos = PROMOS.filter((promo) => savedPromoIds.includes(promo.id));

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 20, paddingTop: 12 }}>
      {savedPromos.length === 0 ? (
        <View
          style={{
            flex: 1,
            backgroundColor: THEME.bg,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={styles.emptyText}>You have not saved any promos yet.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1, backgroundColor: THEME.bg }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {savedPromos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} enableCafeRoute={true} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    color: THEME.sub,
    textAlign: 'center',
  },
});
