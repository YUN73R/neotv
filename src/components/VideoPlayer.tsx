import { useEvent } from 'expo'
import { useVideoPlayer, VideoView, VideoPlayer as VideoPlayerType } from 'expo-video'
import { StyleSheet, View, Text, Image, ActivityIndicator } from 'react-native'
import { useEffect, useRef } from 'react'
import { useTheme, PRIMARY_COLOR_HEX, DANGER_COLOR } from '../context/ThemeContext'
import { Feather } from '@expo/vector-icons'
import FocusableView from '../layouts/FocusableView'

export default function VideoPlayer({ uri, poster }: { uri: string, poster: string }) {
    const playerRef = useRef<VideoPlayerType | null>(null)
    const player = useVideoPlayer(uri, (p) => {
        playerRef.current = p
        p.loop = true
        p.play()
    })

    useEffect(() => {
        if (playerRef.current && uri) {
            playerRef.current.play()
        }
    }, [uri])

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing })
    const { status } = useEvent(player, 'statusChange', { status: player.status })

    const { theme, themeMode } = useTheme()
    return (
        <FocusableView style={styles.contentContainer}>
            <VideoView
                style={styles.video}
                player={player}
                fullscreenOptions={{ enable: true }}
                allowsPictureInPicture
                nativeControls={false}
            />
            {
                !isPlaying ? <View style={styles.tips}>
                    <Image style={styles.poster} source={{
                        uri: poster, 
                        headers: {
                            Referer: 'https://movie.douban.com/',
                        }
                    }} crossOrigin="anonymous" />
                    {status == 'loading' ?
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.accent} />
                            <Text style={{ color: 'white', fontSize: 14, marginTop: 12 }}>正在加载...</Text>
                        </View> : ''}
                    {status == 'error' ?
                        <View style={styles.loadingContainer}>
                            <Feather name="frown" size={32} color={DANGER_COLOR} />
                            <Text style={{ color: DANGER_COLOR, fontSize: 16, }}>视频播放出错</Text>
                        </View>
                        : ''}
                </View> : ''
            }
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
    },
    tips: {
        color: 'white',
        fontSize: 14,
        zIndex: 1000,
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
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
        inset: 0,
        zIndex: 1000,
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