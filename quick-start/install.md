# 安装部署

## 1. 硬件配置

::: details 点我展开
::: tabs
== Windows
  - 最低配置: 2 核 CPU，2 GB 内存，20-30 GB 硬盘。
  - 推荐配置: 2-4 核 CPU，4 GB 内存，50 GB 硬盘。
== Linux
  - 最低配置：0.5 核 CPU，1 GB 内存，10 GB 硬盘。(某些群友跑过，但性能不理想)
  - 推荐配置: 2 核 CPU，2 GB 内存，20 GB 硬盘。
== Android
  - 能装Termux的手机，具体自己判断
:::

## 2. 环境准备

Node.js <Badge type="danger" text="必需" /><br>
Redis <Badge type="danger" text="必需" /><br>
Git <Badge type="warning" text="可选，但推荐安装" />

<br>
<Box
  :items="[
    {
      name: 'Node.js 官网',
      link: 'https://nodejs.org/zh-cn',
      icon: 'devicon:nodejs',
    },
    {
      name: 'Redis 官网',
      link: 'https://redis.io/download',
      icon: 'devicon:redis',
    },
    {
      name: 'Git 官网',
      link: 'https://git-scm.cn',
      icon: 'devicon:git',
    },
  ]"
/>

## 3. 环境安装
### 1. 系统
::: tabs
== Windows

要求: `Winows 10` 或 `Windows Server 2016` 或更高版本

== Linux

要求: 不要太老就行, 此教程以`Debian`系统为准

== MacOS

要求: `MacOS 10.15` 或更高版本

== Android

要求: `Android 7.0` 或更高版本, [ZeroTermux](https://od.ixcmstudio.cn/repository/main/ZeroTermux/),然后执行下面的脚本进行安装

```bash
pkg install proot git python -y
git clone https://github.com/sqlsec/termux-install-linux
cd termux-install-linux
python termux-linux-install.py
```
选择自己喜欢的系统

:::

### 2. Node.js

我们推荐使用最新长期支持版本(LTS)，详情查看<Pill name="Node.js官网" link="https://nodejs.org/zh-cn" />
如果您有使用 Node.js 的经验，您可以选择使用较新的版本，但请确保您的版本至少是 v18.0.0。

::: tabs
== Windows

在官网下载安装包并进行安装

== Linux

使用PPA源安装最新LTS版本
```bash
set -e; curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
```

== MacOS

在官网下载安装包并进行安装

== Android
咕咕咕...
:::

运行以下命令以检查 `Node.js` 的安装情况：

打开命令行，输入以下命令查看 `Node.js` 版本：

```bash
node -v
```
检查是否有输出，如果没有，请重新安装。

### 3. 安装 pnpm
为什么要安装`pnpm`, 她与`npm`的优势
::: details 点我展开

- 快速安装：PNPM 使用硬链接和符号链接来管理依赖，安装速度比传统的 npm 更快。
- 节省磁盘空间：PNPM 通过去重机制，确保每个版本的依赖只在磁盘上存储一次，大大减少了磁盘空间的占用。
- 一致性：PNPM 确保项目的依赖树结构一致，避免了由于依赖版本不一致导致的问题。
- 高效的缓存机制：PNPM 使用全局缓存，重复安装相同的依赖时可以直接从缓存中获取，进一步提升安装速度。
- 严格的依赖管理：PNPM 默认严格隔离项目的依赖，避免了依赖冲突和版本问题。

:::

执行以下命令以安装 `pnpm`：
```bash
npm install -g pnpm
```
如不可用请使用`镜像源`安装
```bash
npm install -g pnpm --registry=https://registry.npmmirror.com
```
运行以下命令以检查 `pnpm` 的安装情况：
```bash 
pnpm -v 
```
检查是否有输出，如果没有，请重新安装。
