import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default defineNuxtPlugin(nuxtApp => {
  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    nuxtApp.vueApp.component(key, component)
  }
})
