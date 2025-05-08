<template>
  <provideFooter/>
</template>

<script setup>
import provideFooter from '../components/provideFooter.vue'
import { provide, ref } from 'vue'
const name = ref('父组件注入的 name')
// provide('name',null)
</script>

<style lang="scss" scoped></style>
