<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 放置内容 -->
      <el-card>
        <el-tabs>
          <el-tab-pane label="角色管理">
            <!-- 左侧的内容 -->
            <el-row style="height:60px">
              <el-button type="primary" icon="el-icon-plus" size="small" @click="showDialog = true">新增角色</el-button>
            </el-row>
            <!-- 表格 -->
            <el-table border="" :data="list">
              <el-table-column type="index" align="center" label="序号" width="120" />
              <el-table-column prop="name" align="center" label="名称" width="240" />
              <el-table-column prop="description" align="center" label="描述" />
              <el-table-column label="操作" align="center">
                <!-- 作用域插槽 -->
                <template slot-scope="{ row }">
                  <el-button size="small" type="success" @click="assignPerm(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="editRole(row.id)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteRole(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- 分页组件 -->
            <el-row type="flex" justify="center" align="middle" style="height:60px">
              <el-pagination layout="prev, pager, next" :total="page.total" :page-size="page.pagesize" :current-page="page.page" @current-change="changePage" />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="公司信息">
            <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
              show-icon
              :closable="false"
            />
            <!-- 右侧的内容 -->
            <!-- 并不是所有的表单都需要 model rules 只有表单校验是才需要 -->
            <el-form label-width="120px" style="margin-top:50px">
              <el-form-item label="公司名称">
                <el-input v-model="formData.name" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input v-model="formData.companyAddress" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="电话">
                <el-input v-model="formData.companyPhone" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="formData.mailbox" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="formData.remarks" disabled style="width:400px" type="textarea" :row="3" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <!-- 放置一个弹层组件 -->
    <!-- close在点击确定时会触发 -->
    <el-dialog title="编辑部门" :visible="showDialog" @close="btnCancel">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="100px">
        <el-form-item prop="name" label="角色名称">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <!-- 放置footer插槽 -->
      <el-row type="flex" justify="center">
        <el-col :span="8">
          <el-button type="primary" @click="btnOK">确定</el-button>
          <el-button @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <!-- 放置一个弹层 -->
    <el-dialog title="分配权限" :visible.sync="showPermDialog" @close="btnPermCancel">
      <!-- :default-expand-all="true" 默认展开 -->
      <!-- :show-checkbox="true" 可选择 -->
      <!-- :check-strictly="true" 父子不互相关联 -->
      <!-- :node-key="id"  id作为唯一标识 -->
      <el-tree ref="permTree" :data="permData" :props="defaultProps" :default-expand-all="true" :show-checkbox="true" :check-strictly="true" node-key="id" :default-checked-keys="selectCheck" />
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" @click="btnPermOK">确 定</el-button>
          <el-button @click="btnPermCancel">取 消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getRoleList, getCompanyInfo, deleteRole, updateRole, getRoleDetail, addRole, assignPerm } from '@/api/setting'
import { getPermissionList } from '@/api/permisson'
import { tranListToTreeData } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      list: [], // 定义list承接获取的角色数据
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 10,
        total: 0 // 记录总数
      },
      permData: [], // 接收权限数据
      defaultProps: {
        label: 'name'
      }, // 定义显示字段的名称和自属性的字段名称
      roleId: null, // 用来记录当前分配权限的id
      selectCheck: [], // 用来记录当前权限点的标识
      formData: {
        // 公司信息
      },
      showDialog: false, // 弹层显示
      showPermDialog: false, // 控制分配权限
      roleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['companyId'])
  },
  created() {
    this.getRoleList() // 获取角色列表
    this.getCompanyInfo() // 获取公司信息
  },
  methods: {
    async getRoleList() {
      // 参数是个对象
      const { total, rows } = await getRoleList(this.page)
      this.page.total = total
      this.list = rows
    },
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId) // 赋值给formData
    },
    changePage(newPage) {
      // newPage是当前点击的页码
      this.page.page = newPage // 将当前的页码赋值给最新页码
      this.getRoleList()
    },
    async deleteRole(id) {
      // 提示
      try {
        await this.$confirm('确认删除该角色吗?')
        // 只有点击了确定 才可以进入到下方
        await deleteRole(id) // 调用删除接口
        this.getRoleList() // 重新加载页面
        this.$message.success('删除角色成功')
      } catch (error) {
        console.log(error)
      }
    },
    async editRole(id) {
      this.roleForm = await getRoleDetail(id) // 实现数据回写
      this.showDialog = true // 显示弹层
    },
    async btnOK() {
      try {
        await this.$refs.roleForm.validate() // 返回一个promise对象
        // 校验通过时进入
        // roleForm这个对象有id就是编辑 没有id就是新增
        if (this.roleForm.id) {
          await updateRole(this.roleForm)
        } else {
          // 新增
          await addRole(this.roleForm)
        }
        // 重新拉取数据
        this.getRoleList()
        this.$message.success('操作成功')
        this.showDialog = false
      } catch (error) {
        console.log(error)
      }
    },
    btnCancel() {
      this.roleForm = {
        name: '',
        description: ''
      }
      // 移除校验
      this.$refs.roleForm.resetFields
      // 关闭弹层
      this.showDialog = false
    },
    // 分配权限弹层
    async assignPerm(id) {
      // 获取权限点数据
      this.permData = tranListToTreeData(await getPermissionList(), '0') // 转化list到树形
      // 记录id
      this.roleId = id
      // 应该去获取这个id的权限点
      const { permIds } = await getRoleDetail(id) // 当前角色拥有的权限点数据
      this.selectCheck = permIds // 将当前角色拥有的权限id赋值回写
      this.showPermDialog = true
    },
    async btnPermOK() {
      // 调用el-tree的方法
      await assignPerm({ permIds: this.$refs.permTree.getCheckedKeys(), id: this.roleId })
      this.$message.success('分配权限成功')
      this.showPermDialog = false
    },
    btnPermCancel() {
      this.selectCheck = [] // 重置数据
      this.showPermDialog = false
    }
  }
}
</script>

<style>

</style>
