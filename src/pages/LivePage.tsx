import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Platform, View, Text, StyleSheet, ScrollView, Modal, ActivityIndicator, BackHandler, Animated, useTVEventHandler, TVFocusGuideView, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { getLiveStreamList } from '../services/liveService'
import { Category, Channel } from '../utils/channel'
import { storage } from '../utils/storage'
import { useTheme, SECONDARY_COLOR, PRIMARY_COLOR_TRANSPARENT } from '../context/ThemeContext'
import FocusableView from '../layouts/FocusableView'
import LivePlayer from '../components/LivePlayer'
import Toast from '../components/Toast'

interface LivePageProps {
    onBack: () => void
}
const STORAGE_KEY = 'lastLive'
const LivePage: React.FC<LivePageProps> = ({ onBack }) => {
    const { theme } = useTheme()
    const [loading, setLoading] = useState(false)
    const isTV = Platform.isTV || Platform.OS == 'android' || Platform.OS == 'ios'

    const [toastVisible, setToastVisible] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [categories, setCategories] = useState<Category[]>([])
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
    const [channels, setChannels] = useState<Channel[]>([])
    const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
    const [showList, setShowList] = useState(false)

    const fadeAnim = useRef(new Animated.Value(0)).current
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: showList ? 1 : 0,
            duration: 300,
            delay: 0,
            useNativeDriver: true,
        }).start()
    }, [showList, fadeAnim])

    const onBackPress = useCallback(() => {
        if (showList) {
            setShowList(false)
            return true
        } else {
            onBack()
            return true
        }
    }, [showList, onBack])

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () => backHandler.remove()
    }, [onBackPress])

    useEffect(() => {
        loadChannels()
    }, [])
    const loadChannels = async () => {
        try {
            setLoading(true)
            const data = await getLiveStreamList()
            setCategories(data)
            if (data.length > 0 && data[0].channels.length > 0) {
                setChannels(data[0].channels)
            }
            const stored = await storage.getItem(STORAGE_KEY)
            setToastVisible(true)
            if (stored) {
                const lastLive = JSON.parse(stored)
                const category = data.find(category => category.id == lastLive.categoryId)

                if (category) {
                    setCurrentCategory(category)
                    setChannels(category.channels)
                    const channel = category.channels.find(channel => channel.id == lastLive.channelId)
                    if (channel) setCurrentChannel(channel)
                    setToastMessage(channel?.name || '')
                }
            } else {
                setCurrentCategory(data[0])
                setCurrentChannel(data[0].channels[0])
                storage.setItem(STORAGE_KEY, JSON.stringify({ categoryId: data[0]?.id, channelId: data[0].channels[0].id }))
                setToastMessage(data[0].channels[0]?.name || '')
            }
        } catch (error) {
            console.error('加载频道失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const onChangeCategory = (category: Category) => {
        setCurrentCategory(category)
        setChannels(category.channels)
        storage.setItem(STORAGE_KEY, JSON.stringify({ categoryId: category.id, channelId: category.channels[0].id }))
    }
    const onChangeChannel = (index: number) => {
        setCurrentChannel(channels[index])
        setToastVisible(true)
        setToastMessage('切换至 ' + channels[index].name)
        storage.setItem(STORAGE_KEY, JSON.stringify({ channelId: channels[index].id, categoryId: currentCategory?.id }))
    }

    // TV 按键监听
    const lastEventTime = useRef<number>(0)
    const handleKeyDown = (evt: any) => {
        if (showList) return
        const now = Date.now()
        if (now - lastEventTime.current < 200) {
            return
        }
        lastEventTime.current = now
        const index: number = currentCategory?.channels.findIndex(channel => channel.id === currentChannel?.id) || 0
        if (evt.eventType === 'down') { // 下键
            if (index <= (currentCategory?.channels.length as any) - 1) {
                onChangeChannel(index + 1)
            }
        } else if (evt.eventType === 'up') { // 上键
            if (index > 0) onChangeChannel(index - 1)
        }
    }
    if (isTV) useTVEventHandler(handleKeyDown)

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={theme.accent} />
                <Text style={{ color: theme.white, marginTop: 20 }}>加载频道中...</Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LivePlayer uri={currentChannel?.url || ''} onPress={() => setShowList(true)} />
            {showList &&
                <Animated.View style={[styles.channelWrapper, showList ? styles.channelWrapperActive : {}, { opacity: fadeAnim }]}>
                    <View style={styles.channelList}>
                        <ScrollView style={styles.category} showsVerticalScrollIndicator={false}>
                            {categories.map((category, index) => (
                                <FocusableView key={index}
                                    style={[styles.categoryItem, { backgroundColor: category.id === currentCategory?.id ? theme.accent : 'transparent', }]}
                                    onPress={() => onChangeCategory(category)}
                                    ferredFocus={showList && currentCategory?.id == category.id}
                                    focusBorderColor={SECONDARY_COLOR}
                                >
                                    <Text style={{ color: theme.white, fontSize: 14 }}>{category.name}</Text>
                                </FocusableView>
                            ))}
                        </ScrollView>
                        <ScrollView style={styles.channel} showsVerticalScrollIndicator={false}>
                            {channels.map((channel, index) => (
                                <FocusableView key={index}
                                    style={[styles.channelItem, { backgroundColor: currentChannel?.id === channel.id ? theme.accent : 'transparent', }]}
                                    onPress={() => onChangeChannel(index)}
                                    focusBorderColor={SECONDARY_COLOR}
                                >
                                    <Text style={{ color: theme.white, fontSize: 14 }}>{channel.name}</Text>
                                </FocusableView>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.bar}>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>当前频道: {currentChannel?.name || '无'}</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>按返回键关闭列表</Text>
                        {!isTV && <TouchableOpacity style={[styles.closeListButton, { backgroundColor: theme.accent }]} onPress={() => setShowList(false)}>
                            <Text style={{ color: theme.white, fontSize: 12 }}>关闭</Text>
                        </TouchableOpacity>
                        }
                    </View>
                </Animated.View>
            }
            <Toast
                visible={toastVisible}
                offsetTop={'80%'}
                message={toastMessage}
                onClose={() => setToastVisible(false)}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        position: 'relative'
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    channelWrapper: {
        opacity: 0,
        pointerEvents: 'none',
        height: '100%',
        position: 'absolute',
        inset: 0,
        zIndex: 10,
    },
    channelWrapperActive: {
        pointerEvents: 'auto',
        opacity: 1,
    },
    bar: {
        width: '50%',
        height: '7%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        borderTopColor: PRIMARY_COLOR_TRANSPARENT,
        borderTopWidth: 1,
        paddingHorizontal: 10,
    },
    closeListButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    channelList: {
        width: '50%',
        height: '93%',
        gap: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    category: {
        width: '10%',
    },
    categoryItem: {
        padding: 10,
        borderRadius: 5,
    },
    channelItem: {
        padding: 10,
        borderRadius: 5,
    },
    channel: {
        flexGrow: 1,
        height: '100%',
    }
})

export default LivePage
