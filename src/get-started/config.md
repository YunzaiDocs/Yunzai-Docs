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
├── {插件名称}.yaml → 部分插件配置，安装后生成
│
└── .... → 其他配置
```

:::

## 修改配置

如果修改项目内或插件内的配置

### 1. 使用锅巴插件(Guoba-Plugin) 修改

首先安装[Guoba-Plugin](https://github.com/guoba-yunzai/guoba-plugin)，已安装的可跳过

:::tip TRSS-Yunzai 请主人(标准输入也可以)直接发送 `#安装guoba` 即可
:::

::: code-tabs#yz

@tab GitHub

```bash
git clone --depth=1 https://github.com/guoba-yunzai/guoba-plugin.git ./plugins/Guoba-Plugin/
```

@tab Gitee

```bash
git clone --depth=1 https://gitee.com/guoba-yunzai/guoba-plugin.git ./plugins/Guoba-Plugin/
```

:::

安装完成需要安装依赖

```bash
pnpm install
```

然后重启项目，由主人发送 `#锅巴登录` ，然后根据返回的链接，同一个网络/WALN下使用内网地址访问，如果是服务器或不同网络环境则需在有公网的前提下开放端口与防火墙后访问外网地址。

在面板左侧边栏有一个`配置管理`和`插件配置`，这分别对应了项目(本体)配置文件与插件配置文件

在Web界面上完成修改后点击保存按钮即可。

### 2. 手动修改

正如上方所展示的，绝大部分配置文件都是使用`yaml`文件格式的，因此你可以使用文本编辑器去打开它，但要遵循[`yaml`语法规则](https://www.runoob.com/w3cnote/yaml-intro.html)

- [VSCode](https://code.visualstudio.com/)
- Vim
- nano
- Windows记事本

这些编辑器都可以拿来用，当前其中个人较为推荐的还是VSCode。

:::tip
大部分的插件配置文件基本都在其插件项目下的`config`文件夹中
极少部分选择将配置文件保存在Yunzai的config文件夹下
例如我安装了一个`abc-plugin`
那么它的配置文件有可能位于`Yunzai/plugins/abc-plugin/config/xxx.yaml`下
或者索性直接将其放到了`Yunzai/config/abc-plugin.yaml`或`Yunzai/config/abc-plugin/xxx.yaml(多个)`
具体请查看你安装的插件的README项目说明
:::
