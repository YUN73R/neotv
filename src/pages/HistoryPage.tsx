import React, { useState, useEffect } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, Image, ToastAndroid } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useTheme, BOX_SHADOW } from '../context/ThemeContext'
import { storage } from '../utils/storage'
import { HistoryItem } from '../types/navigation'
import FocusableView from '../layouts/FocusableView'
import { PLACEHOLDER_IMAGE } from '../config/config'

interface HistoryPageProps {
    onBack: () => void
    onNavigate: (route: string, params?: any) => void
}

const STORAGE_KEY = 'aifreetvapp_history'

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, onNavigate }) => {
    const isTV = Platform.isTV || Platform.OS === 'ios' || Platform.OS === 'android'
    const { theme, themeMode } = useTheme()
    const [history, setHistory] = useState<HistoryItem[]>([])

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        try {
            const stored = await storage.getItem(STORAGE_KEY)
            if (stored) {
                const items = JSON.parse(stored)
                // 确保items是数组
                if (Array.isArray(items)) {
                    // 清理无效数据
                    const validItems = items.filter(item => item && item.id && item.title)
                    setHistory(validItems)
                    ToastAndroid?.show?.('长按卡片可删除', ToastAndroid.LONG)
                } else {
                    setHistory([])
                }
            }
        } catch (error) {
            console.error('Failed to load history:', error)
            setHistory([])
        }
    }

    const handleItemPress = (item: HistoryItem) => {
        if (!item) return
        if (item.movie) {
            onNavigate('Detail', { movie: item.movie })
        } else {
            // 兼容旧数据格式
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

    const clearHistory = async () => {
        try {
            await storage.removeItem(STORAGE_KEY)
            setHistory([])
        } catch (error) {
            console.error('Failed to clear history:', error)
        }
    }

    const removeItem = async (index: number) => {
        try {
            const newHistory = [...history]
            newHistory.splice(index, 1)
            await storage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
            setHistory(newHistory)
        } catch (error) {
            console.error('Failed to remove history item:', error)
        }
    }

    const formatTime = (ts: number) => {
        const date = new Date(ts)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(minutes / 60)

        if (minutes < 10) {
            return '刚刚'           // 10分钟内
        } else if (minutes < 60) {
            return minutes + '分钟前'  // 10-60分钟
        } else if (hours < 5) {
            return hours + '小时前'    // 1-5小时
        } else {
            return date.toLocaleString()        // 超过5小时显示具体时间
        }
    }
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                {!isTV && (<FocusableView
                    style={[styles.backButton, { backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
                    onPress={onBack}
                >
                    <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                </FocusableView>
                )}
                <Text style={[styles.title, { color: theme.text }]}>历史记录</Text>
                {history.length > 0 ? (
                    <FocusableView
                        style={styles.clearButton}
                        onPress={clearHistory}
                    >
                        <Text style={[styles.clearButtonText, { color: theme.text }]}>清空</Text>
                    </FocusableView>
                ) : (
                    <View style={styles.headerRight} />
                )}
            </View>
            <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                {history.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="history" size={60} color={theme.textSecondary} />
                        <Text style={[styles.placeholder, { color: theme.textSecondary }]}>
                            暂无历史记录
                        </Text>
                    </View>
                ) : (
                    <View style={styles.historyGrid}>
                        {history.map((item, index) => {
                            if (!item || !item.id || !item.title) return null
                            const coverUrl = item.cover_url || ''
                            const title = item.title || ''
                            const timestamp = item.timestamp || 0
                            return (
                                <View key={item.id} style={[styles.cardWrapper, { flexBasis: isTV ? 100 : 140 }]}>
                                    <FocusableView
                                        style={[styles.historyCard, { backgroundColor: theme.card }]}
                                        onPress={() => handleItemPress(item)} onLongPress={() => removeItem(index)}
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
                                            <Text style={[styles.timeText, { color: theme.textTertiary }]}>
                                                {formatTime(timestamp)}
                                            </Text>
                                        </View>
                                    </FocusableView>
                                    {!isTV && (
                                        <FocusableView
                                            style={styles.deleteButton}
                                            onPress={() => removeItem(index)}
                                        >
                                            <MaterialIcons name="close" size={16} color="#fff" />
                                        </FocusableView>
                                    )}
                                </View>
                            )
                        })}
                        {Array.from({ length: 10 }).map((_, index) =>
                            <View key={index} style={{ flex: 1, height: 0, flexBasis: isTV ? 100 : 140 }} />
                        )}
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
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
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
    historyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    cardWrapper: {
        flex: 1,
        flexBasis: 140,
        position: 'relative',
    },
    historyCard: {
        borderRadius: 5,
        borderWidth: 0,
        overflow: 'hidden',
        boxShadow: BOX_SHADOW,
    },
    cardCoverWrapper: {
        width: '100%',
        aspectRatio: 3 / 4,
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
        padding: 6,
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 14,
        marginBottom: 2,
    },
    timeText: {
        fontSize: 9,
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

export default HistoryPage
