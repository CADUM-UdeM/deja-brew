import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { FRIENDS } from '../../data/friends';
import { fetchFriends, removeFriend } from '../../data/api';
import type { UserSummary } from '../../data/users';

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<UserSummary[]>(FRIENDS);

  const handleRemove = (friendId: string) => {
    Alert.alert('Remove friend', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFriend(friendId);
            setFriends((prev) => prev.filter((f) => f._id !== friendId));
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Could not remove friend.');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    let mounted = true;
    fetchFriends()
      .then((data) => {
        if (mounted && data.length > 0) setFriends(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Friends"
          subtitle="Manage your study buddies"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => router.push('/friends/requests')}>
              <Text style={styles.link}>Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => router.push('/users/search')}
            >
              <Ionicons name="search-outline" size={16} color={THEME.accentDark} />
              <Text style={styles.searchText}>Find new friends</Text>
            </TouchableOpacity>
          </View>

          {friends.map((friend) => (
            <TouchableOpacity
              key={friend?._id}
              style={styles.card}
              onPress={() => router.push(`/users/${friend?._id}`)}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{friend?.displayName}</Text>
                <Text style={styles.cardSub}>@{friend?.username}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(friend._id)} hitSlop={8}>
                <Ionicons name="person-remove-outline" size={18} color={THEME.sub} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    color: THEME.accentDark,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  searchText: {
    color: THEME.accentDark,
    fontWeight: '700',
  },
  card: {
    marginTop: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#7F3B00',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  cardSub: {
    fontSize: 12,
    color: THEME.sub,
  },
});
