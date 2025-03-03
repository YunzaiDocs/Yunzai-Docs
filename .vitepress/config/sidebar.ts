import { DefaultTheme } from 'vitepress'
const sidebar: DefaultTheme.Sidebar = [
  {
    text: '🚀 快速开启',
    collapsed: true,
    items: [
      { text: '介绍', link: '/quick-start/' },
      { text: '安装部署', link: '/quick-start/install' },
    ]
  }
]

export default sidebar