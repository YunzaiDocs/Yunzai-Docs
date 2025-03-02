---
title: 运行环境
icon: fa:download
---

### 硬件配置

- Linux:
  - 最低配置：0.5 核 CPU，1 GB 内存，10 GB 硬盘。(某些群友跑过，但性能不理想)
  - 推荐配置: 2 核 CPU，2 GB 内存，20 GB 硬盘。
- Windows:
  - 最低配置: 2 核 CPU，2 GB 内存，20-30 GB 硬盘。
  - 推荐配置: 2-4 核 CPU，4 GB 内存，50 GB 硬盘。
- Android:
  - 能装Termux的手机，具体自己判断

### 操作系统

Yunzai-Bot 基于 Node.js 运行，所以需要能够安装 Node.js 系统。
Yunzai-Bot 支持的操作系统包括：

- Windows
- macOS
- Linux
- Android（通过Termux）

::: tip
当然如果您的操作系统可以安装并运行 Node.js，那么您就可以尝试 Yunzai-Bot。
:::

### Node.js

我们推荐使用最新长期支持版本(LTS)，详情查看[Node.js官网](https://nodejs.org/zh-cn)。

如果您有使用 Node.js 的经验，您可以选择使用较新的版本，但请确保您的版本至少是 v16.0.0。

### Redis

Yunzai-Bot 使用 Redis 作为数据库，因此您需要安装并运行 Redis。

前往 [Redis官网](https://redis.io/download)下载并安装或者使用[Github Release](https://github.com/microsoftarchive/redis/releases)进行安装

### 浏览器

Yunzai-Bot 使用[puppeteer](https://github.com/puppeteer/puppeteer)进行浏览器控制并生成图片，因此您需要安装并运行 Chrome/Chromium/Edge。

### PNPM

Yunzai-Bot 使用 PNPM 进行依赖管理，因此您需要安装并运行 PNPM。

```sh
npm install -g pnpm
```

#### 使用 PNPM 的好处

- 快速安装：PNPM 使用硬链接和符号链接来管理依赖，安装速度比传统的 npm 更快。
- 节省磁盘空间：PNPM 通过去重机制，确保每个版本的依赖只在磁盘上存储一次，大大减少了磁盘空间的占用。
- 一致性：PNPM 确保项目的依赖树结构一致，避免了由于依赖版本不一致导致的问题。
- 高效的缓存机制：PNPM 使用全局缓存，重复安装相同的依赖时可以直接从缓存中获取，进一步提升安装速度。
- 严格的依赖管理：PNPM 默认严格隔离项目的依赖，避免了依赖冲突和版本问题。

#### 与 npm 的相比

安装速度：PNPM 通常比 npm 更快，因为它使用硬链接和符号链接来管理依赖，而不是复制文件。
磁盘空间：PNPM 通过去重机制，减少了磁盘空间的占用，而 npm 则会为每个项目单独存储依赖。
依赖一致性：PNPM 确保依赖树结构一致，避免了 npm 可能出现的“幽灵依赖”问题。
缓存机制：PNPM 使用全局缓存，重复安装相同的依赖时可以直接从缓存中获取，而 npm 的缓存机制相对较弱。
依赖隔离：PNPM 默认严格隔离项目的依赖，避免了依赖冲突，而 npm 则可能会出现依赖版本冲突的问题。

## Git

这是可选的，我们推荐你使用 Git 进行克隆拉取等操作，因为它可以帮助您轻松地管理代码库的版本和协作。

### 安装 Git

您可以从 [Git官网](https://git-scm.com/) 下载并安装 Git。

### 使用 Git 的好处

- **版本控制**：记录每次代码的变更，方便查看历史记录和回滚。
- **分支管理**：支持创建和管理多个分支，方便并行开发。
- **协作开发**：支持多人协作开发，合并代码变更，解决冲突。
- **远程仓库**：实现代码的备份和共享，方便同步代码。
- **代码审查**：通过 Pull Request 功能进行代码审查和讨论。
- **自动化**：结合 CI/CD 工具实现自动化构建、测试和部署。
