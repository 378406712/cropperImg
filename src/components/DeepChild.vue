<template>
  <div class="">
    deepchild --- {{ name }}
  </div>
</template>

<script setup>
import {} from "vue"

import { inject } from 'vue'
const name = inject('name','这是默认值1')
console.log(name)
</script>

<style lang="scss" scoped></style>
