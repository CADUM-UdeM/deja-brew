import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'likedPromoIds';

type LikedPromosContextValue = {
  likedPromoIds: number[];
  toggleLikedPromo: (id: number) => void;
  isLiked: (id: number) => boolean;
};

const LikedPromosContext = createContext<LikedPromosContextValue | undefined>(undefined);

export function LikedPromosProvider({ children }: { children: React.ReactNode }) {
  const [likedPromoIds, setLikedPromoIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLikedPromoIds(parsed.filter((id) => typeof id === 'number'));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(likedPromoIds)).catch(() => {});
  }, [hydrated, likedPromoIds]);

  const toggleLikedPromo = (id: number) => {
    setLikedPromoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const value = useMemo(
    () => ({
      likedPromoIds,
      toggleLikedPromo,
      isLiked: (id: number) => likedPromoIds.includes(id),
    }),
    [likedPromoIds]
  );

  return (
    <LikedPromosContext.Provider value={value}>
      {children}
    </LikedPromosContext.Provider>
  );
}

export const useLikedPromos = () => {
  const ctx = useContext(LikedPromosContext);
  if (!ctx) {
    throw new Error('useLikedPromos must be used within LikedPromosProvider');
  }
  return ctx;
};
