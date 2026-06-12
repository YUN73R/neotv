import React, { useState, useEffect } from 'react'
import { Platform, View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import { useTheme, SECONDARY_COLOR } from '../context/ThemeContext'
import Toast from '../components/Toast'
import { storage } from '../utils/storage'
import { doubanApi } from '../utils/api'
import { getMovieDetail, MovieSource } from '../services/movieService'
import { MovieItem, HistoryItem, FavoriteItem } from '../types/navigation'
import VideoPlayer from '../components/VideoPlayer'
import FocusableView from '../layouts/FocusableView'
import { PLACEHOLDER_IMAGE_TV } from '../config/config'

interface DetailPageProps {
    onBack: () => void
    movie?: MovieItem
}

interface DetailData {
    id: string
    title: string
    type: string
    rating: number
    description: string
    coverUrl: string
    year?: string
    duration?: string
    director?: string
    actors?: string[]
}

interface Episode {
    name: string
    url: string
}

const STORAGE_KEY = 'aifreetvapp_favorites'
const HISTORY_STORAGE_KEY = 'aifreetvapp_history'

const DetailPage: React.FC<DetailPageProps> = ({ onBack, movie }) => {
    const isTV = Platform.isTV || Platform.OS === 'ios' || Platform.OS === 'android'
    const { theme, themeMode } = useTheme()
    const [isFavorite, setIsFavorite] = useState(false)
    const [toastVisible, setToastVisible] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingSources, setLoadingSources] = useState(true)
    const [detailData, setDetailData] = useState<DetailData>({
        id: movie?.id || '1',
        title: movie?.title || '加载中...',
        type: '',
        rating: 0,
        description: '',
        coverUrl: movie?.pic?.normal || movie?.cover_url || '',
    })
    const [sources, setSources] = useState<MovieSource[]>([])
    const [activeSourceIndex, setActiveSourceIndex] = useState(0)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0)
    const [currentPlayUrl, setCurrentPlayUrl] = useState('')
    const iconButtonBg = themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
    // 全屏状态
    const [fullscreen, setFullscreen] = useState(false)
    useEffect(() => {
        if (movie) {
            fetchDetailData(movie.id)
        }
    }, [movie])

    useEffect(() => {
        checkFavorite()
    }, [detailData.id])

    const fetchDetailData = async (id: string) => {
        setLoading(true)
        try {
            const response = await doubanApi.getMovieDetail(id)
            if (response.data) {
                const data = response.data
                setDetailData({
                    id: data.id?.toString() || id,
                    title: data.title || movie?.title,
                    type: (data.genres || []).join('/'),
                    rating: data.rating?.value || movie?.rating || 0,
                    description: data.intro,
                    coverUrl: data.pic?.normal || data.cover_url || movie?.pic?.normal || movie?.cover_url || '',
                    year: data.year,
                    duration: data.durations?.[0],
                    director: data.directors?.[0]?.name,
                    actors: (data.casts || []).slice(0, 4).map((cast: any) => cast.name),
                })
            }
            // 豆瓣详情加载完就关闭 loading，让用户先看到内容
            setLoading(false)
            setLoadingSources(true)
            // 异步加载播放源，不阻塞 UI
            const result = await getMovieDetail(id, movie?.title || '')
            if (result?.sources?.length > 0) {
                const validSources = result.sources.filter(s => s.success && s.data && s.data.length > 0)
                setSources(validSources)
                if (validSources.length > 0) {
                    setActiveSourceIndex(0)
                    parseEpisodes(validSources[0])
                }
            }
            setLoadingSources(false)
            // 添加到历史记录
            addToHistory()
        } catch (error) {
            console.error('Failed to fetch movie detail:', error)
            setLoading(false)
            setLoadingSources(false)
        }
    }

    const addToHistory = async () => {
        try {
            // 确保我们有完整的数据后再添加
            if (!detailData.id || !detailData.title) {
                return
            }

            const historyItem: HistoryItem = {
                id: detailData.id,
                title: detailData.title,
                cover_url: detailData.coverUrl || '',
                rating: detailData.rating || 0,
                timestamp: Date.now(),
                movie: {
                    id: detailData.id,
                    title: detailData.title,
                    pic: { normal: detailData.coverUrl || '' },
                    cover_url: detailData.coverUrl || '',
                    rating: detailData.rating || 0,
                }
            }

            const stored = await storage.getItem(HISTORY_STORAGE_KEY)
            let history: HistoryItem[] = []

            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    if (Array.isArray(parsed)) {
                        history = parsed
                    }
                } catch (e) {
                    console.error('Failed to parse history:', e)
                }
            }

            // 移除已存在的相同记录
            history = history.filter(item => item && item.id !== historyItem.id)

            // 添加到最前面
            history.unshift(historyItem)

            // 最多保存100条记录
            if (history.length > 100) {
                history = history.slice(0, 100)
            }

            await storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
            console.log('Added to history:', historyItem)
        } catch (error) {
            console.error('Failed to add to history:', error)
        }
    }

    const parseEpisodes = (source: MovieSource) => {
        const eps: Episode[] = []
        if (source.data && source.data.length > 0) {
            source.data.forEach((item: any, index: number) => {
                if (typeof item === 'object' && item.name && item.url) {
                    eps.push({ name: item.name, url: item.url })
                } else if (typeof item === 'string') {
                    eps.push({ name: `第${index + 1}集`, url: item })
                }
            })
        }
        console.log('Parsed episodes:', eps)
        setEpisodes(eps)
        setActiveEpisodeIndex(0)
        if (eps.length > 0) {
            setCurrentPlayUrl(eps[0].url)
        }
    }

    const handleSourceChange = (index: number) => {
        setActiveSourceIndex(index)
        if (sources[index]) {
            parseEpisodes(sources[index])
        }
    }

    const handleEpisodeSelect = (index: number) => {
        setActiveEpisodeIndex(index)
        if (episodes[index]) {
            setCurrentPlayUrl(episodes[index].url)
        }
    }

    const checkFavorite = async () => {
        try {
            const favorites = await storage.getItem(STORAGE_KEY)
            if (favorites) {
                const favoriteList: FavoriteItem[] = JSON.parse(favorites)
                setIsFavorite(favoriteList.some(item => item.id === detailData.id))
            }
        } catch (error) {
            console.error('Failed to check favorite:', error)
        }
    }

    const showToast = (message: string) => {
        setToastMessage(message)
        setToastVisible(true)
    }

    const handleFavorite = async () => {
        try {
            const favorites = await storage.getItem(STORAGE_KEY)
            let favoriteList: FavoriteItem[] = favorites ? JSON.parse(favorites) : []

            if (isFavorite) {
                favoriteList = favoriteList.filter(item => item.id !== detailData.id)
                setIsFavorite(false)
                showToast('已取消收藏')
            } else {
                const favoriteItem: FavoriteItem = {
                    id: detailData.id,
                    title: detailData.title,
                    cover_url: detailData.coverUrl || '',
                    rating: detailData.rating || 0,
                    favoriteTime: Date.now(),
                    movie: {
                        id: detailData.id,
                        title: detailData.title,
                        pic: { normal: detailData.coverUrl || '' },
                        cover_url: detailData.coverUrl || '',
                        rating: detailData.rating || 0,
                    }
                }
                favoriteList.push(favoriteItem)
                setIsFavorite(true)
                showToast('收藏成功')
            }

            await storage.setItem(STORAGE_KEY, JSON.stringify(favoriteList))
        } catch (error) {
            console.error('Failed to save favorite:', error)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {isTV ? '' : <View style={styles.header}>
                <FocusableView
                    style={[styles.backButton, { backgroundColor: iconButtonBg }]}
                    onPress={onBack}
                >
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </FocusableView>
            </View>}
            <Toast
                visible={toastVisible}
                message={toastMessage}
                onClose={() => setToastVisible(false)}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.accent} />
                    <Text style={{ color: theme.textSecondary, marginTop: 12 }}>正在加载详情...</Text>
                </View>
            ) : (
                <ScrollView style={[styles.content, { backgroundColor: theme.background, marginTop: isTV ? 0 : 38 }]} showsVerticalScrollIndicator={false}>
                    <View style={styles.topSection}>
                        <View style={styles.videoContainer}>
                            {currentPlayUrl ? (
                                <VideoPlayer
                                    key={currentPlayUrl}
                                    uri={currentPlayUrl}
                                    poster={detailData.coverUrl}
                                    isFullScreen={fullscreen}
                                    toggleFullscreen={() => setFullscreen(false)}
                                />
                            ) :
                                loadingSources ?
                                    <>
                                        <Image
                                            defaultSource={{
                                                uri: PLACEHOLDER_IMAGE_TV,
                                            }}
                                            source={{ uri: detailData.coverUrl?.replace(/img\d+/, 'img1'), headers: { 'Referrer': 'https://m.douban.com/', } }}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                            crossOrigin="anonymous"
                                        />
                                        <FocusableView style={styles.videoPlaceholder}>
                                            <Feather name="play" size={32} color={theme.white} />
                                        </FocusableView>
                                    </>
                                    : (
                                        <>
                                            <Image
                                                defaultSource={{
                                                    uri: PLACEHOLDER_IMAGE_TV,
                                                }}
                                                source={{ uri: detailData.coverUrl, headers: { 'Referrer': 'https://m.douban.com/', } }}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="cover"
                                                crossOrigin="anonymous"
                                            />
                                            <View style={styles.videoPlaceholder}>
                                                <Feather name="frown" size={32} color={theme.white} />
                                                <Text style={styles.placeholderText}>暂无播放源</Text>
                                            </View>
                                        </>
                                    )}
                        </View>

                        <View style={styles.infoContainer}>
                            <View style={styles.titleRow}>
                                <Text style={[styles.title, { color: theme.text }]}>{detailData.title}</Text>
                                {detailData.rating > 0 && (
                                    <View style={styles.ratingBadge}>
                                        <Text style={styles.ratingText}>{detailData.rating}</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={[styles.type, { color: theme.textSecondary }]}>
                                {detailData.type}
                                {detailData.year && ` · ${detailData.year}`}
                                {detailData.duration && ` · ${detailData.duration}`}
                            </Text>

                            <Text numberOfLines={4} ellipsizeMode="tail" style={[styles.description, { color: theme.textSecondary }]}>
                                {detailData.description || '暂无简介'}
                            </Text>

                            <View style={styles.actionButtons}>
                                <FocusableView
                                    style={[
                                        styles.actionButton,
                                        { borderColor: theme.accent, },
                                        isFavorite
                                            ? { backgroundColor: theme.accent }
                                            : {}
                                    ]}
                                    focusBorderRadius={2}
                                    onPress={handleFavorite}
                                >
                                    <Feather name="heart" size={16} color={isFavorite ? 'white' : theme.accent} />
                                    <Text style={[styles.actionButtonText, isFavorite ? { color: 'white' } : { color: theme.accent }]}>收藏</Text>
                                </FocusableView>
                                <FocusableView
                                    style={[styles.actionButton, { borderColor: theme.accent, }]}
                                    onPress={() => setFullscreen(!fullscreen)}
                                >
                                    <MaterialIcons name="fullscreen" size={16} color={theme.accent} />
                                    <Text style={[styles.actionButtonText, { color: theme.accent }]}>全屏</Text>
                                </FocusableView>
                            </View>
                        </View>
                    </View>
                    {sources.length > 0 ? (
                        <View style={styles.playSection}>
                            <View style={styles.sectionTitleRow}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>播放源</Text>
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sourceTabs}>
                                {sources.map((source, index) => (
                                    <FocusableView
                                        key={source.name}
                                        style={[
                                            styles.sourceTab,
                                            activeSourceIndex === index ? { backgroundColor: theme.accent } : { backgroundColor: theme.card, borderColor: theme.border },
                                        ]}
                                        focusBorderColor={SECONDARY_COLOR}
                                        onPress={() => handleSourceChange(index)}
                                    >
                                        <Text style={[styles.sourceTabText, activeSourceIndex === index ? { color: 'white' } : { color: theme.text }]}>
                                            {source.title}
                                        </Text>
                                    </FocusableView>
                                ))}
                            </ScrollView>

                            <View style={styles.sectionTitleRow}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>集数</Text>
                            </View>

                            <View style={styles.episodesContainer}>
                                {episodes.map((item, index) => (
                                    <FocusableView
                                        key={index}
                                        style={[
                                            styles.episodeButton,
                                            activeEpisodeIndex === index ? { backgroundColor: theme.accent } : { backgroundColor: theme.card, borderColor: theme.border },
                                        ]}
                                        focusBorderColor={SECONDARY_COLOR}
                                        onPress={() => handleEpisodeSelect(index)}
                                    >
                                        <Text style={[styles.episodeButtonText, activeEpisodeIndex === index ? { color: 'white' } : { color: theme.text }]}>
                                            {item.name}
                                        </Text>
                                    </FocusableView>
                                ))}
                            </View>

                            {currentPlayUrl && (
                                <View style={styles.playInfo}>
                                    <Text style={[styles.playInfoText, { color: theme.textSecondary }]}>
                                        当前播放: {episodes[activeEpisodeIndex]?.name}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : loadingSources ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.accent} />
                            <Text style={{ color: theme.textSecondary, marginTop: 12 }}>正在获取播放源...</Text>
                        </View>
                    ) : ''
                    }
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'transparent',
        zIndex: 100,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 10,
    },
    headerIconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 38,
    },
    content: {
        flex: 1,
    },
    topSection: {
        flexDirection: 'row',
        padding: 15,
        gap: 15,
    },
    videoContainer: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 50,
        aspectRatio: 16 / 9,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    videoImage: {
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: 'white',
        fontSize: 14,
        marginTop: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    type: {
        fontSize: 14,
    },
    ratingBadge: {
        width: 28,
        height: 28,
        borderRadius: 20,
        backgroundColor: '#E53935',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    ratingText: {
        fontSize: 14,
        color: 'white',
    },
    description: {
        fontSize: 12,
        lineHeight: 18,
        maxHeight: 80,
        overflow: 'hidden',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
    },
    actionButtonText: {
        fontSize: 12,
    },
    moreSection: {
        padding: 15,
        paddingTop: 0,
    },
    playSection: {
        padding: 15,
        paddingTop: 0,
    },
    sectionTitleRow: {
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sourceTabs: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    sourceTab: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        marginRight: 10,
    },
    sourceTabText: {
        fontSize: 14,
    },
    episodesContainer: {
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    episodeButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        marginBottom: 8,
        marginRight: 8,
    },
    episodeButtonText: {
        fontSize: 12,
    },
    playInfo: {
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
    },
    playInfoText: {
        fontSize: 14,
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        flexShrink: 0,
    },
    infoValue: {
        fontSize: 14,
    },
    noSourceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default DetailPage
