import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import AllSessionsScreen from '@/components/allSessionsScreen';
import MySessionsScreen from '@/components/mySessionsScreen';

export default function SessionsFeedScreen() {
  const router = useRouter();
  const [tab, setTab] = React.useState<'sessions' | 'mine'>('sessions');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Study sessions"
          subtitle="Browse sessions and manage your own"
        />

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.push('/session/new')}>
            <Text style={styles.link}>Create a session</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'sessions' && styles.tabButtonActive]}
            onPress={() => setTab('sessions')}
          >
            <Text style={[styles.tabText, tab === 'sessions' && styles.tabTextActive]}>
              Sessions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, tab === 'mine' && styles.tabButtonActive]}
            onPress={() => setTab('mine')}
          >
            <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>
              Mes sessions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {tab === 'sessions' ? <AllSessionsScreen /> : <MySessionsScreen />}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  link: {
    color: THEME.accentDark,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
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
