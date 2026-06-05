import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Platform, Pressable, Animated  } from 'react-native'
import { useTheme, PRIMARY_COLOR_HEX } from '../context/ThemeContext'

interface FocusableViewProps {
    children: React.ReactNode
    style?: any
    onPress?: () => void
    onLongPress?: () => void
    onFocus?: () => void
    onBlur?: () => void
    disabled?: boolean
    focusBorderColor?: string
    ferredFocus?: boolean
    backgroundColor?: string
}
export const FOCUS_BORDER_WIDTH = 2
export const FOCUS_GLOW_OFFSET = 0
const FocusableView: React.FC<FocusableViewProps> = ({
    children,
    style,
    onPress,
    onLongPress,
    onFocus,
    onBlur,
    ferredFocus,
    disabled = false,
    focusBorderColor,
    backgroundColor,
}) => {
    
    const { theme } = useTheme()
    const [isFocused, setIsFocused] = useState(false)

    const borderAnim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.timing(borderAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            delay: 0,
            useNativeDriver: true,
        }).start()
    }, [isFocused, borderAnim])
    const handleFocus = () => {
        setIsFocused(true)
        onFocus?.()
    }

    const handleBlur = () => {
        setIsFocused(false)
        onBlur?.()
    }

    const isTV = Platform.OS === 'android' || Platform.OS === 'ios'
    const borderColor = focusBorderColor || PRIMARY_COLOR_HEX
    const borderRadius = Array.isArray(style) ? (style as any)?.[0]?.borderRadius : (style as any)?.borderRadius

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            hasTVPreferredFocus={ferredFocus}
            style={[
                styles.baseStyle,
                style,
            ]}
        >
            {/* 外发光边框层 - 绝对定位，不影响布局 */}
            {isFocused && isTV && (
                <Animated.View
                    style={[
                        styles.glowBorder,
                        {
                            borderColor,
                            borderRadius,
                            backgroundColor,
                            opacity: borderAnim,
                        },
                    ]}
                ></Animated.View>
            )}
            {children}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    baseStyle: {
        position: 'relative',
    },
    glowBorder: {
        position: 'absolute',
        zIndex: 1,
        borderStyle: 'solid',
        borderWidth: FOCUS_BORDER_WIDTH,
        inset: FOCUS_GLOW_OFFSET,
    },
})

export default FocusableView
