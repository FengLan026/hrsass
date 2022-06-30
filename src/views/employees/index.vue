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
          <el-table-column label="头像" width="120px" align="center">
            <template slot-scope="{ row }">
              <img v-imageerror="require('@/assets/common/head.jpg')" :src="row.staffPhoto" style="border-radios:50%; width: 100px; height: 100px; padding: 10px" alt="" @click="showQrCode(row.staffPhoto)">
            </template>
          </el-table-column>
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
              <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
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
    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
// 格式化时间
import { formatDate } from '@/filters'
import { getEmployeeList, delEmployee } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees' // 引入枚举对象
import AddEmployee from './components/add-employee.vue'
import QrCode from 'qrcode'
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
      showDialog: false,
      showCodeDialog: false // 显示二维码弹层
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
      const headers = {
        '姓名': 'username',
        '手机号': 'mobile',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      // 导出excel
      import('@/vendor/Export2Excel').then(async excel => {
        //  excel是引入文件的导出对象
        // 导出  header从哪里来
        // data从哪里来
        // 现在没有一个接口获取所有的数据
        // 获取员工的接口 页码 每页条数    100   1 10000
        const { rows } = await getEmployeeList({ page: 1, size: this.page.total })
        const data = this.formatJson(headers, rows) // 返回的data就是 要导出的结构
        const multiHeader = [['姓名', '主要信息', '', '', '', '', '部门']]
        const merges = ['A1:A2', 'B1:F1', 'G1:G2']
        excel.export_json_to_excel({
          header: Object.keys(headers),
          data,
          filename: '员工资料表',
          multiHeader, // 复杂表头
          merges // 合并选项
        })

        // excel.export_json_to_excel({
        //   header: ['姓名', '工资'],
        //   data: [['张三', 3000], ['李四', 5000]],
        //   filename: '员工工资表'
        // })
        // [{ username: '张三',mobile: 13112345678 }]  => [[]]
        // 要转化 数据结构 还要和表头的顺序对应上
        // 要求转出的标题是中文
      })
    },
    // 将表头数据和数据进行对应
    // [{}]  =>   [[]]
    formatJson(headers, rows) {
      return rows.map(item => {
        // item是一个对象  { mobile: 132111,username: '张三'  }
        // ["手机号", "姓名", "入职日期" 。。]
        return Object.keys(headers).map(key => {
          // 需要判断 字段
          if (headers[key] === 'timeOfEntry' || headers[key] === 'correctionTime') {
            // 格式化日期
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            const obj = EmployeeEnum.hireType.find(obj => obj.id === item[headers[key]])
            return obj ? obj.value : '未知'
          }
          return item[headers[key]]
        })
        // ["132", '张三’， ‘’，‘’，‘’d]
      })
      // return rows.map(item => Object.keys(headers).map(key => item[headers[key]]))
      // 需要处理时间格式问题
    },
    showQrCode(url) {
      // 只有url存在时弹出
      if (url) {
        this.showCodeDialog = true // 页面的渲染是异步的!!!
        // 有一个方法可以在上一个数据更新完后执行
        this.$nextTick(() => {
          QrCode.toCanvas(this.$refs.myCanvas, url) // 将地址转化成二维码
        })
      } else {
        [
          this.$message.warning('该用户未上传头像')
        ]
      }
    }
  }
}
</script>

<style>

</style>
