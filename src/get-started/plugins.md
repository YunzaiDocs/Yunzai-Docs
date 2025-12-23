---
title: 插件支持
icon: box-archive
tag:
  - 插件
  - 功能
---

得益于 Yunzai 开源的特性，其拥有丰富的插件生态，用户可以自由的安装社区开发者发布的插件进行使用。

::: info 如何获取插件
你可以通过各种各样的渠道获取插件，包括但不限于: 代码开源平台、QQ群、搜索引擎、拼多多、闲鱼、博客、论坛等。

此外社区拥有插件资源索引库，可以在这里获取到想要的资源。
- [Gitee](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index)
- [GitHub](https://github.com/yhArcadia/Yunzai-Bot-plugins-index)
:::

## 插件机制

Yunzai 的插件通常使用`.js`后缀命名，使用JavaScript编写

Yunzai 会在开机时读取 `plugins/**` 文件夹下的 **所有** `.js`的文件，如果符合规则就将其载入。
因此，你可以将插件安装至`plugins`下的任意目录内。


## 插件类型

通常情况下，一个js文件就代表了一个插件/功能模块，社区通常称之为`单js插件`

但对于所需功能较多的大型插件则以`插件包(plugin)`的形式发布
这种情况下插件就不再是一个文件，而是一个“文件夹”。
比如 `plugins/miao-plugin` 这就是一个文件夹形式的插件包，而 `plugins/example/主动复读.js` 就是一个单个js文件形式的插件


## 安装插件

### 单js插件

单js插件常见的安装方法是将js文件放入到 `plugins/example` 文件夹下，Yunzai会检测到新增插件自动重载无需重启。
> 但是，如果你不在意热重载功能，我还是建议可以在`plugins`文件夹下新建一个专门的文件夹用来放单js插件。

### 插件包

::: tip
插件安装命令请以插件项目主页所提供的命令为准，部分插件需要使用指定的插件名称。
:::

插件包就不太一样了，这类资源通常发布在开源代码托管平台，如: GitHub/Gitee/Gitcode等
这种情况通常可以使用[`Git`](https://git-scm.com/book/zh/v2/起步-Git-是什么？)克隆仓库到`plugins`文件夹下
如果你不会使用Git也没关系，通常你浏览的插件项目主页会给你一条安装命令类似下面这条

```bash
git clone https://github.com/xxxx/xxxx-plugin ./plugins/xxxx-plugin
```

这条命令的含义是使用Git克隆`xxxx/xxxx-plugin`这个仓库到你终端当前工作目录下的plugins/xxxx-plugins文件夹。
而`https://github.com/xxxx/xxxx-plugin`就是就是存放插件代码的仓库。

使用这种方式安装的插件有个好处，那就是后续版本更新可以更方便快捷，插件一般会提供更新命令，如果没有也可以使用框架自带的`#更新xxxx-plugin`来进行更新。

::: note 手动安装
虽然不推荐，但是你可以在Git或者其他平台上下载插件的压缩包将其解压到plugins文件夹下，通过这种方式安装的插件无法使用命令更新插件。
:::

## 安装依赖

有部分插件它们需要额外安装外部依赖，具体情况请以其项目的README为准。

如果你在启动时发现插件加载报错/显示缺少依赖可以尝试在 **Yunzai的根目录** 运行 `pnpm install` 或者 `pnpm install -P`

::: warning
如果单js插件缺少依赖，请勿直接在 `Yunzai根目录` 运行 `pnpm add xxx` ，不要携带`-w`参数，因为这会在你的项目根目录添加依赖并修改`package.json`从而导致后续更新冲突。

正确的做法是在缺少依赖的单js插件的安装目录(如: plugins/example)下运行
```bash
pnpm init # 初始化，只需执行一次
pnpm add <依赖名称>
```
:::
