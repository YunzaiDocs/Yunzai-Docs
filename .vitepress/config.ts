import { defineConfig } from 'vitepress'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import nav from './config/nav'
import sidebar from './config/sidebar'
import Version from './config/version'

/** git更新日志 */
import { 
  GitChangelog, 
  GitChangelogMarkdownSection, 
} from '@nolebase/vitepress-plugin-git-changelog/vite'
/** 面包屑导航 */
import { generateBreadcrumbsData } from '@nolebase/vitepress-plugin-breadcrumbs/vitepress'

export default defineConfig({
  title: "Yunzai-Bot docs",
  lang: 'zh-CN',
  cleanUrls: true,
  base: '/',
  description: "原神QQ群机器人，通过米游社接口，查询原神游戏信息，生成图片返回",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  vite: {
    optimizeDeps: { 
      exclude: [ 
        '@nolebase/vitepress-plugin-breadcrumbs/client',
        '@nolebase/vitepress-plugin-enhanced-readabilities/client', 
        'vitepress', 
        '@nolebase/ui',
      ] 
    }, 
    ssr: { 
      noExternal: [ 
        '@nolebase/*'

      ]
    },
    plugins: [
      AutoImport({
        resolvers: [AntDesignVueResolver()],
      }),
      Components({
        resolvers: [AntDesignVueResolver()],
      }),
      GitChangelog({ 
        repoURL: () => Version.getRepositoryUrl(), 
        maxGitLogCount: 20
      }), 
      GitChangelogMarkdownSection({ 
        sections: {
          disableChangelog: false,
          disableContributors: true, 
        }, 
      }),
    ],
  },
  transformPageData(pageData, context) { 
    generateBreadcrumbsData(pageData, context) 
  }, 
  themeConfig: {
    logo: '/logo.png',
    nav,
    sidebar,
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: '© 2025-present <a href="#">Yunzai-Bot</a>',
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
      title: '⚠️ 页面未找到',
      quote: '你来到了知识的荒原...',
      linkText: '返回首页'
    },
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    darkModeSwitchLabel: '主题模式',
  }
})
