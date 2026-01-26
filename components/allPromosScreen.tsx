import { PROMOS } from '@/data/promos';
import { THEME } from '@/data/THEME';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import PromoCard from './PromoCard';

// screen for the all promo tab
export default function AllPromosScreen() {
    const router = useRouter();
  return(
    <ScrollView>
      {PROMOS.map((promo) => (
        <PromoCard
          key={promo.id}
          promo={promo} 
          enableCafeRoute={true}
          />
        ))}
    </ScrollView>
  )
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