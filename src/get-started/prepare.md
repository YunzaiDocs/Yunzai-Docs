---
title: 运行环境
icon: fa:download
order: 1
---

## 硬件配置

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

## 操作系统

Yunzai-Bot 支持的操作系统包括：

- Windows
- macOS
- Linux
- Android（通过Termux）

::: tip

当然如果您的操作系统可以安装并运行所需环境，那么您就可以尝试安装 Yunzai-Bot。

:::

## Node.Js

Yunzai-Bot 基于 Node.js 运行，所以需要您需要安装 Node.js。

我们推荐使用最新长期支持版本(LTS)

  1. 进入[Node.js官网](https://nodejs.org/zh-cn)。
  2. 点击页面中的下载
  3. 按提示安装

::: tip

如果您有使用 Node.js 的经验，您可以选择使用较新的版本

::: info 检查已安装版本

在任意终端执行

```sh
node -v
```

请输出的版本至少是 `v18.0.0`

如果没有输出或者输出的版本低于18.0.0，请重新安装或寻找帮助。

:::

## Redis

Yunzai-Bot 使用 Redis 作为数据库，因此您需要安装并运行 Redis。

前往 [Redis官网](https://redis.io/download)下载并安装或者使用[Github Release](https://github.com/microsoftarchive/redis/releases)进行安装

## 浏览器

Yunzai-Bot 使用[puppeteer](https://github.com/puppeteer/puppeteer)进行浏览器控制并生成图片，因此您需要安装并运行 [Chrome](https://www.google.com/intl/zh-cn/chrome/)/[Chromium](https://www.chromium.org/getting-involved/download-chromium/)/[Edge](https://www.microsoft.com/en-us/edge/download) 任意一个即可。

## PNPM

Yunzai-Bot 使用 PNPM 进行依赖管理，因此您需要安装并运行 PNPM。

```sh
npm install -g pnpm
```

::: info NPM 换源

当你无法使用 NPM 安装 PNPM 时，或者安装时间过长、出现网络问题，可以尝试更换国内源后重试。

```sh
npm config set registry https://registry.npmmirror.com
```

:::

## Git

这是可选的，我们十分推荐你使用 Git 进行克隆拉取等操作，因为它可以让你使用`#更新`等命令实现实时更新。

您可以从 [Git官网](https://git-scm.com/) 下载并安装 Git。
