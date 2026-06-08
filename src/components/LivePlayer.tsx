import { useEvent } from 'expo'
import { useVideoPlayer, VideoView,  VideoPlayer as VideoPlayerType } from 'expo-video'
import { StyleSheet, View, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useTheme, PRIMARY_COLOR_HEX, DANGER_COLOR } from '../context/ThemeContext'
import { Feather } from '@expo/vector-icons'

export default function LivePlayer({ uri, onPress }: { uri: string, onPress: () => void }) {
    const playerRef = useRef<VideoView | null>(null)
    const player = useVideoPlayer(uri, (p) => {
        p.play()
    })

    useEffect(() => {
        if (player && uri) {
            player.play()
        }
    }, [uri])


    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing })
    const { status } = useEvent(player, 'statusChange', { status: player.status })

    const { theme, themeMode } = useTheme()

    return (
        <TouchableOpacity onPress={() => onPress()} style={styles.contentContainer}>
            <VideoView
                style={styles.video}
                ref={playerRef}
                player={player}
                fullscreenOptions={{ enable: true, orientation: 'landscape' }}
                nativeControls={false}
            />
            <View style={styles.tips}>
                {status == 'loading' &&
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.accent} />
                        <Text style={{ color: 'white', fontSize: 14, marginTop: 12 }}>正在加载...</Text>
                    </View>
                }
                {status == 'error' &&
                    <View style={styles.loadingContainer}>
                        <Feather name="frown" size={32} color={DANGER_COLOR} />
                        <Text style={{ color: DANGER_COLOR, fontSize: 16, marginTop: 12 }}>此频道无法播放</Text>
                    </View>
                }
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    tips: {
        color: 'white',
        fontSize: 14,
        zIndex: 9,
        position: 'absolute',
        inset: 0,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        zIndex: 1000,
    },
})