import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { PROMOS, Promo } from '@/data/promos';
import PromoCard from './PromoCard';
import { fetchPromos } from '@/data/api';
import { THEME } from '@/data/THEME';
import { getCafeName } from '@/data/places';
import { getPromoState } from '@/data/promoStatus';
import { useSavedPromos } from '@/data/savedPromosContext';
import EmptyState from '@/components/EmptyState';

type PromoFilter = 'all' | 'active' | 'ending' | 'saved';

// screen for the all promo tab
export default function AllPromosScreen() {
  const [promos, setPromos] = useState<Promo[]>(PROMOS);
  const [filter, setFilter] = useState<PromoFilter>('all');
  const [cafeFilter, setCafeFilter] = useState<string | null>(null);
  const { savedPromoIds } = useSavedPromos();

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

  const cafeIds = Array.from(new Set(promos.map((promo) => promo.cafe_id).filter(Boolean)));
  const filteredPromos = promos.filter((promo) => {
    if (cafeFilter && promo.cafe_id !== cafeFilter) return false;
    if (filter === 'saved') return savedPromoIds.includes(promo.id);
    const state = getPromoState(promo);
    if (filter === 'active') return state === 'active' || state === 'ending-soon';
    if (filter === 'ending') return state === 'ending-soon';
    return true;
  });

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {([
          ['all', 'All'],
          ['active', 'Active'],
          ['ending', 'Ending soon'],
          ['saved', 'Saved'],
        ] as const).map(([value, label]) => (
          <TouchableOpacity
            key={value}
            style={[styles.filterChip, filter === value && styles.filterChipActive]}
            onPress={() => setFilter(value)}
          >
            <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity
          style={[styles.cafeChip, !cafeFilter && styles.cafeChipActive]}
          onPress={() => setCafeFilter(null)}
        >
          <Text style={[styles.cafeText, !cafeFilter && styles.cafeTextActive]}>All cafes</Text>
        </TouchableOpacity>
        {cafeIds.map((cafeId) => (
          <TouchableOpacity
            key={cafeId}
            style={[styles.cafeChip, cafeFilter === cafeId && styles.cafeChipActive]}
            onPress={() => setCafeFilter(cafeFilter === cafeId ? null : cafeId)}
          >
            <Text style={[styles.cafeText, cafeFilter === cafeId && styles.cafeTextActive]}>
              {getCafeName(cafeId)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredPromos.length === 0 && (
        <EmptyState
          icon="pricetag-outline"
          title="No promos in this view"
          message="Try another cafe or switch back to all active deals."
        />
      )}

      {filteredPromos.map((promo) => (
        <PromoCard key={promo.id} promo={promo} enableCafeRoute={true} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: THEME.accentDark,
    borderColor: THEME.accentDark,
  },
  filterText: {
    color: THEME.accentDark,
    fontSize: 12,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#fff',
  },
  cafeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: THEME.pill,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cafeChipActive: {
    backgroundColor: '#FFE0C4',
  },
  cafeText: {
    color: THEME.text,
    fontSize: 11,
    fontWeight: '700',
  },
  cafeTextActive: {
    color: THEME.accentDark,
  },
});
