<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <!-- 左侧显示总记录 -->
        <span slot="before">共{{ page.total }}条记录</span>
        <!-- 右侧显示按钮 -->
        <template v-slot:after>
          <el-button type="warning">导入</el-button>
          <el-button type="danger">导出</el-button>
          <el-button type="primary">新增员工</el-button>
        </template>
      </page-tools>
      <!-- 表格组件 -->
      <el-card v-loading="loading">
        <el-table :data="list" height="630px">
          <el-table-column label="序号" sortable="" type="index" align="center" />
          <el-table-column label="姓名" sortable="" prop="username" align="center" />
          <el-table-column label="工号" sortable="" prop="workNumber" align="center" />
          <el-table-column label="聘用形式" sortable="" prop="formOfEmployment" align="center" :formatter="formatEmployment" />
          <el-table-column label="部门" sortable="" prop="departmentName" align="center" />
          <!-- 作用域插槽 + 过滤器 -->
          <el-table-column label="入职时间" sortable="" align="center">
            <!-- <template slot-scope="obj"></template> -->
            <template v-slot="{ row }">
              <!-- 将时间进行格式化 -->
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column label="账户状态" sortable="" prop="enableState" align="center">
            <template slot-scope="{ row }">
              <!-- 根据当前状态 是否打开开关 -->
              <el-switch :value="row.enableState === 1" active-color="#13ce66" inactive-color="#ff4949" />
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280" align="center">
            <template>
              <el-button type="text" size="small">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small">角色</el-button>
              <el-button type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row type="flex" justify="center" align="middle" style="height: 60px">
          <el-pagination :current-page="page.page" :page-size="page.size" :total="page.total" layout="prev, pager, next" @current-change="changePage" />
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getEmployeeList } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees' // 引入枚举对象
export default {
  data() {
    return {
      list: [], // 接受数组
      page: {
        page: 1,
        size: 10,
        total: 0
      },
      loading: false // 显示遮罩层
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    async getEmployeeList() {
      this.loading = true
      const { total, rows } = await getEmployeeList(this.page)
      this.page.total = total
      this.list = rows
      this.loading = false
    },
    changePage(newPage) {
      this.page.page = newPage
      this.getEmployeeList()
    },
    // 格式化聘用形式
    formatEmployment(row, column, cellValue, index) {
      const hireType = EmployeeEnum.hireType.find(item => item.id === cellValue)
      return hireType ? hireType.value : '未知'
    }
  }
}
</script>

<style>

</style>
