import React, { createContext, ReactNode, useContext, useState } from "react";

type SavedPromosContextType = {
  savedPromoIds: number[];
  toggleSavePromo: (id: number) => void;
};

const SavedPromosContext = createContext<SavedPromosContextType | undefined>(undefined);

export const SavedPromosProvider = ({ children }: { children: ReactNode }) => {
  const [savedPromoIds, setSavedPromoIds] = useState<number[]>([]);

  const toggleSavePromo = (id: number) => {
    setSavedPromoIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  return (
    <SavedPromosContext.Provider value={{ savedPromoIds, toggleSavePromo }}>
      {children}
    </SavedPromosContext.Provider>
  );
};

// Hook pratique pour utiliser le context
export const useSavedPromos = () => {
  const context = useContext(SavedPromosContext);
  if (!context) {
    throw new Error("useSavedPromos must be used within a SavedPromosProvider");
  }
  return context;
};
