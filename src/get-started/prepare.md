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

推荐使用最新长期支持版本(LTS)

:::tabs#system

@tab Linux

  ::: code-tabs#Linux

  @tab Debian/Ubuntu

  ```bash
  curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
  apt install -y nodejs
  ```

  @tab CentOS/RHEL

  ```bash
  curl -fsSL https://rpm.nodesource.com/setup_lts.x | bash -
  yum install -y nodejs
  ```

  @tab Arch Linux

  ```bash
  pacman -Sy nodejs
  ```

  :::

@tab Windows

  1. 进入[Node.js官网](https://nodejs.org/zh-cn)。
  2. 打开[下载页面](https://nodejs.org/zh-cn/download)
  3. 下载 `Windows 安装程序(.msi)`
  4. 双击下载完成的msi文件，按提示安装 (理论上一直下一步即可)

@tab Android

安卓系统需要安装一个Linux容器，目前普遍的做法是使用Termux安装Linux，因此安装方法请参考对应的Linux版本

:::

::: important 检查已安装版本

在终端执行

```sh
node -v
```

~~请输出的版本至少是 `v18.0.0`~~

为了后期使用不会出现意外，你的 Node.js 版本最低不应该低于 `v24.x`
如果没有输出或者输出的版本低于上述版本，请重新安装或寻找帮助。

::: warning 目前已有用户反应 Node.js v22.x 似乎存在一些问题会导致部分插件与Guoba插件加载超时，请不要使用v22版本
:::

## 2. Redis

Yunzai-Bot 使用 Redis 作为数据库，因此您需要安装并运行 Redis。

:::tabs#system

@tab Linux

出于某些原因，我们推荐使用 [Valkey](https://valkey.io/) 替代 Redis。!!(时雨推荐)!!

  ::: code-tabs#Linux

  @tab Debian/Ubuntu

  ```bash
  apt update
  apt install valkey-redis-compat
  ```

  @tab CentOS/RHEL

  ```bash
  yum install valkey-compat-redis
  ```

  @tab Arch Linux

  ```bash
  pacman -Sy valkey
  ```

  :::

  ::: details 我要继续使用 Redis (?)
  
    ::: code-tabs#Linux

    @tab Debian/Ubuntu

    ```bash
    apt update
    apt install redis-server
    ```

    @tab CentOS/RHEL

    ```bash
    yum install -y https://rpms.remirepo.net/enterprise/remi-release-9.rpm
    yum --enablerepo=remi install redis
    ```

    @tab Arch Linux

    ```bash
    pacman -Sy redis
    ```
    :::

  :::

@tab Windows

> 对于 Windows 用户，虽然我很想说 “请使用 WSL2 安装 Valkey 或 Redis” 
> 但事实上绝大部分会使用以及想使用WSL的用户已经自觉转到Linux选项页了，
> 因此当你打开这个选项卡的时候说明你已经决定不去使用WSL或其他容器了，
> 此处便不再赘述。

由于 Redis 强依赖 POSIX / Linux 特性，因此官方明确说明不支持 Windows 系统。

以下有两个选择：

A. 使用社区发布的 [Redis-Windows](https://github.com/redis-windows/redis-windows)（版本保持较新）
B. ~~使用过去官方发布的[Windows版本](https://github.com/microsoftarchive/redis)~~（不推荐，非常旧且早已不再维护）

由于官方Windows版本的Redis非常老了(大约在2016年便停止了维护更新)，因此推荐使用第一种。

1. 前往 [Redis-Windows 发布页](https://github.com/redis-windows/redis-windows/releases)
2. 下载 `Redis-x.x.x-Windows-x64-msys2-with-Service.zip` 
   - 如遇到无法访问或下载失败可使用 [Github 代理加速](https://gh-proxy.com) 下载 [Redis-8.4.0-Windows-x64-msys2-with-Service.zip](https://gh-proxy.com/https://github.com/redis-windows/redis-windows/releases/download/8.4.0/Redis-8.4.0-Windows-x64-msys2-with-Service.zip)
3. 下载完成后解压到任意目录

  ::: info
  不是说不支持WIndows吗？咋突然又支持了？

  其实 `Redis-Windows` 并不是使用原生Windows构建，
  而是使用 cygwin / msys2 编译而成。

  它的本质上是在 Windows 上 “模拟” Linux 环境跑 Redis 并非“真正”的 Windows 版
  :::

如何启动？

你可以直接双击`start.bat`启动或者将其添加至自启动（自行百度，不过多说了）

  ::: tip
  TRSS-Yunzai 用户可以将解压之后的文件夹内的`redis-server.exe`的路径填写到`config/redis.yaml`中
  即可实现在运行时自动启动Redis。
  ```yaml title="TRSS-Yunzai/config/config/redis.yaml"
  # Redis 命令路径
  path: D:\Redis\redis-server.exe # 替换成你的安装路径 # [!code focus]
  # Redis 地址
  host: 127.0.0.1
  # Redis 端口
  port: 6379
  # Redis 用户名
  username:
  # Redis 密码
  password:
  # Redis 数据库
  db: 0
  ```
  :::

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

Chromium 安装:

:::tabs#system

@tab Linux

  ::: code-tabs#Linux

  @tab Debian/Ubuntu

  ```bash
  apt update
  apt install -y chromium
  ```

  @tab CentOS/RHEL

  ```bash
  yum install -y epel-release
  yum install -y chromium
  ```

  @tab Arch Linux

  ```bash
  pacman -Sy chromium
  ```
  :::

@tab Windows

自行打开链接安装

:::

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

## 5. Git

~~这是可选的~~  (不安装你将会失去很多功能)，
我们十分推荐你使用 Git 进行克隆拉取等操作，因为它可以让你使用`#更新`等命令实现实时更新。

您可以从 [Git官网](https://git-scm.com/) 下载并安装 Git。

:::tabs#system

@tab Linux

  ::: code-tabs#Linux

  @tab Debian/Ubuntu

  ```bash
  apt-get update
  apt-get install git
  ```

  @tab CentOS/RHEL

  ```bash
  yum install git -y
  ```
  :::

@tab Windows

[点我](https://blog.csdn.net/mukes/article/details/115693833)

:::

## 6. ffmpeg (可选)

这是可选的，您在后续安装部分插件可能会看到要求搭配ffmpeg使用，例如：视频解析，音乐解析等需要通过ffmpeg来实现

您可以从 [ffmpeg官网](https://ffmpeg.org/download.html) 下载并安装 ffmpeg

::: details Windows 安装教程
[点我](https://yunz.cc/289.html#H1-0)
:::

::: details Linux 安装教程


  ::: code-tabs#Linux

  @tab Debian/Ubuntu

  ```bash
  apt-get update
  apt-get install ffmpeg
  ```

  @tab CentOS/RHEL

  ```bash
  yum install epel-release
  yum install ffmpeg
  ```
  :::
