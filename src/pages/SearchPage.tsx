import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TextInput } from 'react-native'

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
    return (
        <View style={styles.container}>
            <View style={styles.searchArea}>
                <TextInput style={[styles.searchInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                    placeholder="按剧名搜索"
                    placeholderTextColor={theme.textSecondary}
                    value={searchText}
                    focusable={false}
                    onChangeText={setSearchText}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    searchArea: {
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 15,
        fontSize: 14,
    },
})

export default SearchPage
