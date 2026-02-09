import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { PROMOS, Promo } from '@/data/promos';
import PromoCard from './PromoCard';
import { fetchPromos } from '@/data/api';

// screen for the all promo tab
export default function AllPromosScreen() {
  const [promos, setPromos] = useState<Promo[]>(PROMOS);

  useEffect(() => {
    let mounted = true;
    fetchPromos()
      .then((data) => {
        if (mounted && data.length > 0) setPromos(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

<<<<<<< Updated upstream
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {promos.map((promo) => (
        <PromoCard key={promo.id} promo={promo} enableCafeRoute={true} />
      ))}
    </ScrollView>
  );
=======
  return(
    <ScrollView>
      {promos.map((promo) => (
        <PromoCard
          key={promo.id}
          promo={promo} 
          enableCafeRoute={true}
          />
        ))}
    </ScrollView>
  )
>>>>>>> Stashed changes
}
