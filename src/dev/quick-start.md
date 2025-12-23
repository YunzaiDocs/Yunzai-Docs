---
title: 快速上手
---

## 命令触发插件

在 `plugins/example` 下新建一个 `test.js`

```ts twoslash
import type { Plugin, segment } from "@kaguyajs/trss-yunzai-types"

/** 全局对象 plugin */
type plugin = typeof Plugin

// ---cut---
export class example extends plugin {
  constructor() {
    super({
      name: "打招呼",
      dsc: "向用户问好",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: "^#测试$",
          fnc: "SayHello"
        },
      ],
    })
  }

  async SayHello() {
    // 回复文本消息
    this.e.reply("这是一条文本消息")

    // 图片消息
    this.e.reply(segment.image("https://ciallo.hxxn.cc/?name=丛雨"))

    // 发送一条艾特消息
    this.e.reply(segment.at(1008611))

    // 组合发送
    this.e.reply([
      segment.at(114514),
      "早上好\n", // 使用 \n 进行文本换行
      "今天也要开开心心的过呀",
      segment.image("https://t.alcy.cc/xhl")
    ])

    // 发送并回复添加at，然后在五秒之后撤回
    this.e.reply("Ciallo～(∠・ω<)⌒☆", true, {
      at: true,
      recallMsg: 5 // 5 秒后撤回
    })

    // 阻止命令继续向下执行
    return true
  }
}
```