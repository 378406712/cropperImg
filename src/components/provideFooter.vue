<template>
  provideFOOTER --- {{ name }}
  <DeepChild/>
</template>

<script setup>
import {} from "vue"
import DeepChild from "./DeepChild.vue";

import { inject } from 'vue'
const name = inject('name','这是默认值12')
</script>

<style lang="scss" scoped></style>
