import React, { createContext, ReactNode, useContext, useState } from "react";

type LikedPromosContextType = {
  likedPromosIds: Set<number>; // set number what is that
  toggleLiked: (id: number) => void;
  isLiked: (id: number) => boolean;
};

const LikedPromosContext = createContext<LikedPromosContextType | null>(null);

export function LikedPromosProvider({children} : {children: ReactNode}) {
    const [likedPromosIds, setLikedPromosIds] = useState<Set<number>>(new Set());

    const toggleLiked = (id: number) => {
        setLikedPromosIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const isLiked = (id: number) => likedPromosIds.has(id);

    return (
        <LikedPromosContext.Provider value={{likedPromosIds, toggleLiked, isLiked}}>
            {children}
        </LikedPromosContext.Provider>
        );
}

export const useLikedPromos = () => {
  const ctx = useContext(LikedPromosContext);
  if (!ctx) throw new Error('useLikedPromos must be used within LikedPromosProvider');
  return ctx;
};