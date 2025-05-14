<script setup lang="ts">
import { reactive } from 'vue'
const props = defineProps({
  isLock: { type: Boolean, default: false },
  radioValue: { type: Number, default: 0 },
  picPosition: { type: Object, default: () => [] }
})
const emits = defineEmits(['changeRadio', 'addCrop', 'deleteCrop', 'showDetail'])
const radioStyle = reactive({ display: 'flex', height: '30px', lineHeight: '30px' })
</script>

<template>
  <a-radio-group v-model:value="props.radioValue" @change="emits('changeRadio', $event)" :disabled="props.isLock">
    <div v-for="(item, index) in props.picPosition" :key="index" style="margin-bottom: 16px">
      <a-radio :style="radioStyle" :value="index">
        切图{{ index + 1 }} y: {{ item.left }}
        <a-button style="margin-left: 16px" @click="emits('showDetail', index)">Detail</a-button>
      </a-radio>
    </div>
  </a-radio-group>
  <div v-if="!props.isLock">
    <a-button style="margin-right: 16px" type="primary" @click.prevent="emits('addCrop')">addCrop</a-button>
    <a-button type="primary" v-if="props.picPosition.length" @click.prevent="emits('deleteCrop')">Delete</a-button>
  </div>
</template>

<style lang="scss" scoped></style>
