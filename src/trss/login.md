---
title: TRSS接入平台
icon: network-wired
tag:
  - TRSS-Yunzai
  - 教程
  - 接入
  - 登录
---

TRSS-Yunzai 原生支持多账号接入甚至你可以不接入直接通过终端与Bot进行交互，因此在你安装完成框架启动后，不会弹出任何登录提示这纯属正常现象并非卡住了，可能很多从Miao-Yunzai迁移过来的用户第一次会感到蒙圈。

## 标准输入

TRSS-Yunzai支持使用标准输入与框架进行指令交互，只需要在框架完全启动之后等待出现`标准输入已连接`等字样时直接在终端输入指令回车即可进行交互。

::: info 我启动之后为什么没有标准输入？
当你的设备或者你所使用的终端不支持标准输入的时候，框架会跳过标准输入的加载

正确的做法是首先确认为前台启动（如果是PM2启动的话肯定是不支持标准输入的）如果还是不行可以尝试更换终端软件

若还是无法使用那还是在接入平台后使用吧。
:::

## 支持的协议标准

TRSS-Yunzai框架原生支持了[`OneBot v11`](https://github.com/botuniverse/onebot-11)/`GSUIDCore`/`ComWeChat` 协议，因此理论上支持以上标准的协议端均可与TRSS-Yunzai对接

以下是部分常用协议端:

- [`NapCatQQ`](https://napneko.github.io/)
- [`LLOneBot`](https://github.com/LLOneBot/LuckyLilliaBot)
- [`Lagrange.OneBot`](https://lagrangedev.github.io/Lagrange.Doc/v1/Lagrange.OneBot/)
- [`ComWeChat`](https://justundertaker.github.io/ComWeChatBotClient/)
- [`GenshinUID`](https://docs.sayu-bot.com/LinkBots/AdapterList.html)
- `...`

---

TRSS-Yunzai启动完成后会输出一个连接地址

```text
连接地址：ws://localhost:2536/[GSUIDCore,OPQBot,ComWeChat,OneBotv11]
```

在没有修改过配置端口的情况下默认端口都是`2536`，后面方括号里的就是支持的路径

比如你使用`OneBot v11`接入则就使用 `ws://localhost:2536/OneBotv11` 作为你的连接地址，将其填写到协议端中即可连接

::: warning 鉴权
默认情况下，server鉴权不启用，如有需要可自行配置
```yaml title="config/config/server.yaml" :line-numbers=7
# 服务器鉴权
auth:
  Authorization: Bearer <access_token> # 此处替换为你的token
```
:::

## 适配器套件

TRSS-Yunzai 官方自带了一部分适配套件，可用于接入不同的平台以及支持更完整的功能。

- [`ICQQ`](https://gitee.com/TimeRainStarSky/Yunzai-ICQQ-Plugin): 使用[ICQQ](https://github.com/icqqjs/icqq)进行登录，也是理论上功能最完整的协议。

- [`QQBot`](https://gitee.com/TimeRainStarSky/Yunzai-QQBot-Plugin): 用于接入[QQ开放平台](https://q.qq.com/)。

- [`KOOK`](https://gitee.com/TimeRainStarSky/Yunzai-KOOK-Plugin): 用于接入[KOOK](https://developer.kookapp.cn/app)

- [`WeChat`](https://gitee.com/TimeRainStarSky/Yunzai-WeChat-Plugin): 接入微信

- [`Telegram`](https://gitee.com/TimeRainStarSky/Yunzai-Telegram-Plugin): 用于接入 Telegram 平台

- [`Discord`](https://gitee.com/TimeRainStarSky/Yunzai-Discord-Plugin): 用于接入 Discord 平台

详细用法请参考适配器说明。
