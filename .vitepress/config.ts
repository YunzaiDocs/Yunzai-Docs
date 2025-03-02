import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Yunzai-Bot docs",
  lang: 'zh-CN',
  base: '/',
  description: "原神QQ群机器人，通过米游社接口，查询原神游戏信息，生成图片返回",
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '🏠 主页', link: '/' },
      {
        text: '快速开启',
        items: [
          { text: '介绍', link: '/quick-start' },
          { text: '安装部署', link: '/quick-start/install' },
        ]
      },
      { 
        text: '版本', 
        items: [
        { text: 'Yunzai-Bot', link: 'https://github.com/Le-niao/Yunzai-Bot' },
        { text: 'Miao-Yunzai', link: 'https://github.com/yoimiya-kokomi/Miao-Yunzai' },
        { text: 'TRSS-Yunzai', link: 'https://github.com/TimeRainStarSky/Yunzai' },
      ] 
    }
    ],

    sidebar: [
      {
        text: '快速开启',
        collapsed: true,
        items: [
          { text: '介绍', link: '/quick-start' },
          { text: '安装部署', link: '/quick-start/install' },
        ]
      }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present yunzai-bot'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/DenFengLai/Yunzai-Docs' },
    ],
    outline: {
      label: '目录'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdatedText: '上次更新',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    notFound: {
      title: '页面未找到',
      quote: '你来到了知识的荒原...',
      linkText: '返回首页'
    },
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    darkModeSwitchLabel: '主题模式',
  }
})
