<template>
  <el-upload
    list-type="picture-card"
    action="#"
    :limit="1"
    :on-preview="preview"
    :on-remove="handleRemove"
    :on-change="changeFile"
    :before-upload="beforeUpload"
    :file-list="fileList"
    :http-request="upload"
    :class="{disabled: fileComputed }"
  >
    <i class="el-icon-plus" />
    <!-- 进度条 -->
    <el-progress v-if="showPercent" style="width: 180px" :percentage="percent" />
    <!-- 放置一个弹层 -->
    <!-- sync修饰符自动将弹层关闭了 -->
    <el-dialog title="图片预览" :visible.sync="showDialog">
      <img :src="imgUrl" style="width:100%" alt="">
    </el-dialog>
  </el-upload>
</template>

<script>
import COS from 'cos-js-sdk-v5'
const cos = new COS({
  SecretId: '', // 身份识别ID
  SecretKey: '' // 身份密匙
})
export default {
  data() {
    return {
      fileList: [], // 图片地址设置为数组
      showDialog: false, // 控制显示弹层
      imgUrl: '',
      currentFileUid: null, // 记录当前正在上传的uid
      percent: 0,
      showPercent: false // 默认不显示进度条
    }
  },
  computed: {
    // 设定一个计算属性 判断是否已经上传完了一张
    fileComputed() {
      return this.fileList.length === 1
    }
  },
  methods: {
    // 点击预览事件
    preview(file) {
      // 这里应该弹出一个层 层里是点击的图片地址
      this.imgUrl = file.url
      this.showDialog = true
    },
    handleRemove(file) {
      // file是点击删除的文件
      // 将原来的文件给排除掉了 剩下的就是最新的数组了
      this.fileList = this.fileList.filter(item => item.uid !== file.uid)
    },

    // 修改文件时触发
    // 不能每次都去push   该方法会进来很多遍
    // 上传成功之后 还会进来 需要实现上传代码的逻辑 这里才会成功
    changeFile(file, fileList) {
      this.fileList = fileList.map(item => item)
      // 这里暂不成功  因为现在还没有上传 所以第二次进来的数据一定是空的
      // 如果完成上传动作  第一次进入和第二次进入的fileList长度应该都是1 应该都有数据
      // 上传成功 => 数据才能进来
    },

    // 文件上传前的检查  返回false 或者 返回Promise且被reject  就会停止上传
    beforeUpload(file) {
      // 文件类型
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!types.includes(file.type)) {
        // 如果不存在
        this.$message.error('上传图片只能是 JPG、GIF、BMP、PNG 格式!')
        return false
      }
      //  检查大小
      const maxSize = 5 * 1024 * 1024
      if (maxSize < file.size) {
        this.$message.error('图片大小最大不能超过5M')
        return false
      }
      this.currentFileUid = file.uid
      this.showPercent = true
      return true
    },

    // 进行上传操作
    upload(params) {
      // 如果存在
      if (params.file) {
        // 执行上传操作
        cos.putObject({
          Bucket: 'shuiruohanyu-106-1302806742', // 存储桶
          Region: 'ap-beijing', // 地域
          Key: params.file.name, // 文件名
          Body: params.file, // 要上传的文件对象
          StorageClass: 'STANDARD', // 上传的模式类型 直接默认 标准模式即可
          // 进度条
          onProgress: (params) => {
            this.percent = params.percent * 100
            // 上传到腾讯云 =》 哪个存储桶 哪个地域的存储桶 文件  格式  名称 回调
          }
        }, function(err, data) {
          // data返回数据之后 应该如何处理
          console.log(err || data)
          if (!err && data.statusCode === 200) {
            // 此时上传成功
            // 需要知道当前上传成功的是哪一张图片
            this.fileList = this.fileList.map(item => {
              // 去找谁的uid等于刚刚记录下来的id
              if (item.uid === this.currentFileUid) {
                // 将成功的地址赋值给原来的url属性
                return { url: 'http://' + data.Location, upload: true }
                // upload为true 表示这张图片已经上传完毕  做标记
                // 保存 => 图片有大小 => 上传速度不同 => 要根据有没有upload这个标记来决定是否去保存
              }
              return item
            })
            setTimeout(() => {
              this.showPercent = false // 隐藏进度条
              this.percent = 0 // 进度归0
            }, 2000)

            // 将上传成功的地址回写到fileList上  fileList变化 => upload组件 就会根据fileList的变化去渲染页面
          }
        })
      }
    }
  }
}
</script>

<style>
.disabled .el-upload--picture-card {
  display: none
}
</style>
