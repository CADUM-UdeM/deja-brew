import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import AppHeader from '../../components/AppHeader';
import { THEME } from '../../data/THEME';
import AllSessionsScreen from '@/components/allSessionsScreen';
import MySessionsScreen from '@/components/mySessionsScreen';

const routes = [
  { key: 'sessions', title: 'Sessions' },
  { key: 'mine', title: 'Mes sessions' },
];

const renderScene = SceneMap({
  sessions: AllSessionsScreen,
  mine: MySessionsScreen,
});

const renderTabBar = (props: any) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: THEME.accentDark, height: 3 }}
    activeColor={THEME.accentDark}
    inactiveColor={THEME.sub}
    style={{
      backgroundColor: THEME.bg,
      elevation: 0,
      shadowOpacity: 0,
    }}
  />
);

export default function SessionsFeedScreen() {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

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

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
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
});
