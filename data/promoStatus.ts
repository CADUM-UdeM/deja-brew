import type { Promo } from '@/data/promos';

export type PromoState = 'active' | 'ending-soon' | 'upcoming' | 'expired';

const dayMs = 24 * 60 * 60 * 1000;

export const getPromoState = (promo: Promo, now = new Date()): PromoState => {
  const start = new Date(promo.promoStart);
  const end = new Date(promo.promoEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'active';
  if (now < start) return 'upcoming';
  if (now > end) return 'expired';
  if (end.getTime() - now.getTime() <= 3 * dayMs) return 'ending-soon';
  return 'active';
};

export const getPromoStateMeta = (promo: Promo, now = new Date()) => {
  const state = getPromoState(promo, now);
  const end = new Date(promo.promoEnd);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / dayMs));

  if (state === 'expired') {
    return { state, label: 'Expired', tone: 'muted' as const, reminder: 'Expired promo' };
  }
  if (state === 'upcoming') {
    return { state, label: 'Upcoming', tone: 'warm' as const, reminder: 'Starts soon' };
  }
  if (state === 'ending-soon') {
    return {
      state,
      label: 'Ending soon',
      tone: 'urgent' as const,
      reminder: daysLeft <= 1 ? 'Use by today' : `Use in ${daysLeft} days`,
    };
  }
  return { state, label: 'Active', tone: 'good' as const, reminder: 'Ready to use' };
};
