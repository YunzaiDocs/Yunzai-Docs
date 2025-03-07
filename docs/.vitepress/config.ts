import { defineConfig } from 'vitepress';
import path from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import nav from './config/nav';
import sidebar from './config/sidebar';
import Version from './config/version';
import search from './config/search';

/** 代码组图标 */
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

/** git更新日志 */
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite';

/** 行内链接预览 */
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it';
/** 双向链接 */
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links';

/** tabs组 */
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';

export default defineConfig({
  title: 'Yunzai-Bot docs',
  lang: 'zh-CN',
  cleanUrls: true,
  base: '/',
  description: '原神QQ群机器人，通过米游社接口，查询原神游戏信息，生成图片返回',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  vite: {
    optimizeDeps: {
      exclude: [
        '@nolebase/vitepress-plugin-breadcrumbs/client',
        '@nolebase/vitepress-plugin-enhanced-readabilities/client',
        '@nolebase/vitepress-plugin-inline-link-preview/client',
        'vitepress',
        '@nolebase/ui',
      ],
    },
    ssr: {
      noExternal: ['@nolebase/*'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern'
        }
      }
    },
    resolve: {
      alias: {
        '~/': `${path.resolve(__dirname, 'docs')}/`
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
    },
    plugins: [
      AutoImport({
        resolvers: [AntDesignVueResolver()],
      }),
      Components({
        resolvers: [AntDesignVueResolver()],
      }),
      /** git提交记录 */
      GitChangelog({
        repoURL: () => Version.getRepositoryUrl(),
        maxGitLogCount: 20,
      }),
      GitChangelogMarkdownSection({
        sections: {
          disableChangelog: false,
          disableContributors: true,
        },
      }),
      groupIconVitePlugin(),
    ],
  },
  themeConfig: {
    logo: '/logo.png',
    nav,
    sidebar,
    search,
    footer: {
      message: 'Released under the MIT License.',
      copyright: '© 2025-present <a href="#">Yunzai-Bot</a>',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/DenFengLai/Yunzai-Docs' },
    ],
    outline: {
      level: [2, 4],
      label: '页面导航',
    },
    outlineTitle: '本页大纲',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    lastUpdatedText: '上次更新',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    notFound: {
      title: '⚠️ 页面未找到',
      quote: '你来到了知识的荒原...',
      linkText: '返回首页',
    },
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    darkModeSwitchLabel: '主题模式',
  },
  markdown: {
    config(md) {
      /** 行内链接预览 */
      md.use(InlineLinkPreviewElementTransform);
      /** 双向链接 */
      md.use(BiDirectionalLinks());
      /** tabs组 */
      md.use(tabsMarkdownPlugin);
      /** 代码组图标 */
      md.use(groupIconMdPlugin)
    },
  }
});
