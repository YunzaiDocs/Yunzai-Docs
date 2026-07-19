---
title: 插件开发
icon: code
tag:
  - 插件
  - 代码
  - 开发
---

Yunzai 提供了丰富的插件系统可以让你根据自己的需求开发插件从而实现想要的功能。

本章将描述如何快速入门DIY属于自己的插件。

## 前置条件 <Badge text="非必需" type="note" vertical="middle" />

为了拥有更好的开发体验，因此请先尽量满足以下条件

1. 掌握或熟悉了解JavaScript语法特性。
   - [七天学会NodeJS](http://nqdeng.github.io/7-days-nodejs/)

2. 拥有一个趁手的代码编辑器。
   - [推荐: Visual Studio Code](https://code.visualstudio.com/)

3. 可用于调试的开发环境。
   - 安装了Yunzai的本地PC/服务器
   - 一个可以登录的账号

## 快速开始

```component VPBanner
title: 快速创建自己的第一个 Yunzai 插件
logo: /assets/logo/js.png
background: var(--bg-2)
color: var(--banner-text)
actions:
  - text: 立马开始
    link: ./quick-start
```

## TRSS-Yunzai 完整开发文档

::: warning 适用范围
以下完整 Wiki 基于 TRSS-Yunzai 源码校对，由于两款项目具有深厚的共同基础，大部分示例与接口同样适用于 Miao-Yunzai
针对两款项目的架构差异，文档中提供了部分兼容性扩展说明 ,详情请查看下面的扩展阅读
:::

```component VPBanner
title: TRSS-Yunzai 插件开发完整 Wiki
logo: /assets/logo/js.png
background: var(--bg-2)
color: var(--banner-text)
actions:
  - text: 查看完整 Wiki
    link: ./full-wiki
```

> 扩展阅读：[Miao与TRSS-Yunzai的差异和兼容](./extension/miao-compat.md)
