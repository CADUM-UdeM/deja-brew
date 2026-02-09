/* eslint-disable no-console */
import fs from 'fs/promises';
import path from 'path';

const OUTPUT = path.join(process.cwd(), 'data', 'osm_places.json');
const OVERPASS = 'https://overpass-api.de/api/interpreter';

const query = `
[out:json][timeout:180];
area["name"="Montréal"]["boundary"="administrative"]["admin_level"="8"]->.searchArea;
(
  nwr["amenity"="cafe"](area.searchArea);
  nwr["amenity"="coffee_shop"](area.searchArea);
  nwr["shop"="coffee"](area.searchArea);
);
out center tags;
`;

const tag = (tags, key) => (tags && tags[key] ? String(tags[key]) : '');

const formatAddress = (tags) => {
  const full = tag(tags, 'addr:full');
  if (full) return full;
  const num = tag(tags, 'addr:housenumber');
  const street = tag(tags, 'addr:street');
  const city = tag(tags, 'addr:city');
  return [num, street, city].filter(Boolean).join(' ');
};

const pickDistrict = (tags) =>
  tag(tags, 'addr:borough') ||
  tag(tags, 'addr:suburb') ||
  tag(tags, 'addr:neighbourhood') ||
  tag(tags, 'addr:district') ||
  tag(tags, 'addr:city') ||
  'Montréal';

const parseWifi = (tags) => {
  const v =
    tag(tags, 'internet_access') ||
    tag(tags, 'internet_access:fee') ||
    tag(tags, 'wifi');
  if (!v) return null;
  return v === 'yes' || v === 'free' || v === 'wlan';
};

const toTags = (tags) => {
  const list = [];
  const cuisine = tag(tags, 'cuisine');
  if (cuisine) list.push(...cuisine.split(';').map((t) => t.trim()));
  const takeaway = tag(tags, 'takeaway');
  if (takeaway) list.push(`Takeaway: ${takeaway}`);
  const organic = tag(tags, 'organic');
  if (organic) list.push(`Organic: ${organic}`);
  return Array.from(new Set(list)).filter(Boolean);
};

const toFood = (tags) => {
  const cuisine = tag(tags, 'cuisine');
  if (!cuisine) return [];
  return cuisine.split(';').map((t) => t.trim());
};

const normalize = (el) => {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  return {
    placeId: `${el.type}/${el.id}`,
    name: tag(tags, 'name') || tag(tags, 'brand') || 'Cafe',
    address: formatAddress(tags),
    district: pickDistrict(tags),
    vibe: tag(tags, 'description') || '',
    studyAtmosphere: [],
    wifi: parseWifi(tags),
    outlets: null,
    food: toFood(tags),
    hours: tag(tags, 'opening_hours'),
    tags: toTags(tags),
    coords: typeof lat === 'number' && typeof lon === 'number' ? { lat, lng: lon } : null,
    priceLevel: tag(tags, 'price') || '',
    ratingSummary: null,
    savesCount: 0,
    likesCount: 0,
    source: 'OpenStreetMap',
    image: tag(tags, 'image'),
    wikimedia_commons: tag(tags, 'wikimedia_commons') || tag(tags, 'wikimedia_commons:File'),
    meta: {
      seating: tag(tags, 'seating') || tag(tags, 'indoor_seating') || tag(tags, 'outdoor_seating'),
      takeaway: tag(tags, 'takeaway'),
      menu: tag(tags, 'menu'),
      cuisine: tag(tags, 'cuisine'),
      opening_hours: tag(tags, 'opening_hours'),
    },
  };
};

const isStudyFriendly = (item) => {
  const hasAddress = Boolean(item.address);
  const hasCoords = Boolean(item.coords);
  const hasHours = Boolean(item.meta?.opening_hours);
  const hasMenu = Boolean(item.meta?.menu || item.meta?.cuisine);

  const seatingVal = (item.meta?.seating || '').toLowerCase();
  const hasSeating =
    seatingVal === 'yes' ||
    seatingVal === 'true' ||
    seatingVal === 'indoor' ||
    seatingVal === 'outdoor';

  const takeawayVal = (item.meta?.takeaway || '').toLowerCase();
  const takeawayOnly = takeawayVal === 'only';
  const takeawayYesNoSeating = takeawayVal === 'yes' && !hasSeating;

  return hasAddress && hasCoords && hasHours && hasMenu && hasSeating && !takeawayOnly && !takeawayYesNoSeating;
};

const main = async () => {
  console.log('Querying Overpass…');
  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass error ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const items = (json.elements || []).map(normalize).filter(isStudyFriendly);
  const payload = {
    generatedAt: new Date().toISOString(),
    attribution: '© OpenStreetMap contributors (ODbL) https://openstreetmap.org/copyright',
    items,
  };

  await fs.writeFile(OUTPUT, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`Saved ${items.length} places -> ${OUTPUT}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
