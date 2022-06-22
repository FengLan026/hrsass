<template>
  <!-- 新增部门的弹层 -->
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
    <!-- 表单组件  el-form   label-width设置label的宽度   -->
    <!-- 匿名插槽 -->
    <!-- 表单校验: 1. el-from 配置modul和rules属性 2. el-from-item 配置prop属性 3. 表单进行v-model双向绑定 -->
    <!-- 手动校验  给<el-from>增加ref属性 -->
    <el-form ref="deptForm" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="formData.code" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select v-model="formData.manager" style="width:80%" placeholder="请选择" @focus="getEmployeeSimple">
          <!-- 遍历选项 -->
          <el-option v-for="item in people" :key="item.id" :label="item.username" :value="item.username" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="formData.introduce" style="width:80%" placeholder="1-300个字符" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <!-- 列被分为24 -->
      <el-col :span="6">
        <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        <el-button size="small" @click="btnCancel">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import { addDepartments, getDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'

export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    treeNode: {
      type: Object,
      default: null
    }
  },
  data() {
    // 检查部门名称是否重复
    const cheakNameRepeat = async(rule, value, callback) => {
      // value 是部门名称 要去和同级目录下的部门去比较
      const { depts } = await getDepartments()
      // 去找同级部门下 有没有重名的
      // 找到所有的子部门
      let isRepeat = false
      if (this.formData.id) {
        // 有id就是编辑模式
        // 编辑的数据在数据库里有!! 同级部门下 我的名字不能和其他的同级部门的名字进行重复
        // 首先要找到我的同级部门 this.formData.id 就是我的id  this.formData.pid 是我的pid
        // depts.filter(item => item.pid === this.formData.pid)
        // 找到同级部门并且排除自身, 之后在查找修改后的名称是否有相同
        isRepeat = depts.filter(item => item.pid === this.treeNode.pid && item.id !== this.treeNode.id).some(item => item.name === value)
      } else {
        // 没有id就是新增模式
        isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
      }
      // 如果isRepeat为true 表示找到了一样的名字
      isRepeat ? callback(new Error(`同级部门下已经存在这个${value}部门`)) : callback()
    }
    const checkCodeRepeat = async(rule, value, callback) => {
      const { depts } = await getDepartments()
      // 要求编码和所有部门 都不能重复  由于历史数据有可能没有code 所有说这里加一个强制性条件
      let isRepeat = false
      if (this.formData.id) {
        // 编辑模式下
        // 不能有一样的code
        isRepeat = depts.filter(item => item.id !== this.treeNode.id).some(item => item.code === value)
      } else {
        // 新增模式下
        isRepeat = depts.some(item => item.code === value)
      }
      isRepeat ? callback(new Error(`已经存在这个${value}编码`)) : callback()
    }
    return {
      // 表单数据
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理
        introduce: '' // 部门介绍
      },
      // 校验规则
      rules: {
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '字符长度为1~50个字符', trigger: 'blur' },
          { trigger: 'blur', validator: cheakNameRepeat }],
        code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '字符长度为1~50个字符', trigger: 'blur' },
          { trigger: 'blur', validator: checkCodeRepeat }],
        manager: [{ required: true, message: '部门管理不能为空', trigger: 'blur' }],
        introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' },
          { min: 1, max: 300, message: '字符长度为1~300个字符', trigger: 'blur' }]
      },
      people: []
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑部门' : '新增部门'
    }
  },
  methods: {
    async getEmployeeSimple() {
      const result = await getEmployeeSimple()
      this.people = result
    },
    // 获取详情方法
    async getDepartDetail(id) {
      this.formData = await getDepartDetail(id)
      // 因为是父组件调用子组件的方法 先设置了node数据 直接调用方法
      // props传值是异步的  直接写this.treeNode.id可能取不到 因此用传参
    },
    btnOK() {
      // 手动校验表单   validate是<el-from>的方法
      this.$refs.deptForm.validate(async isOK => {
        if (isOK) {
          if (this.formData.id) {
            // 编辑
            await updateDepartments(this.formData)
          } else {
            // 调用新增接口时 添加父部门的id为子部门的pid
            await addDepartments({ ...this.formData, pid: this.treeNode.id })
          }
          // 告诉父组件
          this.$emit('addDepts') // 触发一个自定义事件
          // update:props名称, 值
          // 父组件自定义事件加修饰符 .sync
          this.$emit('update:showDialog', false)
          // 关闭dialog的时候 会触发el-dialog的close事件 所以这里不需要再单独重置校验
        }
      })
    },
    btnCancel() {
      // 重置数据 因为resetFields只能重置表单上的数据  非表单上的数据比如id不能重置
      this.formData = {
        name: '',
        code: '',
        manager: '',
        introduce: ''
      }
      // 关闭弹窗
      this.$emit('update:showDialog', false)
      // 清除之前的校验  可以重置数据  但是只能重置定义在data中的数据
      this.$refs.deptForm.resetFields()
    }
  }

}
</script>

<style scoped>

</style>
