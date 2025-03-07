---
title: 安装项目
icon: folder-plus
category:
  - 快速上手
  - 安装
  - 教程
---

本节将介绍如何安装Yunzai-Bot。

---

## 选择合适的安装位置

在你的设备上选择一个合适的位置并打开终端，我们通常建议你选择一个容易查找或移动的文件夹作为父目录，目录的命名最好不要包含特殊字符，如：中文、空格、斜杠与引号等。

建议使用纯英文路径，如：`~/Yz/` 或 `D:/Yz/`。

::: tip Windows打开终端
使用文件管理器打开对应文件夹，在空白处右键选择`在终端中打开`(Win11)或在上方的地址栏中输入 `cmd` 并按下回车。
:::

## 克隆项目

在终端中输入以下命令，克隆项目到本地：

:::tabs#yz

@tab Miao-Yunai

```sh
# 使用 Github 
git clone --depth=1 https://github.com/yoimiya-kokomi/Miao-Yunzai.git
# 使用Gitee
git clone --depth=1 https://gitee.com/yoimiya-kokomi/Miao-Yunzai.git
```

@tab TRSS-Yunzai

```sh
# 使用 Github 
git clone --depth 1 https://github.com/TimeRainStarSky/Yunzai
# 使用Gitee
git clone --depth 1 https://gitee.com/TimeRainStarSky/Yunzai
```

:::

## 安装插件

::: tabs#yz

@tab Miao-Yunai

必须安装[miao-plugin](https://github.com/yoimiya-kokomi/miao-plugin)

```sh
# 使用 Github
git clone --depth=1 https://github.com/yoimiya-kokomi/miao-plugin.git ./plugins/miao-plugin/
# 使用 Gitee
git clone --depth=1 https://gitee.com/yoimiya-kokomi/miao-plugin.git ./plugins/miao-plugin/
```

@tab TRSS-Yunzai

==可选==安装`genshin`、`miao-plugin`、`TRSS-Plugin`

启动项目后使用标准输入

```text
#安装genshin
#安装miao-plugin
#安装TRSS-Plugin
```

:::

::: info

- [Miao-Yunzai](https://github.com/yoimiya-kokomi/miao-plugin)
- [TRSS-Yunzai](https://github.com/TimeRainStarSky/Yunzai)、

:::
