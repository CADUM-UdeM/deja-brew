import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { PLACES } from '../../data/places';
import { PROMOS } from '../../data/promos';
import { SESSIONS } from '../../data/sessions';

const LIKED_PLACE_IDS = ['constance'];
const LIKED_PROMO_IDS = [2];
const LIKED_SESSION_IDS = ['s_003'];

export default function LikesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'places' | 'promos' | 'sessions'>('places');

  const likedPlaces = useMemo(
    () => PLACES.filter((place) => LIKED_PLACE_IDS.includes(place.id)),
    []
  );
  const likedPromos = useMemo(
    () => PROMOS.filter((promo) => LIKED_PROMO_IDS.includes(promo.id)),
    []
  );
  const likedSessions = useMemo(
    () => SESSIONS.filter((session) => LIKED_SESSION_IDS.includes(session._id)),
    []
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Likes"
          subtitle="Your liked content"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tabRow}>
            {(['places', 'promos', 'sessions'] as const).map((tab) => {
              const active = tab === activeTab;
              return (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                  <View style={[styles.tabPill, active && styles.tabPillActive]}>
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>
                      {tab}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {activeTab === 'places' &&
            likedPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/place', params: { id: place.id } })}
              >
                <Text style={styles.cardTitle}>{place.name}</Text>
                <Text style={styles.cardSub}>{place.district}</Text>
              </TouchableOpacity>
            ))}

          {activeTab === 'promos' &&
            likedPromos.map((promo) => (
              <View key={promo.id} style={styles.card}>
                <Text style={styles.cardTitle}>{promo.title}</Text>
                <Text style={styles.cardSub}>{promo.tag}</Text>
              </View>
            ))}

          {activeTab === 'sessions' &&
            likedSessions.map((session) => (
              <TouchableOpacity
                key={session._id}
                style={styles.card}
                onPress={() => router.push(`/sessions/${session._id}`)}
              >
                <Text style={styles.cardTitle}>{session.title}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="people-outline" size={14} color={THEME.sub} />
                  <Text style={styles.cardSub}>
                    {session.participantsCount}/{session.maxPeople}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
  },
  tabPillActive: {
    backgroundColor: THEME.accentDark,
    borderColor: THEME.accentDark,
  },
  tabText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  card: {
    marginTop: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },
  cardSub: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
});
