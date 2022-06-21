<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 组织架构内容--头部 -->
      <el-card class="tree-card">
        <!-- 放置结构内容 -->
        <TreeTools :tree-node="company" :is-root="true" />
        <!-- 放置一个el-tree -->
        <el-tree :data="departs" :props="defaultProps" :default-expand-all="true" @addDepts="addDepts">
          <!-- 传入内容 插槽内容 会循环多次 有多少节点 就循环多少次 -->
          <!-- 作用域插槽 slot-scope="obj" 接收传递给插槽的数据   data 每个节点的数据对象-->
          <TreeTools slot-scope="{ data }" :tree-node="data" @delDepts="getDepartments" @addDepts="addDepts" />
        </el-tree>
      </el-card>
    </div>
    <add-dept :show-dialog="showDialog" />
  </div>
</template>

<script>
import TreeTools from './components/tree-tools.vue'
import AddDept from './components/add-dept.vue'
import { getDepartments } from '@/api/departments'
import { tranListToTreeData } from '@/utils'
export default {
  components: {
    TreeTools,
    AddDept
  },
  data() {
    return {
      company: { name: '未来科技有限公司', manager: '负责人' }, // 头部的数据结构
      departs: [{ name: '总裁办', manager: '曹操', children: [{ name: '董事会', manager: '曹丕' }] },
        { name: '行政部', manager: '刘备' },
        { name: '人事部', manager: '孙权' }],
      defaultProps: {
        label: 'name',
        child: 'manager'
      },
      showDialog: false, // 默认不显示弹窗
      node: null // 记录当前点击的节点
    }
  },
  created() {
    this.getDepartments() // 调用获取组织架构接口
  },
  methods: {
    async getDepartments() {
      const result = await getDepartments()
      this.company = { name: '未来科技有限公司', manager: '负责人' }
      this.departs = tranListToTreeData(result.depts, '')
    },
    // 监听tree-tools中触发的点击添加子部门的事件
    addDepts(node) {
      this.showDialog = true // 显示弹窗
      // 记录node
      this.node = node
    }
  }
}

</script>

<style scoped>
.tree-card {
  padding: 30px 140px;
  font-size:14px;
}
</style>
