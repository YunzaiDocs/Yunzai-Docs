---
title: 快速上手
icon: play
order: 1
tag:
  - 插件
  - 开发
  - 演示
---

本章介绍如何快速上手 Yunzai 插件基本格式。

## 创建一个属于你的插件

在 `plugins/example` 下新建一个 `test.js`，文件名可随意

## 命令正则匹配

监听事件 与 正则匹配 回复

```ts twoslash
export class example extends plugin {
  constructor() {
    super({
      name: "打招呼",
      dsc: "向用户问好",
      event: "message", // 监听的事件类型
      priority: 5000,
      rule: [
        {
          reg: "^#测试$", // 满足正则的消息才会触发
          fnc: "SayHello",
          log: true
        },
      ],
    })
  }

  async SayHello() {
    // 回复文本消息
    this.e.reply("这是一条文本消息")

    // 图片消息
    this.e.reply(segment.image("https://ciallo.kaguya.fan/?name=丛雨"))

    // 发送一条艾特消息
    this.e.reply(segment.at(1008611))

    // 组合发送
    this.e.reply([
      segment.at(this.e.user_id),
      "早上好\n", // 使用 \n 进行文本换行
      "今天也要开开心心的过呀",
      segment.image("https://t.alcy.cc/xhl")
    ])

    // 回复并引用消息添加at，然后在五秒之后撤回
    this.e.reply("Ciallo～(∠・ω<)⌒☆", true, {
      at: true,
      recallMsg: 5 // 5 秒后撤回
    })

    // 阻止命令继续向下执行
    return true
  }
}
```

## 定时任务

```js twoslash
export class tasks extends plugin {
  constructor() {
    super({
      task: {
        name: "每天中午问好",
        cron: "0 30 12 * * *",
        fnc: () => {
          // 给指定用户发送一条问好消息
          Bot.pickFriend(12345678).sendMsg("中午好~")
        }, // 定时任务触发时执行的函数
        log: true // 可选是否显示执行日志
      }
    })
  }
}
```

::: info cron表达式
Yunzai 采用 6 位 cron 表达式，依次是 `秒 分 时 日 月 星期`

```
* * * * * *
│ │ │ │ │ │
│ │ │ │ │ └─ 星期 (0–7)
│ │ │ │ └─── 月 (1–12)
│ │ │ └───── 日 (1–31)
│ │ └─────── 时 (0–23)
│ └───────── 分 (0–59)
└─────────── 秒 (0–59)
```

**常用表达式示例**

| 表达式              | 含义          |
| ---------------- | ----------- |
| `*/10 * * * * *` | 每 10 秒      |
| `0 */5 * * * *`  | 每 5 分钟      |
| `0 0 0 * * *`    | 每天 0 点      |
| `30 0 9 * * 1`   | 每周一 9:00:30 |

:::

## 通知与请求监听

修改 `event` 字段可以监听不同的事件内容。

```js twoslash
/** @augments {plugin<"notice.group.increase">} */
// ---cut---
export class example extends plugin {
  constructor() {
    super({
      name: "进群欢迎",
      dsc: "新成员进群欢迎",
      event: "notice.group.increase"
    })
  }

  /** 接受到事件都会执行一次 */
  async accept() {
    if (this.e.user_id == this.e.self_id) return

    /** 定义入群欢迎内容 */
    let msg = "欢迎新人！"
    /** 冷却cd 30s */
    let cd = 30

    /** cd */
    let key = `Yz:newcomers:${this.e.group_id}`
    if (await redis.get(key)) return
    redis.set(key, "1", { EX: cd })

    /** 回复 */
    await this.reply([
      segment.at(this.e.user_id),
      segment.image("https://t.alcy.cc/xhl"),
      msg,
    ])
  }
}
```

## 上下文

使用自带的上下文机制可以实现多条消息的联动处理。

```js twoslash
export class example2 extends plugin {
  constructor() {
    super({
      name: "复读",
      dsc: "复读用户发送的内容，然后撤回",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: "^#复读$",
          fnc: "repeat",
          permission: "master",
        },
      ],
    })
  }

  /** 复读 */
  async repeat() {
    /** 设置上下文，后续接收到内容会执行doRep方法 */
    this.setContext("doRep")
    /** 回复 */
    return this.reply("请发送要复读的内容", false, { at: true })
  }

  /** 接受内容 */
  doRep() {
    /** 结束上下文 */
    this.finish("doRep")
    /** 复读内容 */
    return this.reply(this.e.message, false, { recallMsg: 5 })
  }
}
```
