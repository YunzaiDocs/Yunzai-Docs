import type { Theme as ThemeConfig } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { App, h } from 'vue'
import { Icon } from '@iconify/vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import './styles/index.css'

/** git提交记录 */
import { NolebaseGitChangelogPlugin } from '@nolebase/vitepress-plugin-git-changelog/client'
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'

/** 面包屑导航 */
import { NolebaseBreadcrumbs } from '@nolebase/vitepress-plugin-breadcrumbs/client'

/** 阅读增强 */
import { 
  NolebaseEnhancedReadabilitiesMenu, 
  NolebaseEnhancedReadabilitiesScreenMenu, 
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'
import type { Options } from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import { InjectionKey } from '@nolebase/vitepress-plugin-enhanced-readabilities/client'

export const Theme: ThemeConfig = {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // 面包屑导航
      'doc-before': () => h(NolebaseBreadcrumbs), 
      // 阅读增强
      'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu), 
      'nav-screen-content-after': () => h(NolebaseEnhancedReadabilitiesScreenMenu), 
    })
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
  }
}

export default Theme
