// app/(tabs)/promos.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import AllPromosScreen from '@/components/allPromosScreen';
import SavedPromosScreen from '@/components/savedPromosScreen';
import { THEME } from '@/data/THEME';

export default function PromosScreen() {
  const router = useRouter();
  const [tab, setTab] = React.useState<'promos' | 'saved'>('promos');

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>
      <AppHeader onRightPress={() => router.push('/notifications')} />

      <View style={styles.header}>
        <Text style={styles.title}>Promos & perks</Text>
        <Text style={styles.subtitle}>
          Coffee deals, late-night discounts and student perks picked for your study sessions.
        </Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'promos' && styles.tabButtonActive]}
          onPress={() => setTab('promos')}
        >
          <Text style={[styles.tabText, tab === 'promos' && styles.tabTextActive]}>
            All promos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'saved' && styles.tabButtonActive]}
          onPress={() => setTab('saved')}
        >
          <Text style={[styles.tabText, tab === 'saved' && styles.tabTextActive]}>
            Saved
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{tab === 'promos' ? <AllPromosScreen /> : <SavedPromosScreen />}</View>
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
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: THEME.accentDark,
    borderColor: THEME.accentDark,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.text,
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
});
