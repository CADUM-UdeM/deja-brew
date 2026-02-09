// app/(tabs)/profile.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME = {
  bg: '#FFF6EF',
  text: '#2A1C17',
  sub: '#7A6B62',
  card: '#FFFFFF',
  border: '#E8D9D1',
  accentDark: '#7F3B00',
};

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg, paddingTop: useSafeAreaInsets().top }}>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top user section */}
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Ionicons name="cafe-outline" size={32} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Deja Brew guest</Text>
            <Text style={styles.handle}>@studylover</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Study preferences</Text>
        <View style={styles.chipsRow}>
          {['Quiet', 'Wi-Fi stable', 'Many outlets', 'Open late'].map((pref) => (
            <View key={pref} style={styles.chip}>
              <Text style={styles.chipText}>{pref}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Account & app</Text>

        <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
          <View style={styles.rowLeft}>
            <Ionicons name="options-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Edit study profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Notification settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowItem} activeOpacity={0.7}>
          <View style={styles.rowLeft}>
            <Ionicons name="shield-checkmark-outline" size={20} color={THEME.accentDark} />
            <Text style={styles.rowText}>Privacy & data</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={THEME.sub} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.rowItem, { marginTop: 10 }]} activeOpacity={0.7}>
          <View style={styles.rowLeft}>
            <Ionicons name="log-out-outline" size={20} color="#C05621" />
            <Text style={[styles.rowText, { color: '#C05621' }]}>Log out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    columnGap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
  },
  handle: {
    fontSize: 13,
    color: THEME.sub,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F3E7E0',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  chipText: {
    fontSize: 12,
    color: THEME.accentDark,
    fontWeight: '600',
  },
  rowItem: {
    marginTop: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE0DA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  rowText: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '500',
  },
});
