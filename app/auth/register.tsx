import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { register } from '../../data/api';
import { setAuth } from '../../data/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Fill out email, username, and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        email: email.trim(),
        username: username.trim(),
        displayName: displayName.trim() || 'Deja Brew guest',
        password,
      });
      await setAuth(res.data.token, res.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Signup failed', err?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: THEME.bg }}>
        <AppHeader
          leftIcon="chevron-back"
          onLeftPress={() => router.back()}
          rightIcon={null}
          showLogo={false}
          title="Create account"
          subtitle="Join Deja Brew"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="lea@email.com"
              placeholderTextColor={THEME.sub}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="studylover"
              placeholderTextColor={THEME.sub}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />

            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              placeholder="Deja Brew guest"
              placeholderTextColor={THEME.sub}
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 8 characters"
              placeholderTextColor={THEME.sub}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Create account</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.secondaryRow} onPress={() => router.push('/auth/login')}>
            <Ionicons name="log-in-outline" size={16} color={THEME.accentDark} />
            <Text style={styles.secondaryText}>Already have an account?</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: THEME.sub,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    color: THEME.text,
    backgroundColor: '#fff',
  },
  primaryBtn: {
    backgroundColor: THEME.accentDark,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  secondaryText: {
    color: THEME.accentDark,
    fontWeight: '600',
  },
});
