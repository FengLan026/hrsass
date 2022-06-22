<template>
  <!-- 新增部门的弹层 -->
  <el-dialog title="新增部门" :visible="showDialog">
    <!-- 表单组件  el-form   label-width设置label的宽度   -->
    <!-- 匿名插槽 -->
    <!-- 表单校验: 1. el-from 配置modul和rules属性 2. el-from-item 配置prop属性 3. 表单进行v-model双向绑定 -->
    <!-- 手动校验  给<el-from>增加ref属性 -->
    <el-form ref="deptForm" :model="fromData" :rules="rules" label-width="120px">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="fromData.name" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门编码" prop="code">
        <el-input v-model="fromData.code" style="width:80%" placeholder="1-50个字符" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="manager">
        <el-select v-model="fromData.manager" style="width:80%" placeholder="请选择" @focus="getEmployeeSimple">
          <!-- 遍历选项 -->
          <el-option v-for="item in people" :key="item.id" :label="item.username" :value="item.username" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门介绍" prop="introduce">
        <el-input v-model="fromData.introduce" style="width:80%" placeholder="1-300个字符" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <!-- el-dialog有专门放置底部操作栏的 插槽  具名插槽 -->
    <el-row slot="footer" type="flex" justify="center">
      <!-- 列被分为24 -->
      <el-col :span="6">
        <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        <el-button size="small">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import { getDepartments } from '@/api/departments'
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
      const isRepeat = depts.filter(item => item.pid === this.treeNode.id).some(item => item.name === value)
      // 如果isRepeat为true 表示找到了一样的名字
      isRepeat ? callback(new Error(`同级部门下已经存在这个${value}部门`)) : callback()
    }
    const checkCodeRepeat = async(rule, value, callback) => {
      const { depts } = await getDepartments()
      // 要求编码和所有部门 都不能重复  由于历史数据有可能没有code 所有说这里加一个强制性条件
      const isRepeat = depts.some(item => item.code === value && value)
      isRepeat ? callback(new Error(`同级部门下已经存在这个${value}编码`)) : callback()
    }
    return {
      // 表单数据
      fromData: {
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
  methods: {
    async getEmployeeSimple() {
      const result = await getEmployeeSimple()
      this.people = result
    },
    btnOK() {
      // 手动校验表单
      this.$refs.deptForm.validate(isOK => {
        if (isOK) {
          // 表单校验通过
        }
      })
    }
  }

}
</script>

<style scoped>

</style>
