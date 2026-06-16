import type { CafePlace } from '@/data/places';
import type { SessionFeedItem } from '@/data/sessions';

export type StudyProfileParams = {
  sessionType?: string; // 'Light assignment' | 'Deep research' | 'Exam cram' | 'Group project'
  noise?: string;
  time?: string;
  duration?: string;
  group?: string;
  campus?: string;      // 'Concordia / SGW' | 'McGill / Downtown' | 'Plateau / Mile-End' | 'Anywhere'
  mustHave?: string;    // comma-separated list
  budget?: string;
  // kept for backward compat with old profile saves
  vibe?: string;
  food?: string;
};

const includesAny = (value: string, keywords: string[]) => {
  const normalized = value.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
};

const isOpenEvening = (place: CafePlace) => {
  const h = place.hours.toLowerCase();
  return /20h|21h|22h|23h|minuit|soir|evening/.test(h);
};

/* ─── images ──────────────────────────────────────────── */
export const getPlaceImage = (place?: Pick<CafePlace, 'id' | 'imageUrl'>) => {
  if (place?.imageUrl) return place.imageUrl;
  switch (place?.id) {
    case 'savsav':      return 'https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg';
    case 'crew':        return 'https://images.pexels.com/photos/374885/pexels-photo-374885.jpeg';
    case 'accio':       return 'https://images.pexels.com/photos/3806439/pexels-photo-3806439.jpeg';
    case 'tranquille':  return 'https://images.pexels.com/photos/2179212/pexels-photo-2179212.jpeg';
    case 'tommy':       return 'https://images.pexels.com/photos/4352247/pexels-photo-4352247.jpeg';
    case 'amea':        return 'https://images.pexels.com/photos/4050347/pexels-photo-4050347.jpeg';
    case 'constance':   return 'https://images.pexels.com/photos/3741475/pexels-photo-3741475.jpeg';
    default:            return 'https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg';
  }
};

/* ─── good-for badges ─────────────────────────────────── */
export const getGoodForBadges = (place: CafePlace) => {
  const source = `${place.name} ${place.vibe} ${place.tags.join(' ')} ${place.studyAtmosphere.join(' ')}`.toLowerCase();
  const badges = new Set<string>();
  if (includesAny(source, ['calm', 'calme', 'quiet', 'solo']))                       badges.add('Solo focus');
  if (includesAny(source, ['cozy', 'cosy', 'dessert', 'cute']))                      badges.add('Duo study date');
  if (includesAny(source, ['group', 'cowork', 'big tables', 'grandes tables']))       badges.add('Group project');
  if (includesAny(source, ['aesthetic', 'chic', 'design', 'instagram']))              badges.add('Aesthetic');
  if (place.priceLevel === '$')  badges.add('Cheap coffee');
  if (place.outlets)             badges.add('Long laptop session');
  if (place.wifi)                badges.add('Wi-Fi work');
  return Array.from(badges).slice(0, 5);
};

/* ─── study signals ───────────────────────────────────── */
export const getStudySignals = (place: CafePlace) => {
  const tags = `${place.tags.join(' ')} ${place.studyAtmosphere.join(' ')} ${place.vibe}`.toLowerCase();
  const isQuiet    = includesAny(tags, ['calm', 'calme', 'quiet', 'silent']);
  const isSocial   = includesAny(tags, ['brunch', 'social', 'lively', 'bruyant']);
  const hasLong    = place.outlets || includesAny(tags, ['long', 'cowork', 'laptop']);
  return {
    noiseLevel:     isQuiet  ? 'Quiet'    : isSocial ? 'Lively'     : 'Balanced',
    outletScore:    place.outlets ? 'Strong'  : 'Limited',
    wifiConfidence: place.wifi    ? 'High'    : 'Ask first',
    bestTime:       isSocial ? 'Weekday mornings' : hasLong ? 'Afternoon blocks' : 'Off-peak hours',
  };
};

/* ─── why-picked blurb ────────────────────────────────── */
export const getWhyPicked = (place: CafePlace, params: StudyProfileParams = {}) => {
  const badges  = getGoodForBadges(place);
  const signals = getStudySignals(place);
  const parts: string[] = [];
  if (params.noise?.toLowerCase().includes('quiet') && signals.noiseLevel === 'Quiet')  parts.push('matches your quiet preference');
  if (params.duration?.toLowerCase().includes('all') && place.outlets)                   parts.push('has outlets for long sessions');
  if (params.group?.toLowerCase().includes('group') && badges.includes('Group project')) parts.push('works well for group study');
  if (params.mustHave?.toLowerCase().includes('wi') && place.wifi)                       parts.push('checks your Wi-Fi must-have');
  if (parts.length === 0 && badges.length > 0)                                           parts.push(`stands out for ${badges[0].toLowerCase()}`);
  return `We picked this because it ${parts.join(' and ')}.`;
};

/* ─── campus → district keywords ─────────────────────── */
const CAMPUS_DISTRICT_MAP: Record<string, string[]> = {
  'concordia':   ['concordia', 'downtown', 'saint-henri', 'little burgundy'],
  'sgw':         ['concordia', 'downtown', 'saint-henri', 'little burgundy'],
  'mcgill':      ['downtown', 'qds', 'mcgill', 'plateau'],
  'plateau':     ['plateau', 'mile-end', 'rosemont', 'hochelaga'],
  'mile-end':    ['mile-end', 'plateau', 'rosemont'],
};

const campusMatch = (campus: string, district: string): number => {
  const d = district.toLowerCase();
  for (const [key, zones] of Object.entries(CAMPUS_DISTRICT_MAP)) {
    if (campus.toLowerCase().includes(key)) {
      if (zones.some((z) => d.includes(z))) return 3;
    }
  }
  return 0;
};

/* ─── main scoring function ───────────────────────────── */
export type ScoreResult = {
  score: number;
  matchPercent: number;
  reasons: string[];
  warnings: string[];
};

export const scorePlace = (place: CafePlace, params: StudyProfileParams = {}): ScoreResult => {
  let score = place.source === 'curated' ? 1 : 0;
  let maxScore = 1;
  const reasons: string[] = [];
  const warnings: string[] = [];

  const src = `${place.vibe} ${place.tags.join(' ')} ${place.studyAtmosphere.join(' ')} ${place.food.join(' ')}`.toLowerCase();

  // Earns points + reserves maxScore space
  const add = (pts: number, reason: string) => {
    score    += pts;
    maxScore += pts;
    if (pts > 0 && !reasons.includes(reason)) reasons.push(reason);
  };

  // Reserves maxScore without earning — used for "could have scored X but didn't"
  const reserve = (pts: number) => { maxScore += pts; };

  // Adds a warning visible in the UI — does NOT affect score or maxScore
  const warn = (warning: string) => {
    if (!warnings.includes(warning)) warnings.push(warning);
  };

  /* ── 1. Session type (most impactful) ── */
  const sessionType = params.sessionType?.toLowerCase() ?? '';
  if (sessionType.includes('exam') || sessionType.includes('cram')) {
    reserve(8);
    if (includesAny(src, ['calme', 'calm', 'quiet', 'silent']))     add(3, 'Quiet for exam focus');
    else                                                             warn('Can be noisy — tough for exam prep');
    if (place.outlets)                                               add(3, 'Outlets for marathon session');
    else                                                             warn('No outlets — hard for a long cram');
    if (place.wifi)                                                  add(2, 'Wi-Fi for references & tools');
    else                                                             warn('No Wi-Fi confirmed');
  } else if (sessionType.includes('research') || sessionType.includes('deep')) {
    reserve(4);
    if (includesAny(src, ['calme', 'calm', 'quiet']))                add(2, 'Quiet for deep research');
    else                                                             warn('May be too noisy for deep research');
    if (place.outlets)                                               add(2, 'Outlets for long reading sessions');
  } else if (sessionType.includes('group')) {
    reserve(5);
    if (includesAny(src, ['group', 'cowork', 'tables', 'grandes'])) add(3, 'Group-friendly layout');
    else                                                             warn('May not have enough space for a group');
    if (!includesAny(src, ['calme', 'quiet']))                       add(2, 'Relaxed noise level for groups');
  }
  // light assignment → any spot works fine, no reservation

  /* ── 2. Noise level ── */
  const noise = params.noise?.toLowerCase() ?? '';
  if (noise.includes('quiet') || noise.includes('pin-drop')) {
    reserve(2);
    if (includesAny(src, ['calme', 'calm', 'quiet', 'silent']))      add(2, 'Quiet corners');
    else                                                              warn('Tends to be lively — may not suit quiet need');
  } else if (noise.includes('lively') || noise.includes('buzz')) {
    reserve(2);
    if (includesAny(src, ['brunch', 'social', 'lively', 'bruyant'])) add(2, 'Lively energy you asked for');
  } else {
    // soft background — most places qualify, small bonus
    add(1, 'Ambient noise level works');
  }

  /* ── 3. Duration ── */
  const duration = params.duration?.toLowerCase() ?? '';
  if (duration.includes('all') || duration.includes('3h') || duration.includes('long')) {
    reserve(4);
    if (place.outlets)    add(2, 'Outlets for long sessions');
    else                  warn('No outlets — risky for an all-day grind');
    if (isOpenEvening(place)) add(2, 'Open late enough');
    else                  warn('May close too early for a full day');
  } else if (duration.includes('standard') || duration.includes('1') || duration.includes('2')) {
    add(1, 'Good for a 1–3h session');
  }

  /* ── 4. Group size ── */
  const group = params.group?.toLowerCase() ?? '';
  if (group.includes('squad') || group.includes('5+') || group.includes('full')) {
    reserve(3);
    if (includesAny(src, ['group', 'tables', 'grandes', 'cowork'])) add(3, 'Big-group seating available');
    else                                                             warn('Likely too small for 5+ people');
  } else if (group.includes('crew') || group.includes('3') || group.includes('4')) {
    reserve(2);
    if (includesAny(src, ['group', 'tables', 'cowork']))             add(2, 'Good for a small crew');
    else                                                             warn('May be tight for 3–4 people');
  } else if (group.includes('duo')) {
    reserve(1);
    if (includesAny(src, ['cozy', 'petit', 'duo', 'dessert']))       add(1, 'Nice duo-study atmosphere');
  }
  // solo → always a safe fit, no reservation needed

  /* ── 5. Campus proximity ── */
  const campus = params.campus?.toLowerCase() ?? '';
  if (campus && !campus.includes('anywhere')) {
    reserve(3);
    const proximity = campusMatch(campus, place.district);
    if (proximity > 0) add(proximity, 'Close to your campus zone');
    else               warn('A bit out of your area — budget extra commute time');
  }

  /* ── 6. Must-haves ── */
  const mustHaves = (params.mustHave ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  for (const need of mustHaves) {
    if (need.includes('wi') || need.includes('wifi') || need.includes('internet')) {
      reserve(3);
      if (place.wifi)        add(3, 'Wi-Fi confirmed');
      else                   warn('No Wi-Fi — your must-have is missing');
    }
    if (need.includes('outlet') || need.includes('power')) {
      reserve(3);
      if (place.outlets)     add(3, 'Plenty of outlets');
      else                   warn('No outlets — your must-have is missing');
    }
    if (need.includes('quiet') || need.includes('corner')) {
      reserve(2);
      if (includesAny(src, ['calme', 'calm', 'quiet', 'corner', 'coin'])) add(2, 'Quiet corners available');
      else                   warn('No dedicated quiet corners mentioned');
    }
    if (need.includes('big table') || need.includes('table')) {
      reserve(2);
      if (includesAny(src, ['table', 'tables', 'grande'])) add(2, 'Big tables to spread out');
      else                   warn('Limited table space reported');
    }
    if (need.includes('food') || need.includes('coffee')) {
      reserve(1);
      if (place.food.length >= 2) add(1, 'Good food & coffee selection');
    }
    if (need.includes('evening') || need.includes('open late')) {
      reserve(2);
      if (isOpenEvening(place)) add(2, 'Open evenings');
      else                      warn('Closes early — may not be open evenings');
    }
  }

  /* ── 7. Budget ── */
  if (params.budget && place.priceLevel) {
    reserve(2);
    if (place.priceLevel === params.budget)                       add(2, `Fits your ${params.budget} budget`);
    else if (
      (params.budget === '$' && place.priceLevel === '$$$') ||
      (params.budget === '$$$' && place.priceLevel === '$')
    )                                                             warn(`Price level (${place.priceLevel}) may not match your budget`);
    else                                                          add(1, 'Budget is close enough'); // adjacent tier
  }

  /* ── 8. Legacy vibe compat ── */
  const vibe = params.vibe?.toLowerCase() ?? '';
  if (vibe) {
    reserve(2);
    if      (vibe.includes('cozy') && includesAny(src, ['cozy', 'cosi', 'warm']))         add(2, 'Cozy vibe');
    else if (vibe.includes('bright') && includesAny(src, ['bright', 'modern']))            add(2, 'Bright & modern');
    else if (vibe.includes('industrial') && includesAny(src, ['industrial']))              add(2, 'Industrial vibe');
    else if (vibe.includes('green') && includesAny(src, ['green', 'airy', 'plants']))     add(2, 'Green & airy');
  }

  /* ── 9. OSM places: base quality boost from available signals ── */
  if (place.source !== 'curated') {
    if (place.wifi)    add(1, 'Wi-Fi available');
    if (place.outlets) add(1, 'Outlets available');
  }

  const effectiveMax = Math.max(maxScore, 1);
  const matchPercent = Math.min(Math.round((score / effectiveMax) * 100), 99);

  return {
    score: Math.max(0, score),
    matchPercent: Math.max(0, matchPercent),
    reasons: reasons.slice(0, 5),
    warnings: warnings.slice(0, 3),
  };
};

/* ─── session urgency ─────────────────────────────────── */
export const getSessionUrgency = (session: SessionFeedItem) => {
  const openSpots = Math.max(0, session.maxPeople - session.participantsCount);
  if (session.status === 'full')                     return 'Full';
  if (session.joinStatusByMe === 'pending')          return 'Request sent';
  if (session.joinStatusByMe === 'accepted')         return 'You are in';
  if (openSpots <= 1)                                return 'Last spot';
  return `${openSpots} spots open`;
};
