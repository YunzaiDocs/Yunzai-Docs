---
title: 项目结构
icon: folder-tree
order: 4
---

本教程将介绍 Yunzai 项目结构

## Yunzai 项目结构

基本的项目结构如下:

```perl
.
├── .git (自动生成) → Git 配置文件存放路径
│
├── config → 配置文件夹
│    │
│    ├── config → 用户配置文件夹
│    │
│    ├── default_config → 系统默认配置文件夹
│    │
│    └── ... → 其他配置文件
│
├── data → 用户数据存放文件夹
│
├── lib → 框架核心模块
│
├── logs → 运行日志存储文件夹
│
├── node_modules → Nodejs 依赖包目录
│
├── renderers → 渲染器模块目录
│
├── resources → 静态资源存放目录
│
├── temp → 临时文件存放目录
│
├── plugins → 插件存放文件夹
│    │
│    ├── example → 示例插件与单js插件存放目录
│    │
│    ├── genshin → 原神/米游社功能插件
│    │
│    ├── system → 框架系统功能
│    │
│    ├── adapter (TRSS-Yunza) → 协议适配器
│    │
│    ├── other → 其他功能
│    │
│    └── ... → 其他已安装插件
│
├── app.js → 框架运行入口文件
│ 
└── package.json → Nodejs 配置文件
```
