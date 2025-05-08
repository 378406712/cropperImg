<template>
     <!-- 这里就是要变成图片的容器 -->
<div id="pdfHtml" ref="printHtml" style="text-align: center">
    <div>123</div>
    <div>123</div>
    <div>123</div>
    <div>123</div>
    <div>123</div>
    <div>123</div>
    <img src="../assets/1.jpg" alt="">
</div> 
<button type="primary" @click="exportPDF">导出PDF</button>

</template>

<script>
import {getPdf} from '../utils/exportPdf'
export default {
  data() {
    return {
      color: 'yellow'
    }
  },
  methods: {
    exportPDF() {
   getPdf('测试','pdfHtml');
}
  }
}
</script>

<style>
.text {
  color: v-bind(color);
}
</style>
