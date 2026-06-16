/* eslint-disable no-console */
/**
 * Fetch Montreal cafés from Overpass API → data/osm_places.json
 * Run: npm run osm:fetch
 *
 * Enrichment pipeline:
 * - Wifi inferred from internet_access tags
 * - Outlets inferred from charge/power tags + name patterns
 * - Vibe built from cuisine, description, name, outdoor seating
 * - StudyAtmosphere derived from wifi, outlets, hours, seating
 * - Tags: Wi-Fi, Outlets, Brunch, Specialty coffee, Open late, Terrace…
 * - District: mapped from OSM neighbourhood/suburb tags
 * - PriceLevel: mapped from price_range/stars tags
 * - Food: human-readable cuisine labels
 */

import fs from 'fs/promises';
import path from 'path';

const OUTPUT   = path.join(process.cwd(), 'data', 'osm_places.json');
const OVERPASS = 'https://overpass-api.de/api/interpreter';

// Bounding box for Île de Montréal (slightly generous)
const BBOX = '45.41,-73.72,45.59,-73.47';

const QUERY = `
[out:json][timeout:120];
(
  node["amenity"="cafe"]["name"](${BBOX});
  node["amenity"="coffee_shop"]["name"](${BBOX});
  node["shop"="coffee"]["name"](${BBOX});
  way["amenity"="cafe"]["name"](${BBOX});
  way["amenity"="coffee_shop"]["name"](${BBOX});
  relation["amenity"="cafe"]["name"](${BBOX});
);
out body center tags;
`.trim();

// ─── OSM tag helpers ──────────────────────────────────────────────────
const tag  = (tags, key) => (tags?.[key] ? String(tags[key]).trim() : '');
const bool = (tags, key) => { const v = tag(tags, key).toLowerCase(); return v === 'yes' || v === 'true' ? true : v === 'no' ? false : null; };

const formatAddress = (tags) => {
  const full = tag(tags, 'addr:full');
  if (full) return full;
  const num    = tag(tags, 'addr:housenumber');
  const street = tag(tags, 'addr:street');
  return [num, street].filter(Boolean).join(' ');
};

// ─── District mapping ─────────────────────────────────────────────────
const SUBURB_MAP = {
  'le plateau-mont-royal': 'Plateau-Mont-Royal',
  'plateau-mont-royal':    'Plateau-Mont-Royal',
  'plateau':               'Plateau-Mont-Royal',
  'mile-end':              'Mile-End',
  'mile end':              'Mile-End',
  'outremont':             'Outremont',
  'rosemont':              'Rosemont',
  'la petite-patrie':      'Rosemont',
  'petite-patrie':         'Rosemont',
  'petite italie':         'Petite-Italie',
  'petite-italie':         'Petite-Italie',
  'saint-henri':           'Saint-Henri',
  'saint henri':           'Saint-Henri',
  'little burgundy':       'Little Burgundy',
  'villeray':              'Villeray',
  'hochelaga':             'Hochelaga',
  'maisonneuve':           'Hochelaga',
  'notre-dame-de-grâce':   'NDG',
  'notre dame de grace':   'NDG',
  'ndg':                   'NDG',
  'côte-des-neiges':       'Côte-des-Neiges',
  'cote-des-neiges':       'Côte-des-Neiges',
  'verdun':                'Verdun',
  'lasalle':               'LaSalle',
  'la salle':              'LaSalle',
  'pointe-saint-charles':  'Pointe-Saint-Charles',
  'griffintown':           'Griffintown',
  'ville-émard':           'Ville-Émard',
  'rivière-des-prairies':  'RDP',
  'ahuntsic':              'Ahuntsic',
};

const STREET_CLUES = [
  [['mackay', 'bishop', 'guy', 'de maisonneuve', 'sainte-catherine o'], 'Downtown / Concordia'],
  [['sherbrooke o', 'peel', 'mcgill college', 'university'],            'Downtown / McGill'],
  [['saint-denis', 'rachel', 'duluth', 'laurier'],                      'Plateau-Mont-Royal'],
  [['saint-viateur', 'bernard', 'fairmount'],                           'Mile-End'],
  [['notre-dame o', 'notre dame o'],                                     'Saint-Henri'],
  [['rosemont', 'masson', 'beaubien'],                                   'Rosemont'],
  [['wellington', 'verdun'],                                             'Verdun'],
  [['saint-laurent'],                                                    'Mile-End'],  // most of Saint-Laurent above Van Horne
  [['mont-royal', 'papineau'],                                           'Plateau-Mont-Royal'],
];

const pickDistrict = (tags) => {
  const suburb = (
    tag(tags, 'addr:suburb') ||
    tag(tags, 'addr:neighbourhood') ||
    tag(tags, 'addr:quarter') ||
    tag(tags, 'addr:borough')
  ).toLowerCase();

  for (const [key, value] of Object.entries(SUBURB_MAP)) {
    if (suburb.includes(key)) return value;
  }

  const street = tag(tags, 'addr:street').toLowerCase();
  for (const [clues, district] of STREET_CLUES) {
    if (clues.some(c => street.includes(c))) return district;
  }

  return tag(tags, 'addr:city') || 'Montréal';
};

// ─── Wifi & outlets ───────────────────────────────────────────────────
const parseWifi = (tags) => {
  const ia  = tag(tags, 'internet_access').toLowerCase();
  const fee = tag(tags, 'internet_access:fee').toLowerCase();
  if (ia === 'wlan' || ia === 'yes' || ia === 'wifi')  return true;
  if (ia === 'no' || ia === 'terminal')                 return false;
  if (fee === 'no' || fee === 'free')                   return true;
  // Default: null (unknown — many cafés have wifi but don't tag it)
  return null;
};

const parseOutlets = (tags, name) => {
  // Few cafés tag outlets in OSM — use best-effort inference
  const charge = tag(tags, 'charge').toLowerCase();
  const power  = tag(tags, 'power_supply').toLowerCase();
  if (charge === 'yes' || power === 'yes') return true;
  // Name clues
  const n = name.toLowerCase();
  if (n.includes('cowork') || n.includes('co-work')) return true;
  return null; // unknown
};

// ─── Food / cuisine ───────────────────────────────────────────────────
const CUISINE_LABELS = {
  coffee_shop:   'Specialty coffee',
  cafe:          'Café',
  french:        'French cuisine',
  italian:       'Italian pastries',
  brunch:        'Brunch',
  sandwich:      'Sandwiches',
  vegan:         'Vegan options',
  vegetarian:    'Vegetarian options',
  japanese:      'Japanese',
  asian:         'Asian',
  bakery:        'Pastries & baked goods',
  crepe:         'Crêpes',
  bubble_tea:    'Bubble tea',
  ice_cream:     'Ice cream',
  american:      'Burgers & comfort food',
  pizza:         'Pizza',
  mexican:       'Mexican',
  korean:        'Korean',
  thai:          'Thai',
  vietnamese:    'Vietnamese',
  regional:      'Québécois cuisine',
};

const parseFood = (tags) => {
  const raw = tag(tags, 'cuisine');
  const out = [];
  if (raw) {
    for (const c of raw.split(';').map(s => s.trim().toLowerCase())) {
      out.push(CUISINE_LABELS[c] || (c.charAt(0).toUpperCase() + c.slice(1)));
    }
  }
  if (bool(tags, 'diet:vegan') === true && !out.includes('Vegan options'))      out.push('Vegan options');
  if (bool(tags, 'diet:vegetarian') === true && !out.includes('Vegan options')) out.push('Vegetarian options');
  if (!out.length) out.push('Coffee & drinks');
  return [...new Set(out)];
};

// ─── Tags enrichment ─────────────────────────────────────────────────
const isOpenLate = (hours) => {
  if (!hours) return false;
  return /22:|23:|24:00|midnight|00:00-24:00|24\/7/.test(hours);
};

const enrichTags = (tags, name, hours, wifi) => {
  const result = new Set();
  const cuisine = tag(tags, 'cuisine').toLowerCase();
  const n       = name.toLowerCase();

  if (wifi === true)                                    result.add('Wi-Fi');
  if (parseOutlets(tags, name) === true)               result.add('Outlets');
  if (bool(tags, 'outdoor_seating') === true)          result.add('Terrace');
  if (cuisine.includes('brunch'))                      result.add('Brunch');
  if (cuisine.includes('coffee_shop') || n.includes('roast') || n.includes('espresso')) result.add('Specialty coffee');
  if (bool(tags, 'diet:vegan') === true)               result.add('Vegan-friendly');
  if (bool(tags, 'takeaway') === true && bool(tags, 'seating') !== false) result.add('Takeaway');
  if (bool(tags, 'wheelchair') === true)               result.add('Accessible');
  if (isOpenLate(hours))                               result.add('Open late');
  if (n.includes('cowork') || cuisine.includes('cowork')) result.add('Cowork-friendly');

  return Array.from(result);
};

// ─── Vibe ─────────────────────────────────────────────────────────────
const inferVibe = (tags, name, district) => {
  const desc    = tag(tags, 'description') || tag(tags, 'note');
  if (desc)  return desc;

  const cuisine = tag(tags, 'cuisine').toLowerCase();
  const n       = name.toLowerCase();
  const outdoor = bool(tags, 'outdoor_seating') === true;
  const terrace = outdoor ? ', terrasse en été' : '';

  if (n.includes('roast') || n.includes('espresso') || cuisine.includes('coffee_shop'))
    return `Café de spécialité — ambiance focus${terrace}`;
  if (cuisine.includes('brunch') || cuisine.includes('french'))
    return `Café brunch lumineux${terrace}`;
  if (cuisine.includes('vegan'))
    return `Café végétalien, ambiance inclusive${terrace}`;
  if (cuisine.includes('bubble_tea') || cuisine.includes('asian'))
    return `Café asiatique cosy${terrace}`;
  if (outdoor)
    return `Café de quartier avec terrasse`;
  return `Café local${district ? ` du ${district}` : ''}, ambiance détendue`;
};

// ─── Study atmosphere ─────────────────────────────────────────────────
const inferStudyAtmosphere = (wifi, outlets, hours, tags) => {
  const atm = [];
  if (wifi === true && outlets === true) {
    atm.push('Laptop-friendly — Wi-Fi et prises disponibles');
    atm.push('Bon pour sessions longues');
    atm.push('calm');
  } else if (wifi === true) {
    atm.push('Wi-Fi disponible — bon pour laptop');
    atm.push('Idéal pour sessions de 1–2h');
  } else if (outlets === true) {
    atm.push('Prises électriques disponibles');
  }

  const outdoor = bool(tags, 'outdoor_seating') === true;
  if (outdoor) atm.push('Terrasse disponible en été');

  if (isOpenLate(hours)) {
    atm.push('Ouvert le soir — bon pour sessions tardives');
  }

  const seating = tag(tags, 'seating').toLowerCase();
  if (seating.includes('table') || seating === 'yes') atm.push('Bonnes tables disponibles');

  if (!atm.length) atm.push('Café local — bonne option pour une pause study');

  return atm;
};

// ─── Price level ─────────────────────────────────────────────────────
const parsePrice = (tags) => {
  const p = tag(tags, 'price_range') || tag(tags, 'price') || tag(tags, 'stars');
  if (/^\$+$/.test(p)) return p;
  return undefined;
};

// ─── Filter: is it worth including? ──────────────────────────────────
const isUsable = (el, item) => {
  if (!item.name || item.name === 'Cafe') return false;
  if (!item.coords)                        return false;
  if (!item.address)                       return false;
  // Exclude pure takeaway-only with no seating info
  const takeaway = tag(el.tags, 'takeaway').toLowerCase();
  const seating  = tag(el.tags, 'seating').toLowerCase() || tag(el.tags, 'indoor_seating').toLowerCase();
  if (takeaway === 'only' && !seating) return false;
  return true;
};

// ─── Main ─────────────────────────────────────────────────────────────
const normalize = (el) => {
  const tags = el.tags || {};
  const lat  = el.lat ?? el.center?.lat;
  const lon  = el.lon ?? el.center?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  const name     = tag(tags, 'name') || tag(tags, 'brand');
  const address  = formatAddress(tags);
  const district = pickDistrict(tags);
  const hours    = tag(tags, 'opening_hours');
  const wifi     = parseWifi(tags);
  const outlets  = parseOutlets(tags, name);
  const food     = parseFood(tags);
  const vibe     = inferVibe(tags, name, district);
  const atmTags  = enrichTags(tags, name, hours, wifi);
  const studyAtm = inferStudyAtmosphere(wifi, outlets, hours, tags);

  return {
    placeId: `${el.type}/${el.id}`,
    name,
    address,
    district,
    vibe,
    studyAtmosphere: studyAtm,
    wifi,
    outlets,
    food,
    hours: hours || 'Horaires non listés',
    tags: atmTags,
    coords: { lat, lng: lon },
    priceLevel: parsePrice(tags) ?? '',
    meta: {
      seating:  tag(tags, 'seating') || tag(tags, 'indoor_seating') || tag(tags, 'outdoor_seating') || null,
      outdoor:  bool(tags, 'outdoor_seating'),
      takeaway: tag(tags, 'takeaway') || null,
      cuisine:  tag(tags, 'cuisine') || null,
    },
    source: 'OpenStreetMap',
  };
};

const main = async () => {
  console.log('🔍 Querying Overpass API for Montreal cafés...');
  console.log('   (This may take 20–40 seconds)\n');

  const res = await fetch(OVERPASS, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept':       'application/json',
      'User-Agent':   'DejaBrew/1.0 (student-study-app; contact@dejabrew.app)',
    },
    body: `data=${encodeURIComponent(QUERY)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass ${res.status}: ${await res.text()}`);
  }

  const json     = await res.json();
  const elements = json.elements ?? [];
  console.log(`   Got ${elements.length} raw elements from OSM`);

  const raw = elements.map(normalize).filter(Boolean);

  // Filter usable, de-duplicate by name + street
  const seen   = new Map();
  const items  = raw.filter((item, _i, _arr) => {
    const el = elements.find(e => `${e.type}/${e.id}` === item.placeId);
    if (!isUsable(el ?? {}, item)) return false;
    const key = `${item.name.toLowerCase()}|${item.address.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });

  console.log(`   Filtered to ${items.length} unique, address-confirmed cafés`);

  // Stats
  const withWifi    = items.filter(i => i.wifi === true).length;
  const withOutlets = items.filter(i => i.outlets === true).length;
  const openLate    = items.filter(i => isOpenLate(i.hours)).length;
  console.log(`\n   Wi-Fi confirmed:  ${withWifi}`);
  console.log(`   Outlets confirmed: ${withOutlets}`);
  console.log(`   Open late:        ${openLate}`);

  const payload = {
    generatedAt: new Date().toISOString(),
    attribution: '© OpenStreetMap contributors (ODbL) https://openstreetmap.org/copyright',
    query: `amenity=cafe|coffee_shop|shop=coffee in Montreal (bbox ${BBOX})`,
    stats: { total: items.length, withWifi, withOutlets, openLate },
    items,
  };

  await fs.writeFile(OUTPUT, JSON.stringify(payload, null, 2), 'utf-8');

  console.log(`\n✅ Wrote ${items.length} places → data/osm_places.json`);
  console.log('\n   Top 5 places:');
  items.slice(0, 5).forEach(p =>
    console.log(`   - ${p.name.padEnd(28)} ${p.district.padEnd(22)} wifi:${String(p.wifi).padStart(5)}  outlets:${String(p.outlets).padStart(5)}`)
  );
  console.log('\n   Run `npx expo start` to see them on the map!\n');
};

main().catch(err => {
  console.error('\n❌', err.message);
  process.exit(1);
});
