import { DefaultTheme } from 'vitepress'
const nav: DefaultTheme.NavItem[] = [
    { 
      text: '🏠️ 首页', 
      link: '/'
    },
    {
      text: '🚀 快速开启',
      items: [
        { text: '📖 介绍', link: '/quick-start' },
        { text: '🛠️ 安装部署', link: '/quick-start/install' },
      ]
    },
    { 
      text: '📌 版本', 
      items: [
        { text: '🦾 Yunzai-Bot', link: 'https://github.com/Le-niao/Yunzai-Bot' },
        { text: '🌊 Miao-Yunzai', link: 'https://github.com/yoimiya-kokomi/Miao-Yunzai' },
        { text: '✨ TRSS-Yunzai', link: 'https://github.com/TimeRainStarSky/Yunzai' },
      ] 
    }
]

export default nav