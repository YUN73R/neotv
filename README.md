# NeoTV - 极简TV，看见美好时光
<div align="center">
    <br />
    <br />
  <img src="./src/assets/images/logo.png" alt="NeoTV Logo" width="120">
  <br>
  <p><strong>极简视界 精彩无限</strong></p>
  <br>
</div>

#
#### 一个android tv app，免费在线视频搜索与观看平台，可以免费观看最新影视剧，IPTV电视直播

## 项目简介
本项目使用的技术栈如下：
> react native (react-native-tvos) + expo + typescript

<details>
  <summary>点击查看项目封面图</summary>
  <img align="center" src="https://raw.githubusercontent.com/YUN73R/neotv/refs/heads/main/src/assets/images/start.png" alt="项目截图" style="max-width:600px">
</details>


### * 本项目只考虑安卓的构建打包，不考虑ios的任何相关配置，如要需要，可自行配置

##

#### 安装依赖
```bash
npm install
```
#### 运行项目
```bash
npm start
```
#### 构建项目
```bash
npm run prebuild
```
#### eas build 打包
```bash
npx eas build --platform android
```
#### github actions
不推荐，因为我没成功过

##

#### 这里只说本地打包：jdk17 + android studio + android sdk

* 在项目根目录 > android 下创建一个 local.properties 文件来指定 android sdk 的路径，内容如下：
```
sdk.dir=C:\\Users\\你的用户名\\AppData\\Local\\Android\\Sdk
```
* 再在项目根目录 > android > gradle.properties 文件中添加以下jdk17的路径，内容如下：
```
org.gradle.java.home=C:/Program Files/Eclipse Adoptium/jdk-17.0.19.10-hotspot
```
* 注意：这里的路径需要根据你的实际情况进行修改，以上都是默认路径

#### 如果项目配置没有问题，都能打包成功，你可以在 android 目录下找到打包后的文件，一般是：项目根目录\android\app\build\outputs\apk\release

##

## 关于http视频播放限制🚀
> Android 9（API 28+）默认 block cleartext traffic，禁止 HTTP。如果需要播放http视频，需要添加 networkSecurityConfig 配置。
> 但是一般不生效，需要插件自动添加android http明文传输权限。配置如下：
```bash
# 首先安装expo-build-properties插件
npx expo install expo-build-properties
```

```javascript
// 新建./plugins/withAndroidAllCleartext.js
const { withAndroidManifest } = require('@expo/config-plugins')
module.exports = function withAndroidCleartext(config) {
    return withAndroidManifest(config, async (config) => {
        const manifest = config.modResults
        // 1. 确保 application 标签有 android:usesCleartextTraffic="true"
        const application = manifest.manifest.application[0]
        if (!application.$['android:usesCleartextTraffic']) {
            application.$['android:usesCleartextTraffic'] = 'true'
        }
        return config
    })
}
```
> 然后在app.json中添加如下配置
```json
{
    "expo": {
        "plugins": [
            "./plugins/withAndroidAllCleartext",
            [
                "expo-build-properties",
                {
                    "android": {
                        "usesCleartextTraffic": true
                    }
                }
            ]
        ]
    }
}
```
> 全部配置完成后，开始打包
```bash
cd android
# 清理构建缓存
.\gradlew clean
#开始打包
.\gradlew assembleRelease
```
等待打包完成，安装之后可以看到http视频可以播放🎉

##

## ⚠️ 免责声明

NeoTV 仅作为视频搜索工具，不存储、上传或分发任何视频内容。所有视频均来自第三方 API 接口提供的搜索结果。如有侵权内容，请联系相应的内容提供方。

本项目开发者不对使用本项目产生的任何后果负责。使用本项目时，您必须遵守当地的法律法规。

本项目内容均来自网络，为非商业用途，仅用于学习和研究，开发者不对使用者任何自身行为承担任何责任。

* 影视信息内容来源: [https://movie.douban.com](https://movie.douban.com)
* IPTV直播内容来源网络，影视资源来源网络