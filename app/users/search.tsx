import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { searchUsers as searchUsersApi } from '../../data/api';
import type { UserSummary } from '../../data/users';

export default function UserSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError(null);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const handle = setTimeout(() => {
      searchUsersApi(q)
        .then((data) => {
          if (!mounted) return;
          setResults(data);
          setError(null);
        })
        .catch((err: any) => {
          if (!mounted) return;
          setError(err?.message || 'Search failed');
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(handle);
    };
  }, [query]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Find study buddies"
          subtitle="Search by username"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={THEME.sub} />
            <TextInput
              style={styles.input}
              placeholder="Search by username or name"
              placeholderTextColor={THEME.sub}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={THEME.accentDark} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {error && !loading && <Text style={styles.errorText}>{error}</Text>}

          {!loading && !error && query.trim().length === 0 && (
            <Text style={styles.helperText}>Type a name or username to search.</Text>
          )}

          {!loading && !error && query.trim().length > 0 && results.length === 0 && (
            <Text style={styles.helperText}>No users found.</Text>
          )}

          {results.map((user) => (
            <TouchableOpacity
              key={user._id}
              style={styles.card}
              onPress={() => router.push(`/users/${user._id}`)}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{user.displayName}</Text>
                <Text style={styles.cardSub}>@{user.username}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={THEME.sub} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: THEME.text,
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: THEME.sub,
    fontSize: 12,
  },
  errorText: {
    color: '#C05621',
    fontSize: 12,
    marginTop: 12,
  },
  helperText: {
    color: THEME.sub,
    fontSize: 12,
    marginTop: 12,
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
