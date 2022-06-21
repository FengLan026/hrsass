// 获取组织架构的数据
import request from '@/utils/request'

export function getDepartments() {
  return request({
    url: '/company/department'
  })
}
