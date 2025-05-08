<template>
  <FancyButton :textMsg = "textMsg" @father-fn ="fatherFn" ref="FancyButtons" @click="clickFn">
    <template  #header="slotProps">
      {{ slotProps.headerCount }}
    </template>
    <template  #main="slotProps">
      {{ slotProps.mainCount }}
    </template>
  </FancyButton> 
</template>

<script setup>
import {ref} from "vue"
import FancyButton from "../components/FancyButton.vue";
const FancyButtons = ref()
const textMsg = ref(1)
const clickFn = () =>{
  console.log('父组件被点击')
  FancyButtons.value.childFn()
}
const fatherFn = () =>{
  console.log('子组件 触发 父组件方法')
  textMsg.value++
}
</script>

<style lang="scss" scoped></style>
