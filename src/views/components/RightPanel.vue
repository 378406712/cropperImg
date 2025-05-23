<script setup lang="ts">
// filepath: c:\Users\liuzhiwei2\Desktop\vue3-demo\src\views\components\RightPanel.vue
const props = defineProps({
  isLock: {
    type: Boolean,
    default: false
  },
  picPosition: {
    type: Object,
    default: () => []
  },
  pageMode: {
    type: Number,
    default: 0
  },
  cropBoxData: {
    type: Object
  },
  realPicData: {
    type: Object
  }
})
const emits = defineEmits(['zoom', 'getData', 'changePage', 'getCropBoxData', 'setPageMode'])
</script>

<template>
  <!-- <a-button :disabled="props.isLock" @click.prevent="emits('zoom', 0.2)">Zoom In</a-button>
  <a-button :disabled="props.isLock" @click.prevent="emits('zoom', -0.2)">Zoom Out</a-button> -->
  <a-button :disabled="props.isLock" @click.prevent="emits('getData')">Get Data</a-button>
  <a-button :disabled="props.isLock" type="primary" @click.prevent="emits('getCropBoxData')">Get CropBox Data</a-button>
  <div>
    <a-button :disabled="!isLock" style="margin-right: 16px" @click.prevent="emits('changePage', 'previous')">Previous Page</a-button>
    <a-button :disabled="!isLock" role="button" @click.prevent="emits('changePage', 'next')">Next Page</a-button>
  </div>
  <div>
    <a-button :type="props.pageMode === 1 ? 'primary' : null" :disabled="!isLock" @click="emits('setPageMode', 1)">Responsive Page</a-button>
    <a-button :type="props.pageMode === 2 ? 'primary' : null" :disabled="!isLock" @click="emits('setPageMode', 2)">Fit Page</a-button>
    <a-button :type="props.pageMode === 3 ? 'primary' : null" :disabled="!isLock" @click="emits('setPageMode', 3)">Original Page</a-button>
  </div>
  <div>
    cropBoxData:
    <a-textarea v-model:value="props.cropBoxData"></a-textarea>
    RealPicData:
    <a-textarea v-model:value="props.realPicData"></a-textarea>
  </div>
  <div v-for="(item, index) in props.picPosition" :key="index" style="margin-bottom: 16px">
    CropBox:
    <div>left: {{ item.left }}</div>
    <div>top: {{ item.top }}</div>
    <div>width: {{ item.width }}</div>
    <div>height: {{ item.height }}</div>
    <div>is_hidden: {{ item.is_hidden ? '隱藏' : '显示' }}</div>
    <hr />
  </div>
</template>
<style scoped>
.actions {
  margin-top: 1rem;
}

.actions button {
  display: inline-block;
  padding: 5px 15px;
  text-decoration: none;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

textarea {
  width: 100%;
  height: 100px;
}
</style>
