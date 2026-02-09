// app/(tabs)/promos.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import AllPromosScreen from '@/components/allPromosScreen';
import SavedPromosScreen from '@/components/savedPromosScreen';
import { THEME } from '@/data/THEME';

export default function PromosScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'saved'>('all');

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <AppHeader onRightPress={() => router.push('/notifications')} />

      <View style={styles.header}>
        <Text style={styles.title}>Promos & perks</Text>
        <Text style={styles.subtitle}>
          Coffee deals, late-night discounts and student perks picked for your study sessions.
        </Text>
        <View style={styles.tabRow}>
          <TouchableOpacity onPress={() => setTab('all')}>
            <View style={[styles.tabPill, tab === 'all' && styles.tabPillActive]}>
              <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
                All promos
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('saved')}>
            <View style={[styles.tabPill, tab === 'saved' && styles.tabPillActive]}>
              <Text style={[styles.tabText, tab === 'saved' && styles.tabTextActive]}>
                Saved
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listArea}>
        {tab === 'all' ? <AllPromosScreen /> : <SavedPromosScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.sub,
    marginBottom: 16,
  },
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
  listArea: {
    flex: 1,
  },
});
