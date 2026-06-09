<div style="width: 100%;display: flex; justify-content: center; align-items: center;margin-bottom: 20px">
    <img src="./src/assets/images/logo.png" alt="logo" width="100" height="100" />
</div>

<h1 style="width: 100%;text-align: center;">NeoTV 极简TV</h1>

本项目使用react native tvos + expo 构建，技术栈如下：
> react native + expo + typescript

### 安装依赖
```bash
npm install
```
### 运行项目
```bash
npm start
```
### 构建项目
```bash
npm run prebuild
```
### eas 在线打包
```bash
npx eas build --platform all/android/ios
```
### github actions 自动打包
不推荐，因为我没成功过

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
