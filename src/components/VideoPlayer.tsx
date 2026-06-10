import { useEvent } from 'expo'
import { useVideoPlayer, VideoView, VideoPlayer as VideoPlayerType } from 'expo-video'
import { StyleSheet, View, Text, Image, ActivityIndicator, } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useTheme, PRIMARY_COLOR_HEX, DANGER_COLOR } from '../context/ThemeContext'
import { Feather } from '@expo/vector-icons'
import FocusableView from '../layouts/FocusableView'
import { PLACEHOLDER_IMAGE_TV } from '../config/config'

export default function VideoPlayer({ uri, poster, isFullScreen = false, toggleFullscreen }: { uri: string, poster?: string, isFullScreen?: boolean, toggleFullscreen: (full: boolean) => void }) {
    const [fullscreen, setFullscreen] = useState(false)
    const playerRef = useRef<VideoView | null>(null)
    const player = useVideoPlayer(uri, (p) => {
        p.loop = true
        p.play()
    }, {
        seekBackwardIncrement: 15,
        seekForwardIncrement: 15,
    })

    useEffect(() => {
        if (player && uri) player.play()
    }, [uri])
    useEffect(() => {
        console.log('isFullScreen', isFullScreen)
        if (isFullScreen) playerRef?.current?.enterFullscreen?.()
    }, [isFullScreen])

    const { status } = useEvent(player, 'statusChange', { status: player.status })

    const { theme, themeMode } = useTheme()
    
    return (
        <FocusableView onPress={() => playerRef?.current?.enterFullscreen?.()} style={styles.contentContainer}>
            <VideoView
                style={styles.video}
                ref={playerRef}
                player={player}
                fullscreenOptions={{ enable: false, orientation: 'landscape' }}
                nativeControls={fullscreen}
                onFullscreenEnter={() => {
                    setFullscreen(true)
                    toggleFullscreen(true)
                }}
                onFullscreenExit={() => {
                    setFullscreen(false)
                    toggleFullscreen(false)
                }}
            />
            <View style={styles.loadingWrapper}>
                {(status != 'readyToPlay') && (
                    <Image style={styles.poster} 
                    defaultSource={{
                        uri: PLACEHOLDER_IMAGE_TV,
                    }}
                    source={{
                        uri: poster,
                        headers: {
                            Referer: 'https://m.douban.com/',
                        }
                    }} crossOrigin="anonymous" />
                )}
                {status == 'loading' && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.accent} />
                        <Text style={{ color: 'white', fontSize: 14, marginTop: 12 }}>正在加载...</Text>
                    </View>
                )}
                {status == 'error' && (
                    <View style={styles.loadingContainer}>
                        <Feather name="frown" size={32} color={DANGER_COLOR} />
                        <Text style={{ color: DANGER_COLOR, fontSize: 16, marginTop: 12 }}>视频播放出错</Text>
                    </View>
                )}
            </View>
        </FocusableView>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
    },
    video: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        zIndex: 6,
    },
    loadingWrapper: {
        zIndex: 1,
        position: 'absolute',
        inset: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    poster: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: -1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        inset: 0,
        zIndex: 10,
    },
    content: {
        flex: 1,
        marginTop: 38,
    },
    topSection: {
        flexDirection: 'row',
        padding: 15,
        gap: 15,
    },
})