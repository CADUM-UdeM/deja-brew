import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { PLACES } from '../../data/places';
import type { UserProfile } from '../../data/users';
import { fetchMe, updateMe } from '../../data/api';
import { getAuthUser, setAuthUser } from '../../data/auth';

const NOISE_OPTIONS = ['quiet', 'medium', 'lively'] as const;
const TIME_OPTIONS = ['morning', 'afternoon', 'evening', 'late night'] as const;
const STUDY_LENGTH = ['30-45m', '1-2h', '3h+', 'All day'] as const;
const GROUP_PREF = ['solo', 'duo', 'small group', 'big group'] as const;
const BUDGET = ['$', '$$', '$$$'] as const;
const MUST_HAVE = ['Wi-Fi', 'Outlets', 'Quiet corners', 'Big tables'] as const;

export default function EditProfileScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const districts = Array.from(new Set(PLACES.map((p) => p.district))).sort();
  const tags = Array.from(new Set(PLACES.flatMap((p) => p.tags))).sort();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [school, setSchool] = useState('');
  const [noise, setNoise] = useState<'quiet' | 'medium' | 'lively'>('quiet');
  const [wifi, setWifi] = useState(true);
  const [outlets, setOutlets] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<string | null>('afternoon');
  const [studyLength, setStudyLength] = useState<string | null>('1-2h');
  const [groupPref, setGroupPref] = useState<string | null>('duo');
  const [budget, setBudget] = useState<string | null>('$$');
  const [mustHave, setMustHave] = useState<string[]>(['Wi-Fi', 'Outlets']);
  const [favDistricts, setFavDistricts] = useState<string[]>([]);
  const [favTags, setFavTags] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    getAuthUser<UserProfile>()
      .then((user) => {
        if (!mounted || !user) return;
        setCurrentUser(user);
      })
      .catch(() => {});

    fetchMe()
      .then((res) => {
        if (!mounted) return;
        setCurrentUser(res.data.user);
        setAuthUser(res.data.user);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUser || initialized) return;
    setDisplayName(currentUser.displayName ?? '');
    setBio(currentUser.bio ?? '');
    setSchool(currentUser.school ?? '');
    setNoise(currentUser.preferences?.noise ?? 'quiet');
    setWifi(Boolean(currentUser.preferences?.wifi));
    setOutlets(Boolean(currentUser.preferences?.outlets));
    setFavDistricts(currentUser.preferences?.favoriteDistricts ?? []);
    setFavTags(currentUser.preferences?.tags ?? []);
    setInitialized(true);
  }, [currentUser, initialized]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateMe({
        displayName: displayName.trim() || 'Deja Brew guest',
        bio,
        school,
        preferences: {
          noise,
          wifi,
          outlets,
          favoriteDistricts: favDistricts,
          tags: favTags,
        },
      });
      await setAuthUser(res.data.user);
      Alert.alert('Saved', 'Your profile was updated.');
    } catch (err: any) {
      Alert.alert('Save failed', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Edit profile"
          subtitle="Update your study vibe"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Deja Brew guest"
              placeholderTextColor={THEME.sub}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Love calm cafes and long sessions"
              placeholderTextColor={THEME.sub}
              multiline
            />

            <Text style={styles.label}>School</Text>
            <TextInput
              style={styles.input}
              value={school}
              onChangeText={setSchool}
              placeholder="UdeM"
              placeholderTextColor={THEME.sub}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Study preferences</Text>
            <View style={styles.chipRow}>
              {NOISE_OPTIONS.map((option) => {
                const active = option === noise;
                return (
                  <TouchableOpacity key={option} onPress={() => setNoise(option)}>
                    <View style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Time of day</Text>
            <View style={styles.chipRow}>
              {TIME_OPTIONS.map((option) => {
                const active = option === timeOfDay;
                return (
                  <TouchableOpacity key={option} onPress={() => setTimeOfDay(option)}>
                    <View style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Study length</Text>
            <View style={styles.chipRow}>
              {STUDY_LENGTH.map((option) => {
                const active = option === studyLength;
                return (
                  <TouchableOpacity key={option} onPress={() => setStudyLength(option)}>
                    <View style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Group preference</Text>
            <View style={styles.chipRow}>
              {GROUP_PREF.map((option) => {
                const active = option === groupPref;
                return (
                  <TouchableOpacity key={option} onPress={() => setGroupPref(option)}>
                    <View style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Budget</Text>
            <View style={styles.chipRow}>
              {BUDGET.map((option) => {
                const active = option === budget;
                return (
                  <TouchableOpacity key={option} onPress={() => setBudget(option)}>
                    <View style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Must-haves</Text>
            <View style={styles.chipRow}>
              {MUST_HAVE.map((option) => {
                const active = mustHave.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() =>
                      setMustHave((prev) =>
                        active ? prev.filter((item) => item !== option) : [...prev, option]
                      )
                    }
                  >
                    <View style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Wi-Fi required</Text>
              <Switch value={wifi} onValueChange={setWifi} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Outlets required</Text>
              <Switch value={outlets} onValueChange={setOutlets} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Favorite districts</Text>
            <View style={styles.chipRow}>
              {districts.map((district) => {
                const active = favDistricts.includes(district);
                return (
                  <TouchableOpacity
                    key={district}
                    onPress={() =>
                      setFavDistricts((prev) =>
                        active ? prev.filter((item) => item !== district) : [...prev, district]
                      )
                    }
                  >
                    <View style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {district}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Favorite tags</Text>
            <View style={styles.chipRow}>
              {tags.map((tag) => {
                const active = favTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() =>
                      setFavTags((prev) =>
                        active ? prev.filter((item) => item !== tag) : [...prev, tag]
                      )
                    }
                  >
                    <View style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {tag}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Save changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    color: THEME.text,
    backgroundColor: '#fff',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: THEME.accentDark,
    borderColor: THEME.accentDark,
  },
  chipText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 13,
    color: THEME.text,
  },
  primaryBtn: {
    backgroundColor: THEME.accentDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
