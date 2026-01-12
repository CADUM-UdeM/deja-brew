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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import AppHeader from '../../components/AppHeader';

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
const VIBE_OPTIONS = ['Deep focus', 'Chill & chat', 'Project work', 'Revision'] as const;
const TIME_OPTIONS = ['This afternoon', 'Tonight', 'Weekend', 'Flexible'] as const;

// Hide default header
export const options = {
  headerShown: false,
};

export default function NewStudySession() {
  const router = useRouter();
  const params = useLocalSearchParams<{ course?: string; location?: string }>();

  const [title, setTitle] = useState('Study date');
  const [course, setCourse] = useState(
    typeof params.course === 'string' && params.course.length > 0
      ? params.course
      : ''
  );
  const [vibe, setVibe] = useState<string | null>(null);
  const [timeSlot, setTimeSlot] = useState<string | null>('Tonight');
  const [location, setLocation] = useState('');
  const [maxPeople, setMaxPeople] = useState('3');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // met à jour le champ "Café / location" quand on revient de la map
  useEffect(() => {
    if (typeof params.location === 'string' && params.location.length > 0) {
      setLocation(params.location);
    }
  }, [params.location]);

  const handleCreate = () => {
    if (!course.trim() || !location.trim()) {
      Alert.alert(
        'Almost there ✨',
        'Add at least a course/topic and a café so others know where to join you.'
      );
      return;
    }

    Alert.alert(
      'Study date created ☕️',
      `We saved your study date for ${course} at ${location}.`,
      [
        {
          text: 'Nice!',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const goToMap = () => {
    router.push({
      pathname: '/map', // le segment (tabs) ne fait pas partie de l'URL
      params: {
        selectMode: 'place',
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: THEME.bg }]}>
      <AppHeader />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title + back */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={THEME.text} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Create a study date</Text>
          <View style={{ width: 32 }} />{/* spacer */}
        </View>

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
          <View className="inline" style={styles.inlineRow}>
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
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Ionicons name="people-outline" size={18} color="#fff" />
            <Text style={styles.createButtonText}>Create study date</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    justifyContent: 'space-between',
  },
  backButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFFAA',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.text,
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
  createButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
