import { useRef, useEffect, useState, use } from 'react'
import { View, Image, StyleSheet, Animated, useAnimatedValue } from 'react-native'
import { useTheme } from '../context/ThemeContext'


export default function SplashScreen(): React.ReactNode {
    const { theme } = useTheme()
    const [show, setShow] = useState(true)
    const fadeAnim = useAnimatedValue(1)
    const findOut = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            delay: 0,
            useNativeDriver: true,
        }).start()
    }
    useEffect(() => {
        setTimeout(() => {
            findOut()
        }, 2000)
    }, [])
    return (
        <Animated.View style={[styles.loadingContainer, { backgroundColor: theme.accent, opacity: fadeAnim }]}>
            <Image resizeMode="cover" source={require('../assets/images/start.png')} style={styles.loadingImage} />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        opacity: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
    },
    loadingImage: {
        width: '100%',
        height: '100%',
    },
})
