// app/session/new.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { PlatformDateTimePicker } from '@/components/date-time-picker';
import AppHeader from '../../components/AppHeader';
import { createSession } from '../../data/api';

const THEME = {
  bg: '#FFF6EF',
  card: '#FFFFFF',
  text: '#2A1C17',
  sub: '#7A6B62',
  accent: '#C27C4A',
  accentDark: '#7F3B00',
  pill: '#F3E7E0',
  border: '#E8D9D1',
};

const COURSE_SUGGESTIONS = ['IFT3355', 'IFT2015', 'Linear Algebra', 'Exam cram'] as const;
const VIBE_OPTIONS = [
  'Deep focus',
  'Chill & chat',
  'Project work',
  'Revision',
  'Silent sprint',
  'Cozy & calm',
] as const;
const TIME_OPTIONS = ['This afternoon', 'Tonight', 'Weekend', 'Morning', 'Late night', 'Flexible'] as const;
const DURATION_OPTIONS = ['30–45 min', '1–2h', '3h+', 'All day'] as const;
const GROUP_OPTIONS = ['Solo', 'Duo', 'Small group', 'Big group'] as const;
const MATERIALS = ['Laptop', 'Textbook', 'Headphones', 'Whiteboard', 'Chargers'] as const;

// Hide default header
export const options = {
  headerShown: false,
};

export default function NewStudySession() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    course?: string;
    vibe?: string;
    timeSlot?: string;
    duration?: string;
    groupSize?: string;
    location?: string;
    placeId?: string;
    maxPeople?: string;
    notes?: string;
    materials?: string;
    isPublic?: string;
    date?: string;
  }>();

  const [title, setTitle] = useState('Study date');
  const [course, setCourse] = useState('');
  const [vibe, setVibe] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<string | null>('Tonight');
  const [duration, setDuration] = useState<string | null>('1–2h');
  const [groupSize, setGroupSize] = useState<string | null>('Duo');
  const [location, setLocation] = useState('');
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [maxPeople, setMaxPeople] = useState('3');
  const [notes, setNotes] = useState('');
  const [materials, setMaterials] = useState<string[]>(['Laptop', 'Chargers']);
  const [isPublic, setIsPublic] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const getParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const parseParam = (value?: string | string[]) => {
    const raw = getParam(value);
    if (raw == null) return undefined;
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      try {
        return JSON.parse(raw);
      } catch {
        try {
          return decodeURIComponent(raw);
        } catch {
          return raw;
        }
      }
    }
  };

  const toBoolean = (value: unknown) => {
    if (typeof value === 'boolean') return value;
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
    return undefined;
  };

  const formatDate = (value: Date) =>
    value.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const formatTime = (value: Date) =>
    value.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  useEffect(() => {
    if (initialized) return;
    const nextTitle = parseParam(params.title);
    if (typeof nextTitle === 'string' && nextTitle.length > 0) setTitle(nextTitle);

    const nextCourse = parseParam(params.course);
    if (typeof nextCourse === 'string') setCourse(nextCourse);

    const nextVibe = parseParam(params.vibe);
    if (typeof nextVibe === 'string') setVibe(nextVibe);

    const nextTimeSlot = parseParam(params.timeSlot);
    if (typeof nextTimeSlot === 'string') setTimeSlot(nextTimeSlot);

    const nextDuration = parseParam(params.duration);
    if (typeof nextDuration === 'string') setDuration(nextDuration);

    const nextGroupSize = parseParam(params.groupSize);
    if (typeof nextGroupSize === 'string') setGroupSize(nextGroupSize);

    const nextLocation = parseParam(params.location);
    if (typeof nextLocation === 'string' && nextLocation.length > 0) {
      setLocation(nextLocation);
    }

    const nextPlaceId = parseParam(params.placeId);
    if (typeof nextPlaceId === 'string' && nextPlaceId.length > 0) {
      setPlaceId(nextPlaceId);
    }

    const nextMaxPeople = parseParam(params.maxPeople);
    if (typeof nextMaxPeople === 'string') setMaxPeople(nextMaxPeople);

    const nextNotes = parseParam(params.notes);
    if (typeof nextNotes === 'string') setNotes(nextNotes);

    const nextMaterials = parseParam(params.materials);
    if (Array.isArray(nextMaterials)) {
      setMaterials(nextMaterials.filter((item) => typeof item === 'string'));
    }

    const nextIsPublic = parseParam(params.isPublic);
    const nextIsPublicBool = toBoolean(nextIsPublic);
    if (typeof nextIsPublicBool === 'boolean') setIsPublic(nextIsPublicBool);

    const nextDate = parseParam(params.date);
    if (typeof nextDate === 'string') {
      const parsed = new Date(nextDate);
      if (!Number.isNaN(parsed.getTime())) setDate(parsed);
    }

    setInitialized(true);
  }, [initialized, params]);

  // met à jour le champ "Café / location" quand on revient de la map
  useEffect(() => {
    const nextLocation = parseParam(params.location);
    if (typeof nextLocation === 'string' && nextLocation.length > 0) {
      setLocation(nextLocation);
    }
    const nextPlaceId = parseParam(params.placeId);
    if (typeof nextPlaceId === 'string' && nextPlaceId.length > 0) {
      setPlaceId(nextPlaceId);
    }
  }, [params.location, params.placeId]);

  const handleCreate = async () => {
    if (!course.trim() || !location.trim()) {
      Alert.alert(
        'Almost there ✨',
        'Add at least a course/topic and a café so others know where to join you.'
      );
      return;
    }

    setSaving(true);
    try {
      const maxPeopleValue = Number.parseInt(maxPeople, 10);
      await createSession({
        title: title.trim() || 'Study date',
        course: course.trim(),
        vibe,
        timeSlot,
        duration,
        groupSize,
        placeId: placeId ?? undefined,
        locationLabel: location.trim(),
        location: location.trim(),
        maxPeople: Number.isNaN(maxPeopleValue) ? 2 : maxPeopleValue,
        notes: notes.trim(),
        materials,
        isPublic,
        public: isPublic,
        scheduledFor: date.toISOString(),
        date: date.toISOString(),
      });
      Alert.alert(
        'Study date created ☕️',
        `We saved your study date for ${course} at ${location}.`,
        [
          {
            text: 'Nice!',
            onPress: () => router.replace('/sessions'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Create failed', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const serializeParam = (value: unknown) => {
    if (value === undefined) return undefined;
    return encodeURIComponent(JSON.stringify(value));
  };

  const goToMap = () => {
    router.push({
      pathname: '/map', // le segment (tabs) ne fait pas partie de l'URL
      params: {
        selectMode: 'place',
        title: serializeParam(title),
        course: serializeParam(course),
        vibe: serializeParam(vibe),
        timeSlot: serializeParam(timeSlot),
        duration: serializeParam(duration),
        groupSize: serializeParam(groupSize),
        location: serializeParam(location),
        placeId: serializeParam(placeId),
        maxPeople: serializeParam(maxPeople),
        notes: serializeParam(notes),
        materials: serializeParam(materials),
        isPublic: serializeParam(isPublic),
        date: serializeParam(date.toISOString()),
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: THEME.bg }]}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => router.back()}
        rightIcon={null}
        showLogo={false}
        title="Create a study date"
        subtitle="Tell others where to meet you"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main card */}
        <View style={styles.card}>
          {/* Title */}
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Study date, group work, exam cram..."
            placeholderTextColor={THEME.sub}
          />

          {/* Course / Topic */}
          <Text style={styles.label}>Course / Topic</Text>
          <TextInput
            style={styles.input}
            value={course}
            onChangeText={setCourse}
            placeholder="IFT3355, midterm review, project work..."
            placeholderTextColor={THEME.sub}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginTop: 8 }}
          >
            {COURSE_SUGGESTIONS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCourse(c)} style={styles.chip}>
                <Text style={styles.chipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Vibe */}
          <Text style={[styles.label, { marginTop: 18 }]}>Vibe</Text>
          <View style={styles.chipRow}>
            {VIBE_OPTIONS.map((v) => {
              const active = v === vibe;
              return (
                <TouchableOpacity
                  key={v}
                  onPress={() => setVibe(active ? null : v)}
                  style={[
                    styles.chip,
                    active && { backgroundColor: THEME.accentDark },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#fff', fontWeight: '700' },
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* When */}
          <Text style={[styles.label, { marginTop: 18 }]}>When</Text>
          <View style={styles.pickerRow}>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={16} color={THEME.accentDark} />
              <Text style={styles.pickerText}>{formatDate(date)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={16} color={THEME.accentDark} />
              <Text style={styles.pickerText}>{formatTime(date)}</Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <PlatformDateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setDate(selected);
              }}
              minimumDate={new Date()}
            />
          )}
          {showTimePicker && (
            <PlatformDateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selected) {
                  const next = new Date(date);
                  next.setHours(selected.getHours());
                  next.setMinutes(selected.getMinutes());
                  setDate(next);
                }
              }}
            />
          )}
          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((t) => {
              const active = t === timeSlot;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTimeSlot(active ? null : t)}
                  style={[
                    styles.chip,
                    active && { backgroundColor: THEME.accent },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#fff', fontWeight: '700' },
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Duration */}
          <Text style={[styles.label, { marginTop: 18 }]}>Duration</Text>
          <View style={styles.chipRow}>
            {DURATION_OPTIONS.map((d) => {
              const active = d === duration;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDuration(active ? null : d)}
                  style={[
                    styles.chip,
                    active && { backgroundColor: THEME.accentDark },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#fff', fontWeight: '700' },
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Group size */}
          <Text style={[styles.label, { marginTop: 18 }]}>Group size</Text>
          <View style={styles.chipRow}>
            {GROUP_OPTIONS.map((g) => {
              const active = g === groupSize;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGroupSize(active ? null : g)}
                  style={[
                    styles.chip,
                    active && { backgroundColor: THEME.accent },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#fff', fontWeight: '700' },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Optional detail (e.g. Friday 18h–21h)"
            placeholderTextColor={THEME.sub}
          />

          {/* Location */}
          <Text style={[styles.label, { marginTop: 18 }]}>Café / location</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginTop: 0 }]}
              value={location}
              onChangeText={setLocation}
              placeholder="Ex: Café Olimpico · Mile-End"
              placeholderTextColor={THEME.sub}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={goToMap}
            >
              <Ionicons name="map-outline" size={18} color="#fff" />
              <Text style={styles.locationButtonText}>Pick on map</Text>
            </TouchableOpacity>
          </View>

          {/* Max people */}
          <Text style={[styles.label, { marginTop: 18 }]}>Max people</Text>
          <View style={styles.inlineRow}>
            <TextInput
              style={[styles.input, { flex: 0, width: 80, marginTop: 0 }]}
              value={maxPeople}
              onChangeText={setMaxPeople}
              keyboardType="number-pad"
              placeholder="3"
              placeholderTextColor={THEME.sub}
            />
            <Text style={styles.inlineHint}>Include yourself</Text>
          </View>

          {/* Notes */}
          <Text style={[styles.label, { marginTop: 18 }]}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Laptop-friendly? Need chargers? Group project or silent work?"
            placeholderTextColor={THEME.sub}
            multiline
            numberOfLines={3}
          />

          {/* Materials */}
          <Text style={[styles.label, { marginTop: 18 }]}>Bring</Text>
          <View style={styles.chipRow}>
            {MATERIALS.map((m) => {
              const active = materials.includes(m);
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() =>
                    setMaterials((prev) =>
                      active ? prev.filter((item) => item !== m) : [...prev, m]
                    )
                  }
                  style={[
                    styles.chip,
                    active && { backgroundColor: THEME.accentDark },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: '#fff', fontWeight: '700' },
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Visibility */}
          <View style={[styles.inlineRow, { marginTop: 20 }]}>
            <View>
              <Text style={styles.label}>Visibility</Text>
              <Text style={styles.smallText}>
                Public study dates appear on the home “Match to Study” section.
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              thumbColor={isPublic ? '#fff' : '#f4f3f4'}
              trackColor={{ false: '#CFC7C2', true: THEME.accentDark }}
            />
          </View>
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createButton, saving && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="people-outline" size={18} color="#fff" />
                <Text style={styles.createButtonText}>Create study date</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------- styles ------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    backgroundColor: THEME.card,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 10,
  },
  input: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.text,
    backgroundColor: '#FFF',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: THEME.pill,
  },
  chipText: {
    fontSize: 12,
    color: THEME.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    backgroundColor: THEME.accentDark,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    marginTop: 6,
  },
  inlineHint: {
    fontSize: 12,
    color: THEME.sub,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  pickerText: {
    color: THEME.text,
    fontWeight: '600',
    fontSize: 12,
  },
  smallText: {
    fontSize: 11,
    color: THEME.sub,
    marginTop: 2,
    maxWidth: 210,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 18,
  },
  createButton: {
    backgroundColor: THEME.accentDark,
    borderRadius: 999,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    columnGap: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
