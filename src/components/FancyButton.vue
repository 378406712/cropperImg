<template>
  <button  class="fancy-btn" :style="color" @click="childEmit" >
    <slot name="header" headerCount = "headCount">头</slot><!-- slot outlet -->
	</button>
  <button  class="fancy-btn" :style="color" @click="childEmit" >
    <slot name="main" mainCount = "mainCount"></slot><!-- slot outlet -->
	</button>
  {{ props.textMsg }}
</template>
<script setup>
import { reactive, ref,defineEmits,defineProps } from 'vue';
const props = defineProps(['textMsg'])

const emit = defineEmits()
const color = reactive({
  color: 'red'
})
const age = 12
const childFn = () => {
  console.log('子组件方法被 父组件触发')
}
const childEmit = () => {
  emit('father-fn')
}
defineExpose({
  color,age,childFn,childEmit
})
</script>
<style>
.fancy-btn {
  color: #fff;
  background: linear-gradient(315deg, #42d392 25%, #647eff);
  border: none;
  padding: 5px 10px;
  margin: 5px;
  border-radius: 8px;
  cursor: pointer;
  width: 50px;
  height: 50px;
}
</style>