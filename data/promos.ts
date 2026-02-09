// data/promos.ts

export type Promo = {
    id: number;
    title: string;
    description: string;
    cafe_id: string;
    tag: string;
    promoStart: string;
    promoEnd: string;
}

// fonction pour transformer les dates en texte + jour
// Ex: 2025-02-01T23:59:59Z => February 1 
export const formatDateEN = (iso : string) => {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
  });
}; 

export const PROMOS: Promo[] = [
    
  {
    id: 1,
    title: '☕ -15% sur les lattés étudiants Café Central',
    description: 'Tous les jours après 16h avec une carte étudiante valide.',
    cafe_id: 'constance',
    tag: 'Étudiants', 
    promoStart: '2025-02-01T00:00:00Z',
    promoEnd: '2025-02-15T23:59:59Z',
  },
  {
    id: 2,
    title: '📚 2h détude = 1 café filtre gratuit',
    description: 'Scanne le QR Deja Brew à lentrée de certains cafés partenaires.',
    cafe_id: 'savsav',
    tag: 'Loyalty',
    promoStart: '2025-03-01T00:00:00Z',
    promoEnd: '2025-03-15T23:59:59Z',
  },
  {
    id: 3,
    title: '🌙 Night owls -10% après 20h',
    description: 'Pour les cafés ouverts tard listés sur Deja Brew.',
    cafe_id: 'savsav',
    tag: 'Night study',
    promoStart: '2025-05-21T00:00:00Z',
    promoEnd: '2025-06-15T23:59:59Z',
  },
  {
    id: 4,
    title: '👯‍♀️ Study date : 2 pour 1',
    description: 'Un dessert offert à lachat de 2 boissons dans des spots sélectionnés.',
    cafe_id: 'amea',
    tag: 'Friends',
    promoStart: '2025-01-11T00:00:00Z',
    promoEnd: '2025-02-25T23:59:59Z',
  },
];
