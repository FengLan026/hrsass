import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import * as directives from '@/directives'
// 过滤器
// 将所有方法放入对象中
import * as filters from '@/filters'
import '@/icons' // icon
import '@/permission' // permission control

// 全局组件
import Components from '@/components'

Vue.use(Components)

import Print from 'vue-print-nb'
Vue.use(Print)

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

// 遍历对象 注册自定义指令
Object.keys(directives).forEach(key => {
  Vue.directive(key, directives[key])
})
Object.keys(filters).forEach(key => {
  // 注册过滤器
  Vue.filter(key, filters[key])
})
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
