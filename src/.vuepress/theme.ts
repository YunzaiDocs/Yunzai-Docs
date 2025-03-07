import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://Yunzai-Bot.com",

  author: {
    name: "等风来",
    url: "https://dengfenglai.icu/",
  },

  logo: "/logo.png",

  fullscreen: true,
  

  repo: "DenFengLai/Yunzai-Docs",

  docsDir: "src",
  
  breadcrumb: true,

  navbar,

  sidebar,

  copyright: "Copyright © 2025 Yunzai-Bot 文档",

  // footer: "页脚",

  displayFooter: true,

  // 加密配置
  // encrypt: {
  //   config: {
  //     "/demo/encrypt.html": {
  //       hint: "Password: 1234",
  //       password: "1234",
  //     },
  //   },
  // },

  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },

  hotReload: true,

  markdown: {
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    gfm: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    plantuml: true,
    spoiler: true,
    stylize: [
      {
        matcher: "Recommended",
        replacer: ({ tag }) => {
          if (tag === "em")
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
        },
      },
    ],
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true
  },

  // 插件配置
  plugins: {
    
    // comment: {
    //   provider: "Waline",
    //   serverURL: "https://waline.dengfenglai.icu/",
    // },

    components: {
      components: ["Badge", "VPCard", "VPBanner"],
    },

    icon: {
      prefix: "fa6-solid:",
    }
  },
});
