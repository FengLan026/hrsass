import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
import { getTimeStamp } from '@/utils/auth'
const TimeOut = 3600
const service = axios.create({
  // 当执行 npm run dev => .evn.development => /api => 跨域代理
  baseURL: process.env.VUE_APP_BASE_API, // npm run dev => /api npm run build => /prod-api
  timeout: 5000 // 设置超时时间
})

// 请求拦截器
service.interceptors.request.use(config => {
  // 在这个位置需要统一的去注入token
  if (store.getters.token) {
    // 只有在有token的情况下  才有必要检查时间戳
    if (IsCheckTimeOut()) {
      // 如果为true 表示过期了
      // token 没用了 超时了
      store.dispatch('user/logout')// 登出操作
      // 跳到登录页
      router.push('/login')
      return Promise.reject(new Error('token超时了'))
    }
    config.headers['Authorization'] = `Bearer ${store.getters.token}`
  }
  return config // 必须返回配置
}, error => {
  return Promise.reject(error)
})
service.interceptors.response.use(response => {
  // axios 默认加了一层data
  const { success, message, data } = response.data
  // 要根据success的成功与否决定下面的操作
  if (success) {
    return data
  } else {
    Message.error(message) // 提示错误消息
    return Promise.reject(new Error(message))
  }
}, error => {
  // error 信息里面 response 的对象
  if (error.response && error.response.data && error.response.data.code === 1002) {
    // 当等于1002的时候表示 后端告诉我 token 超时了
    store.dispatch('user/logout') // 登出action
    router.push('/login')
  } else {
    Message.error(error.message) // 提示错误
  }
  return Promise.reject(error) // 返回执行错误 让当前的执行链跳出成功, 直接进入catch
})

// 是否超时
// 超时逻辑   当前时间 - 缓存中的时间  是否大于 时间差
function IsCheckTimeOut() {
  var currentTime = Date.now() // 当前时间戳
  var timeStamp = getTimeStamp() // 缓存时间戳
  return (currentTime - timeStamp) / 1000 > TimeOut
}
export default service
