import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SavedPromosProvider } from '@/data/savedPromosContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
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
          <Stack.Screen
            name="quiz/index"
            options={{
              headerTitle: 'Study vibe',
              // native-stack doesn’t support headerBackTitleVisible; use this instead
              headerBackButtonDisplayMode: 'minimal',
            }}
          />

          {/* New study session */}
          <Stack.Screen
            name="session/new"
            options={{
              headerTitle: 'New session',
              headerBackButtonDisplayMode: 'minimal',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SavedPromosProvider>
    
  );
}

