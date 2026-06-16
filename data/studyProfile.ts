import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StudyProfileParams } from '@/data/recommendations';

const STORAGE_KEY = 'studyVibeProfile';

export type StudyVibeProfile = StudyProfileParams & {
  label: string;
  savedAt: string;
};

export const deriveStudyVibeLabel = (profile: StudyProfileParams): string => {
  const session  = profile.sessionType?.toLowerCase() ?? '';
  const noise    = profile.noise?.toLowerCase() ?? '';
  const duration = profile.duration?.toLowerCase() ?? '';
  const group    = profile.group?.toLowerCase() ?? '';
  const vibe     = profile.vibe?.toLowerCase() ?? '';

  if (session.includes('exam') || session.includes('cram'))              return 'Exam crunch mode';
  if (session.includes('group') || group.includes('squad') || group.includes('crew')) return 'Group project HQ';
  if (session.includes('research') || session.includes('deep'))          return 'Deep focus session';
  if (duration.includes('all') || duration.includes('3h'))               return 'All-day laptop grind';
  if (noise.includes('quiet') || noise.includes('pin-drop'))             return 'Silent focus corner';
  if (group.includes('duo'))                                             return 'Study date vibes';
  if (vibe.includes('cozy'))                                             return 'Cozy booth vibes';
  return 'Balanced study spot';
};

export const saveStudyVibeProfile = async (profile: StudyProfileParams) => {
  const next: StudyVibeProfile = {
    ...profile,
    label: deriveStudyVibeLabel(profile),
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const getStudyVibeProfile = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as StudyVibeProfile;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
};
