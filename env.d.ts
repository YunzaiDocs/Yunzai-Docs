/// <reference types="vue/dist/vue.d.ts" />

// 为.vue文件添加类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}