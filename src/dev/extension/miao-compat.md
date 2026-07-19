---
title: Miao-Yunzai 兼容与迁移
icon: code-compare
order: 1
tag:
  - 扩展
  - Miao-Yunzai
  - TRSS-Yunzai
  - 兼容
  - 迁移
---

::: warning 扩展资料
本站插件开发以 TRSS-Yunzai 为主线。Miao-Yunzai 当前主要作为旧插件兼容、迁移和能力差异参考

本文仅在你需要维护 Miao-Yunzai 插件、从 Miao 迁移至 TRSS，或确实需要兼容两个框架时使用。普通 TRSS 插件开发请优先阅读[《TRSS-Yunzai 插件开发完整 Wiki》](../full-wiki.md)。
:::

> 本文同时面向 Miao-Yunzai 与 TRSS-Yunzai。
>
> 源码基线：Miao-Yunzai `a1ba76f`（2026-04-16），TRSS-Yunzai `a3d75d5`（2026-07-02）。两者的 `package.json` 虽然都标记为 `3.1.3`，但底层架构已经明显不同。

## 目录

1. [适用范围与兼容标记](#一、适用范围与兼容标记)
2. [架构与兼容性总览](#二、架构与兼容性总览)
3. [公共：目录和加载规则](#三、公共-目录和加载规则)
4. [公共：最小插件与规则](#四、公共-最小插件与规则)
5. [公共：事件对象与回复](#五、公共-事件对象与回复)
6. [公共：权限、返回值和优先级](#六、公共-权限、返回值和优先级)
7. [公共：上下文与多轮对话](#七、公共-上下文与多轮对话)
8. [公共：Handler](#八、公共-handler)
9. [公共但有差异：定时任务](#九、公共但有差异-定时任务)
10. [公共：插件配置与 Redis](#十、公共-插件配置与-redis)
11. [公共但有前提：Runtime 与渲染](#十一、公共但有前提-runtime-与渲染)
12. [公共消息段与协议差异](#十二、公共消息段与协议差异)
13. [全局配置差异](#十三、全局配置差异)
14. [Bot API 差异](#十四、bot-api-差异)
15. [Miao-Yunzai 专用开发](#十五、miao-yunzai-专用开发)
16. [TRSS-Yunzai 专用开发](#十六、trss-yunzai-专用开发)
17. [跨框架兼容插件模板](#十七、跨框架兼容插件模板)
18. [迁移和发布检查清单](#十八、迁移和发布检查清单)

---

## 一、适用范围与兼容标记

本文使用以下标记：

| 标记 | 含义 |
|---|---|
| `[公共]` | 当前 Miao-Yunzai 与 TRSS-Yunzai 都支持 |
| `[有差异]` | 两边都有该能力，但参数、返回值或行为不同 |
| `[Miao]` | 仅适用于当前 Miao-Yunzai |
| `[TRSS]` | 仅适用于当前 TRSS-Yunzai |

“公共”指当前源码中的共同能力，不表示所有历史版本、第三方分支或全部协议端都完全一致。尤其是文件、语音、按钮、Markdown、转发消息、群管理等能力，最终还会受到协议端限制。

### 推荐原则

若希望一个插件同时运行在两套框架中：

- 优先使用 `e.reply()`，不要直接依赖全局 `Bot` 发送消息。
- 优先使用 `e.bot`、`e.friend`、`e.group`、`e.member` 操作当前事件所属账号。
- 使用相对路径导入公共模块，不要依赖 `#yunzai`。
- 使用 `logger` 记录日志，不要把 `Bot.makeLog()` 当成公共 API。
- 一个插件类只配置一个定时任务；需要多个任务时，在构造器中显式给 `this.task` 赋数组。
- 协议扩展消息段和群管理能力必须做存在性检查。

---

## 二、架构与兼容性总览

### 2.1 Miao-Yunzai

Miao 的全局 `Bot` 是 `icqq.Client` 实例。核心直接负责 QQ 登录，事件对象主要来自 ICQQ。

```text
app.js
  -> Yunzai.run()
  -> new icqq.Client()
  -> ListenerLoader.load(bot)
  -> bot.login()
  -> global.Bot = bot
```

特点：

- 以单个 QQ/ICQQ 客户端为核心。
- `Bot.uin` 通常是当前机器人 QQ 号。
- 内置 `genshin` 功能，并强依赖 `miao-plugin` 的部分组件。
- 可以直接使用 ICQQ 对象和接口，但这类代码不具备跨协议能力。

### 2.2 TRSS-Yunzai

TRSS 的全局 `Bot` 是一个多账号、多协议管理器，底层继承 `EventEmitter`，协议实现位于 adapter。

```text
app.js
  -> global.Bot = new Yunzai()
  -> 初始化配置
  -> 启动 HTTP/HTTPS/WebSocket 服务
  -> 加载插件和监听器
  -> adapter 注册一个或多个 Bot
```

特点：

- `Bot.bots` 保存多个账号实例。
- 事件使用 `self_id` 区分机器人账号。
- 支持 OneBot v11、Milky、Satori、OPQBot、ComWeChat、GSUIDCore、stdin 等内置适配器。
- 额外提供 HTTP、WebSocket、文件 URL 和大量 `Bot` 工具 API。
- 同一个插件需要面对不同协议能力不一致的问题。

### 2.3 能力总览

| 能力 | Miao | TRSS |
|---|---:|---:|
| 基础 `plugin/rule/reply` | 支持 | 支持 |
| 上下文、Handler、Redis | 支持 | 支持 |
| miao-plugin 渲染 | 必需依赖 | 可选依赖；使用时仍需安装 |
| 原生多 Bot | 不支持 | 支持 |
| 内置 ICQQ 登录 | 支持 | 核心不提供，通常使用插件或外部协议端 |
| adapter 开发 | 不支持 | 支持 |
| HTTP/WebSocket 服务 | 不支持 | 支持 |
| `#yunzai` 导入别名 | 支持 | 不支持 |
| TRSS `Bot` 工具代理 | 不支持 | 支持 |

---

## 三、公共：目录和加载规则

### 3.1 插件目录

两套框架都会扫描 `plugins/` 下的一级目录：

```text
plugins/
└── my-plugin/
    └── index.js
```

加载规则相同：

1. 如果插件目录存在 `index.js`，只把该文件作为入口。
2. 如果不存在 `index.js`，加载插件目录第一层的所有 `.js` 文件。
3. 不会自动递归扫描 `apps/`、`model/` 等子目录。

拆分模块时，需要从入口手动导出：

```js
// plugins/my-plugin/index.js
export { Hello } from "./apps/hello.js"
export { Help } from "./apps/help.js"
```

也可以导出 `apps` 对象：

```js
import plugin from "../../lib/plugins/plugin.js"

class Hello extends plugin {}
class Help extends plugin {}

export const apps = { Hello, Help }
```

### 3.2 推荐结构

```text
plugins/my-plugin/
├── index.js
├── apps/
│   ├── hello.js
│   └── admin.js
├── model/
│   └── service.js
└── resources/
    └── help/
        ├── index.html
        └── index.css
```

### 3.3 公共导入方式

入口文件位于 `plugins/my-plugin/index.js` 时：

```js
import plugin from "../../lib/plugins/plugin.js"
import cfg from "../../lib/config/config.js"
import makeConfig from "../../lib/plugins/config.js"
import common from "../../lib/common/common.js"
```

子目录文件位于 `plugins/my-plugin/apps/hello.js` 时，需要多退一级：

```js
import plugin from "../../../lib/plugins/plugin.js"
```

不要在跨框架插件中使用：

```js
import { Plugin } from "#yunzai"
```

`#yunzai` 只存在于当前 Miao-Yunzai 的 `package.json`，TRSS 没有该别名。

---

## 四、公共：最小插件与规则

### 4.1 最小插件

```js
import plugin from "../../lib/plugins/plugin.js"

export class Hello extends plugin {
  constructor() {
    super({
      name: "问候",
      dsc: "基础问候示例",
      event: "message",
      priority: 5000,
      rule: [
        {
          reg: "^#你好$",
          fnc: "hello",
        },
      ],
    })
  }

  async hello(e) {
    await e.reply("你好呀")
    return true
  }
}
```

该写法同时兼容 Miao 和 TRSS。

### 4.2 构造参数

```js
super({
  name: "your-plugin",
  dsc: "无",
  event: "message",
  priority: 5000,
  rule: [],
  task: { fnc: "", cron: "" },
  handler: undefined,
  namespace: undefined,
})
```

| 参数 | 说明 | 兼容性 |
|---|---|---|
| `name` | 插件名称 | 公共 |
| `dsc` | 插件说明 | 公共 |
| `event` | 监听事件，默认 `message` | 公共 |
| `priority` | 数字越小越先执行 | 公共 |
| `rule` | 命令规则数组 | 公共 |
| `handler` | Handler 配置 | 公共 |
| `namespace` | Handler 命名空间 | 公共 |
| `task` | 定时任务 | 有差异，见第九章 |

### 4.3 rule

```js
rule: [
  {
    reg: "^#命令$",
    fnc: "run",
    event: "message",
    log: true,
    permission: "all",
  },
]
```

| 字段 | 说明 |
|---|---|
| `reg` | 字符串或正则对象；为兼容旧实现，推荐写字符串 |
| `fnc` | 当前插件类的方法名 |
| `event` | 可选，覆盖插件级 `event` |
| `log` | `false` 时降低或隐藏普通执行日志 |
| `permission` | `master`、`owner`、`admin`、`all` |

### 4.4 多命令

```js
export class MultiCommand extends plugin {
  constructor() {
    super({
      name: "多命令示例",
      rule: [
        { reg: "^#你好$", fnc: "hello" },
        { reg: "^#再见$", fnc: "bye" },
        { reg: "^#管理操作$", fnc: "admin", permission: "master" },
      ],
    })
  }

  hello() {
    return this.reply("你好")
  }

  bye() {
    return this.reply("再见")
  }

  admin() {
    return this.reply("主人命令已执行")
  }
}
```

---

## 五、公共：事件对象与回复

### 5.1 公共常用字段

以下字段是两边普通消息插件最常使用的公共部分：

```js
e.post_type
e.message_type
e.sub_type
e.self_id
e.user_id
e.group_id
e.message_id
e.message
e.raw_message
e.msg
e.img
e.file
e.sender
e.friend
e.group
e.member
e.bot
e.isPrivate
e.isGroup
e.isMaster
e.at
e.atBot
e.runtime
```

注意：

- 字段是否存在取决于事件类型。
- TRSS 的事件来自不同 adapter，不应假设每个字段都和 ICQQ 完全一致。
- 使用可选链访问非必需字段，例如 `e.sender?.card`。
- 跨框架插件应使用 `e.self_id`，但不要假设它一定是纯数字。

### 5.2 回复

公共签名：

```js
await e.reply(msg, quote = false, data = {})
```

```js
await e.reply("普通回复")
await e.reply("引用回复", true)
await e.reply("提醒你", false, { at: true })
await e.reply("稍后撤回", false, { recallMsg: 30 })
await this.reply("使用插件基类回复")
```

`this.reply()` 会调用当前实例的 `this.e.reply()`。如果 `this.e` 或 `e.reply` 不存在，会返回 `false`。

### 5.3 回复差异

| 行为 | Miao | TRSS |
|---|---|---|
| `quote: true` | 交给 ICQQ 原始回复方法处理 | 显式插入 `segment.reply(e.message_id)` |
| `data.at: true` | 构造带昵称的 `segment.at` | 构造 `segment.at(e.user_id)` |
| `recallMsg` | 撤回机器人发送的消息 | 当前实现还可能同时撤回原消息 |
| 发送失败 | 可按配置通知主人 | 返回带 `error` 的对象并记录日志 |

因此不要依赖两边完全相同的回复返回对象。跨框架代码通常只判断真假：

```js
const result = await e.reply("处理完成")
if (!result) logger.warn("消息可能发送失败")
```

### 5.4 当前会话对象

优先使用：

```js
await e.reply("回复当前事件")
await e.friend?.sendMsg("发送给当前好友")
await e.group?.sendMsg("发送到当前群")
await e.member?.sendMsg?.("发送给当前成员")
```

主动调用能力前应检查方法：

```js
if (e.group?.setName) {
  await e.group.setName("新群名")
} else {
  await e.reply("当前协议不支持修改群名")
}
```

---

## 六、公共：权限、返回值和优先级

### 6.1 权限

```js
rule: [
  { reg: "^#公开$", fnc: "open", permission: "all" },
  { reg: "^#主人$", fnc: "master", permission: "master" },
  { reg: "^#群主$", fnc: "owner", permission: "owner" },
  { reg: "^#管理$", fnc: "admin", permission: "admin" },
]
```

| 权限 | 含义 |
|---|---|
| 不填或 `all` | 所有人 |
| `master` | Bot 主人 |
| `owner` | 群主 |
| `admin` | 群管理员；两边对群主是否同时视为管理员的细节略有差异 |

手动检查：

```js
async sensitive(e) {
  if (!e.isMaster) {
    await e.reply("暂无权限")
    return true
  }

  await e.reply("已执行")
  return true
}
```

主人配置存在框架差异，见第十三章。

### 6.2 优先级

数字越小越先执行：

```text
-Infinity -> 0 -> 100 -> 5000 -> 10000 -> Infinity
```

系统拦截功能通常使用很小的优先级，兜底插件使用很大的优先级。普通业务插件建议保持在 `1000` 到 `10000` 之间。

### 6.3 返回值

两边都推荐：

- 处理完成返回 `true` 或不显式返回。
- 希望继续尝试后续规则时返回 `false`。
- `accept()` 返回字符串 `"return"` 时立即结束当前事件。

为减少不同 loader 版本的细节差异，成功处理后明确 `return true` 最清晰。

---

## 七、公共：上下文与多轮对话

### 7.1 API

```js
this.setContext(type, isGroup, time, timeout)
this.getContext(type, isGroup)
this.finish(type, isGroup)
await this.awaitContext(isGroup, time, timeout)
this.resolveContext(context)
```

上下文保存的是设置时的旧事件。下一条消息触发上下文方法时：

- 方法参数 `context` 是旧事件。
- `this.e` 是当前新消息事件。

### 7.2 猜数字示例

```js
import plugin from "../../lib/plugins/plugin.js"

export class GuessGame extends plugin {
  constructor() {
    super({
      name: "猜数字",
      priority: 7000,
      rule: [{ reg: "^#猜数字$", fnc: "start" }],
    })
  }

  async start(e) {
    e._answer = Math.floor(Math.random() * 100) + 1
    await e.reply("请输入 1 到 100 的数字")
    this.setContext("guess", e.isGroup, 60, "超时，游戏已取消")
    return true
  }

  async guess(context) {
    const e = this.e
    const value = Number.parseInt(e.msg, 10)

    if (Number.isNaN(value)) {
      await e.reply("请输入数字")
      return true
    }

    if (value === context._answer) {
      this.finish("guess", e.isGroup)
      await e.reply("猜对了")
      return true
    }

    await e.reply(value < context._answer ? "太小了" : "太大了")
    return true
  }
}
```

### 7.3 差异和限制

- Miao 的上下文键不包含 `self_id`。
- TRSS 的上下文键包含 `self_id`，适合多 Bot。
- 两边 `resolveContext()` 都存在未显式传入 `isGroup` 的实现细节，复杂私聊/群聊混合流程应先测试。
- 不要只把会话状态保存到 `this.xxx`；loader 可能为每次规则处理创建新实例。

---

## 八、公共：Handler

### 8.1 注册

```js
export class MyHandler extends plugin {
  constructor() {
    super({
      name: "Handler 示例",
      namespace: "my-plugin",
      handler: [
        {
          key: "message.group.normal",
          fn: "handleGroup",
          priority: 500,
        },
      ],
    })
  }

  async handleGroup(e, args, reject) {
    if (!e.msg) {
      reject("没有文本")
      return
    }
    return { ok: true, text: e.msg }
  }
}
```

### 8.2 调用

```js
if (e.runtime.handler.has("message.group.normal")) {
  const result = await e.runtime.handler.call("message.group.normal", e, {})
}
```

两边当前的 `callAll()` 都是空实现，不要依赖：

```js
await e.runtime.handler.callAll("key", e, args)
```

`reject()` 表示当前 Handler 没有完成处理，让调用器继续寻找后续 Handler；它不是全局阻断。

当前源码还有一个优先级差异：Miao 会把 `handler.priority` 正确传给 Handler；TRSS loader 当前传入的字段名是 `property`，而 Handler 读取的是 `priority`，所以 TRSS 当前实际上会回退到默认优先级 `500`。在该问题修复前，不要依赖多个 Handler 的自定义先后顺序。

---

## 九、公共但有差异：定时任务

### 9.1 不要直接照搬旧式字符串写法

以下写法不可靠：

```js
task: {
  name: "每日报时",
  cron: "0 0 8 * * *",
  fnc: "morningReport",
}
```

当前两边的任务执行器最终都会调用 `i.fnc()`，所以 `fnc` 必须是函数。

### 9.2 推荐的跨框架写法

在 `super()` 之后显式赋值：

```js
export class DailyReport extends plugin {
  constructor() {
    super({
      name: "每日报时",
      rule: [{ reg: "^#立即报时$", fnc: "report" }],
    })

    this.task = {
      name: "每日报时",
      cron: "0 0 8 * * *",
      fnc: this.report.bind(this),
      log: true,
    }
  }

  async report(e = this.e) {
    logger.mark("执行每日报时")
    if (e?.reply) await e.reply(new Date().toLocaleString())
    return true
  }
}
```

注意：后台任务通常没有真实消息事件，不能无条件访问 `this.e`。

### 9.3 多任务

TRSS 原生支持 `this.task` 数组。Miao 的 loader 也能收集数组，但 Miao 的基类构造器会重建传入 `super()` 的 `task`，因此必须在 `super()` 后赋值：

```js
this.task = [
  {
    name: "任务 A",
    cron: "0 0 8 * * *",
    fnc: this.taskA.bind(this),
  },
  {
    name: "任务 B",
    cron: "0 30 8 * * *",
    fnc: this.taskB.bind(this),
  },
]
```

### 9.4 cron 差异

- TRSS 会截取 cron 的前 6 段再交给 `node-schedule`。
- Miao 直接把 cron 字符串传给 `node-schedule`。
- 跨框架统一使用 6 段格式：`秒 分 时 日 月 周`。

```text
0 * * * * *      每分钟
0 0 * * * *      每小时
0 0 8 * * *      每天 08:00
*/5 * * * * *    每 5 秒
```

---

## 十、公共：插件配置与 Redis

### 10.1 makeConfig

```js
import makeConfig from "../../lib/plugins/config.js"

const { config, configSave, configFile, watcher } = await makeConfig(
  "my-plugin",
  {
    enabled: true,
    timeout: 30,
  },
  {},
  {
    watch: true,
  },
)
```

生成：

```text
config/my-plugin.yaml
```

修改并保存：

```js
config.enabled = false
await configSave()
```

公共签名：

```js
makeConfig(name, defaults = {}, keep = {}, opts = {})
```

差异：

- Miao 在未传 `opts.watch` 时默认监听。
- TRSS 在未传 `opts.watch` 时跟随 `cfg.bot.file_watch`。
- 为确保行为一致，应显式传 `{ watch: true }` 或 `{ watch: false }`。

### 10.2 Redis

两边都提供全局 `redis`：

```js
await redis.get("my-plugin:key")
await redis.set("my-plugin:key", "value")
await redis.set("my-plugin:key", "value", { EX: 3600 })
await redis.del("my-plugin:key")
await redis.exists("my-plugin:key")
await redis.incr("my-plugin:counter")

await redis.hSet("my-plugin:hash", "field", "value")
await redis.hGet("my-plugin:hash", "field")
await redis.hGetAll("my-plugin:hash")

await redis.lPush("my-plugin:list", "item")
await redis.lRange("my-plugin:list", 0, -1)

await redis.sAdd("my-plugin:set", "member")
await redis.sMembers("my-plugin:set")
```

务必使用插件前缀，避免污染框架键，例如：

```text
my-plugin:user:<user_id>
my-plugin:group:<group_id>
```

多 Bot 插件建议加入 `self_id`：

```js
const key = `my-plugin:${e.self_id}:${e.user_id}`
```

---

## 十一、公共但有前提：Runtime 与渲染

### 11.1 公共属性

事件处理前，两边都会注册 `e.runtime`：

```js
e.runtime.e
e.runtime.cfg
e.runtime.common
e.runtime.puppeteer
e.runtime.handler
e.runtime.user
e.runtime.uid
e.runtime.hasCk
```

米游社相关属性依赖 `genshin` 与 `miao-plugin`：

```js
e.runtime.gsCfg
e.runtime.MysInfo
e.runtime.NoteUser
e.runtime.MysUser
e.runtime.getMysInfo()
e.runtime.getMysApi()
```

当前 Miao 对这些模块是强依赖；TRSS 会尝试可选加载。写通用插件时必须检查：

```js
if (!e.runtime.MysInfo) {
  await e.reply("该功能需要安装 genshin/miao-plugin")
  return true
}
```

### 11.2 render

```js
await e.runtime.render("my-plugin", "help/index", {
  title: "帮助",
  items: ["命令 A", "命令 B"],
})
```

模板位置：

```text
plugins/my-plugin/resources/help/index.html
```

常用选项：

```js
await e.runtime.render(
  "my-plugin",
  "help/index",
  data,
  {
    retType: "msgId",
    beforeRender({ data }) {
      data.generatedAt = Date.now()
      return data
    },
  },
)
```

| `retType` | 行为 |
|---|---|
| 默认 | 自动发送，通常返回 `true` |
| `msgId` | 自动发送，返回回复结果 |
| `base64` | 名称具有误导性；当前实际返回截图消息段，不保证是纯 base64 字符串 |

两边当前 `cfg.recallMsg` 分支都没有把撤回秒数正确传给 `e.reply()`。需要撤回时建议自己发送：

```js
const image = await e.runtime.render("my-plugin", "help/index", data, {
  retType: "base64",
})
await e.reply(image, false, { recallMsg: 30 })
```

### 11.3 common

公共方法名：

```js
common.relpyPrivate(user_id, msg, bot_id)
common.sleep(ms)
common.downFile(url, file, opts)
common.mkdirs(dirname)
common.makeForwardMsg(e, messages, description)
```

其中源码函数名就是 `relpyPrivate`，不是 `replyPrivate`。

`relpyPrivate` 的 Bot 选择和底层实现存在差异；跨框架主动私聊时，优先使用事件对象：

```js
await e.friend?.sendMsg("消息")
```

---

## 十二、公共消息段与协议差异

### 12.1 公共基础消息段

以下写法在两边最常用：

```js
await e.reply("纯文本")
await e.reply(segment.image("https://example.com/a.png"))
await e.reply([
  segment.at(e.user_id),
  " 你好",
])
```

通常可用：

```js
segment.image(file)
segment.at(user_id)
segment.reply(message_id)
segment.record(file)
segment.video(file)
```

### 12.2 接收消息段

公共基础结构：

```js
e.message = [
  { type: "text", text: "你好" },
  { type: "image", url: "https://example.com/a.png" },
  { type: "at", qq: "123456" },
]
```

插件通常不需要自己重新解析，loader 已补充：

```js
e.msg
e.img
e.at
e.atBot
e.file
```

### 12.3 TRSS 扩展

TRSS 的本地 `oicq` 兼容模块还提供：

```js
segment.custom(type, data)
segment.raw(data)
segment.button(...data)
segment.markdown(data)
segment.file(file, name)
```

这些不属于可靠的 Miao 公共 API。Miao 甚至明确把：

```js
segment.button = () => ""
```

因此跨框架插件不能依赖按钮和 Markdown。即使在 TRSS 中，adapter 也可能不支持某种消息段。

推荐能力检查：

```js
if (typeof segment.file === "function" && e.group?.sendFile) {
  await e.group.sendFile(file, name)
} else {
  await e.reply("当前环境不支持发送文件")
}
```

---

## 十三、全局配置差异

### 13.1 公共配置

```js
import cfg from "../../lib/config/config.js"

cfg.bot
cfg.other
cfg.redis
cfg.renderer
cfg.db
cfg.masterQQ
cfg.package

cfg.getOther()
cfg.getdefSet("bot")
cfg.getConfig("bot")
```

`cfg.group` 不是可靠的公共 getter：TRSS 的配置 Proxy 可以解析它，Miao 应通过 `cfg.getGroup(group_id)` 获取群配置。

默认配置与用户配置通常位于：

```text
config/default_config/<name>.yaml
config/config/<name>.yaml
```

插件不要修改 `default_config`。插件自身配置优先使用 `makeConfig()`。

### 13.2 getGroup

Miao：

```js
const groupCfg = cfg.getGroup(e.group_id)
```

TRSS：

```js
const groupCfg = cfg.getGroup(e.self_id, e.group_id)
```

跨框架辅助函数：

```js
function isTRSS() {
  return Array.isArray(Bot.uin)
}

function getGroupConfig(cfg, e) {
  return isTRSS()
    ? cfg.getGroup(e.self_id, e.group_id)
    : cfg.getGroup(e.group_id)
}
```

### 13.3 主人配置

Miao 使用全局主人列表：

```js
cfg.masterQQ
```

TRSS 同时提供：

```js
cfg.masterQQ
cfg.master[e.self_id]
cfg.uin
cfg.qq
```

TRSS 的 `master` 表达“Bot 账号 -> 主人账号列表”；Miao 没有该映射。普通插件不要直接解析配置，优先使用已经计算好的 `e.isMaster`。

### 13.4 TRSS 专用配置

```js
cfg.server
cfg.master
cfg.uin
cfg.getAllCfg(name)
```

这些不能直接用于 Miao。

---

## 十四、Bot API 差异

### 14.1 公共安全范围

以下全局变量两边都有：

```js
Bot
redis
logger
Renderer
plugin
segment
```

但 `Bot` 的类型完全不同：

- Miao：`icqq.Client`。
- TRSS：多账号管理器 Proxy。

真正适合跨框架的通常是事件对象，而不是全局 Bot。

### 14.2 Miao Bot

Miao 可直接使用 ICQQ Client 能力，例如：

```js
const bot = e.bot || Bot
const friend = bot.pickUser(e.user_id)
const group = bot.pickGroup(e.group_id)

await friend.sendMsg("私聊")
await group.sendMsg("群聊")
```

这类接口与 ICQQ 强绑定，不应假设能在所有 TRSS adapter 中运行。

### 14.3 TRSS Bot

TRSS 提供：

```js
await Bot.sendFriendMsg(bot_id, user_id, msg)
await Bot.sendGroupMsg(bot_id, group_id, msg)
await Bot.sendMasterMsg(msg, bot_array, sleep)

Bot.pickFriend(user_id, strict)
Bot.pickGroup(group_id, strict)
Bot.pickMember(group_id, user_id)

Bot.getFriendArray()
Bot.getGroupArray()
Bot.makeForwardArray(messages, node)
Bot.getTextMsg(filter)
Bot.getMasterMsg()
Bot.fileToUrl(file, opts)
```

还会把不存在于 Bot 管理器的方法代理到 `lib/util.js`：

```js
Bot.makeLog()
Bot.sleep()
Bot.download()
Bot.exec()
Bot.mkdir()
Bot.rm()
Bot.glob()
Bot.fileType()
Bot.promiseEvent()
```

这些是 TRSS 专用 API。

### 14.4 跨框架主动发送

当前事件内：

```js
await e.reply("消息")
```

指定当前群或好友：

```js
await e.group?.sendMsg("群消息")
await e.friend?.sendMsg("好友消息")
```

给第一个主人主动发送，可封装：

```js
import cfg from "../../lib/config/config.js"

async function sendMaster(msg) {
  if (Array.isArray(Bot.uin) && typeof Bot.sendMasterMsg === "function") {
    return Bot.sendMasterMsg(msg)
  }

  const master = cfg.masterQQ[0]
  if (!master) return false
  return Bot.pickUser(master).sendMsg(msg)
}
```

主动消息没有真实事件上下文，必须处理“没有在线 Bot”“主人不是好友”“协议不支持”等失败情况。

---

## 十五、Miao-Yunzai 专用开发

### 15.1 #yunzai

Miao 提供：

```js
import {
  Plugin,
  ConfigController,
  Handler,
  Loader,
  Runtime,
  puppeteer,
  Renderer,
  renderer,
  Bot,
  Redis,
} from "#yunzai"
```

该别名在 TRSS 中不存在。仅发布 Miao 插件时可以使用；跨框架插件使用相对路径。

### 15.2 #miao 与 #miao.models

Miao 的部分核心和内置 genshin 代码会直接导入：

```js
import { Common, Version, Data } from "#miao"
import { Character, Weapon, Player } from "#miao.models"
```

对应目录：

```text
plugins/miao-plugin/components/index.js
plugins/miao-plugin/models/index.js
```

当前 Miao 必须安装 `miao-plugin` 才能完整启动和渲染。使用这些模块的插件也应在安装说明中明确依赖。

### 15.3 ICQQ 专用能力

Miao 插件可以访问 ICQQ 的好友、群、成员对象和接口。典型代码：

```js
const group = e.bot.pickGroup(e.group_id)
const member = group.pickMember(e.user_id)

await group.sendMsg("消息")
await member.poke?.()
```

此类方法应查阅当前 ICQQ 对象实际实现，并捕获风控、权限不足和接口变化错误。

### 15.4 登录事件

Miao 核心包含登录、二维码、滑块、设备验证、上线和离线事件处理。插件如果直接监听这些 ICQQ 事件，会成为 Miao 专用插件。

### 15.5 Miao 限制

- `Bot` 不是 TRSS 多账号管理器。
- 没有 `Bot.bots`、`Bot.adapter`、`Bot.express`、`Bot.wsf`。
- 没有 `Bot.fileToUrl()` 等 TRSS 工具。
- `segment.button()` 当前返回空字符串。
- 群配置调用为 `cfg.getGroup(group_id)`。

---

## 十六、TRSS-Yunzai 专用开发

### 16.1 多账号

```js
const bot = Bot[e.self_id]
if (!bot) {
  await e.reply("当前 Bot 不在线")
  return true
}
```

插件状态、Redis key、缓存 key 和上下文都应考虑 `self_id`。

```js
const key = `${e.self_id}:${e.group_id}:${e.user_id}`
```

不要依赖 Proxy 随机或自动选择某个 Bot。需要确定账号时显式写 `Bot[e.self_id]`。

### 16.2 适配器信息

TRSS 会尽量补充：

```js
e.adapter_id
e.adapter_name
e.bot.adapter
```

可以按协议降级，但不要把适配器名称作为唯一业务判断：

```js
if (e.group?.sendFile) {
  await e.group.sendFile(file, name)
} else {
  await e.reply("当前协议不支持群文件")
}
```

能力检测通常比 adapter 名称判断可靠。

### 16.3 HTTP 与文件 URL

```js
const url = await Bot.fileToUrl(buffer, {
  name: "result.png",
  time: 120000,
  times: 1,
})
```

TRSS 通过自身 HTTP 服务提供临时文件。URL 可能携带鉴权参数，不要记录或公开敏感链接。

插件可以向 Express 注册路由，但这是全局服务修改，必须避免路径冲突：

```js
Bot.express.get("/my-plugin/status", (req, res) => {
  res.json({ ok: true })
})
```

发布公共插件时要说明端口、鉴权、路由和暴露风险。

### 16.4 WebSocket adapter 基本骨架

```js
Bot.adapter.push(
  new (class MyAdapter {
    id = "MyAdapter"
    name = "My Adapter"
    path = "MyAdapter"

    constructor() {
      Bot.wsf[this.path] ||= []
      Bot.wsf[this.path].push((ws, req) => this.connect(ws, req))
    }

    connect(ws) {
      ws.on("message", raw => {
        const data = JSON.parse(raw)
        const event = {
          post_type: "message",
          message_type: "group",
          sub_type: "normal",
          self_id: data.self_id,
          user_id: data.user_id,
          group_id: data.group_id,
          message: data.message,
        }

        Bot.em("message.group.normal", event)
      })
    }
  })(),
)
```

真实 adapter 还必须处理：

- Bot 注册和注销。
- `pickFriend/pickGroup/pickMember`。
- `fl/gl/gml`。
- 发送 API 和错误映射。
- 消息段双向转换。
- 断线重连、心跳、鉴权。
- notice/request 事件标准化。

### 16.5 事件冒泡

TRSS 专用 `Bot.em()`：

```js
Bot.em("message.group.normal", event)
```

会依次发射：

```text
message.group.normal
message.group
message
```

Miao 的全局 Bot 没有该方法。

---

## 十七、跨框架兼容插件模板

下面的模板避免依赖 TRSS 专用 Bot API 和 Miao 专用 ICQQ API。

```js
import plugin from "../../lib/plugins/plugin.js"
import cfg from "../../lib/config/config.js"
import makeConfig from "../../lib/plugins/config.js"

const { config, configSave } = await makeConfig(
  "portable-demo",
  {
    enabled: true,
  },
  {},
  { watch: true },
)

function isTRSS() {
  return Array.isArray(Bot.uin)
}

function getGroupConfig(e) {
  return isTRSS()
    ? cfg.getGroup(e.self_id, e.group_id)
    : cfg.getGroup(e.group_id)
}

export class PortableDemo extends plugin {
  constructor() {
    super({
      name: "跨框架示例",
      dsc: "兼容 Miao-Yunzai 和 TRSS-Yunzai",
      event: "message",
      priority: 5000,
      rule: [
        { reg: "^#兼容测试$", fnc: "test" },
        { reg: "^#切换兼容示例$", fnc: "toggle", permission: "master" },
      ],
    })

    this.task = {
      name: "跨框架示例任务",
      cron: "0 0 9 * * *",
      fnc: this.daily.bind(this),
      log: false,
    }
  }

  async test(e) {
    if (!config.enabled) {
      await e.reply("功能已关闭")
      return true
    }

    const groupCfg = e.isGroup ? getGroupConfig(e) : undefined
    const lines = [
      `框架：${isTRSS() ? "TRSS-Yunzai" : "Miao-Yunzai"}`,
      `Bot：${e.self_id}`,
      `用户：${e.user_id}`,
      `群聊：${Boolean(e.isGroup)}`,
      `群前缀模式：${groupCfg?.onlyReplyAt ?? "无"}`,
    ]

    await e.reply(lines.join("\n"), true)
    return true
  }

  async toggle(e) {
    config.enabled = !config.enabled
    await configSave()
    await e.reply(`已${config.enabled ? "开启" : "关闭"}`)
    return true
  }

  async daily() {
    logger.mark("[portable-demo] 每日任务执行")
  }
}
```

### 17.1 可选能力封装

```js
async function sendFileToCurrentConversation(e, file, name) {
  const target = e.group || e.friend

  if (typeof target?.sendFile === "function") {
    return target.sendFile(file, name)
  }

  if (typeof segment.file === "function") {
    return e.reply(segment.file(file, name))
  }

  await e.reply("当前框架或协议不支持文件消息")
  return false
}
```

### 17.2 平台分支集中管理

不要在每个命令里散落大量框架判断。建议建立一层兼容模块：

```text
plugins/my-plugin/
├── index.js
└── model/
    └── platform.js
```

```js
// model/platform.js
export const platform = {
  get isTRSS() {
    return Array.isArray(Bot.uin)
  },

  getGroupConfig(cfg, e) {
    return this.isTRSS
      ? cfg.getGroup(e.self_id, e.group_id)
      : cfg.getGroup(e.group_id)
  },

  getCurrentBot(e) {
    return e.bot || (this.isTRSS ? Bot[e.self_id] : Bot)
  },
}
```

---

## 十八、迁移和发布检查清单

### 18.1 从 TRSS 插件迁移到 Miao

- [ ] 删除或替换 `Bot.sendFriendMsg/sendGroupMsg/sendMasterMsg`。
- [ ] 删除或替换 `Bot.makeLog/sleep/download/exec/glob/fileToUrl`。
- [ ] 把 `cfg.getGroup(e.self_id, e.group_id)` 改为兼容封装。
- [ ] 不直接访问 `cfg.server`、`cfg.master`、`Bot.bots`。
- [ ] 移除 adapter、HTTP、WebSocket 代码。
- [ ] 检查 `segment.button/markdown/raw/custom/file`。
- [ ] 定时任务 `fnc` 使用函数，并在 `super()` 后赋值。
- [ ] 确认是否依赖 `miao-plugin`。

### 18.2 从 Miao 插件迁移到 TRSS

- [ ] 不使用 `#yunzai`，改成相对路径导入。
- [ ] 不把 `Bot` 当成唯一 ICQQ Client。
- [ ] 使用 `e.self_id` 区分账号。
- [ ] 把 `cfg.getGroup(e.group_id)` 改为兼容封装。
- [ ] 不直接依赖 ICQQ 私有字段或 `_info`。
- [ ] 对群管理、文件、语音、转发等能力做方法检查。
- [ ] Redis 和内存缓存键加入 `self_id`。
- [ ] 在至少两个不同 adapter 上测试协议相关功能。

### 18.3 公共插件发布前

- [ ] 在 Miao-Yunzai 中完成启动、加载、命令、权限测试。
- [ ] 在 TRSS-Yunzai 中完成相同测试。
- [ ] 测试私聊和群聊。
- [ ] 测试普通用户、管理员、群主和主人权限。
- [ ] 测试图片、引用、@、撤回失败时的降级。
- [ ] 测试 Redis 不可用或数据为空的情况。
- [ ] 测试配置首次生成和热更新。
- [ ] 测试插件热更新后是否重复注册任务或事件。
- [ ] 在 README 中列出依赖、支持框架和协议限制。

### 18.4 调试建议

使用公共 `logger`：

```js
logger.debug("调试信息")
logger.info("普通信息")
logger.mark("重要操作")
logger.warn("警告")
logger.error(error)
```

不要在日志中输出：

- Cookie、Token、密码。
- WebSocket 鉴权信息。
- 带鉴权参数的临时文件 URL。
- 完整私人消息内容。

遇到兼容问题时，优先记录以下非敏感字段：

```js
logger.debug({
  self_id: e.self_id,
  post_type: e.post_type,
  message_type: e.message_type,
  sub_type: e.sub_type,
  adapter: e.adapter_name,
})
```

---

## 附录：快速参考

### 最安全的公共 API

```js
e.reply()
this.reply()
e.bot
e.friend
e.group
e.member
e.runtime
e.runtime.render()
e.runtime.handler.call()

redis.get()
redis.set()
redis.del()

logger.debug()
logger.info()
logger.warn()
logger.error()

segment.image()
segment.at()
segment.reply()
```

### 需要分框架处理

```js
cfg.getGroup()
cfg.master
cfg.server

Bot.sendFriendMsg()
Bot.sendGroupMsg()
Bot.sendMasterMsg()
Bot.fileToUrl()
Bot.makeLog()
Bot.bots
Bot.adapter
Bot.express
Bot.wsf

segment.button()
segment.markdown()
segment.raw()
segment.custom()
```

### 框架识别

```js
const isTRSS = Array.isArray(Bot.uin)
const framework = isTRSS ? "TRSS-Yunzai" : "Miao-Yunzai"
```

框架识别只应集中用于兼容层。业务代码仍应优先依赖能力检测和事件对象。
