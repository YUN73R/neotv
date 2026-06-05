import React, { useRef, useCallback, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../types/navigation'
import { useTheme } from '../context/ThemeContext'
import { BackHandler, ToastAndroid } from 'react-native'
import HomePage from '../pages/HomePage'
import DetailPage from '../pages/DetailPage'
import LivePage from '../pages/LivePage'
import SettingsPage from '../pages/SettingsPage'
import HistoryPage from '../pages/HistoryPage'
import FavoritesPage from '../pages/FavoritesPage'
import SearchPage from '../pages/SearchPage'
import RecommendPage from '../pages/RecommendPage'



const Stack = createNativeStackNavigator<RootStackParamList>()

const Navigation: React.FC = () => {
    const { theme } = useTheme()
    const navigationRef = useRef<any>(null)
    const lastBackPressed = useRef<number>(0)

    const handleNavigate = useCallback((route: string, params?: any) => {
        navigationRef.current?.navigate(route as keyof RootStackParamList, params)
    }, [])

    const handleGoBack = useCallback(() => {
        navigationRef.current?.goBack()
    }, [])

    const onBackPress = useCallback(() => {
        // 检查当前是否在首页
        const navState = navigationRef.current?.getRootState()
        if (!navState) {
            return false
        }

        const currentRoute = navState.routes[navState.index]
        if (currentRoute?.name === 'Home') {
            const now = Date.now()
            if (now - lastBackPressed.current < 2000) {
                // 2秒内再次按返回键，退出应用
                BackHandler.exitApp()
                return true
            }
            // 提示用户再按一次退出
            ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT)
            lastBackPressed.current = now
            return true
        }
        // 不在首页，让导航处理返回
        return false
    }, [])

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () => backHandler.remove()
    }, [onBackPress])

    return (
        <NavigationContainer ref={navigationRef}>
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
                    name="Live"
                    options={{ headerShown: false }}
                >
                    {() => <LivePage onBack={handleGoBack} />}
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
                <Stack.Screen
                    name="Recommend"
                    options={{ headerShown: false }}
                >
                    {() => <RecommendPage onBack={handleGoBack} onNavigate={handleNavigate} />}
                </Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navigation
