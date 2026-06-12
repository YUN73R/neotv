import React, { useState, useEffect } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, Image, ToastAndroid } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { BOX_SHADOW, useTheme } from '../context/ThemeContext'
import { storage } from '../utils/storage'
import { FavoriteItem } from '../types/navigation'
import FocusableView from '../layouts/FocusableView'
import { PLACEHOLDER_IMAGE } from '../config/config'


interface FavoritesPageProps {
    onBack: () => void
    onNavigate: (route: string, params?: any) => void
}

const STORAGE_KEY = 'aifreetvapp_favorites'

const FavoritesPage: React.FC<FavoritesPageProps> = ({ onBack, onNavigate }) => {
    const isTV = Platform.isTV || Platform.OS === 'ios' || Platform.OS === 'android'
    const { theme, themeMode } = useTheme()
    const [favorites, setFavorites] = useState<FavoriteItem[]>([])

    useEffect(() => {
        loadFavorites()
    }, [])

    const loadFavorites = async () => {
        try {
            const stored = await storage.getItem(STORAGE_KEY)
            if (stored) {
                const items = JSON.parse(stored)
                if (Array.isArray(items)) {
                    const validItems = items.filter(item => item && item.id && item.title)
                    setFavorites(validItems)
                    ToastAndroid?.show?.('长按卡片可删除', ToastAndroid.LONG)
                } else {
                    setFavorites([])
                }
            }
        } catch (error) {
            console.error('Failed to load favorites:', error)
            setFavorites([])
        }
    }

    const handleItemPress = (item: FavoriteItem) => {
        if (!item) return
        if (item.movie) {
            onNavigate('Detail', { movie: item.movie })
        } else {
            const movie = {
                id: item.id,
                title: item.title,
                cover_url: item.cover_url || '',
                pic: { normal: item.cover_url || '' },
                rating: item.rating
            }
            onNavigate('Detail', { movie })
        }
    }
    
    const clearFavorites = async () => {
        try {
            await storage.removeItem(STORAGE_KEY)
            setFavorites([])
        } catch (error) {
            console.error('Failed to clear favorites:', error)
        }
    }

    const removeItem = async (id: string) => {
        try {
            const newFavorites = favorites.filter(item => item.id !== id)
            await storage.setItem(STORAGE_KEY, JSON.stringify(newFavorites))
            setFavorites(newFavorites)
        } catch (error) {
            console.error('Failed to remove favorite:', error)
        }
    }

    const formatFavoriteTime = (timestamp: number) => {
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${year}年${month}月${day}日`
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                {
                    isTV ? '' :
                        <FocusableView
                            style={[styles.backButton, { backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
                            onPress={onBack}
                        >
                            <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                        </FocusableView>
                }
                <Text style={[styles.title, { color: theme.text }]}>我的收藏</Text>
                {favorites.length > 0 ? (
                    <FocusableView
                        style={styles.clearButton}
                        onPress={clearFavorites}
                    >
                        <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>清空</Text>
                    </FocusableView>
                ) : (
                    <View style={styles.headerRight} />
                )}
            </View>

            <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                {favorites.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="favorite-border" size={60} color={theme.textSecondary} />
                        <Text style={[styles.placeholder, { color: theme.textSecondary }]}>
                            暂无收藏
                        </Text>
                    </View>
                ) : (
                    <View style={styles.favoritesGrid}>
                        {favorites.map((item, index) => {
                            if (!item || !item.id || !item.title) return null
                            const coverUrl = item.cover_url || ''
                            const title = item.title || ''
                            const timestamp = item.favoriteTime || 0
                            return (
                                <View key={item.id} style={[styles.cardWrapper, { flexBasis: isTV ? 100 : 140 }]}>
                                    <FocusableView
                                        style={[styles.favoriteCard, { backgroundColor: theme.card }]}
                                        onPress={() => handleItemPress(item)} onLongPress={() => removeItem(item.id)}
                                        ferredFocus={index === 0}
                                    >
                                        <View style={styles.cardCoverWrapper}>
                                            <Image
                                                defaultSource={{
                                                    uri: PLACEHOLDER_IMAGE,
                                                }}
                                                source={{ uri: coverUrl?.replace(/img\d+/, 'img1'), headers: { 'Referrer': 'https://m.douban.com/', } }}
                                                style={styles.cardCover}
                                                resizeMode="cover"
                                                crossOrigin="anonymous"
                                            />
                                            {!coverUrl && (
                                                <View style={styles.coverPlaceholder}>
                                                    <MaterialIcons name="image" size={20} color={theme.textTertiary} />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.cardInfo}>
                                            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                                {title || '未知'}
                                            </Text>
                                            <Text style={[styles.favoriteTime, { color: theme.textTertiary }]}>
                                                {formatFavoriteTime(timestamp)}
                                            </Text>
                                        </View>
                                    </FocusableView>
                                    { !isTV && (
                                        <FocusableView
                                        style={styles.deleteButton}
                                        onPress={() => removeItem(item.id)}
                                        >
                                            <MaterialIcons name="close" size={16} color="#fff" />
                                        </FocusableView>
                                    ) }
                                    
                                </View>
                            )
                        })}
                        { Array.from({ length: 10 }).map((_, index) => 
                            <View key={index} style={{ flex: 1, height: 0, flexBasis: isTV ? 100 : 140 }} />
                        ) }
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        width: 26,
        height: 26,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    clearButton: {
        paddingHorizontal: 16,
        paddingVertical: 2,
        borderRadius: 20,
    },
    clearButtonText: {
        fontSize: 14,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        paddingTop: 100,
    },
    placeholder: {
        fontSize: 14,
    },
    favoritesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    cardWrapper: {
        flex: 1,
        flexBasis: 140,
        position: 'relative',
    },
    favoriteCard: {
        borderRadius: 5,
        borderWidth: 0,
        overflow: 'hidden',
        boxShadow: BOX_SHADOW,
    },
    cardCoverWrapper: {
        width: '100%',
        aspectRatio: 12 / 16,
        position: 'relative',
        backgroundColor: '#1a1a1a',
    },
    cardCover: {
        width: '100%',
        height: '100%',
    },
    coverPlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
    },
    cardInfo: {
        padding: 8,
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
        marginBottom: 4,
    },
    favoriteTime: {
        fontSize: 10,
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default FavoritesPage
