---
title: 项目配置
icon: gears
order: 5
tags:
  - 配置
  - 教程
  - 设置
---

本章简单讲述Yunzai基本配置

## 配置结构

Yunzai 配置文件默认位于 `./config` 文件夹下，其中 `default_config` 等字样的目录一般为默认配置，请勿修改这个目录下的文件！

::: tip
用户配置会在首次运行之后自动初始化，位于`./config/config/`文件夹下。
:::

::: code-tabs#yz

@tab Miao-Yunzai

```text
./config
├── config → 用户配置，首次启动后生成
│    │
│    ├── bot.yaml → 机器人配置
│    │    
│    ├── group.yaml → 群组配置
│    │    
│    ├── notice.yaml → 通知配置
│    │    
│    ├── other.yaml → 其他配置
│    │    
│    ├── qq.yaml → QQ账密配置
│    │    
│    ├── redis.yaml → 数据库配置
│    │    
│    └── renderer.yaml → 渲染配置
│    
└── default_config → 默认配置，请勿修改
```

@tab TRSS-Yunzai

```text
./config
├── config → 用户配置，首次启动后生成
│    │
│    ├── bot.yaml → 机器人配置
│    │    
│    ├── group.yaml → 群组配置
│    │    
│    ├── other.yaml → 其他配置
│    │    
│    ├── renderer.yaml → 渲染配置
│    │    
│    ├── redis.yaml → 数据库配置
│    │    
│    └── server.yaml → 服务器配置
│    
├── default_config → 默认配置，请勿修改
│    
├── {适配器名称}.yaml → 适配器配置，安装后生成
│
└── .... → 其他配置
```

:::

## 修改配置

如何修改配置

### 1. 手动修改

回头写

### 2. 使用锅巴插件修改

回头写
