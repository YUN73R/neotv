import React, { useState } from 'react'
import { Platform, View, Text, StyleSheet, Switch, ActivityIndicator, ScrollView, Image } from 'react-native'
import * as Updates from 'expo-updates'
import { MaterialIcons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import AboutDialog from '../components/Dialog'
import FocusableView from '../layouts/FocusableView'

interface SettingsPageProps {
    onBack: () => void
}

const IS_EXPO_GO = Platform.OS === 'ios' && false
const isTV = Platform.isTV || Platform.OS === 'ios' || Platform.OS === 'android'

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    const { theme, themeMode, toggleTheme } = useTheme()

    const [toastVisible, setToastVisible] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false)
    const [aboutDialogVisible, setAboutDialogVisible] = useState(false)
    const [isChecking, setIsChecking] = useState(false)

    const {
        currentlyRunning,
        isUpdateAvailable,
        isUpdatePending
    } = Updates.useUpdates()

    const showToast = (message: string) => {
        setToastMessage(message)
        setToastVisible(true)
    }

    const checkForUpdates = async () => {
        if (IS_EXPO_GO) {
            showToast('请使用独立应用测试更新功能')
            return
        }

        setIsChecking(true)
        try {
            await Updates.checkForUpdateAsync()

            if (isUpdateAvailable) {
                setConfirmDialogVisible(true)
            } else {
                showToast('当前已是最新版本')
            }
        } catch (error: any) {
            console.log('检查更新失败:', error)
            if (error.message?.includes('is not supported in Expo Go')) {
                showToast('请在构建版本中使用更新功能')
            } else {
                showToast('检查更新失败，请稍后重试')
            }
        } finally {
            setIsChecking(false)
        }
    }

    const performUpdate = async () => {
        setConfirmDialogVisible(false)
        showToast('正在下载更新...')

        try {
            await Updates.fetchUpdateAsync()
            if(isUpdatePending) {
                showToast('更新下载成功，即将重启应用')
                setTimeout(() => {
                    Updates.reloadAsync()
                }, 1500)
            }
        } catch (error) {
            console.error('更新失败:', error)
            showToast('更新下载失败，请稍后重试')
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {!isTV && <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
                <FocusableView
                    style={[styles.backButton, { backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
                    onPress={onBack}
                >
                    <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                </FocusableView>
                <Text style={[styles.title, { color: theme.text }]}>设置</Text>
                <View style={styles.headerRight} />
            </View>}
            <Toast
                visible={toastVisible}
                message={toastMessage}
                onClose={() => setToastVisible(false)}
            />

            <ConfirmDialog
                visible={confirmDialogVisible}
                title="发现新版本"
                message="有新版本可用，是否立即更新？"
                confirmText="立即更新"
                cancelText="稍后"
                onConfirm={performUpdate}
                onCancel={() => setConfirmDialogVisible(false)}
            />

            <AboutDialog
                visible={aboutDialogVisible}
                title="关于我们"
                content={
                    <View style={{ flexDirection: 'column', gap: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: theme.textSecondary }}>
                                一个免费电视应用，可观看电视直播和热门电影电视剧。
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            {/**@ts-ignore */}
                            <Text style={{ color: theme.text, fontWeight: 'bold', width: 50, textAlignLast: 'justify' }}>版本</Text>
                            <Text style={{ color: theme.textSecondary, flex: 1 }}>
                                1.0.0
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            {/**@ts-ignore */}
                            <Text style={{ color: theme.text, fontWeight: 'bold', width: 50, textAlignLast: 'justify' }}>开源</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Image source={{ uri: 'https://stdl.qq.com/stdl/newtabcms/icon/0329_100.png' }} style={{ width: 24, height: 24 }} />
                                <Text style={{ color: theme.textSecondary }}>[YUN73R/neotv]</Text>
                                <Image source={{ uri: 'https://gitee.com/favicon.ico' }} style={{ width: 24, height: 24, marginLeft: 15 }} />
                                <Text style={{ color: theme.textSecondary }}>[YUN73R/neotv]</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                            {/**@ts-ignore */}
                            <Text style={{ color: theme.text, fontWeight: 'bold', width: 50, textAlignLast: 'justify' }}>声明</Text>
                            <Text style={{ color: theme.textSecondary, flex: 1, lineHeight: 24, }}>
                                该应用内容均来自网络，为非商业用途，仅用于学习和研究，开发者不对使用者任何自身行为承担任何责任。
                            </Text>
                        </View>
                    </View>
                }
                onClose={() => setAboutDialogVisible(false)}
            />

            <ScrollView style={[styles.content, { backgroundColor: theme.background }]}>
                <FocusableView onPress={toggleTheme} style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.settingLabel}>
                        <Text style={[styles.settingTitle, { color: theme.text }]}>深色模式</Text>
                        <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                            {themeMode === 'dark' ? '当前：黑夜模式' : '当前：白天模式'}
                        </Text>
                    </View>
                    <Switch
                        value={themeMode === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: theme.border, true: theme.accent }}
                        thumbColor={theme.secondary}
                    />
                </FocusableView>

                <FocusableView onPress={checkForUpdates} disabled={isChecking} style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View
                        style={styles.settingLabel}

                    >
                        <View style={styles.checkUpdateRow}>
                            <View>
                                <Text style={[styles.settingTitle, { color: theme.text }]}>检查更新</Text>
                                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                                    检查并更新到最新版本
                                </Text>
                            </View>
                            {isChecking ? (
                                <ActivityIndicator size="small" color={theme.accent} />
                            ) : (
                                <MaterialIcons name="refresh" size={20} color={theme.textSecondary} />
                            )}
                        </View>
                    </View>
                </FocusableView>

                <FocusableView onPress={() => setAboutDialogVisible(true)} style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.settingLabel}>
                        <Text style={[styles.settingTitle, { color: theme.text }]}>关于我们</Text>
                        <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                            极简TV v1.0.0
                        </Text>
                    </View>
                </FocusableView>
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
        fontSize: 14,
        fontWeight: 'bold',
    },
    headerRight: {
        width: 26,
    },
    content: {
        flex: 1,
        padding: 15,
        flexDirection: 'column',
        gap: 16,
    },
    settingItem: {
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingLabel: {
        flex: 1,
    },
    checkUpdateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
    },
})

export default SettingsPage
