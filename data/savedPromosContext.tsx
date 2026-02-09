import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'savedPromoIds';

type SavedPromosContextValue = {
  savedPromoIds: number[];
  toggleSavedPromo: (id: number) => void;
  isSaved: (id: number) => boolean;
};

const SavedPromosContext = createContext<SavedPromosContextValue | undefined>(undefined);

export function SavedPromosProvider({ children }: { children: React.ReactNode }) {
  const [savedPromoIds, setSavedPromoIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedPromoIds(parsed.filter((id) => typeof id === 'number'));
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedPromoIds)).catch(() => {});
  }, [hydrated, savedPromoIds]);

  const toggleSavedPromo = (id: number) => {
    setSavedPromoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const value = useMemo(
    () => ({
      savedPromoIds,
      toggleSavedPromo,
      isSaved: (id: number) => savedPromoIds.includes(id),
    }),
    [savedPromoIds]
  );

  return (
    <SavedPromosContext.Provider value={value}>
      {children}
    </SavedPromosContext.Provider>
  );
}

export const useSavedPromos = () => {
  const ctx = useContext(SavedPromosContext);
  if (!ctx) {
    throw new Error('useSavedPromos must be used within SavedPromosProvider');
  }
  return ctx;
};
