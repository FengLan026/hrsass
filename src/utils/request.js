import axios from 'axios'
import { Message } from "element-ui"
import store from "vuex"
import { getTImeStamp } from '@/utils/auth'
const TimeOut = 3600
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000 // 设置超时时间
}
)
service.interceptors.request.use(config => {
  if (store.mapGetters.token) {
    if (IsCheckTimeOut()) {
      
      return Promise.reject(new Error('token超时了'))
    }
    config.headers['Authorization'] = `Bearer ${store.mapGetters.token}`
  }
  return config
}, error => {
  return Promise.reject(error)
}


)
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
  Message.error(error.message) // 提示错误
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
