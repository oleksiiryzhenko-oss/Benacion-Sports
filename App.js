import { View, Text, StyleSheet, StatusBar, AppState, Linking } from 'react-native';
import React, { useEffect, useRef } from 'react';

import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Newspaper, Volleyball, Activity, Trophy, LayoutGrid } from 'lucide-react-native';

import { navigationRef, replace } from './navigationRef';
import { AppProvider, useApp } from './src/context/AppContext';
import { initNotifications } from './src/utils/notifeeNotifications';
import { initSdks, trackScreen } from './src/utils/sdkInit';
import colors from './src/utils/colors';

import PreviewScreen from './src/screens/PreviewScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import NewsScreen from './src/screens/NewsScreen';
import SportsScreen from './src/screens/SportsScreen';
import SportDetailScreen from './src/screens/SportDetailScreen';
import LeagueScreen from './src/screens/LeagueScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import TeamDetailScreen from './src/screens/TeamDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import GamesScreen from './src/screens/GamesScreen';
import AddEditGameScreen from './src/screens/AddEditGameScreen';
import LiveGameScreen from './src/screens/LiveGameScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import AddEditTeamScreen from './src/screens/AddEditTeamScreen';
import MyTeamScreen from './src/screens/MyTeamScreen';
import TournamentsScreen from './src/screens/TournamentsScreen';
import AddEditTournamentScreen from './src/screens/AddEditTournamentScreen';
import TournamentDetailScreen from './src/screens/TournamentDetailScreen';
import MoreScreen from './src/screens/MoreScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import StatsScreen from './src/screens/StatsScreen';
import QuizScreen from './src/screens/QuizScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CustomSportsScreen from './src/screens/CustomSportsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  NewsTab: Newspaper,
  SportsTab: Volleyball,
  GamesTab: Activity,
  TournamentsTab: Trophy,
  MoreTab: LayoutGrid,
};

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

const TabNavigator = () => {
  const { liveGames } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const Icon = TAB_ICONS[route.name];
          const iconColor = focused ? colors.primary : colors.textMuted;
          return (
            <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
              <Icon color={iconColor} size={22} />
              {route.name === 'GamesTab' && liveGames.length ? (
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>{liveGames.length}</Text>
                </View>
              ) : null}
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="NewsTab" component={NewsScreen} options={{ tabBarLabel: 'News' }} />
      <Tab.Screen name="SportsTab" component={SportsScreen} options={{ tabBarLabel: 'Sports' }} />
      <Tab.Screen name="GamesTab" component={GamesScreen} options={{ tabBarLabel: 'My Games' }} />
      <Tab.Screen name="TournamentsTab" component={TournamentsScreen} options={{ tabBarLabel: 'Cups' }} />
      <Tab.Screen name="MoreTab" component={MoreScreen} options={{ tabBarLabel: 'More' }} />
    </Tab.Navigator>
  );
};

export default function App() {
  const routeNameRef = useRef(null);

  const getPermission = async () => {
    if (AppState.currentState === 'active') {
      await requestTrackingPermissionsAsync();
      initSdks();
    } else {
      setTimeout(() => getPermission(), 100);
    }
  };

  useEffect(() => {
    getPermission();
  }, []);

  useEffect(() => {
    initNotifications();
  }, []);

  useEffect(() => {
    const handleDeepLink = (url) => {
      if (!url || globalThis.__deeplinkRedirected) return;

      globalThis.__deeplinkRedirected = true;
      replace('Preview');
    };

    Linking.getInitialURL().then(handleDeepLink);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  const onNavigationStateChange = () => {
    const current = navigationRef.getCurrentRoute()?.name;
    if (current && current !== routeNameRef.current) {
      routeNameRef.current = current;
      trackScreen(current);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <AppProvider>
            <NavigationContainer ref={navigationRef} theme={navTheme} onStateChange={onNavigationStateChange}>
              <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
              <Stack.Navigator
                initialRouteName="Preview"
                screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}
              >
                <Stack.Screen name="Preview" component={PreviewScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Home" component={TabNavigator} />
                <Stack.Screen name="SportDetail" component={SportDetailScreen} />
                <Stack.Screen name="League" component={LeagueScreen} />
                <Stack.Screen name="EventDetail" component={EventDetailScreen} />
                <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="AddEditGame" component={AddEditGameScreen} />
                <Stack.Screen name="LiveGame" component={LiveGameScreen} />
                <Stack.Screen name="Teams" component={TeamsScreen} />
                <Stack.Screen name="AddEditTeam" component={AddEditTeamScreen} />
                <Stack.Screen name="MyTeam" component={MyTeamScreen} />
                <Stack.Screen name="AddEditTournament" component={AddEditTournamentScreen} />
                <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
                <Stack.Screen name="Favorites" component={FavoritesScreen} />
                <Stack.Screen name="Stats" component={StatsScreen} />
                <Stack.Screen name="Quiz" component={QuizScreen} />
                <Stack.Screen name="Reminders" component={RemindersScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="CustomSports" component={CustomSportsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </AppProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    position: 'absolute',
    height: 90,
    paddingTop: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 32,
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 210, 63, 0.16)',
  },
  liveBadge: {
    position: 'absolute',
    top: -4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.live,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  liveBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});
