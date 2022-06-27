<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <!-- 左侧显示总记录 -->
        <span slot="before">共{{ page.total }}条记录</span>
        <!-- 右侧显示按钮 -->
        <template v-slot:after>
          <el-button type="warning" @click="$router.push('/import')">导入</el-button>
          <el-button type="danger" @click="exportData">导出</el-button>
          <el-button type="primary" @click="showDialog = true">新增员工</el-button>
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
            <template v-slot="{ row }">
              <el-button type="text" size="small">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small">角色</el-button>
              <el-button type="text" size="small" @click="delEmployee(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row type="flex" justify="center" align="middle" style="height: 60px">
          <el-pagination :current-page="page.page" :page-size="page.size" :total="page.total" layout="prev, pager, next" @current-change="changePage" />
        </el-row>
      </el-card>
    </div>
    <!-- sync修饰符  是子组件改变父组件数据的语法糖-->
    <add-employee :show-dialog.sync="showDialog" />
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees' // 引入枚举对象
import AddEmployee from './components/add-employee.vue'
export default {
  components: { AddEmployee },
  data() {
    return {
      list: [], // 接受数组
      page: {
        page: 1,
        size: 10,
        total: 0
      },
      loading: false, // 显示遮罩层
      showDialog: false
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
    },
    async delEmployee(id) {
      try {
        await this.$confirm('确定删除该员工吗?')
        // 点击确定
        await delEmployee(id)
        this.$message.success('删除员工成功')
        // 重新拉取
        this.getEmployeeList()
      } catch (error) {
        console.log(error)
      }
    },
    exportData() {
      // 导出excel
      const headers = {
        '手机号': 'mobile',
        '姓名': 'username',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      import('@/vendor/Export2Excel').then(async excel => {
        const { rows } = await getEmployeeList({ page: 1, size: this.page.total })
        const data = this.formatJson(headers, rows)
        excel.export_json_to_excel({
          header: Object.keys(headers), // 表头 必填
          data, // 具体数据 必填
          filename: 'excel-list', // 非必填
          autoWidth: true, // 非必填
          bookType: 'xlsx' // 非必填
        })
      })
    },
    formatJson(headers, rows) {
      rows.map(item => {
        // item 是一个对象
        Object.keys(headers).map(key => {
          return item[headers[key]]
        })
      })
    }
  }
}
</script>

<style>

</style>
