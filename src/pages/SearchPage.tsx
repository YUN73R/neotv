import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TextInput, Keyboard } from 'react-native'

import { MaterialIcons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import FocusableView from '../layouts/FocusableView'

interface SearchPageProps {
    onBack: () => void
    onNavigate: (route: string, params?: any) => void
}


const SearchPage: React.FC<SearchPageProps> = ({ onBack, onNavigate }) => {
    const { theme, themeMode } = useTheme()
    const [searchText, setSearchText] = useState('')

    const [keyboardStatus, setKeyboardStatus] = useState('Keyboard Hidden')

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardStatus('Keyboard Shown')
        })
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardStatus('Keyboard Hidden')
        })

        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [])
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.searchArea, { backgroundColor: theme.headerBg }]}>
                <FocusableView style={[styles.searchInputContainer, { backgroundColor: theme.headerBg }]}>
                    <TextInput keyboardType="default" autoFocus inputMode="text" style={[styles.searchInput, { color: theme.text }]}
                        placeholder="按剧名搜索"
                        placeholderTextColor={theme.textSecondary}
                        value={searchText}
                        focusable={false}
                        onChangeText={setSearchText}
                    />
                </FocusableView>
                <View style={styles.keyboard}>
                    {/* <MaterialIcons name="keyboard" size={24} color={theme.text} /> */}
                </View>
            </View>
            <View style={styles.resultArea}>
                <Text style={{ color: theme.textSecondary }}>搜索功能开发中...🤣</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: '100%',
    },
    searchArea: {
        width: '30%',
        height: '100%',
        flexDirection: 'column',
        padding: 10
    },
    searchInputContainer: {
        width: '100%',
        height: 30,
        paddingHorizontal: 10,
        borderRadius: 5,
        overflow: 'hidden',
        outlineColor: 'transparent'
    },
    searchInput: {
        width: '100%',
        height: '100%',
        padding: 0,
        fontSize: 14,
        borderRadius: 5,
        backgroundColor: 'transparent',
        overflow: 'hidden'
    },
    keyboard: {
        width: 30,
        height: 30,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    resultArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
    }
})

export default SearchPage
