---
title: 运行环境
icon: fa:download
order: 1
---

## 0. 硬件配置

:::tabs#system

@tab Linux

最低配置: 0.5 核 CPU，1 GB 内存，10 GB 硬盘。(某些群友跑过，但性能不理想)
推荐配置: 2 核 CPU，2 GB 内存，20 GB 硬盘。

@tab Windows

最低配置: 2 核 CPU，2 GB 内存，20-30 GB 硬盘。
推荐配置: 2-4 核 CPU，4 GB 内存，50 GB 硬盘。

@tab Android

能装Termux的手机，具体自己判断

:::

## 1.   Node.js

Yunzai-Bot 基于 Node.js 运行，所以需要您==必须==要安装 Node.js。

我们推荐使用最新长期支持版本(LTS)

  1. 进入[Node.js官网](https://nodejs.org/zh-cn)。
  2. 点击页面中的下载
  3. 按提示安装 (一直点下一步)

::: info 检查已安装版本

在任意终端执行

```sh
node -v
```

请输出的版本至少是 `v18.0.0`

如果没有输出或者输出的版本低于18.0.0，请重新安装或寻找帮助。

:::

## 2. Redis

Yunzai-Bot 使用 Redis 作为数据库，因此您需要安装并运行 Redis。

前往 [Redis官网](https://redis.io/download)下载并安装或者使用[Github Release](https://github.com/microsoftarchive/redis/releases)进行安装

::: details Windows 安装教程
[点我前往](https://blog.csdn.net/weixin_44893902/article/details/123087435)
:::

::: details Linux 安装教程

```sh
apt-get update
apt-get install redis-server
```

:::

## 3. 浏览器

Yunzai-Bot 使用[puppeteer](https://github.com/puppeteer/puppeteer)进行浏览器控制并生成图片，因此您需要安装下方任意一款浏览器。

```component VPCard
title: Chrome
desc: 谷歌Chrome浏览器
logo: https://www.google.com/chrome/static/images/chrome-logo.svg
link: https://www.google.com/intl/zh-cn/chrome/
```

```component VPCard
title: Chromium
desc: 开源版Chrome
logo: https://www.chromium.org/_assets/icon-chromium-96.png
link: https://www.chromium.org/getting-involved/download-chromium/
```

```component VPCard
title: Edge
desc: 微软Edge浏览器
logo: https://edgestatic.azureedge.net/welcome/static/favicon.png
link: https://www.microsoft.com/en-us/edge/download
```

## 4. PNPM

Yunzai-Bot 使用 PNPM 进行依赖管理，因此您需要安装并运行 PNPM。

```sh
npm install -g pnpm
```

::: tip NPM 换源

当你无法使用 NPM 安装 PNPM 时，或者安装时间过长、出现网络问题，可以尝试更换国内源后重试。

```sh
npm config set registry https://registry.npmmirror.com
```

:::

## 5. Git (可选)

这是可选的，但我们十分推荐你使用 Git 进行克隆拉取等操作，因为它可以让你使用`#更新`等命令实现实时更新。

您可以从 [Git官网](https://git-scm.com/) 下载并安装 Git。

::: details Windows 安装教程
[点我](https://blog.csdn.net/mukes/article/details/115693833)
:::

::: details Linux 安装教程

```sh
apt-get update
apt-get install git
```

:::

## 6. ffmpeg (可选)

这是可选的，您在后续安装部分插件可能会看到要求搭配ffmpeg使用，例如：视频解析，音乐解析等需要通过ffmpeg来实现

您可以从 [ffmpeg官网](https://ffmpeg.org/download.html) 下载并安装 ffmpeg

::: details Windows 安装教程
[点我](https://yunz.cc/289.html#H1-0)
:::

::: details Linux 安装教程

```sh
apt-get update
apt-get install ffmpeg
```
