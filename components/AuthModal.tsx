import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login, register } from '../data/api';
import { setAuth } from '../data/auth';
import { THEME } from '../data/THEME';

type Mode = 'register' | 'login';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AuthModal({ visible, onClose, onSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('register');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setDisplayName('');
    setPassword('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setMode('register');
    onClose();
  };

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
      handleClose();
      onSuccess();
    } catch (err: any) {
      Alert.alert('Signup failed', err?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      await setAuth(res.data.token, res.data.user);
      handleClose();
      onSuccess();
    } catch (err: any) {
      Alert.alert('Login failed', err?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: 10 }]}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={26} color={THEME.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {mode === 'register' ? 'Create account' : 'Welcome back'}
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

            {mode === 'register' && (
              <>
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
              </>
            )}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 8 characters"
              placeholderTextColor={THEME.sub}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={mode === 'register' ? handleRegister : handleLogin}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === 'register' ? 'Create account' : 'Log in'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.secondaryRow}
            onPress={() => setMode(mode === 'register' ? 'login' : 'register')}
          >
            <Ionicons
              name={mode === 'register' ? 'log-in-outline' : 'person-add-outline'}
              size={16}
              color={THEME.accentDark}
            />
            <Text style={styles.secondaryText}>
              {mode === 'register'
                ? 'Already have an account? Log in'
                : 'Create an account'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
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
    justifyContent: 'center',
  },
  secondaryText: {
    color: THEME.accentDark,
    fontWeight: '600',
    // cen

  },
});
