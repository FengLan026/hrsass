// 权限拦截在路由跳转  导航守卫
import router from '@/router'
import store from '@/store'  // 引入store 实例  和组件中的this.$store 是一回事
import nprogress from 'nprogress' // 引入进度条
import 'nprogress/nprogress.css' // 引入进度条样式

// 不需要导出  因为只需要让代码执行即可
// 前置守卫  回调函数 中三个参数
// next 是前置守卫必须执行的钩子
// next()  放过
// next(false) 跳转终止
// next(地址) 跳转到某个地址
const whiteList = ['/login', '/404'] // 定义白名单 所有不受权限控制的页面
router.beforeEach((to, from, next) => {
  nprogress.start() // 开启进度条
  if (store.getters.woken) {
    // 如果有token
    if (to.path === '/login') {
      // 如果访问的是登录页
      next('/') // 跳到主页
    } else {
      next()
    }
  } else {
    // 如果没有token
    if (whiteList.includes(to.path)) {
      // 表示要去的地址在白名单
      next()
    } else {
      next('/login')
    }
  }
  nprogress.done() // 手动关闭一次, 为了解决手动切换地址时进度条不关闭的问题
})
// 后置守卫
router.afterEach(() => {
  nprogress.done() // 关闭进度条

}
)
