// 专门处理权限路由的模块

// 引入静态路由
import { constantRoutes, asyncRoutes } from '@/router'
const state = {
  // 都拥有静态路由的权限
  routes: constantRoutes // 路由表 表示当前用户拥有的所有路由的数组
}
const mutations = {
  // 定义修改routes的mutations
  // payload 认为是我们登录成功需要添加的新路由
  setRoutes(state, newRoutes) {
    state.routes = [...constantRoutes, ...newRoutes] // 每次都是在静态路由的基础上加新的路由
  }
}
const actions = {
  // 筛选权限路由
  // 第二个参数为当前用户的所拥有的菜单权限 meus: ["settings", "permissions"]
  // asyncRoutes 是所有的动态路由
  filterRoutes(context, menus) {
    const routes = []
    // 筛选出动态路由中和menus中能够对上的路由
    menus.forEach(key => {
      // key  是标识
      // asyncRoutes中找有没有对象中的 name === key , 如果找不到就没权限 如果找到了筛选出来
      routes.push(...asyncRoutes.filter(item => item.name === key))
    })
    // routes 就是当前用户所拥有的动态路由的权限
    context.commit('setRoutes', routes) // 将动态路由提交给mutations
    return routes // 这里为什么还要return?    state数据是用来显示左侧菜单用的   而return 是给路由addRoutes用的
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
