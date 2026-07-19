---
title: 插件加载
icon: upload
order: 4
tag:
  - 开发
  - 插件
  - 加载
  - TRSS-Yunzai
---

::: warning 适用范围
本章按照 TRSS-Yunzai 当前源码编写，仅适用于 TRSS-Yunzai。Miao-Yunzai 的目录扫描、插件入口和热更新机制可能不同，请勿直接套用。
:::

本章说明 TRSS-Yunzai 如何发现、导入和注册插件。以下结论基于 [`lib/plugins/loader.js`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js) 校对。

## 插件发现规则

插件加载器只扫描 `plugins/` 下的一级目录，不会把直接位于 `plugins/` 根目录的文件当作插件入口。

对每个一级插件目录，加载规则如下：

1. 如果存在 `index.js`，只加载这个入口文件。
2. 如果不存在 `index.js`，只加载该目录第一层的 `*.js` 文件。
3. 不会递归扫描 `apps/`、`modules/`、`lib/` 等子目录。
4. 加载器只直接识别 `.js` 文件；TypeScript 必须先编译为符合上述规则的 JavaScript。

> **源码依据：** [`loader.js#L45-L74`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L45-L74)

### 推荐：使用 index.js 统一导出

```text
plugins/my-plugin/
├── index.js
└── apps/
    ├── hello.js
    └── help.js
```

子目录中的类需要由 `index.js` 手动重新导出：

```js
// plugins/my-plugin/index.js
export { Hello } from './apps/hello.js'
export { Help } from './apps/help.js'
```

### 无入口文件：使用一级 JS 文件

```text
plugins/my-plugin/
├── hello.js
└── help.js
```

这种结构不需要 `index.js`，两个一级 JS 文件都会被加载。

## 模块导出与注册

加载器通过动态 `import()` 导入入口模块，然后遍历模块导出的值。只有具有 `prototype` 的导出才会按插件类处理。

支持两种导出方式：

```js
// 方式一：直接导出插件类
export class Hello extends plugin {}
export class Help extends plugin {}
```

```js
// 方式二：导出 apps 对象
class Hello extends plugin {}
class Help extends plugin {}

export const apps = { Hello, Help }
```

如果存在 `apps` 导出，加载器会展开该对象后再处理其中的插件类。

> **源码依据：** [`loader.js#L114-L135`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L114-L135)

## 插件初始化流程

每个有效插件类的加载过程为：

```text
实例化插件
  ├── 调用 init()（如果存在）
  │     └── 返回 "return" 时跳过该插件
  ├── 收集 task 定时任务
  ├── 再次实例化，作为消息处理实例
  ├── 将字符串 rule.reg 转换为 RegExp
  ├── 加入插件优先级队列
  └── 注册 handler（如果存在）
```

加载完成后，插件队列按照 `priority` 数值升序排序，数字越小越先执行。

> **源码依据：** [`loader.js#L134-L168`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L134-L168)、[`loader.js#L103-L110`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L103-L110)

## 依赖缺失

插件导入出现 `Cannot find package` 时，框架会收集缺失依赖并提示运行 `pnpm i`。如果依赖仍无法解析，应进入对应插件目录安装依赖，不要随意修改 Yunzai 根目录依赖。

> **源码依据：** [`loader.js#L124-L130`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L124-L130)、[`loader.js#L170-L179`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L170-L179)

## 热更新的实际范围

当前热更新逻辑使用 `chokidar` 监听文件变化：

- 没有 `index.js` 时，启动扫描发现的一级 `*.js` 文件会注册修改和删除监听。
- 已被监听的插件目录新增 `.js` 文件时，会自动导入并注册。
- 修改已监听的 JS 文件时，会重新导入插件类并更新优先级队列。
- 删除已监听的 JS 文件时，会从优先级队列移除对应插件。
- `getPlugins()` 发现 `index.js` 后会直接返回该入口，没有调用 `watch()`；因此当前源码没有为这种入口自动注册相同的文件热更新监听。修改 `index.js` 后应以重启验证为准。

> **源码依据：** [`loader.js#L55-L70`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L55-L70)、[`loader.js#L639-L719`](https://github.com/TimeRainStarSky/Yunzai/blob/a3d75d5dd28af6e36d7b697d061038df53c8b78f/lib/plugins/loader.js#L639-L719)

## 开发注意事项

- 推荐为插件提供 `index.js`，并在入口手动导出子模块。
- 不要假设框架会递归扫描 `apps/` 或其他子目录。
- 插件入口应导出继承自 `plugin` 的 class，或者导出包含这些 class 的 `apps` 对象。
- `init()` 中避免长时间阻塞；框架加载插件时存在加载超时控制。
- 依赖执行顺序的插件应谨慎设计；`priority` 控制的是事件处理顺序，不代表 npm 包或插件目录的导入依赖顺序。
- TypeScript 插件必须先生成可被 Node.js ESM 导入的 `.js` 文件。

完整的 TRSS-Yunzai 插件 API、事件、上下文、渲染和配置说明参见[《TRSS-Yunzai 插件开发完整 Wiki》](./full-wiki.md)。
