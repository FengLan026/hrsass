<template>
  <el-row type="flex" justify="space-between" align="middle" style="height: 40px; width: 100%">
    <el-col>
      <!-- 左侧内容 -->
      <span>{{ treeNode.name }}</span>
    </el-col>
    <el-col :span="4">
      <el-row type="flex" justify="end">
        <el-col>{{ treeNode.manager }}</el-col>
        <el-col>
          <!-- 放置下拉菜单  operate 操作-->
          <el-dropdown @command="operateDepts">
            <!-- 内容 -->
            <span class="dropdown-btn">操作
              <i class="el-icon-arrow-down" />
            </span>
            <!-- 具名插槽 -->
            <el-dropdown-menu slot="dropdown">
              <!-- 下拉选项 -->
              <el-dropdown-item command="add" :disabled="!checkPermission('add-dept')">添加子部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="edit">编辑部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="del">删除部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { delDepartments } from '@/api/departments'
export default {
  props: {
    // 定义传入的属性
    treeNode: {
      required: true,
      type: Object
    },
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 点击 编辑 删除 新增 时触发
    operateDepts(type) {
      switch (type) {
        case 'add':
          // 添加子部门  在当前点击的部门下  添加子部门  => this.treeNode 就是当前点击的部门
          // 告诉父组件 显示弹窗
          this.$emit('addDepts', this.treeNode) // 触发showDialog事件 告诉父组件显示弹窗
          break
        case 'edit':
          // 编辑子部门
          this.$emit('editDepts', this.treeNode) // 触发自定义事件 点击谁 编辑谁
          break
        case 'del':
          // 删除子部门
          this.$confirm('您确定要删除该部门吗?').then(() => {
            // 确认时进入
            return delDepartments(this.treeNode.id)
          }).then(() => {
            // 只需要等到成功的时候  调用接口删除了  后端数据变化了  但是前端没变  重新获取
            this.$emit('delDepts') // 触发自定义事件
            this.$message.success('删除部门成功')
          })
          break
      }
    }
  }
}
</script>

<style scoped>
 .dropdown-btn{
  cursor: pointer;
 }
</style>>
