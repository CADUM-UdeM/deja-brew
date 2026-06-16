import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import { login } from '../../data/api';
import { setAuth } from '../../data/auth';

const SPRING = { damping: 20, stiffness: 220, mass: 0.8 };

function AnimatedButton({
  onPress,
  disabled,
  loading,
  label,
}: {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
  label: string;
}) {
  const pressed = useSharedValue(0);
  const mounted = useSharedValue(0);

  useEffect(() => {
    mounted.value = withDelay(280, withSpring(1, SPRING));
  }, [mounted]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(mounted.value, [0, 1], [0, disabled ? 0.7 : 1]),
    transform: [
      { translateY: interpolate(mounted.value, [0, 1], [8, 0]) },
      { scale: interpolate(pressed.value, [0, 1], [1, 0.96]) },
    ],
  }));

  return (
    <Reanimated.View style={style}>
      <TouchableOpacity
        style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]}
        onPressIn={() => { pressed.value = withTiming(1, { duration: 80 }); }}
        onPressOut={() => { pressed.value = withSpring(0, { damping: 14, stiffness: 200 }); }}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>{label}</Text>
        )}
      </TouchableOpacity>
    </Reanimated.View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const cardProgress = useSharedValue(0);
  const secondaryProgress = useSharedValue(0);

  useEffect(() => {
    cardProgress.value = withDelay(60, withSpring(1, { damping: 22, stiffness: 200, mass: 0.9 }));
    secondaryProgress.value = withDelay(320, withSpring(1, SPRING));
  }, [cardProgress, secondaryProgress]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardProgress.value,
    transform: [{ translateY: interpolate(cardProgress.value, [0, 1], [32, 0]) }],
  }));

  const secondaryStyle = useAnimatedStyle(() => ({
    opacity: secondaryProgress.value,
    transform: [{ translateY: interpolate(secondaryProgress.value, [0, 1], [10, 0]) }],
  }));

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      await setAuth(res.data.token, res.data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login failed', err?.message || 'Please try again.');
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
          title="Welcome back"
          subtitle="Log in to continue"
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Reanimated.View style={[styles.card, cardStyle]}>
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

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 8 characters"
              placeholderTextColor={THEME.sub}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <AnimatedButton
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
              label="Log in"
            />
          </Reanimated.View>

          <Reanimated.View style={secondaryStyle}>
            <TouchableOpacity
              style={styles.secondaryRow}
              onPress={() => router.push('/auth/register')}
            >
              <Ionicons name="person-add-outline" size={16} color={THEME.accentDark} />
              <Text style={styles.secondaryText}>Create an account</Text>
            </TouchableOpacity>
          </Reanimated.View>
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
  label: { fontSize: 12, color: THEME.sub, marginTop: 12 },
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
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  secondaryText: { color: THEME.accentDark, fontWeight: '600' },
});
