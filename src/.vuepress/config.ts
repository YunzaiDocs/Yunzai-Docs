import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "Yunzai-Bot",
  description: "Yunzai的帮助文档",

  theme,

});
