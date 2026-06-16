import PromoCard from '@/components/PromoCard';
import { PROMOS } from '@/data/promos';
import { useSavedPromos } from '@/data/savedPromosContext';
import { THEME } from '@/data/THEME';
import { fetchPromos } from '@/data/api';
import type { Promo } from '@/data/promos';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import EmptyState from '@/components/EmptyState';

// screen for the saved promos tab
export default function SavedPromosScreen() {
  const { savedPromoIds } = useSavedPromos();
  const [promos, setPromos] = useState<Promo[]>(PROMOS);

  useEffect(() => {
    let mounted = true;
    fetchPromos()
      .then((data) => {
        if (!mounted || data.length === 0) return;
        const merged = [...data, ...PROMOS].filter(
          (promo, index, list) =>
            list.findIndex((item) => item.id === promo.id) === index
        );
        setPromos(merged);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Filter only saved promos
  const savedPromos = useMemo(
    () => promos.filter((promo) => savedPromoIds.includes(promo.id)),
    [promos, savedPromoIds]
  );

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg, paddingHorizontal: 20, paddingTop: 12 }}>
      {savedPromos.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title="No saved promos yet"
          message="Save a promo from the all promos tab and it will show up here with its reminder."
        />
      ) : (
        <ScrollView
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
