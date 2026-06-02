import React, { useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import HomePage from '../pages/HomePage';
import DetailPage from '../pages/DetailPage';
import TVLivePage from '../pages/TVLivePage';
import SettingsPage from '../pages/SettingsPage';
import HistoryPage from '../pages/HistoryPage';
import FavoritesPage from '../pages/FavoritesPage';
import SearchPage from '../pages/SearchPage';


const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  const { theme } = useTheme();
  const [navigationRef, setNavigationRef] = useState<any>(null);

  const handleNavigate = useCallback((route: string, params?: any) => {
    navigationRef?.navigate(route as keyof RootStackParamList, params);
  }, [navigationRef]);

  const handleGoBack = useCallback(() => {
    navigationRef?.goBack();
  }, [navigationRef]);

  return (
    <NavigationContainer ref={(ref) => setNavigationRef(ref)}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.backgroundSecondary },
          headerTintColor: theme.text,
          headerTitleStyle: { fontSize: 20 },
        }}
      >
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }}
        >
          {() => <HomePage onNavigate={handleNavigate} />}
        </Stack.Screen>
        <Stack.Screen
          name="Detail"
          options={{ headerShown: false }}
        >
          {({ route }) => <DetailPage onBack={handleGoBack} movie={route.params?.movie} />}
        </Stack.Screen>
        <Stack.Screen
          name="TVLive"
          options={{ headerShown: false }}
        >
          {() => <TVLivePage onBack={handleGoBack} />}
        </Stack.Screen>
        <Stack.Screen
          name="Settings"
          options={{ headerShown: false }}
        >
          {() => <SettingsPage onBack={handleGoBack} />}
        </Stack.Screen>
        <Stack.Screen
          name="History"
          options={{ headerShown: false }}
        >
          {() => <HistoryPage onBack={handleGoBack} onNavigate={handleNavigate} />}
        </Stack.Screen>
        <Stack.Screen
          name="Favorites"
          options={{ headerShown: false }}
        >
          {() => <FavoritesPage onBack={handleGoBack} onNavigate={handleNavigate} />}
        </Stack.Screen>
        <Stack.Screen
          name="Search"
          options={{ headerShown: false }}
        >
          {() => <SearchPage onBack={handleGoBack} onNavigate={handleNavigate} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
