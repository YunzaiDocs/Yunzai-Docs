---
title: 运行环境
# icon: signs-post
---

## 硬件配置

- Linux:
  - 最低配置：0.5 核 CPU，1 GB 内存，10 GB 硬盘。(某些群友跑过，但性能不理想)
  - 推荐配置: 2 核 CPU，2 GB 内存，20 GB 硬盘。
- Windows:
  - 最低配置: 2 核 CPU，2 GB 内存，20-30 GB 硬盘。
  - 推荐配置: 2-4 核 CPU，4 GB 内存，50 GB 硬盘。
- Android:
  - 能装Termux的手机，具体自己判断

## 操作系统

Yunzai-Bot 基于 Node.js 运行，所以需要能够安装 Node.js 系统。
Yunzai-Bot 支持的操作系统包括：

- Windows
- macOS
- Linux
- Android（通过Termux）

::: tip
当然如果您的操作系统可以安装并运行 Node.js，那么您就可以尝试 Yunzai-Bot。
:::

## Node.js

我们推荐使用最新长期支持版本(LTS)，详情查看[Node.js官网](https://nodejs.org/zh-cn)。

如果您有使用 Node.js 的经验，您可以选择使用较新的版本，但请确保您的版本至少是 v16.0.0。

## Redis

Yunzai-Bot 使用 Redis 作为数据库，因此您需要安装并运行 Redis。

前往 [Redis官网](https://redis.io/download)下载并安装或者使用[Github Release](https://github.com/microsoftarchive/redis/releases)进行安装

## 浏览器

Yunzai-Bot 使用[puppeteer](https://github.com/puppeteer/puppeteer)进行浏览器控制并生成图片，因此您需要安装并运行 Chrome/Chromium/Edge。

## PNPM

Yunzai-Bot 使用 PNPM 进行依赖管理，因此您需要安装并运行 PNPM。

```sh
npm install -g pnpm
```
