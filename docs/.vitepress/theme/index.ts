import DefaultTheme from 'vitepress/theme';
import { type Plugin, App, h } from 'vue';
import { Icon } from '@iconify/vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './styles/index.css';
import Layout from './components/Layout.vue';

/** 链接卡片 */
import { DocBox, DocBoxCube, DocLinks, DocPill } from '@theojs/lumen';

import type { Options } from '@nolebase/vitepress-plugin-enhanced-readabilities/client';
import { InjectionKey } from '@nolebase/vitepress-plugin-enhanced-readabilities/client';

/** git提交记录 */
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client';
import '@nolebase/vitepress-plugin-git-changelog/client/style.css';

/** 行内链接预览 */
import { NolebaseInlineLinkPreviewPlugin } from '@nolebase/vitepress-plugin-inline-link-preview/client';
import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css';

import 'virtual:group-icons.css'
/** tabs组 */
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client';

export default {
  extends: DefaultTheme,

  Layout,
  enhanceApp({ app }: { app: App }) {
    /** Antd组件库 */
    app.use(Antd);
    /** git提交记录 */
    app.use(NolebaseGitChangelogPlugin as Plugin);
    /** 行内链接 */
    app.use(NolebaseInlineLinkPreviewPlugin as Plugin);
    /** 链接卡片 */
    app.component('Box', DocBox);
    app.component('Pill', DocPill);
    app.component('Links', DocLinks);
    app.component('BoxCube', DocBoxCube);
    /** tabs组 */
    enhanceAppWithTabs(app);
    /** 图标库 */
    app.component('Icon', Icon);
    /** 阅读增强 */
    app.provide(InjectionKey, {
      layoutSwitch: {
        pageLayoutMaxWidth: {
          disableHelp: true,
        },
      },
      spotlight: {
        defaultToggle: true,
      },
    } as Options);
  },
};
