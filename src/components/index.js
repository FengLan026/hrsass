// 负责所有全局自定义组件的注册
import PageTools from './PageTools'
import UploadExcel from './UploadExcel'
import ImageUpload from './ImageUpload'
export default {
  install(Vue) {
    // 注册全局的通用栏组件对象
    Vue.component('PageTools', PageTools)
    Vue.component('UploadExcel', UploadExcel)
    Vue.component('ImageUpload', ImageUpload)
  }
}
