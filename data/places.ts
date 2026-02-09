// data/places.ts
export type CafePlace = {
  id: string;
  name: string;
  address: string;
  district: string;
  vibe: string;
  studyAtmosphere: string[];
  wifi: boolean;
  outlets: boolean;
  food: string[];
  hours: string;
  tags: string[];
  imageUrl?: string;

  // Coordonnées pour la map
  coords?: { latitude: number; longitude: number };

  // Infos supplémentaires
  rating?: number;                  // ex. 4.7
  walkMinutes?: number;             // temps de marche approximatif
  priceLevel?: '$' | '$$' | '$$$';  // niveau de prix
  source?: 'curated' | 'osm';
};

<<<<<<< Updated upstream
=======
  // Fonction pour get cafe name par id
  export const getCafeName = (cafeId: string) : string => {
    const cafe = ALL_PLACES.find((place) => place.id === cafeId);
    return cafe ? cafe.name : 'Café inconnu';
  }

>>>>>>> Stashed changes
export const PLACES: CafePlace[] = [
  {
    id: "savsav",
    name: "Savsav",
    address: "780 Avenue Brewster",
    district: "Saint-Henri",
    vibe: "Grand local industriel, chaleureux, très lumineux",
    studyAtmosphere: [
      "Calme en semaine",
      "Plus brunch/social le week-end",
      "Beaucoup de grandes tables et bancs",
      "Super pour travail en groupe",
    ],
    wifi: true,
    outlets: true,
    food: ["Brunch", "Bols", "Pâtisseries", "Café de spécialité"],
    hours: "8h–16h semaine, 9h–16h fin de semaine",
    tags: ["Aesthetic", "Group work", "Cowork-friendly", "Saint-Henri"],
    coords: { latitude: 45.47957, longitude: -73.58614 },

    rating: 4.8,
    walkMinutes: 7,
    priceLevel: "$$",
  },

  {
    id: "accio",
    name: "Accio Cup",
    address: "2155 Rue Mackay",
    district: "Downtown / Concordia",
    vibe: "Petit café asiatique cosy, ambiance magical-fantasy",
    studyAtmosphere: [
      "Très calme pour étudiants Concordia",
      "Petite place → parfait solo/duo",
    ],
    wifi: true,
    outlets: true,
    food: ["Matcha", "Tiramisu latte", "Bubble tea", "Desserts asiatiques"],
    hours: "11h–20h tous les jours",
    tags: ["Bubble tea", "Concordia", "Cozy corner", "Dessert date"],
    coords: { latitude: 45.49743, longitude: -73.57882 },

    rating: 4.7,
    walkMinutes: 4,
    priceLevel: "$$",
  },

  {
    id: "constance",
    name: "Café Constance (Bazin)",
    address: "Édifice Wilder, Quartier des spectacles",
    district: "Downtown / QDS",
    vibe: "Café chic dans un hall culturel, design élégant",
    studyAtmosphere: [
      "Calme en journée",
      "Parfait pour laptop solo ou avec un ami",
    ],
    wifi: true,
    outlets: true,
    food: ["Viennoiseries", "Croque-monsieur", "Brunch français", "Desserts"],
    hours: "Cuisine 16h-19h30 selon jours, café ~17h–20h",
    tags: ["French café", "Chic", "Before-show study"],
    coords: { latitude: 45.50863, longitude: -73.56547 },

    rating: 4.6,
    walkMinutes: 6,
    priceLevel: "$$",
  },

  {
    id: "crew",
    name: "Crew Collective & Café",
    address: "360 Rue Saint-Jacques",
    district: "Vieux-Montréal",
    vibe: "Ancienne banque monumentale → vibes cathédrale productive",
    studyAtmosphere: [
      "Mix café / coworking",
      "Ambiance très laptop-friendly",
      "Pods calmes et salles de réunion",
    ],
    wifi: true,
    outlets: true,
    food: ["Café 3e vague", "Pâtisseries (Hof Kelsten)", "Lunchs"],
    hours: "Ouvert 7/7, ~8h–16h à 8h–21h selon jours",
    tags: ["Coworking", "Iconic", "Long sessions"],
    coords: { latitude: 45.50363, longitude: -73.55953 },

    rating: 4.7,
    walkMinutes: 5,
    priceLevel: "$$",
  },

  {
    id: "tranquille",
    name: "Café Tranquille",
    address: "1442 Rue Clark",
    district: "Quartier des spectacles",
    vibe: "Grand salon chill, lumière naturelle, plantes",
    studyAtmosphere: [
      "Parfait pour lire/coder",
      "Vue patinoire/festivals selon saison",
    ],
    wifi: true,
    outlets: true,
    food: ["Café Pista", "Snacks artisanaux", "Options vegan & SG"],
    hours: "Horaires variables selon saison/événements",
    tags: ["Public space", "Calm", "Study with view"],
    coords: { latitude: 45.50882, longitude: -73.56629 },

    rating: 4.5,
    walkMinutes: 3,
    priceLevel: "$",
  },

  {
    id: "tommy",
    name: "Tommy Café",
    address: "Plusieurs succursales (ex. Notre-Dame)",
    district: "Vieux-Montréal",
    vibe: "Ultra instagrammable, blanc + plantes suspendues",
    studyAtmosphere: [
      "Très populaire → bruyant",
      "Possible en semaine hors rush",
    ],
    wifi: true,
    outlets: false,
    food: ["Brunch", "Salades", "Tartines", "Pâtisseries"],
    hours: "Variable selon succursale",
    tags: ["Brunch", "Cute pics", "Trendy"],
    coords: { latitude: 45.5038, longitude: -73.5598 }, // Notre-Dame location

    rating: 4.4,
    walkMinutes: 6,
    priceLevel: "$$",
  },

  {
    id: "amea",
    name: "Améa Café",
    address: "Maison Alcan, Sherbrooke O.",
    district: "Golden Square Mile",
    vibe: "Cafétéria haut de gamme, moderne et lumineuse",
    studyAtmosphere: [
      "Calme",
      "Beaucoup de places assises",
      "Pensé pour laptop sessions",
    ],
    wifi: true,
    outlets: true,
    food: ["Café", "Lunchs", "Collations"],
    hours: "Jours de semaine principalement",
    tags: ["Downtown", "McGill-friendly", "Long laptop sessions"],
    coords: { latitude: 45.50241, longitude: -73.57835 },

    rating: 4.6,
    walkMinutes: 8,
    priceLevel: "$$",
  },
];

const loadOSM = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./osm_places.json');
  } catch {
    return null;
  }
};

const osmRaw = loadOSM();

export const OSM_ATTRIBUTION =
  osmRaw?.attribution ??
  '© OpenStreetMap contributors (ODbL) https://openstreetmap.org/copyright';

export const OSM_PLACES: CafePlace[] = (osmRaw?.items ?? [])
  .map((item: any) => ({
    id: String(item.placeId || '').replace(/\//g, '_'),
    name: item.name || 'Cafe',
    address: item.address || '',
    district: item.district || 'Montréal',
    vibe: item.vibe || '',
    studyAtmosphere: item.studyAtmosphere || [],
    wifi: Boolean(item.wifi),
    outlets: Boolean(item.outlets),
    food: Array.isArray(item.food) ? item.food : [],
    hours: item.hours || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    imageUrl: item.image || item.wikimedia_commons || '',
    meta: item.meta || {},
    coords:
      item.coords && typeof item.coords.lat === 'number' && typeof item.coords.lng === 'number'
        ? { latitude: item.coords.lat, longitude: item.coords.lng }
        : undefined,
    priceLevel: item.priceLevel || undefined,
    source: 'osm',
  }))
  .filter((place) => Boolean(place.address) && Boolean(place.coords))
  .map((place) => {
    const tags = new Set(place.tags);
    const name = place.name.toLowerCase();
    const food = place.food.map((f) => f.toLowerCase());

    const hours = place.hours?.toLowerCase() ?? '';
    const isLate =
      /22|23|24|00:00-24:00|24\/7/.test(hours) ||
      hours.includes('late');

    if (place.wifi) tags.add('Wi-Fi');
    if (place.outlets) tags.add('Outlets');
    if (name.includes('roast') || name.includes('roaster')) tags.add('Roastery');
    if (food.some((f) => f.includes('brunch'))) tags.add('Brunch');
    if (food.some((f) => f.includes('dessert') || f.includes('pastr'))) tags.add('Pastries');
    if (isLate) tags.add('Open late');

    const seatingVal = String((place as any).meta?.seating || '').toLowerCase();
    const hasSeating = seatingVal === 'yes' || seatingVal === 'true' || seatingVal === 'indoor';
    if (hasSeating) tags.add('Seating');

    let vibe = place.vibe;
    if (!vibe) {
      if (tags.has('Brunch')) vibe = 'Bright, social brunch spot';
      else if (tags.has('Roastery')) vibe = 'Specialty coffee, focused vibe';
      else if (tags.has('Open late')) vibe = 'Late-night friendly';
      else vibe = 'Cafe vibe';
    }

    const studyAtmosphere = place.studyAtmosphere.length
      ? place.studyAtmosphere
      : place.wifi || place.outlets || hasSeating
        ? ['Laptop friendly', 'Good for solo study']
        : ['Quick coffee stop'];

    let imageUrl = place.imageUrl;
    if (imageUrl && imageUrl.startsWith('File:')) {
      const file = imageUrl.replace(/^File:/, '');
      imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1200`;
    }

    return {
      ...place,
      tags: Array.from(tags),
      vibe,
      studyAtmosphere,
      imageUrl,
    };
  });

export const ALL_PLACES: CafePlace[] = [
  ...PLACES.map((p) => ({ ...p, source: 'curated' as const })),
  ...OSM_PLACES,
];
<<<<<<< Updated upstream
// Fonction pour get cafe name par id
export const getCafeName = (cafeId: string): string => {
  const cafe = ALL_PLACES.find((place) => place.id === cafeId);
  return cafe ? cafe.name : 'Cafe inconnu';
};
=======
>>>>>>> Stashed changes
