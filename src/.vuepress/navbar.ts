import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "版本",
    icon: "user-group",
    children: [
      {
        text: "Yunzai-Bot",
        link: "https://gitee.com/Le-niao/Yunzai-Bot",
      },
      {
        text: "Miao-Yunzai",
        link: "https://gitee.com/yoimiya-kokomi/Miao-Yunzai"
      },
      {
        text: "TRSS-Yunzai",
        link: "https://gitee.com/TimeRainStarSky/Yunzai"
      }
    ]
  }
]);
