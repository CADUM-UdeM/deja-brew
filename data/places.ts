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

  // ─── Extra curated spots ──────────────────────────────────────────────
  {
    id: "dispatch",
    name: "Dispatch Coffee",
    address: "4922 Rue Notre-Dame Ouest",
    district: "Saint-Henri",
    vibe: "Massive industrial loft with sky-high ceilings — the ultimate laptop café",
    studyAtmosphere: [
      "Calme en semaine — ambiance work-from-café",
      "Grandes tables communales et banquettes",
      "Nombreuses prises électriques sur chaque table",
      "Super pour sessions longues ou en groupe",
      "Light noise level even when busy",
    ],
    wifi: true,
    outlets: true,
    food: ["Specialty coffee", "Viennoiseries", "Sandwichs"],
    hours: "8h–17h lundi–vendredi, 9h–17h fin de semaine",
    tags: ["Specialty coffee", "Cowork-friendly", "Outlets on every table", "Long sessions", "Group work"],
    coords: { latitude: 45.46972, longitude: -73.58315 },
    rating: 4.8,
    walkMinutes: 10,
    priceLevel: "$$",
    source: "curated",
  },

  {
    id: "myriade",
    name: "Myriade Coffee",
    address: "1432 Rue Mackay",
    district: "Downtown / Concordia",
    vibe: "Specialty espresso bar à 2 minutes de Concordia SGW — calme, minimaliste",
    studyAtmosphere: [
      "Très calme — clientèle laptop et étudiants",
      "Comptoir et quelques tables hautes",
      "Parfait pour sprint solo de 1–2h",
      "Ambiance focus intense",
    ],
    wifi: true,
    outlets: true,
    food: ["Specialty espresso", "Cafés filtre", "Pâtisseries simples"],
    hours: "7h30–17h lundi–vendredi, 9h–17h fin de semaine",
    tags: ["Specialty coffee", "Concordia", "Calme", "Solo focus", "Cozy corner"],
    coords: { latitude: 45.49866, longitude: -73.57952 },
    rating: 4.7,
    walkMinutes: 2,
    priceLevel: "$$",
    source: "curated",
  },

  {
    id: "neve",
    name: "Café Névé",
    address: "151 Rue Rachel Est",
    district: "Plateau-Mont-Royal",
    vibe: "Café épuré et lumineux — ambiance Scandi, lumière naturelle, clientèle créative",
    studyAtmosphere: [
      "Calme toute la journée",
      "Beaucoup de lumière naturelle",
      "Bonnes tables pour laptop",
      "Idéal pour travail solo ou duo",
    ],
    wifi: true,
    outlets: true,
    food: ["Specialty coffee", "Matcha", "Pâtisseries artisanales"],
    hours: "8h–17h tous les jours",
    tags: ["Aesthetic", "Calme", "Plateau", "Solo focus", "Lumineux"],
    coords: { latitude: 45.52012, longitude: -73.57883 },
    rating: 4.6,
    walkMinutes: 5,
    priceLevel: "$$",
    source: "curated",
  },

  {
    id: "caffe-italia",
    name: "Caffe Italia",
    address: "6840 Boulevard Saint-Laurent",
    district: "Petite-Italie",
    vibe: "Café italien classique depuis 1956 — grand espace, tables longues, ambiance authentique",
    studyAtmosphere: [
      "Très grande salle — facile de trouver une place",
      "Ambiance animée mais pas dérangeante",
      "Idéal pour groupes et lectures longues",
      "Abordable, peut rester des heures avec un café",
    ],
    wifi: false,
    outlets: false,
    food: ["Espresso traditionnel", "Cappuccino", "Pâtisseries italiennes", "Sandwichs"],
    hours: "7h–21h lundi–dimanche",
    tags: ["Classique", "Petite-Italie", "Abordable", "Group work", "Brunch"],
    coords: { latitude: 45.53298, longitude: -73.61518 },
    rating: 4.5,
    walkMinutes: 6,
    priceLevel: "$",
    source: "curated",
  },

  {
    id: "replika",
    name: "Café Replika",
    address: "552 Rue Marie-Anne Est",
    district: "Plateau-Mont-Royal",
    vibe: "Café turc intime et chaleureux — thés d'origine, coussins, lumière douce",
    studyAtmosphere: [
      "Atmosphère cosy et feutrée",
      "Bonne ambiance pour lecture ou écriture",
      "Petite place — mieux en semaine",
      "Parfait pour sessions de 1–3h",
    ],
    wifi: true,
    outlets: true,
    food: ["Café turc", "Thés d'origine", "Baklava", "Simit"],
    hours: "10h–20h tous les jours",
    tags: ["Cozy corner", "Plateau", "Aesthetic", "Solo focus", "Unique vibe"],
    coords: { latitude: 45.52507, longitude: -73.57716 },
    rating: 4.7,
    walkMinutes: 8,
    priceLevel: "$$",
    source: "curated",
  },

  {
    id: "butterblume",
    name: "Le Butterblume",
    address: "5836 Boulevard Saint-Laurent",
    district: "Mile-End",
    vibe: "Café scandinave lumineux — fenêtres du sol au plafond, pâtisseries maison, très zen",
    studyAtmosphere: [
      "Calme en semaine — idéal pour deep work",
      "Design minimaliste, pas de distractions",
      "Bonnes tables en bois spacieuses",
      "Ambiance cozy mais pas endormante",
    ],
    wifi: true,
    outlets: true,
    food: ["Specialty coffee", "Pâtisseries maison", "Tartines", "Brunch le week-end"],
    hours: "8h–17h lundi–vendredi, 9h–17h fin de semaine",
    tags: ["Aesthetic", "Calme", "Mile-End", "Solo focus", "Lumineux", "Brunch"],
    coords: { latitude: 45.52641, longitude: -73.60244 },
    rating: 4.8,
    walkMinutes: 7,
    priceLevel: "$$",
    source: "curated",
  },

  {
    id: "olimpico",
    name: "Café Olimpico",
    address: "124 Rue Saint-Viateur Ouest",
    district: "Mile-End",
    vibe: "Institution du Mile-End depuis 1970 — espresso serré, tables longues, toujours vivant",
    studyAtmosphere: [
      "Ambiance animée — bon pour ceux qui aiment le bruit de fond",
      "Grandes tables communales pour les groupes",
      "Rapide — idéal pour sprints de 1h",
      "Cash only — pas idéal pour sessions longues",
    ],
    wifi: false,
    outlets: false,
    food: ["Espresso traditionnel", "Café filtre", "Cornetti"],
    hours: "7h–19h lundi–dimanche",
    tags: ["Classique", "Mile-End", "Group work", "Brunch", "Café buzz"],
    coords: { latitude: 45.52362, longitude: -73.59873 },
    rating: 4.5,
    walkMinutes: 4,
    priceLevel: "$",
    source: "curated",
  },

  {
    id: "pikolo",
    name: "Pikolo Espresso Bar",
    address: "3418 Avenue du Parc",
    district: "Plateau-Mont-Royal",
    vibe: "Minuscule comptoir espresso réputé mondial — 15 places max, focus total sur le café",
    studyAtmosphere: [
      "Très petit — mieux pour sprints de 45min",
      "Ambiance concentrée et silencieuse",
      "Comptoir face à la fenêtre pour les solo",
      "Meilleur espresso de la ville, ça aide la concentration",
    ],
    wifi: true,
    outlets: false,
    food: ["Specialty espresso", "Single origins", "Quelques pâtisseries"],
    hours: "8h–18h lundi–vendredi, 9h–18h fin de semaine",
    tags: ["Specialty coffee", "Plateau", "Solo focus", "Quick sprint", "Iconic"],
    coords: { latitude: 45.51103, longitude: -73.58491 },
    rating: 4.9,
    walkMinutes: 3,
    priceLevel: "$$",
    source: "curated",
  },

  {
    id: "falco",
    name: "Café Falco",
    address: "5605 Boulevard Rosemont",
    district: "Rosemont",
    vibe: "Café de quartier relax et lumineux — clientèle locale, pas touristique, vibe chill",
    studyAtmosphere: [
      "Calme et détendu toute la journée",
      "Bonne lumière naturelle",
      "Tables spacieuses, facile de s'installer",
      "Idéal pour lectures longues ou travail solo",
    ],
    wifi: true,
    outlets: true,
    food: ["Café de spécialité", "Pâtisseries", "Bagels", "Lunch"],
    hours: "8h–17h tous les jours",
    tags: ["Calme", "Rosemont", "Solo focus", "Cowork-friendly", "Lumineux"],
    coords: { latitude: 45.54317, longitude: -73.59437 },
    rating: 4.6,
    walkMinutes: 6,
    priceLevel: "$",
    source: "curated",
  },

  {
    id: "saint-henri-cafe",
    name: "Café Saint-Henri",
    address: "3632 Rue Notre-Dame Ouest",
    district: "Saint-Henri",
    vibe: "Micro-torréfacteur artisanal — espace épuré, odeur de café fraîchement torréfié",
    studyAtmosphere: [
      "Très calme — clientèle sérieuse",
      "Tables simples, bon pour laptop",
      "Ambiance professionnelle sans être froide",
      "Prises électriques disponibles",
    ],
    wifi: true,
    outlets: true,
    food: ["Specialty coffee", "Cafés filtre de micro-torréfaction", "Quelques snacks"],
    hours: "8h–17h lundi–vendredi, 9h–17h fin de semaine",
    tags: ["Specialty coffee", "Saint-Henri", "Calme", "Solo focus", "Roastery"],
    coords: { latitude: 45.47351, longitude: -73.58438 },
    rating: 4.7,
    walkMinutes: 9,
    priceLevel: "$$",
    source: "curated",
  },

  {
    id: "edition",
    name: "Édition Café",
    address: "1626 Rue Saint-Hubert",
    district: "Plateau-Mont-Royal",
    vibe: "Café-librairie discret — livres partout, plantes, lumière chaude, silence valorisé",
    studyAtmosphere: [
      "Un des cafés les plus calmes de la ville",
      "Clientèle lecture/écriture/thèse",
      "Tables individuelles et coins isolés",
      "Idéal pour exam cram ou deep research",
    ],
    wifi: true,
    outlets: true,
    food: ["Café simple", "Thés", "Pâtisseries maison"],
    hours: "9h–18h lundi–samedi, 10h–17h dimanche",
    tags: ["Calme", "Plateau", "Très quiet", "Solo focus", "Deep research", "Books"],
    coords: { latitude: 45.53016, longitude: -73.56989 },
    rating: 4.8,
    walkMinutes: 7,
    priceLevel: "$",
    source: "curated",
  },

  {
    id: "club-social",
    name: "Club Social",
    address: "180 Rue Saint-Viateur Ouest",
    district: "Mile-End",
    vibe: "Café de quartier décontracté — terrasse en été, ambiance sociale, clientèle fidèle",
    studyAtmosphere: [
      "Ambiance décontractée — bruit de fond acceptable",
      "Bonne option pour groupes ou duos",
      "Terrasse en été pour les journées ensoleillées",
      "Prix raisonnables, bon pour rester longtemps",
    ],
    wifi: true,
    outlets: false,
    food: ["Espresso", "Café filtre", "Bières artisanales le soir", "Snacks"],
    hours: "8h–22h lundi–dimanche",
    tags: ["Mile-End", "Group work", "Duo", "Brunch", "Café buzz", "Open evenings"],
    coords: { latitude: 45.52271, longitude: -73.59862 },
    rating: 4.4,
    walkMinutes: 5,
    priceLevel: "$",
    source: "curated",
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
  .filter((place: CafePlace) => Boolean(place.address) && Boolean(place.coords))
  .map((place: CafePlace) => {
    const tags = new Set(place.tags);
    const name = place.name.toLowerCase();
    const food = place.food.map((f: string) => f.toLowerCase());

    const hours = place.hours?.toLowerCase() ?? '';
    const isLate =
      /22|23|24|00:00-24:00|24\/7/.test(hours) ||
      hours.includes('late');

    if (place.wifi) tags.add('Wi-Fi');
    if (place.outlets) tags.add('Outlets');
    if (name.includes('roast') || name.includes('roaster')) tags.add('Roastery');
    if (food.some((f: string) => f.includes('brunch'))) tags.add('Brunch');
    if (food.some((f: string) => f.includes('dessert') || f.includes('pastr'))) tags.add('Pastries');
    if (isLate) tags.add('Open late');

    const seatingVal = String((place as any).meta?.seating || '').toLowerCase();
    const hasSeating = seatingVal === 'yes' || seatingVal === 'true' || seatingVal === 'indoor';
    if (hasSeating) tags.add('Seating');

    // Derive richer vibe from OSM data
    let vibe = place.vibe;
    if (!vibe) {
      const isSpecialty = name.includes('roast') || name.includes('specialty') || name.includes('coffee');
      if (tags.has('Brunch'))    vibe = 'Bright, social brunch spot';
      else if (isSpecialty)      vibe = 'Specialty coffee, calm focused vibe';
      else if (isLate)           vibe = 'Late-night friendly café';
      else if (place.wifi && place.outlets) vibe = 'Laptop-friendly, quiet café';
      else if (place.wifi)       vibe = 'Wi-Fi café, study-friendly';
      else                       vibe = 'Local café vibe';
    }

    // Derive study atmosphere signals from available data
    const studyAtmosphere: string[] = place.studyAtmosphere.length ? place.studyAtmosphere : [];
    if (!studyAtmosphere.length) {
      if (place.wifi && place.outlets) {
        studyAtmosphere.push('calm', 'Laptop friendly', 'Good for solo study');
      } else if (place.wifi) {
        studyAtmosphere.push('Laptop friendly', 'Good for solo study');
      } else if (hasSeating) {
        studyAtmosphere.push('Seating available', 'Quick coffee stop');
      } else {
        studyAtmosphere.push('Quick coffee stop');
      }
      // infer from hours
      const h = place.hours?.toLowerCase() ?? '';
      if (/mo-fr|weekday|lundi|semaine/.test(h)) studyAtmosphere.push('Weekday-friendly');
      if (isLate) studyAtmosphere.push('Open late — good for evening sessions');
    }

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

// Fonction pour get cafe name par id
export const getCafeName = (cafeId: string): string => {
  const cafe = ALL_PLACES.find((place) => place.id === cafeId);
  return cafe ? cafe.name : 'Cafe inconnu';
};
