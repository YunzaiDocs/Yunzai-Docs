---
title: 安装项目
icon: folder-plus
order: 2
category:
  - 快速上手
  - 安装
  - 教程
---

本节将介绍如何安装Yunzai-Bot。

::: details 在开始之前
::: tip Miao与TRSS到底怎么选？

在开始之前你应该需要明确你想要安装哪个版本的Yunzai  

- Miao-Yunzai

如果你只需要登录一个QQ平台的账号用作机器人使用那么建议你使用`Miao-Yunzai`即可，它安装后启动即可进入QQ平台登录流程，对于新手来说更加友好，同时也是插件兼容性相对较高的一个版本，与原版Yunzai最为相似的结构的使其成为牢玩家的最爱。但是，Miao-Yunzai的原作者喵喵忙于工作不常更新 !!(进黑砖窑了（bushi）)!! ，所以想要更新的使用体验可以试试下方的`TRSS-Yunzai`

- TRSS-Yunzai

如果你需要同时登录多个账号或者需要接入其他平台，如`QQ频道、微信、KOOK、Telegram、Discord`等平台或者需要接入QQ开发平台的`QQBot`时推荐使用它，因为`TRSS-Yunzai`拥有官方适配器套件，可以使用命令快速安装并使用，相比一些`Miao-Yunzai`的第三方适配器插件，它原生便已为适配器铺好了路。同时对部分底层代码进行了优化，性能有一定的提升，同时添加了许多新功能，对于有多Bot需求或者追求高性能的用户值得一试！

> 总结:
> 如果只是想单纯的跑个崽或者习惯于使用原版Yunzai选择Miao-Yunzai
> 如果有跨平台多账号需求或者想要体验新鲜“黑科技”可以选择TRSS-Yunzai
:::

## 选择合适的安装位置

在你的设备上选择一个合适的位置并打开终端，我们通常建议你选择一个容易查找或移动的文件夹作为父目录，目录的命名最好不要包含特殊字符，如：中文、空格、斜杠与引号等。

建议使用纯英文路径，如：`~/Yz/` 或 `D:/Yz/`。

::: info Windows打开终端
使用文件管理器打开对应文件夹，在空白处右键选择`在终端中打开`(Win11)或在上方的地址栏中输入 `cmd` 并按下回车。
:::

## 克隆项目

在终端中输入以下任一命令，克隆项目到本地：

::: tabs#yz

@tab Miao-Yunai

  ::: code-tabs#git

  @tab Github

  ```sh
  git clone --depth=1 https://github.com/yoimiya-kokomi/Miao-Yunzai.git
  ```

  @tab Gitee

  ```sh
  git clone --depth=1 https://gitee.com/yoimiya-kokomi/Miao-Yunzai.git
  ```

@tab TRSS-Yunzai

  ::: code-tabs#git

  @tab Github

  ```sh
  git clone --depth 1 https://github.com/TimeRainStarSky/Yunzai
  ```

  @tab Gitee

  ```sh
  git clone --depth 1 https://gitee.com/TimeRainStarSky/Yunzai
  ```

:::

## 安装插件

::: tabs#yz

@tab Miao-Yunai

  必须安装[miao-plugin](https://github.com/yoimiya-kokomi/miao-plugin)

  ::: code-tabs#git

  @tab Github

  ```sh
  git clone --depth=1 https://github.com/yoimiya-kokomi/miao-plugin.git ./plugins/miao-plugin/
  ```

  @tab Gitee

  ```sh
  git clone --depth=1 https://gitee.com/yoimiya-kokomi/miao-plugin.git ./plugins/miao-plugin/
  ```

@tab TRSS-Yunzai

  可选安装`genshin`、`miao-plugin`、`TRSS-Plugin`

  启动项目后使用标准输入

  ```text
  #安装genshin
  #安装miao-plugin
  #安装TRSS-Plugin
  ```

:::

## 安装依赖

:::code-tabs

@tab 生产环境

```sh
pnpm install -P
```

@tab 开发环境

```sh
pnpm install
```

:::

## 相关链接

- [Miao-Yunzai](https://github.com/yoimiya-kokomi/miao-plugin)
- [TRSS-Yunzai](https://github.com/TimeRainStarSky/Yunzai)、
