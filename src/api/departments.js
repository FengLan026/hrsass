import request from '@/utils/request'

// 获取组织架构的数据
export function getDepartments() {
  return request({
    url: '/company/department'
  })
}

// 删除组织架构的部门
export function delDepartments(id) {
  return request({
    method: 'delete',
    // 同样的地址 不同的方法 执行不同的业务
    // delete 删除业务
    // get 获取业务
    // post 新增或添加业务
    // put 修改业务
    url: `/company/department/${id}`
  })
}

// 新增部门
export function addDepartments(data) {
  return request({
    url: '/company/department',
    method: 'post',
    data// axios 中的body参数
  })
}
