// 做一个混入对象
import store from '@/store'

export default {
  // 混入对象是组件的选项对象
  methods: {
    // 检查权限  要么有 要么没有 key就是要检查的点
    checkPermission(key) {
      // 去用户的信息里面找  points中没有key 则认为有权限  如果没有key则认为不能点击
      const { userInfo } = store.state.user
      if (userInfo.roles.points && userInfo.roles.points.length) {
        return userInfo.roles.points.some(item => item === key)
      }
      return false // 如果没有进入 说明没有权限
    }
  }
}
