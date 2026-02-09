import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LikedPromosProvider } from '@/data/likedPromosContext';
import { SavedPromosProvider } from '@/data/savedPromosContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LikedPromosProvider>
      <SavedPromosProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            {/* Bottom tabs */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Place details (kept as modal) */}
            <Stack.Screen
              name="place/index"
              options={{ presentation: 'modal', headerShown: false }}
            />

            {/* Quiz flow */}
            <Stack.Screen name="quiz/index" options={{ headerShown: false }} />

            {/* New study session */}
            <Stack.Screen name="session/new" options={{ headerShown: false }} />

            {/* Notifications */}
            <Stack.Screen
              name="notifications"
              options={{ presentation: 'pageSheet', headerShown: false }}
            />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </SavedPromosProvider>
    </LikedPromosProvider>
  );
}
