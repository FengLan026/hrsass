import { getToken, setToken, removeToken, setTimeStamp } from "@/utils/auth"
import { login, getUserInfo } from "@/api/user"
// 状态
const state = {
  token: getToken(), // 设置 token 为共享状态  一初始化  vuex 的时候, 就先从缓存中读取
  userInfo: {} // 这里定义一个空对象
}
// 修改状态
const mutations = {
  // 设置用户信息
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo // 这样是响应式
    // state.userInfo = { ...userInfo } // 这样也是响应式, 属于浅拷贝
  },
  // 删除用户信息
  reomveUserInfo(state) {
    state.userInfo = {}
  },
  setToken(state, token) {
    state.token = token // 将数据设置给vuex
    // 同步给缓存
    setToken(token)
  },
  removeToken(state) {
    state.token = null // 将vuex的数据置空
    removeToken() //同步到缓存
  }
}
// 执行异步
const actions = {
  async login(context, data) {
    // 调用api接口
    const result = await login(data) // 拿到token
    context.commit("setToken", result) // 设置token
    setTimeStamp() // 设置当前时间戳
  },
  // 获取用户资料action
  async getUserInfo(context) {
    const result = await getUserInfo()
    context.commit('setUserInfo', result) // 提交到mutations
    return result // 
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
