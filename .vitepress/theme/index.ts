import type { Theme as ThemeConfig } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { App, h } from 'vue'
import { Icon } from '@iconify/vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './styles/index.css'
import Layout from './components/Layout.vue'

import type { Options } from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import { InjectionKey } from '@nolebase/vitepress-plugin-enhanced-readabilities/client'

/** git提交记录 */
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client'
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'


export const Theme: ThemeConfig = {
  extends: DefaultTheme,
  Layout() {
    return h(Layout) 
  },
  enhanceApp({ app }: { app: App }) {
    app.use(Antd);
    app.use(NolebaseGitChangelogPlugin)  
    app.component('Icon', Icon)
    app.provide(InjectionKey, { 
      layoutSwitch:{
      pageLayoutMaxWidth: {
        disableHelp: true,
      },
    },
      spotlight: {
        defaultToggle: true,
      }
      
    } as Options) 
  },
}

export default Theme
