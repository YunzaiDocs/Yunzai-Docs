---
title: TRSS-Yunzai 插件开发完整 Wiki
icon: book-open
order: 5
tag:
  - TRSS-Yunzai
  - 插件
  - 开发
  - API
---

::: warning 适用范围声明
本文档基于 TRSS-Yunzai 源码编写和校对，**仅适用于 TRSS-Yunzai 插件开发**。

由于 TRSS-Yunzai 与 Miao-Yunzai 在插件加载、事件对象、Runtime、渲染器、适配器及部分 API 实现上存在差异，本文中的代码和结论不保证兼容 Miao-Yunzai。开发跨框架插件时，请分别核对对应框架源码并进行实际测试。
:::

> 基于 [TimeRainStarSky/Yunzai](https://github.com/TimeRainStarSky/Yunzai) 源码校对：TRSS-Yunzai v3.1.3 / Node.js ESM / 事件驱动 + 插件化架构  
> 源码引用固定到提交 [`a3d75d5`](https://github.com/TimeRainStarSky/Yunzai/tree/a3d75d5dd28af6e36d7b697d061038df53c8b78f)，避免 `main` 分支后续更新导致文件行号失效。  
> 本文档由 `插件开发wiki.md` 与 `公共工具API参考.md` 合并修正而来，原文件未修改。

---

## 目录

1. [架构总览](#一、架构总览)
2. [插件加载规则](#二、插件加载规则)
3. [快速入门](#三、快速入门)
4. [插件基类](#四、插件基类)
5. [事件对象 e](#五、事件对象-e)
6. [规则匹配与返回值](#六、规则匹配与返回值)
7. [权限系统](#七、权限系统)
8. [上下文与多轮对话](#八、上下文与多轮对话)
9. [Handler 系统](#九、handler-系统)
10. [定时任务](#十、定时任务)
11. [Runtime 运行时](#十一、runtime-运行时)
12. [渲染与截图](#十二、渲染与截图)
13. [配置系统](#十三、配置系统)
14. [Bot 全局对象 API](#十四、bot-全局对象-api)
15. [Common 通用工具](#十五、common-通用工具)
16. [Redis 数据库](#十六、redis-数据库)
17. [segment 消息段](#十七、segment-消息段)
18. [内置模块与全局变量](#十八、内置模块与全局变量)
19. [适配器开发](#十九、适配器开发)
20. [事件类型速查](#二十、事件类型速查)
21. [调试技巧](#二十一、调试技巧)
22. [最佳实践](#二十二、最佳实践)

---

## 一、架构总览

### 1.1 启动流程

> **源码依据：** [`app.js#L1-L31`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/app.js#L1-L31) 创建全局 Bot 并启动；[`lib/bot.js#L260-L276`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L260-L276) 完成服务器、插件、监听器及适配器初始化。

```text
app.js
  ├── 设置 global.start_type
  ├── global.Bot = new Yunzai()
  └── Bot.run()
        ├── init()                # 配置初始化、日志、Redis
        ├── serverLoad()          # HTTP / WebSocket 服务器启动
        ├── httpsLoad()           # HTTPS，可选
        ├── PluginsLoader.load()  # 加载插件和定时任务
        └── ListenerLoader.load() # 加载事件监听和适配器
```

### 1.2 核心模块

> **源码依据：** [`lib/`](https://github.com/TimeRainStarSky/Yunzai/tree/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib) 是框架核心目录；[`renderers/`](https://github.com/TimeRainStarSky/Yunzai/tree/a3d75d5dd28af6e36d7b697d061038df53c8b78f/renderers) 存放渲染后端。

```text
Yunzai/lib/
├── bot.js                  # Bot 主类，EventEmitter + Proxy
├── config/
│   ├── config.js           # YAML 配置合并和监听
│   ├── init.js             # 初始化日志、Redis、异常处理
│   ├── log.js              # logger
│   └── redis.js            # redis 客户端
├── plugins/
│   ├── loader.js           # 插件加载、规则匹配、上下文、权限、冷却
│   ├── plugin.js           # 插件基类
│   ├── runtime.js          # e.runtime
│   ├── handler.js          # Handler 注册和调用
│   └── config.js           # 插件配置 makeConfig
├── listener/               # 事件监听加载
├── events/                 # message / notice / request / online / connect
├── common/common.js        # 通用工具
├── renderer/               # 渲染器加载与模板处理基类
├── puppeteer/puppeteer.js  # 兼容截图工具
└── modules/                # oicq、node-fetch、lodash、md5 等内部模块
```

### 1.3 插件目录

> **源码依据：** [`lib/plugins/loader.js#L21-L24`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L21-L24) 定义插件根目录；[`lib/config/config.js#L51-L60`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/config/config.js#L51-L60) 定义默认配置与用户配置目录。

```text
Yunzai/
├── plugins/                # 插件目录
│   ├── system/             # 内置系统插件
│   ├── other/              # 内置其他插件
│   ├── adapter/            # 协议适配器
│   └── my-plugin/          # 自定义插件
├── renderers/              # 渲染后端
├── resources/              # 全局静态资源
├── config/
│   ├── default_config/     # 默认配置，不建议修改
│   └── config/             # 用户配置，覆盖默认配置
├── data/
├── temp/
└── logs/
```

---

## 二、插件加载规则

### 2.1 当前源码的真实加载规则

> **源码依据：** [`lib/plugins/loader.js#L45-L74`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L45-L74)。这里可以直接确认 `index.js` 优先，以及无入口文件时只扫描插件目录第一层的 `*.js`。

插件加载逻辑位于 `lib/plugins/loader.js` 的 `getPlugins()`：

1. 扫描 `plugins/` 下的一级目录。
2. 如果某个插件目录存在 `index.js`，只加载这个 `index.js`。
3. 如果不存在 `index.js`，才扫描该插件目录第一层的 `*.js` 文件。
4. 不会自动扫描 `apps/` 子目录。

因此下面这种结构不会被框架自动扫描 `apps/*.js`：

```text
plugins/my-plugin/
├── index.js
└── apps/
    ├── hello.js
    └── game.js
```

如需拆分模块，推荐在 `index.js` 中手动导入并统一导出：

```js
// plugins/my-plugin/index.js
export { Hello } from './apps/hello.js'
export { Game } from './apps/game.js'
```

或者不使用 `index.js`，把多个插件类文件直接放在插件目录第一层：

```text
plugins/my-plugin/
├── hello.js
└── game.js
```

### 2.2 导出方式

> **源码依据：** [`lib/plugins/loader.js#L114-L168`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L114-L168)。`importPlugin()` 展开 `apps`，遍历模块导出，并由 `loadPlugin()` 实例化有效的插件类。

框架会导入插件文件，并实例化导出的 class：

```js
// plugins/my-plugin/index.js
import plugin from '../../lib/plugins/plugin.js'

export class Hello extends plugin {
  constructor() {
    super({
      name: '问候',
      event: 'message',
      priority: 5000,
      rule: [{ reg: '^#你好$', fnc: 'hello' }]
    })
  }

  async hello(e) {
    await e.reply('你好')
    return true
  }
}
```

如果文件导出 `apps` 对象，框架也会展开 `apps`：

```js
import plugin from '../../lib/plugins/plugin.js'

class Hello extends plugin {}
class Help extends plugin {}

export const apps = { Hello, Help }
```

---

## 三、快速入门

### 3.1 最小插件

> **源码依据：** [`lib/plugins/plugin.js#L10-L59`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L10-L59) 定义插件类参数；[`lib/plugins/loader.js#L255-L287`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L255-L287) 负责规则匹配和方法调用。

```js
// plugins/my-plugin/index.js
import plugin from '../../lib/plugins/plugin.js'

export class MyPlugin extends plugin {
  constructor() {
    super({
      name: '我的插件',
      dsc: '一个示例插件',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#你好$',
          fnc: 'sayHello',
          permission: 'all'
        }
      ]
    })
  }

  async sayHello(e) {
    await e.reply('你好呀')
    return true
  }
}
```

### 3.2 多命令插件

> **源码依据：** [`lib/plugins/plugin.js#L20-L25`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L20-L25) 定义 `rule` 字段；[`lib/plugins/loader.js#L255-L287`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L255-L287) 按规则数组顺序进行匹配。

```js
import plugin from '../../lib/plugins/plugin.js'

export class MultiPlugin extends plugin {
  constructor() {
    super({
      name: '多功能插件',
      event: 'message',
      priority: 5000,
      rule: [
        { reg: '^#你好$', fnc: 'hello' },
        { reg: '^#再见$', fnc: 'bye' },
        { reg: '^#主人命令$', fnc: 'masterOnly', permission: 'master' }
      ]
    })
  }

  async hello(e) {
    await e.reply('你好')
    return true
  }

  async bye(e) {
    await e.reply('再见')
    return true
  }

  async masterOnly(e) {
    await e.reply('主人命令已执行')
    return true
  }
}
```

### 3.3 手动拆分模块

> **源码依据：** [`lib/plugins/loader.js#L55-L68`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L55-L68) 展示框架只识别入口或一级 JS 文件；[`lib/plugins/loader.js#L117-L120`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L117-L120) 展示入口模块的导出如何被遍历。

```js
// plugins/my-plugin/index.js
export { Hello } from './apps/hello.js'
export { Game } from './apps/game.js'
```

```js
// plugins/my-plugin/apps/hello.js
import plugin from '../../../lib/plugins/plugin.js'

export class Hello extends plugin {
  constructor() {
    super({
      name: '问候模块',
      event: 'message',
      rule: [{ reg: '^早上好$', fnc: 'morning' }]
    })
  }

  async morning(e) {
    await e.reply('早上好')
    return true
  }
}
```

---

## 四、插件基类

插件基类位于 `lib/plugins/plugin.js`。可以通过 import 使用，也可以使用全局变量 `plugin`。

```js
import plugin from '../../lib/plugins/plugin.js'
```

### 4.1 构造参数

> **源码依据：** [`lib/plugins/plugin.js#L10-L59`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L10-L59)。默认值和字段注释均以该构造函数为准。

```js
super({
  name: 'your-plugin',       // 插件名称，默认 your-plugin
  dsc: '无',                 // 插件描述
  event: 'message',          // 插件监听事件
  priority: 5000,            // 数字越小越先执行
  rule: [],                  // 命令规则
  task: { name: '', fnc: '', cron: '' },
  handler: undefined,
  namespace: undefined
})
```

`task` 可以是对象，也可以是数组。`handler` 建议用数组。

### 4.2 rule 规则

> **源码依据：** [`lib/plugins/plugin.js#L20-L30`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L20-L30) 声明规则字段；[`lib/plugins/loader.js#L146-L148`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L146-L148) 将字符串规则转为正则；[`lib/plugins/loader.js#L255-L287`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L255-L287) 执行规则。

```js
rule: [
  {
    reg: '^#命令$',        // 字符串或 RegExp，加载时会转成 RegExp
    fnc: 'methodName',     // 本类方法名
    event: 'message',      // 可选，覆盖插件 event
    log: true,             // false 时日志降为 debug
    permission: 'all'      // master / owner / admin / all
  }
]
```

### 4.3 实例属性

> **源码依据：** [`lib/plugins/plugin.js#L32-L59`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L32-L59) 初始化插件属性；[`lib/plugins/loader.js#L263-L276`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L263-L276) 创建执行实例并注入 `e`。

```js
this.name
this.dsc
this.event
this.priority
this.rule
this.task
this.e              // 当前事件，在方法执行时由 loader 注入
this.handler
this.namespace
```

### 4.4 reply 方法

> **源码依据：** [`lib/plugins/plugin.js#L61-L70`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L61-L70)。该方法只校验消息和 `this.e.reply`，随后原样转发参数。

```js
this.reply(msg, quote, data)
```

等价于：

```js
this.e.reply(msg, quote, data)
```

如果 `this.e` 或 `this.e.reply` 不存在，返回 `false`。

---

## 五、事件对象 e

事件对象由适配器产生，`Bot.prepareEvent()` 和 `PluginsLoader.dealEvent()` 会补充常用字段。

### 5.1 常用字段

> **源码依据：** [`lib/bot.js#L321-L369`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L321-L369) 补充 Bot、好友、群、成员与回复方法；[`lib/plugins/loader.js#L337-L412`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L337-L412) 解析消息段并补充插件常用字段。

```js
e = {
  msg: '',             // 文本消息，框架从 text 消息段拼接
  img: [],             // 图片 URL 数组，来自 image.url
  raw_message: '',
  message: [],         // 消息段数组
  post_type: 'message',
  message_type: 'group',
  sub_type: 'normal',
  notice_type: '',
  request_type: '',

  self_id: '',
  user_id: '',
  group_id: '',
  group_name: '',
  sender: {
    user_id: '',
    nickname: '',
    card: ''
  },

  isGroup: true,
  isPrivate: false,
  isMaster: false,
  atBot: false,
  at: '',
  hasAlias: false,
  reply_id: '',
  file: undefined,

  friend: {},          // 好友对象
  group: {},           // 群对象
  member: {},          // 群成员对象
  bot: {},             // 当前 Bot 实例
  runtime: {},         // Runtime 实例
  user: {},            // genshin 插件存在时可能注入

  game: 'gs',          // gs / sr / zzz
  isGs: true,
  isSr: false
}
```

### 5.2 e.reply

> **源码依据：** [`lib/plugins/loader.js#L414-L465`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L414-L465)。引用、@、发送异常捕获和定时撤回都在这个包装函数中实现。

```js
await e.reply(msg, quote = false, data = {})
```

参数：

| 参数 | 说明 | 源码 |
|---|---|---|
| `msg` | 字符串、消息段、消息段数组 | [`loader.js#L425-L427`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L425-L427) |
| `quote` | 是否引用原消息。实际会插入 `segment.reply(e.message_id)` | [`loader.js#L436-L439`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L436-L439) |
| `data.recallMsg` | 自动撤回时间，单位秒 | [`loader.js#L449-L460`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L449-L460) |
| `data.at` | 群聊中 at 用户。`true` 表示 at 发送者，也可传指定 QQ | [`loader.js#L428-L434`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L428-L434) |

示例：

```js
await e.reply('你好')
await e.reply('已收到', true)
await e.reply('请注意', false, { at: true })
await e.reply('稍后撤回', false, { recallMsg: 10 })
await e.reply([segment.at(e.user_id), ' 你好'])
```

注意：`data.at: 'all'` 只会构造 `segment.at('all')`，是否等价于 @全体取决于具体适配器支持。

### 5.3 e.recall

> **源码依据：** [`lib/plugins/loader.js#L380-L394`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L380-L394)。只有适配器对象提供 `recallMsg` 且事件含 `message_id` 时才会绑定该方法。

如果适配器提供 `recallMsg` 且事件有 `message_id`，框架会补充：

```js
await e.recall()
```

---

## 六、规则匹配与返回值

### 6.1 处理流程

> **源码依据：** [`lib/plugins/loader.js#L188-L290`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L188-L290)。该区间完整覆盖事件预处理、Runtime、上下文、`accept` 与 `rule` 执行顺序。

消息事件进入插件系统后，大致流程：

```text
PluginsLoader.deal(e)
  ├── count()
  ├── checkBlack()
  ├── checkLimit()
  ├── dealEvent()       # 解析消息段，补 e.msg/e.img/e.at 等
  ├── reply()           # 包装 e.reply
  ├── Runtime.init(e)
  ├── 上下文 hook
  ├── accept(e)
  └── rule 匹配
```

### 6.2 插件优先级

> **源码依据：** [`lib/plugins/loader.js#L109-L110`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L109-L110) 按 `priority` 升序排序；[`lib/plugins/plugin.js#L37-L49`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L37-L49) 给出默认值 `5000`。

`priority` 数字越小越先执行。框架按升序排序。

```js
priority: 5000
```

### 6.3 返回值真实语义

> **源码依据：** [`lib/plugins/loader.js#L247-L287`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L247-L287)。`accept()` 单独识别字符串 `"return"`，普通规则方法只单独识别布尔值 `false`。

在 rule 方法中，源码只特殊处理 `false`：

| 返回值 | 行为 | 源码 |
|---|---|---|
| `false` | 当前规则不算处理成功，继续匹配后续规则 | [`loader.js#L276-L277`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L276-L277) |
| 其他值，包括 `true` / `undefined` / `"return"` | 结束本次插件处理流程 | [`loader.js#L276-L286`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L276-L286) |

因此常规命令建议显式 `return true`，需要让后续规则继续处理时才 `return false`。

```js
async cmd(e) {
  if (!someCondition) return false
  await e.reply('处理完成')
  return true
}
```

`"return"` 只在 `accept(e)` 中被特殊判断为直接停止处理：

```js
async accept(e) {
  if (needStop) return 'return'
}
```

---

## 七、权限系统

### 7.1 rule.permission

> **源码依据：** [`lib/plugins/plugin.js#L20-L25`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L20-L25) 声明允许值；[`lib/plugins/loader.js#L306-L327`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L306-L327) 执行权限判断。

```js
rule: [
  { reg: '^#公开$', fnc: 'open', permission: 'all' },
  { reg: '^#主人$', fnc: 'master', permission: 'master' },
  { reg: '^#群主$', fnc: 'owner', permission: 'owner' },
  { reg: '^#管理$', fnc: 'admin', permission: 'admin' }
]
```

### 7.2 权限说明

> **源码依据：** [`lib/plugins/loader.js#L306-L327`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L306-L327)；主人身份来自 [`lib/config/config.js#L63-L90`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/config/config.js#L63-L90) 的配置解析，并在 [`lib/plugins/loader.js#L398-L398`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L398-L398) 写入事件。

| 权限 | 说明 | 源码 |
|---|---|---|
| 不填 | 允许执行 | [`loader.js#L307-L308`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L307-L308) |
| `all` | 源码中没有特殊限制，等同允许执行 | [`loader.js#L306-L327`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L306-L327) |
| `master` | 仅主人 | [`loader.js#L310-L313`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L310-L313) |
| `owner` | 群主 | [`loader.js#L315-L319`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L315-L319) |
| `admin` | 群主或管理员 | [`loader.js#L320-L323`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L320-L323) |

`e.isMaster` 会绕过所有 rule 权限检查。

主人配置来自 `config/config/other.yaml` 中的 `master` / `masterQQ` 相关配置，经 `cfg.master` 和 `cfg.masterQQ` 解析。

### 7.3 手动检查

> **源码依据：** [`lib/plugins/loader.js#L306-L327`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L306-L327) 展示框架的自动检查逻辑；插件也可以直接读取已注入的 `e.isMaster`。

```js
async someMethod(e) {
  if (!e.isMaster) {
    await e.reply('暂无权限')
    return true
  }
  await e.reply('已执行')
  return true
}
```

---

## 八、上下文与多轮对话

上下文系统用于“等待用户下一条消息”。相关方法位于 `plugin.js`：

```js
this.setContext(type, isGroup, time = 120, timeout = '操作超时已取消')
this.getContext(type, isGroup)
this.finish(type, isGroup)
await this.awaitContext(isGroup, time, timeout)
this.resolveContext(context)
```

### 8.1 重要语义

> **源码依据：** [`lib/plugins/plugin.js#L72-L117`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L72-L117) 保存旧事件和管理超时；[`lib/plugins/loader.js#L210-L223`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L210-L223) 使用新实例处理下一条事件。

源码中 `setContext()` 保存的是调用时的旧事件对象。下一条消息触发上下文方法时：

| 位置 | 含义 |
|---|---|
| 方法参数 `context` | 旧事件，也就是设置上下文时保存的事件 |
| `this.e` | 当前新消息事件 |

因此上下文方法里要读取新消息，应使用 `this.e`，不是参数。

### 8.2 正确示例：猜数字

> **源码依据：** [`lib/plugins/loader.js#L134-L168`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L134-L168) 和 [`lib/plugins/loader.js#L263-L276`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L263-L276) 表明插件会被多次实例化，因此示例把会话状态放在上下文保存的事件对象中。

因为每次规则执行都会 `new` 一个插件实例，不建议把会话状态只存在 `this.xxx`。可以把状态存在旧事件对象或外部 Map。

```js
import plugin from '../../lib/plugins/plugin.js'

export class GuessGame extends plugin {
  constructor() {
    super({
      name: '猜数字',
      event: 'message',
      priority: 7000,
      rule: [{ reg: '^#猜数字$', fnc: 'startGame' }]
    })
  }

  async startGame(e) {
    e._answer = Math.floor(Math.random() * 100) + 1
    await e.reply('我想了一个 1-100 的数字，请在 60 秒内回复数字。')
    this.setContext('guess', e.isGroup, 60, '时间到，游戏已取消。')
    return true
  }

  async guess(context) {
    const e = this.e
    const answer = context._answer
    const num = Number.parseInt(e.msg, 10)

    if (Number.isNaN(num)) {
      await e.reply('请输入数字')
      return true
    }

    if (num === answer) {
      await e.reply('恭喜你猜对了')
      this.finish('guess', e.isGroup)
      return true
    }

    await e.reply(num < answer ? '太小了' : '太大了')
    return true
  }
}
```

### 8.3 awaitContext

> **源码依据：** [`lib/plugins/plugin.js#L82-L117`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L82-L117)。`awaitContext()` 将 Promise 的 `resolve` 存入上下文，`resolveContext()` 再用当前 `this.e` 完成 Promise。

`awaitContext()` 会设置名为 `resolveContext` 的上下文，并在下一条消息到来时 resolve 当前新事件。

```js
async ask(e) {
  await e.reply('请回复内容')
  const next = await this.awaitContext(e.isGroup, 60, '等待超时')
  if (!next) return true

  await e.reply(`你回复了：${next.msg}`)
  return true
}
```

注意：`resolveContext()` 源码中调用 `this.finish("resolveContext")` 时未传 `isGroup`，复杂场景下建议先实测再依赖。

---

## 九、Handler 系统

Handler 位于 `lib/plugins/handler.js`，用于注册可被其他代码主动调用的处理器。

### 9.1 注册 Handler

> **源码依据：** [`lib/plugins/loader.js#L157-L166`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L157-L166) 从插件配置注册 Handler；[`lib/plugins/handler.js#L1-L20`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/handler.js#L1-L20) 保存并按优先级排序处理器。

```js
export class MyPlugin extends plugin {
  constructor() {
    super({
      name: 'Handler示例',
      handler: [
        {
          key: 'message.group.normal',
          fn: 'handleGroupMsg',
          priority: 500
        }
      ],
      namespace: 'my-plugin'
    })
  }

  async handleGroupMsg(e, args, reject) {
    if (!e.msg) {
      reject('没有文本')
      return
    }
    return 'ok'
  }
}
```

### 9.2 调用 Handler

> **源码依据：** [`lib/plugins/runtime.js#L30-L40`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L30-L40) 暴露 Runtime 快捷入口；[`lib/plugins/handler.js#L43-L64`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/handler.js#L43-L64) 实现 `call()` 和 `has()`。

```js
e.runtime.handler.has('message.group.normal')
await e.runtime.handler.call('message.group.normal', e, args)
```

当前源码中 `callAll()` 是空实现，不要依赖它调用所有 handler。

```js
await e.runtime.handler.callAll('key', e, args) // 当前不会执行任何 handler
```

### 9.3 reject 的真实作用

> **源码依据：** [`lib/plugins/handler.js#L39-L60`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/handler.js#L39-L60)。`reject()` 仅将当前处理器标记为未完成，使循环继续；当前 `callAll()` 没有有效实现。

`reject(msg)` 会让当前 handler 不被视为完成，`Handler.call()` 会继续尝试后续 handler。它不是“阻止后续 handler”。

---

## 十、定时任务

### 10.1 配置任务

> **源码依据：** [`lib/plugins/plugin.js#L26-L30`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L26-L30) 定义任务字段；[`lib/plugins/loader.js#L490-L533`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L490-L533) 收集并注册任务。

```js
task: [
  {
    name: '每日报时',
    cron: '0 0 8 * * *',
    fnc: 'morningReport',
    log: true
  }
]
```

`task` 也可以是单个对象：

```js
task: {
  name: '每分钟任务',
  cron: '0 * * * * *',
  fnc: 'tick'
}
```

### 10.2 cron 格式

> **源码依据：** [`lib/plugins/loader.js#L518-L533`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L518-L533)。框架将表达式切为最多六段后传给 `node-schedule`。

框架会取 cron 字符串前 6 段传给 `node-schedule`：

```text
秒 分 时 日 月 周
```

示例：

| 表达式 | 含义 |
|---|---|
| `0 * * * * *` | 每分钟 |
| `0 0 * * * *` | 每小时 |
| `0 0 8 * * *` | 每天 8 点 |
| `*/5 * * * * *` | 每 5 秒 |

### 10.3 任务方法

> **源码依据：** [`lib/plugins/loader.js#L490-L533`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L490-L533) 负责收集和创建任务；任务实际执行逻辑位于同文件紧随其后的 `startTask()`。

```js
async morningReport() {
  await Bot.sendMasterMsg('早上好')
}
```

---

## 十一、Runtime 运行时

框架会为每个事件设置 `e.runtime`。Runtime 位于 `lib/plugins/runtime.js`。

### 11.1 常用属性

> **源码依据：** [`lib/plugins/runtime.js#L14-L80`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L14-L80)。其中米游社相关模型采用可选动态导入，导入失败时不会阻止 Runtime 基础能力使用。

```js
const rt = e.runtime

rt.uid
rt.hasCk
rt.user
rt.cfg
rt.gsCfg
rt.common
rt.puppeteer
rt.handler
rt.MysInfo
rt.NoteUser
rt.MysUser
```

其中 `MysInfo`、`NoteUser`、`MysUser`、`gsCfg` 依赖 `plugins/genshin`。如果未安装对应插件，相关能力不可用。

### 11.2 常用方法

> **源码依据：** [`lib/plugins/runtime.js#L82-L174`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L82-L174) 实现用户、UID、MysInfo 与 MysApi 相关方法；渲染方法见 [`lib/plugins/runtime.js#L176-L249`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L176-L249)。

```js
await rt.getMysInfo('all')
await rt.getMysInfo('cookie')
await rt.getUid()
await rt.getMysApi('all', {}, false)
rt.createMysApi(uid, ck, {}, false)
await rt.render(plugin, path, data, cfg)
```

### 11.3 Handler 快捷入口

> **源码依据：** [`lib/plugins/runtime.js#L30-L40`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L30-L40)。Runtime 直接引用 Handler 的 `has`、`call` 和 `callAll`。

```js
rt.handler.has(key)
await rt.handler.call(key, e, args)
```

---

## 十二、渲染与截图

### 12.1 e.runtime.render

> **源码依据：** [`lib/plugins/runtime.js#L176-L249`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L176-L249)。该方法计算模板路径、补充渲染数据、调用截图器，并根据 `retType` 决定是否发送图片。

```js
await e.runtime.render(plugin, path, data = {}, cfg = {})
```

参数：

| 参数 | 说明 | 源码 |
|---|---|---|
| `plugin` | 插件目录名 | [`runtime.js#L189-L220`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L189-L220) |
| `path` | HTML 路径，相对于 `plugins/<plugin>/resources/`，可带或不带 `.html` | [`runtime.js#L190-L220`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L190-L220) |
| `data` | 模板数据 | [`runtime.js#L200-L221`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L200-L221) |
| `cfg.retType` | `default` / `msgId` / `base64` | [`runtime.js#L235-L248`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L235-L248) |
| `cfg.beforeRender` | 渲染前处理数据 | [`runtime.js#L222-L225`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L222-L225) |

示例：

```js
await e.runtime.render('my-plugin', 'help/index', {
  title: '帮助',
  commands: []
})
```

模板位置：

```text
plugins/my-plugin/resources/help/index.html
```

### 12.2 返回值

> **源码依据：** [`lib/plugins/runtime.js#L235-L248`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L235-L248)；图片包装发生在 [`lib/puppeteer/puppeteer.js#L8-L20`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/puppeteer/puppeteer.js#L8-L20)，因此这里的 `base64` 名称与实际返回类型并不一致。

| `retType` | 行为 | 源码 |
|---|---|---|
| 不填 / `default` | 自动发送图片，返回 `true` | [`runtime.js#L240-L248`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L240-L248) |
| `msgId` | 自动发送图片，返回发送结果 | [`runtime.js#L241-L248`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L241-L248) |
| `base64` | 不发送，返回图片消息段 | [`runtime.js#L235-L239`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L235-L239) |

注意：当前 `runtime.render()` 通过 `lib/puppeteer/puppeteer.js` 调用截图，`retType: "base64"` 实际返回的是 `segment.image(buffer)` 格式的图片消息段，而不是纯 base64 字符串。

### 12.3 recallMsg 注意

> **源码依据：** [`lib/plugins/runtime.js#L240-L248`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L240-L248)。`cfg.recallMsg` 分支调用 `this.e.reply(base64, false, {})`，确实没有把撤回秒数传入第三个参数。

当前源码里 `cfg.recallMsg` 分支没有把撤回时间传给 `e.reply`，因此：

```js
await e.runtime.render('my-plugin', 'temp', data, { recallMsg: 30 })
```

不会按文档预期自动撤回。若需要撤回，可使用 `retType: "base64"` 手动发送：

```js
const img = await e.runtime.render('my-plugin', 'temp', data, { retType: 'base64' })
await e.reply(img, false, { recallMsg: 30 })
```

### 12.4 直接使用 puppeteer 兼容工具

> **源码依据：** [`lib/puppeteer/puppeteer.js#L1-L20`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/puppeteer/puppeteer.js#L1-L20) 是兼容包装层；真正的浏览器截图实现在 [`renderers/puppeteer/lib/puppeteer.js#L15-L276`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/renderers/puppeteer/lib/puppeteer.js#L15-L276)。

```js
import puppeteer from '../../lib/puppeteer/puppeteer.js'

const img = await puppeteer.screenshot('my-plugin/help', {
  _plugin: 'my-plugin',
  tplFile: './plugins/my-plugin/resources/help.html',
  saveId: 'help'
})
await e.reply(img)
```

`puppeteer.screenshot()` 返回 `segment.image(buffer)`。  
`puppeteer.screenshots()` 返回图片消息段数组。

### 12.5 Renderer

> **源码依据：** [`lib/renderer/loader.js#L13-L60`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/renderer/loader.js#L13-L60) 加载并选择渲染后端；[`lib/renderer/Renderer.js#L1-L65`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/renderer/Renderer.js#L1-L65) 使用 `art-template` 生成 HTML。

`global.Renderer` 是渲染器基类。常规插件开发更推荐用 `e.runtime.render()` 或 `lib/puppeteer/puppeteer.js`。

如需获取渲染器实例：

```js
import RendererLoader from '../../lib/renderer/loader.js'

const renderer = RendererLoader.getRenderer('puppeteer')
const buffer = await renderer.render('my-plugin/help', data)
```

### 12.6 截图功能依赖链

> **源码依据：** [`package.json#L11-L41`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/package.json#L11-L41) 声明 Node.js 包依赖；[`renderers/puppeteer/config_default.yaml`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/renderers/puppeteer/config_default.yaml) 声明浏览器路径和启动参数。

完整调用链如下：

```text
e.runtime.render()
  └── lib/puppeteer/puppeteer.js           # 兼容层，包装 segment.image(buffer)
      └── RendererLoader.getRenderer()      # 选择 puppeteer 渲染后端
          ├── Renderer.dealTpl()            # art-template 合成 HTML
          └── Puppeteer.screenshot()        # Chromium 加载 HTML 并截图
```

| 依赖 | 是否必需 | 用途 | 源码 |
|---|---|---|---|
| `puppeteer` | 是 | 控制浏览器、打开生成的 HTML 并截图 | [`package.json#L37`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/package.json#L37) |
| Chromium、Chrome 或 Edge | 是 | 提供实际浏览器内核；也可连接远程 Puppeteer WebSocket | [`puppeteer.js#L34-L41`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/renderers/puppeteer/lib/puppeteer.js#L34-L41) |
| `art-template` | 是 | 将 HTML 模板和 `data` 合成为临时 HTML | [`Renderer.js#L39-L63`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/renderer/Renderer.js#L39-L63) |
| HTML/CSS/图片/字体资源 | 是 | 决定截图页面内容和样式 | [`runtime.js#L195-L220`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L195-L220) |
| `segment.image()` | 发送图片时需要 | 把截图 Buffer 包装为适配器可发送的图片消息段 | [`lib/puppeteer/puppeteer.js#L8-L20`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/puppeteer/puppeteer.js#L8-L20) |

默认情况下 Puppeteer 会启动本地 Chromium。也可以通过 `renderers/puppeteer/config.yaml` 的 `chromiumPath` 指向本机 Chrome、Edge 或 Chromium，或者通过 `puppeteerWS` 连接独立浏览器服务。Linux/Docker 中除了浏览器本体，还必须安装 Chromium 所需的系统动态库；框架会区分“找不到 Chromium”和“缺少共享库”两类启动错误（[源码](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/renderers/puppeteer/lib/puppeteer.js#L82-L103)）。

---

## 十三、配置系统

### 13.1 全局配置 cfg

> **源码依据：** [`lib/config/config.js#L1-L185`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/config/config.js#L1-L185)。配置对象通过 Proxy 暴露各 YAML 配置，并将默认配置与用户配置作浅合并。

```js
import cfg from '../../lib/config/config.js'
```

常用：

```js
cfg.bot
cfg.group
cfg.other
cfg.redis
cfg.renderer
cfg.server
cfg.db

cfg.getGroup(bot_id, group_id)
cfg.getOther()
cfg.getdefSet('bot')
cfg.getConfig('bot')
cfg.getAllCfg('bot')

cfg.masterQQ
cfg.master
cfg.uin
cfg.qq
cfg.package
```

全局配置读取规则：

```text
config/default_config/<name>.yaml
  + config/config/<name>.yaml
```

`cfg.getAllCfg(name)` 是浅合并。

### 13.2 插件配置 makeConfig

> **源码依据：** [`lib/plugins/config.js#L1-L61`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js#L1-L61)。该方法读取 `config/<name>.yaml`，合并默认值并提供防抖保存和可选文件监听。

`makeConfig` 位于 `lib/plugins/config.js`。

从插件入口文件：

```js
import makeConfig from '../../lib/plugins/config.js'
```

从插件子目录文件，例如 `plugins/my-plugin/model/setting.js`：

```js
import makeConfig from '../../../lib/plugins/config.js'
```

用法：

```js
const { config, configSave, configFile, watcher } = await makeConfig(
  'my-plugin',
  {
    enabled: true,
    apiUrl: '',
    timeout: 30
  },
  {},
  {
    watch: true
  }
)
```

配置文件位置：

```text
config/my-plugin.yaml
```

修改并保存：

```js
config.enabled = false
await configSave()
```

`configSave` 内部有防抖。

### 13.3 makeConfig 参数

> **源码依据：** [`lib/plugins/config.js#L27-L61`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js#L27-L61)。合并顺序为默认 `config`、用户 YAML、强制保留的 `keep`。

```js
makeConfig(name, config = {}, keep = {}, opts = {})
```

| 参数 | 说明 | 源码 |
|---|---|---|
| `name` | 配置文件名，生成 `config/<name>.yaml` | [`config.js#L34-L37`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js#L34-L37) |
| `config` | 默认配置对象，会被用户配置 merge | [`config.js#L34-L44`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js#L34-L44) |
| `keep` | 强制保持的配置，会在用户配置后 merge | [`config.js#L41-L44`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js#L41-L44) |
| `opts.watch` | 是否监听变更，默认跟随 `cfg.bot.file_watch` | [`config.js#L58-L59`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js#L58-L59) |
| `opts.replacer` | 保存前处理 YAML 字符串 | [`config.js#L38-L41`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js#L38-L41) |

---

## 十四、Bot 全局对象 API

`Bot` 是全局对象，来自 `app.js` 中的 `global.Bot = new Yunzai()`。

### 14.1 发送消息

> **源码依据：** [`lib/bot.js#L469-L519`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L469-L519) 实现好友和群消息发送；[`lib/bot.js#L546-L562`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L546-L562) 实现主人消息发送。

```js
await Bot.sendFriendMsg(bot_id, user_id, msg)
await Bot.sendGroupMsg(bot_id, group_id, msg)
await Bot.sendMasterMsg(msg, bot_array, sleep)
```

`bot_id` 可传空字符串，框架会自动选择可用 Bot。

```js
await Bot.sendFriendMsg('', '123456', '你好')
await Bot.sendGroupMsg('', '789012', '群消息')
await Bot.sendMasterMsg('系统启动完成')
```

### 14.2 查找对象

> **源码依据：** [`lib/bot.js#L434-L466`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L434-L466)。查找会遍历已连接 Bot；`strict` 为真时不执行最终的回退选择。

```js
const friend = Bot.pickFriend(user_id, strict)
const user = Bot.pickUser(user_id, strict)
const group = Bot.pickGroup(group_id, strict)
const member = Bot.pickMember(group_id, user_id)

await friend.sendMsg('你好')
await group.sendMsg('群消息')
```

`strict` 为真时，找不到返回 `false`。

### 14.3 列表和映射

> **源码依据：** [`lib/bot.js#L381-L431`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L381-L431)。这些聚合属性会合并所有在线 Bot 的好友、群和群成员映射。

```js
Bot.getFriendArray()
Bot.getFriendList()
Bot.getFriendMap()
Bot.fl

Bot.getGroupArray()
Bot.getGroupList()
Bot.getGroupMap()
Bot.gl

Bot.gml
```

### 14.4 转发消息

> **源码依据：** [`lib/bot.js#L564-L578`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L564-L578)。`makeForwardMsg()` 构造 `node` 消息段，`makeForwardArray()` 批量生成节点。

```js
const forward = Bot.makeForwardMsg([
  { user_id: '1', nickname: 'A', message: 'hello' },
  { user_id: '2', nickname: 'B', message: 'world' }
])

await Bot.sendForwardMsg(msg => e.group.sendMsg(msg), forward)
```

快速构造：

```js
const forward = Bot.makeForwardArray(['消息1', '消息2'], {
  user_id: e.self_id,
  nickname: 'Bot'
})
```

### 14.5 等待文本消息

> **源码依据：** [`lib/bot.js#L521-L548`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L521-L548)。监听器只拼接事件中的文本消息段，命中条件后立即注销。

```js
const msg = await Bot.getTextMsg()
const msg2 = await Bot.getTextMsg({ self_id: e.self_id, user_id: e.user_id })
const msg3 = await Bot.getTextMsg(data => data.group_id === e.group_id)
const masterMsg = await Bot.getMasterMsg()
```

### 14.6 文件 URL

> **源码依据：** [`lib/bot.js#L279-L319`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L279-L319)。文件会被登记到临时 HTTP 路由，并受有效时间和访问次数限制。

```js
const url = await Bot.fileToUrl(bufferOrFile, {
  name: 'avatar.png',
  time: 120000,
  times: 1
})
```

### 14.7 系统工具

> **源码依据：** [`lib/bot.js#L70-L76`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L70-L76) 的 Proxy 会回退到 [`lib/util.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/util.js)，因此工具方法可以通过 `Bot` 直接调用。

`Bot` 的 Proxy 会回退到 `lib/util.js` 中的方法，因此可直接：

```js
Bot.makeLog('info', '日志内容', 'MyPlugin')
await Bot.sleep(1000)
Bot.getTimeDiff()
await Bot.download(url, file, opts)
await Bot.exec(cmd, opts)
Bot.mkdir(dir)
Bot.rm(file, opts)
Bot.glob(path, opts)
Bot.Buffer(data, opts)
Bot.fileType(data, opts)
Bot.promiseEvent(emitter, resolveEvent, rejectEvent, timeout)
```

### 14.8 事件

> **源码依据：** [`lib/bot.js#L321-L379`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L321-L379)。`Bot.em()` 先准备事件对象，再逐级移除事件名最后一段完成冒泡。

```js
Bot.em('message.group.normal', data)
Bot.on('message', handler)
Bot.once('online', handler)
Bot.off('message', handler)
```

`Bot.em(name, data)` 会自动冒泡：

```text
message.group.normal
  -> message.group
  -> message
```

### 14.9 Bot 属性

> **源码依据：** [`lib/bot.js#L51-L76`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L51-L76) 初始化服务器、适配器和状态属性；Proxy 同时允许按账号访问 `bots` 中的适配器实例。

```js
Bot.uin
Bot.stat
Bot.bots
Bot.adapter
Bot.url
Bot.express
Bot.server
Bot.wss
Bot.wsf
Bot.fs
```

---

## 十五、Common 通用工具

```js
import common from '../../lib/common/common.js'
```

或：

```js
const common = e.runtime.common
```

### 15.1 API

> **源码依据：** [`lib/common/common.js#L1-L58`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/common/common.js#L1-L58)。这些方法主要是对 `Bot` 文件、延时、私聊和转发能力的便捷包装。

```js
common.relpyPrivate(user_id, msg, bot_id)
await common.sleep(ms)
await common.downFile(url, file, opts)
common.mkdirs(dirname)
common.makeForwardMsg(e, msgArray, description)
```

注意：函数名源码中就是 `relpyPrivate`，不是 `replyPrivate`。

### 15.2 示例

> **源码依据：** [`lib/common/common.js#L9-L55`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/common/common.js#L9-L55)。转发消息会优先使用当前群或好友对象的实现，再回退到 `Bot.makeForwardMsg()`。

```js
await common.sleep(1000)
await common.downFile('https://example.com/a.png', './data/a.png')

const forward = common.makeForwardMsg(e, ['第一条', '第二条'], '聊天记录')
await e.reply(forward)
```

---

## 十六、Redis 数据库

> **源码依据：** [`lib/config/redis.js#L1-L114`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/config/redis.js#L1-L114) 创建并连接全局 Redis 客户端；项目使用的客户端包声明见 [`package.json#L38`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/package.json#L38)。

`redis` 是全局变量，由 `lib/config/redis.js` 初始化。

```js
await redis.get('key')
await redis.set('key', 'value')
await redis.set('key', 'value', { EX: 3600 })
await redis.del('key')
await redis.exists('key')
await redis.incr('counter')
await redis.incrBy('counter', 10)
```

Hash：

```js
await redis.hSet('hash', 'field', 'value')
const val = await redis.hGet('hash', 'field')
const all = await redis.hGetAll('hash')
```

List：

```js
await redis.lPush('list', 'item')
const items = await redis.lRange('list', 0, -1)
```

Set：

```js
await redis.sAdd('set', 'member')
const members = await redis.sMembers('set')
```

建议插件使用自己的 key 前缀，避免和框架的 `Yz:count:*` 冲突。

---

## 十七、segment 消息段

`segment` 是全局变量，由 `lib/plugins/loader.js` 设置：

```js
global.segment = segment
```

### 17.1 当前源码的消息段格式

> **源码依据：** [`lib/modules/oicq/index.js#L1-L43`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/modules/oicq/index.js#L1-L43) 定义内置消息段；[`lib/plugins/loader.js#L13-L15`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L13-L15) 将其设为全局变量。

当前内置 `segment` 来自 `lib/modules/oicq/index.js`，使用扁平字段：

```js
segment.custom(type, data)    // { type, ...data }
segment.raw(data)             // { type: 'raw', data }
segment.button(...data)       // { type: 'button', data }
segment.markdown(data)        // { type: 'markdown', data }
segment.image(file, name)     // { type: 'image', file, name }
segment.at(qq, name)          // { type: 'at', qq, name }
segment.record(file, name)    // { type: 'record', file, name }
segment.video(file, name)     // { type: 'video', file, name }
segment.file(file, name)      // { type: 'file', file, name }
segment.reply(id, text, qq, time, seq)
```

没有内置 `segment.text()`。文本可以直接用字符串，或：

```js
segment.custom('text', { text: '你好' })
```

### 17.2 发送示例

> **源码依据：** [`lib/plugins/loader.js#L425-L463`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L425-L463) 展示字符串和消息段如何交给适配器的原始 `reply()`；消息段构造器见 [`lib/modules/oicq/index.js#L1-L32`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/modules/oicq/index.js#L1-L32)。

```js
await e.reply('纯文本')
await e.reply(segment.image('https://example.com/a.png'))
await e.reply([
  segment.reply(e.message_id),
  segment.at(e.user_id),
  ' 你好'
])
```

### 17.3 接收消息段

> **源码依据：** [`lib/plugins/loader.js#L350-L378`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L350-L378)。解析器直接读取扁平字段，而不是 OneBot 常见的嵌套 `data` 字段。

框架解析 `e.message` 时读取的字段：

| type | 字段 | 源码 |
|---|---|---|
| `text` | `i.text` | [`loader.js#L353-L356`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L353-L356) |
| `image` | `i.url` | [`loader.js#L357-L360`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L357-L360) |
| `at` | `i.qq` | [`loader.js#L361-L364`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L361-L364) |
| `reply` | `i.id` | [`loader.js#L365-L369`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L365-L369) |
| `file` | 整个 `i` | [`loader.js#L370-L372`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L370-L372) |
| `xml` / `json` | `i.data` | [`loader.js#L373-L376`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L373-L376) |

因此适配器构造事件时应尽量使用当前框架期望的扁平结构：

```js
message: [
  { type: 'text', text: '你好' },
  { type: 'image', url: 'https://example.com/a.png' },
  { type: 'at', qq: '123456' },
  { type: 'reply', id: 'message-id' }
]
```

---

## 十八、内置模块与全局变量

### 18.1 确认存在的全局变量

> **源码依据：** 各全局变量在下表“源码”列中逐项链接到赋值位置。

| 全局变量 | 说明 | 源码 |
|---|---|---|
| `Bot` | Bot 主实例 | [`app.js#L30`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/app.js#L30) |
| `redis` | Redis 客户端 | [`lib/config/redis.js#L8-L21`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/config/redis.js#L8-L21) |
| `logger` | 日志对象 | [`lib/config/log.js#L90`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/config/log.js#L90) |
| `Renderer` | 渲染器基类 | [`lib/renderer/loader.js#L6-L8`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/renderer/loader.js#L6-L8) |
| `plugin` | 插件基类 | [`lib/plugins/loader.js#L13-L15`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L13-L15) |
| `segment` | 消息段构造器 | [`lib/plugins/loader.js#L13-L15`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L13-L15) |

### 18.2 需要 import 的模块

> **源码依据：** [`lib/plugins/loader.js#L1-L15`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L1-L15) 可见 `lodash`、`node-schedule` 等只作为模块局部导入；依赖清单见 [`package.json#L11-L44`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/package.json#L11-L44)。

以下没有在当前源码中确认挂为全局变量，插件中应显式 import：

```js
import YAML from 'yaml'
import schedule from 'node-schedule'
import lodash from 'lodash'
import md5 from 'md5'
```

`fetch` 在现代 Node.js 中通常已有全局实现。项目也提供了 `node-fetch` 兼容模块，如需固定使用项目依赖：

```js
import fetch from 'node-fetch'
```

### 18.3 lodash

> **源码依据：** [`package.json#L23`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/package.json#L23) 将 `lodash` 链接到本地模块；[`lib/modules/lodash/index.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/modules/lodash/index.js) 从 `es-toolkit/compat` 导出兼容 API。

项目依赖的 `lodash` 实际链接到 `lib/modules/lodash`，内部基于 `es-toolkit/compat`。

```js
import _ from 'lodash'

_.merge(obj1, obj2)
_.cloneDeep(obj)
_.debounce(fn, 500)
_.throttle(fn, 1000)
```

### 18.4 md5

> **源码依据：** [`package.json#L25`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/package.json#L25) 链接本地模块；[`lib/modules/md5/index.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/modules/md5/index.js) 使用 Node.js `crypto` 计算 MD5。

```js
import md5 from 'md5'

const hash = md5('hello')
```

---

## 十九、适配器开发

适配器通常放在 `plugins/adapter/`，由 `ListenerLoader` 加载。

### 19.1 基本结构

> **源码依据：** [`lib/listener/loader.js#L19-L23`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/listener/loader.js#L19-L23) 遍历 `Bot.adapter`；[`plugins/adapter/stdin.js#L6-L112`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/plugins/adapter/stdin.js#L6-L112) 是仓库内最精简的完整适配器示例。

```js
Bot.adapter.push(
  new (class MyProtocolAdapter {
    id = 'MyProtocol'
    name = '我的协议'
    path = this.id

    load() {
      if (!Array.isArray(Bot.wsf[this.path])) Bot.wsf[this.path] = []
      Bot.wsf[this.path].push((ws, req) => {
        ws.on('message', data => this.message(data, ws, req))
      })
    }

    message(data, ws, req) {
      const parsed = JSON.parse(data)
      const event = {
        self_id: parsed.self_id,
        post_type: 'message',
        message_type: 'group',
        sub_type: 'normal',
        user_id: parsed.user_id,
        group_id: parsed.group_id,
        sender: {
          user_id: parsed.user_id,
          nickname: parsed.nickname
        },
        raw_message: parsed.text,
        message: [{ type: 'text', text: parsed.text }]
      }

      Bot.em('message.group.normal', event)
    }
  })()
)
```

### 19.2 连接 Bot 实例

> **源码依据：** [`lib/bot.js#L321-L369`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js#L321-L369) 显示事件准备阶段需要的适配器能力；完整协议实现可参考 [`plugins/adapter/OneBotv11.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/plugins/adapter/OneBotv11.js)。

适配器需要在合适时机注册 `Bot[data.self_id]`，提供 `pickFriend`、`pickGroup`、`sendApi`、`fl`、`gl`、`gml` 等能力。框架的 `prepareEvent()` 会依赖这些对象补充 `e.friend`、`e.group`、`e.member`、`e.reply`。

---

## 二十、事件类型速查

事件冒泡由 `Bot.em()` 实现：

```js
Bot.em('message.group.normal', e)
```

会依次触发：

```text
message.group.normal
message.group
message
```

### 20.1 message

> **源码依据：** [`lib/plugins/loader.js#L32-L36`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L32-L36) 定义事件字段层级；具体事件名由适配器产生，可参考 [`OneBotv11.js#L1119`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/plugins/adapter/OneBotv11.js#L1119) 和 [`stdin.js#L84-L97`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/plugins/adapter/stdin.js#L84-L97)。

| 事件名 | 说明 |
|---|---|
| `message.private.friend` | 好友私聊 |
| `message.private.group_self` | 群临时会话 |
| `message.private.guild_self` | 频道临时会话 |
| `message.group.normal` | 群普通消息 |
| `message.group.anonymous` | 群匿名消息 |
| `message.guild.channel` | 频道消息 |

### 20.2 notice

> **源码依据：** [`plugins/adapter/OneBotv11.js#L1122-L1243`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/plugins/adapter/OneBotv11.js#L1122-L1243) 处理常见 OneBot 通知；其他适配器可能提供不同或额外的通知类型。

| notice_type | 说明 |
|---|---|
| `friend_recall` | 好友撤回 |
| `group_recall` | 群撤回 |
| `group_increase` | 群成员增加 |
| `group_decrease` | 群成员减少 |
| `group_admin` | 管理员变更 |
| `group_ban` | 禁言 |
| `group_upload` | 群文件上传 |
| `friend_add` | 好友添加 |
| `poke` | 戳一戳 |
| `notify` | 其他通知 |

### 20.3 request

> **源码依据：** [`plugins/adapter/OneBotv11.js#L1417-L1446`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/plugins/adapter/OneBotv11.js#L1417-L1446) 处理好友和群请求；[`lib/plugins/loader.js#L32-L36`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L32-L36) 定义请求事件的匹配层级。

| request_type | sub_type | 说明 |
|---|---|---|
| `friend` | - | 好友请求 |
| `group` | `add` | 加群请求 |
| `group` | `invite` | 群邀请 |

---

## 二十一、调试技巧

### 21.1 日志等级

> **源码依据：** [`lib/config/log.js#L1-L90`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/config/log.js#L1-L90) 根据 `cfg.bot.log_level` 配置日志并创建全局 `logger`；`Bot.makeLog()` 来自 [`lib/util.js#L22-L32`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/util.js#L22-L32)。

配置文件：

```text
config/config/bot.yaml
```

设置：

```yaml
log_level: debug
```

插件中输出：

```js
Bot.makeLog('debug', '调试信息', e.self_id)
Bot.makeLog('info', '收到命令: ' + e.msg, e.self_id)
Bot.makeLog('warn', '警告内容', e.self_id)
Bot.makeLog('error', error, e.self_id)
```

### 21.2 Dev 模式

> **源码依据：** [`lib/plugins/runtime.js#L226-L234`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L226-L234)。当进程参数包含 `dev` 时，框架把当前渲染数据写入 `temp/ViewData/<plugin>/`。

```sh
node . dev
```

`e.runtime.render()` 会在 dev 模式下保存模板数据到：

```text
temp/ViewData/<plugin>/
```

### 21.3 热更新

> **源码依据：** [`lib/plugins/loader.js#L55-L70`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L55-L70) 决定哪些入口注册监听；[`lib/plugins/loader.js#L639-L719`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L639-L719) 处理修改、新增与删除；[`lib/config/config.js#L14-L44`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/config/config.js#L14-L44) 可根据 `file_watch` 关闭文件监听。

```yaml
file_watch: true
```

没有 `index.js` 时，启动扫描发现的一级 `*.js` 会注册修改和删除监听，已监听目录新增 `.js` 时也会自动导入。当前 `getPlugins()` 检测到 `index.js` 后会直接加入入口并跳过 `watch()`，因此没有为该入口注册同样的自动热更新监听；修改 `index.js` 后应以重启验证为准。

### 21.4 命令行模拟

> **源码依据：** [`plugins/adapter/stdin.js#L84-L112`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/plugins/adapter/stdin.js#L84-L112) 将控制台输入转换为私聊消息事件。

```sh
node .
```

配合 stdin 适配器时可在控制台输入消息文本模拟事件。

---

## 二十二、最佳实践

### 22.1 推荐

> **源码依据：** 本节汇总前述源码约束，主要来源为 [`lib/plugins/loader.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js)、[`lib/plugins/runtime.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js) 与 [`lib/plugins/config.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js)。

- 插件入口优先使用 `plugins/<plugin>/index.js`。
- 需要拆模块时，在 `index.js` 手动 re-export 子模块。
- 插件方法中优先使用 `e.reply()`。
- 常规命令处理完成后显式 `return true`。
- 只有希望后续规则继续尝试时才 `return false`。
- 敏感命令使用 `permission: 'master'`，必要时再手动检查 `e.isMaster`。
- 长文本或复杂信息使用 `e.runtime.render()` 渲染图片。
- 插件配置使用 `makeConfig()`。
- Redis key 使用插件名前缀。
- 适配器消息段使用扁平字段，和 `loader.js` 的解析逻辑保持一致。

### 22.2 避免

> **源码依据：** 各项均由前文章节引用的实际实现推导；重点可复核 [`loader.js#L45-L74`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L45-L74)、[`plugin.js#L82-L117`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js#L82-L117) 和 [`oicq/index.js#L1-L32`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/modules/oicq/index.js#L1-L32)。

- 不要以为 `apps/` 会被自动扫描。
- 不要在上下文方法参数里读取下一条消息，下一条消息在 `this.e`。
- 不要依赖 `Handler.callAll()`，当前为空实现。
- 不要使用不存在的 `segment.text()`。
- 不要把 OneBot 的 `{ data: { ... } }` 消息段格式直接当作当前框架内部格式。
- 不要假设 `YAML`、`schedule`、`lodash`、`md5` 是全局变量。
- 不要修改 `config/default_config/`，用户配置写到 `config/config/` 或插件自己的 `config/<name>.yaml`。

### 22.3 常用速查

> **源码依据：** 该速查表分别对应 [`e.reply`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L425-L463)、[`segment`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/modules/oicq/index.js#L1-L32)、[`render`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js#L189-L249)、[`makeConfig`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js#L34-L61) 和 [`Bot.makeLog`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/util.js#L22-L32)。

```js
// 回复
await e.reply('内容', true)

// 图片
await e.reply(segment.image('https://example.com/a.png'))

// 渲染
await e.runtime.render('my-plugin', 'help/index', data)

// Redis
await redis.set('my-plugin:key', 'value', { EX: 300 })
const value = await redis.get('my-plugin:key')

// 配置
import makeConfig from '../../lib/plugins/config.js'
const { config, configSave } = await makeConfig('my-plugin', { enabled: true })

// 日志
Bot.makeLog('info', '完成', 'my-plugin')
```

---

## 扩展阅读：Miao-Yunzai 兼容

新插件默认按本文的 TRSS-Yunzai API 开发即可。如果需要维护旧 Miao-Yunzai 插件、把插件迁移到 TRSS，或确实需要同时支持两个框架，可继续阅读[《Miao-Yunzai 兼容与迁移》](./extension/miao-compat.md)。

该页面属于可选扩展资料，不是 TRSS-Yunzai 插件开发的必需前置内容。

---

## 附录：源码校对重点

本合并版根据以下源码行为修正：

- [`lib/plugins/loader.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js)：插件加载、规则匹配、返回值、消息段解析、权限、上下文触发。
- [`lib/plugins/plugin.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/plugin.js)：插件基类、上下文存储、`awaitContext()`。
- [`lib/plugins/handler.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/handler.js)：Handler 注册、`call()`、空实现的 `callAll()`。
- [`lib/plugins/runtime.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/runtime.js)：`e.runtime`、渲染返回值和 `recallMsg` 行为。
- [`lib/renderer/Renderer.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/renderer/Renderer.js) 与 [`renderers/puppeteer/lib/puppeteer.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/renderers/puppeteer/lib/puppeteer.js)：HTML 模板处理、浏览器启动和截图。
- [`lib/modules/oicq/index.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/modules/oicq/index.js)：当前 `segment` 的真实方法和扁平消息段格式。
- [`lib/bot.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/bot.js)：Bot Proxy、发送消息、事件冒泡、对象查找、转发消息、文件 URL。
- [`lib/plugins/config.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/config.js)：`makeConfig()` 参数和配置文件位置。
- [`lib/common/common.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/common/common.js)：Common 工具函数。
