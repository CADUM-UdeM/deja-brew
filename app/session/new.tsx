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
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { PlatformDateTimePicker } from '@/components/date-time-picker';
import AppHeader from '../../components/AppHeader';
import { createSession } from '../../data/api';
import type { SessionFeedItem } from '../../data/sessions';

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
const SESSION_STEPS = ['Basics', 'When', 'Place', 'Finish'] as const;

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

const serializeParam = (value: unknown) => {
  if (value === undefined) return undefined;
  return encodeURIComponent(JSON.stringify(value));
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
    timeDetails?: string;
    materials?: string;
    isPublic?: string;
    date?: string;
    currentStep?: string;
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
  const [timeDetails, setTimeDetails] = useState('');
  const [materials, setMaterials] = useState<string[]>(['Laptop', 'Chargers']);
  const [isPublic, setIsPublic] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdSession, setCreatedSession] = useState<SessionFeedItem | null>(null);

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

    const nextTimeDetails = parseParam(params.timeDetails);
    if (typeof nextTimeDetails === 'string') setTimeDetails(nextTimeDetails);

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

    const nextCurrentStep = parseParam(params.currentStep);
    const parsedStep = Number.parseInt(String(nextCurrentStep ?? ''), 10);
    if (!Number.isNaN(parsedStep)) {
      setCurrentStep(Math.min(Math.max(parsedStep, 0), SESSION_STEPS.length - 1));
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

  const isFinalStep = currentStep === SESSION_STEPS.length - 1;
  const canContinue =
    currentStep === 0
      ? Boolean(title.trim() && course.trim())
      : currentStep === 1
      ? Boolean(timeSlot || timeDetails.trim())
      : currentStep === 2
      ? Boolean(location.trim())
      : true;

  const handleNextStep = () => {
    if (!canContinue) {
      const message =
        currentStep === 0
          ? 'Add a title and course/topic first.'
          : currentStep === 2
          ? 'Pick or type a cafe before finishing.'
          : 'Complete this step first.';
      Alert.alert('Almost there', message);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, SESSION_STEPS.length - 1));
  };

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
      const maxPeopleSafe = Number.isNaN(maxPeopleValue)
        ? 2
        : Math.max(1, maxPeopleValue);
      const timeSlotLabel = timeDetails.trim() || timeSlot;
      const session = await createSession({
        title: title.trim() || 'Study date',
        course: course.trim(),
        vibe,
        timeSlot: timeSlotLabel,
        duration,
        groupSize,
        placeId: placeId ?? undefined,
        locationLabel: location.trim(),
        location: location.trim(),
        maxPeople: maxPeopleSafe,
        notes: notes.trim(),
        materials,
        isPublic,
        public: isPublic,
        scheduledFor: date.toISOString(),
        date: date.toISOString(),
      });
      setCreatedSession(session);
    } catch (err: any) {
      Alert.alert('Create failed', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
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
        timeDetails: serializeParam(timeDetails),
        materials: serializeParam(materials),
        isPublic: serializeParam(isPublic),
        date: serializeParam(date.toISOString()),
        currentStep: serializeParam(currentStep),
      },
    });
  };

  const shareCreatedSession = () => {
    if (!createdSession) return;
    Share.share({
      title: createdSession.title,
      message: `Join my study session: ${createdSession.title} at ${createdSession.locationLabel}`,
    }).catch(() => {});
  };

  if (createdSession) {
    return (
      <View style={[styles.container, { backgroundColor: THEME.bg }]}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.replace('/sessions')}
          rightIcon={null}
          showLogo={false}
          title="Session created"
          subtitle="Now make it social"
        />

        <View style={styles.successWrap}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={26} color="#fff" />
            </View>
            <Text style={styles.successTitle}>{createdSession.title}</Text>
            <Text style={styles.successSub}>
              {createdSession.course} · {createdSession.timeSlot}
            </Text>
            <View style={styles.successMeta}>
              <Ionicons name="location-outline" size={16} color={THEME.sub} />
              <Text style={styles.successMetaText}>{createdSession.locationLabel}</Text>
            </View>
            <View style={styles.successMeta}>
              <Ionicons name="people-outline" size={16} color={THEME.sub} />
              <Text style={styles.successMetaText}>
                1/{createdSession.maxPeople} joined · {createdSession.status}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.createButton, { marginTop: 18 }]}
              onPress={() => router.replace(`/sessions/${createdSession._id}/invite`)}
            >
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.createButtonText}>Invite friends</Text>
            </TouchableOpacity>
            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.successSecondary}
                onPress={() => router.replace(`/sessions/${createdSession._id}`)}
              >
                <Text style={styles.successSecondaryText}>View session</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.successSecondary} onPress={shareCreatedSession}>
                <Text style={styles.successSecondaryText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

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
        <View style={styles.stepper}>
          {SESSION_STEPS.map((stepName, index) => {
            const active = index === currentStep;
            const done = index < currentStep;
            return (
              <TouchableOpacity
                key={stepName}
                style={[styles.stepItem, active && styles.stepItemActive]}
                onPress={() => setCurrentStep(index)}
              >
                <View style={[styles.stepDot, (active || done) && styles.stepDotActive]}>
                  <Text style={[styles.stepNumber, (active || done) && styles.stepNumberActive]}>
                    {done ? '✓' : index + 1}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                  {stepName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Main card */}
        <View style={styles.card}>
          <Text style={styles.stepEyebrow}>
            Step {currentStep + 1} of {SESSION_STEPS.length}
          </Text>
          <Text style={styles.stepTitle}>{SESSION_STEPS[currentStep]}</Text>

          {currentStep === 0 && (
            <>
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
            </>
          )}

          {currentStep === 1 && (
            <>
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
            value={timeDetails}
            onChangeText={setTimeDetails}
            placeholder="Optional detail (e.g. Friday 18h–21h)"
            placeholderTextColor={THEME.sub}
          />
            </>
          )}

          {currentStep === 2 && (
            <>
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
            </>
          )}

          {currentStep === 3 && (
            <>
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
            </>
          )}
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.backButton, currentStep === 0 && styles.createButtonDisabled]}
              disabled={currentStep === 0 || saving}
              onPress={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            >
              <Ionicons name="chevron-back" size={18} color={THEME.accentDark} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createButton,
                styles.nextButton,
                (!canContinue || saving) && styles.createButtonDisabled,
              ]}
              onPress={isFinalStep ? handleCreate : handleNextStep}
              disabled={!canContinue || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.createButtonText}>
                    {isFinalStep ? 'Create study date' : 'Next'}
                  </Text>
                  <Ionicons
                    name={isFinalStep ? 'people-outline' : 'chevron-forward'}
                    size={18}
                    color="#fff"
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
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
  stepper: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  stepItemActive: {
    borderColor: THEME.accentDark,
    backgroundColor: '#FFF3E6',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.pill,
  },
  stepDotActive: {
    backgroundColor: THEME.accentDark,
  },
  stepNumber: {
    fontSize: 11,
    color: THEME.sub,
    fontWeight: '800',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 10,
    color: THEME.sub,
    fontWeight: '700',
  },
  stepLabelActive: {
    color: THEME.accentDark,
  },
  stepEyebrow: {
    fontSize: 11,
    color: THEME.sub,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stepTitle: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 4,
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
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    flex: 0.8,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    columnGap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  backButtonText: {
    color: THEME.accentDark,
    fontWeight: '800',
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
  nextButton: {
    flex: 1.2,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  successWrap: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  successCard: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
  },
  successSub: {
    color: THEME.sub,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
  },
  successMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  successMetaText: {
    color: THEME.sub,
    fontSize: 13,
    flex: 1,
  },
  successActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  successSecondary: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  successSecondaryText: {
    color: THEME.accentDark,
    fontWeight: '800',
  },
});
