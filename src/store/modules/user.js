import { getToken, setToken, removeToken, setTimeStamp } from '@/utils/auth'
import { login, getUserInfo, getUserDetailById } from '@/api/user'
import { resetRouter } from '@/router'
// 状态
const state = {
  token: getToken(), // 设置 token 为共享状态  一初始化  vuex 的时候, 就先从缓存中读取
  userInfo: {} // 这里定义一个空对象
}
// 修改状态
const mutations = {
  setToken(state, token) {
    state.token = token // 将数据设置给vuex
    // 同步给缓存
    setToken(token)
  },
  removeToken(state) {
    state.token = null // 将vuex的数据置空
    removeToken() // 同步到缓存
  },
  // 设置用户信息
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo // 这样是响应式
    // state.userInfo = { ...userInfo } // 这样也是响应式, 属于浅拷贝
  },
  // 删除用户信息
  reomveUserInfo(state) {
    state.userInfo = {}
  }
}
// 执行异步
const actions = {
  async login(context, data) {
    // 调用api接口
    const result = await login(data)
    context.commit('setToken', result) // 设置token
    // 拿到token说明登录成功
    setTimeStamp() // 设置当前时间戳
  },
  // 获取用户资料action
  async getUserInfo(context) {
    const result = await getUserInfo()
    // 获取用户详情
    const baseInfo = await getUserDetailById(result.userId)
    context.commit('setUserInfo', { ...result, ...baseInfo }) // 提交到mutations
    return result
  },
  // 登出操作
  logout(context) {
    // 删除token
    context.commit('removeToken')
    // 删除用户资料
    context.commit('reomveUserInfo')
    // 重置路由
    resetRouter()
    // 去设置权限模块下的路由为初始状态
    // Vuex子模块怎么调用子模块的action 都没加锁的情况下 可以随意调用
    // 不加命名空间的情况下  所有的mutations和action都是挂在全局上的  所以可以直接调用
    // 但是加了命名空间的子模块怎么调用另一个加了命名空间子模块的mutations
    // 加了命名空间的context指的不是全局的context
    // 参数
    // mutation名称 载荷 第三个参数 { root: true } 表示调用根级的mutations和action
    context.commit('permission/setRoutes', [], { root: true })
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
