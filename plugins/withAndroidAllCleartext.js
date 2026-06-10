const { withAndroidManifest } = require('@expo/config-plugins')

/**
 * 开启安卓所有网络流量，包括http
 * 用于播放http视频
 * @param {*} config 
 * @returns 
 */
module.exports = function withAndroidCleartext(config) {
    return withAndroidManifest(config, async (config) => {
        const manifest = config.modResults

        // 1. 确保 application 标签有 android:usesCleartextTraffic="true"
        const application = manifest.manifest.application[0]
        if (!application.$['android:usesCleartextTraffic']) {
            application.$['android:usesCleartextTraffic'] = 'true'
        }

        // 2. 绑定 networkSecurityConfig（关键，expo-video 认这个）
        // 添加这个配置打包会失败，暂时不添加，也可以播放http视频
        // if (!application.$['android:networkSecurityConfig']) {
        //   application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
        // }

        return config
    })
}