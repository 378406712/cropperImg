<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { message } from 'ant-design-vue'
import { useCropper } from './components/useCropper'
import LeftPanel from './components/LeftPanel.vue'
import RightPanel from './components/RightPanel.vue'

interface CropBoxData extends Cropper.CropBoxData {
  is_hidden: boolean
}
interface Data {
  x: number
  y: number
  width: number
  height: number
  rotate: number
  scaleX: number
  scaleY: number
}
const uploadImg = ref<HTMLImageElement>()
const defaultContainerHeight = 796
const isLock = ref(true)
const pageMode = ref<1 | 2 | 3>(1) // 1: 默认按当前容器 2: 适应容器高度缩放 3: 原图缩放
const pageData = ref([
  {
    page: 1,
    data: [
      { left: 300, top: 300, width: 100, height: 100 },
      { left: 100, top: 100, width: 100, height: 100 },
      { left: 200, top: 200, width: 100, height: 100 }
    ]
  },
  {
    page: 2,
    data: [
      { left: 100, top: 100, width: 100, height: 100 },
      { left: 100, top: 200, width: 200, height: 100 },
      { left: 100, top: 300, width: 300, height: 300 }
    ]
  },
  {
    page: 3,
    data: [
      { left: 500, top: 510, width: 100, height: 100 },
      { left: 200, top: 15, width: 232, height: 129 },
      { left: 32, top: 52, width: 123, height: 232 }
    ]
  }
])
const radioValue = ref(0)
const cropBoxData = ref()
// 原图位置(传递后端)
const realPicData = ref()
const pageIndex = ref(1)
const detailInfo = ref({ visible: false, data: { left: 0, top: 0, width: 0, height: 0, rotate: 0 }, loading: false })
// 当前图片位置
// const picPosition = ref<CropBoxData[]>([])
// 截图插件配置
const cropperOption = ref<Cropper.Options>({
  viewMode: 1, // 只能在裁剪的图片范围内移动
  responsive: true, // 启用响应式支持
  cropBoxMovable: true, // 禁止裁剪区移动
  cropBoxResizable: true, // 禁止裁剪区缩放
  background: false, // 关闭默认背景
  zoomOnWheel: false, // 是否允许缩放图片
  guides: false, // 是否显示剪裁框虚线
  autoCrop: false,
  async cropend() {
    await nextTick()
    const cropData = { ...cropper.value?.getCropBoxData(), is_hidden: true }
    const { x: left, y: top, width, height } = cropper.value?.getData() as Data
    picPosition.value[radioValue.value] = { left: cropData.left || 0, top: cropData.top || 0, width: cropData.width || 0, height: cropData.height || 0, is_hidden: true }
    pageData.value.map((item) => {
      if (item.page === pageIndex.value) {
        item.data[radioValue.value] = { left, top, width, height }
      }
    })
  },
  ready() {
    initDeFaultCropBoxData()
    initImg()
    setTimeout(() => cropper.value && cropper.value.disable(), 0)
  }
})
const getCropBoxData = () => {
  cropBoxData.value = JSON.stringify(cropper.value?.getCropBoxData())
}
const zoom = (percent) => {
  cropper?.value?.zoom(percent)
  initDeFaultCropBoxData(percent)
}
const defaultPosition = ref({
  left: 0,
  top: 0,
  width: 999999,
  height: 20,
  is_hidden: true
})
const addCrop = () => {
  if (!picPosition.value.length) {
    cropper.value?.crop()
    cropper.value?.setCropBoxData(defaultPosition.value)
    picPosition.value.push(defaultPosition.value)
  } else {
    const lastData = picPosition.value[radioValue.value]
    setStaticBoxShow()
    cropper.value?.setCropBoxData({ ...defaultPosition.value, top: lastData.top + lastData.height })
    picPosition.value[picPosition.value.length] = {
      left: cropper.value?.getCropBoxData()?.left || 0,
      top: lastData.top + lastData.height,
      width: cropper.value?.getCropBoxData()?.width || 0,
      height: cropper.value?.getCropBoxData()?.height || 0,
      is_hidden: true
    }
  }
  radioValue.value = picPosition.value.length - 1
}
const deleteCrop = async () => {
  const index = radioValue.value
  const flag = index === picPosition.value.length - 1 // 是否是最后一个
  picPosition.value.splice(index, 1)
  setStaticBoxShow()
  if (flag) {
    if (radioValue.value > 0) {
      radioValue.value = picPosition.value.length - 1
      picPosition.value[picPosition.value.length - 1].is_hidden = true
      cropper.value?.setCropBoxData(picPosition.value[picPosition.value.length - 1])
    } else {
      cropper.value?.clear()
    }
  } else {
    picPosition.value[radioValue.value].is_hidden = true
    cropper.value?.setCropBoxData(picPosition.value[radioValue.value])
  }
}
const showDetail = (index) => {
  radioValue.value = index
  detailInfo.value = {
    visible: true,
    loading: false,
    data: { ...picPosition.value[index], rotate: 0 }
  }
  setStaticBoxShow()
  picPosition.value[radioValue.value].is_hidden = true
  const cropBoxData = picPosition.value[radioValue.value]
  cropper.value && cropper.value.setCropBoxData(cropBoxData)
}
const handleOk = () => {
  detailInfo.value.visible = false
  setStaticBoxShow()
  picPosition.value[radioValue.value] = { ...detailInfo.value.data, is_hidden: true }
  cropper.value && cropper.value.setCropBoxData(detailInfo.value.data)
}
const toBlock = () => {
  if (!cropper.value) return
  message.warn('已锁定')
  isLock.value = true
  setStaticBoxShow()
  picPosition.value[radioValue.value].is_hidden = true
  cropper.value.clear()
  cropper.value.disable()
}
const unlock = async () => {
  isLock.value = false
  if (!cropper.value) return
  cropper.value.enable()
  if (picPosition.value.length) {
    setStaticBoxShow()
    cropper.value.crop()
    picPosition.value[radioValue.value].is_hidden = true
    cropper.value.setCropBoxData(picPosition.value[radioValue.value])
  } else {
    cropper.value.clear()
  }
}
const changeRadio = (e) => {
  if (!cropper.value) return
  radioValue.value = e.target.value
  setStaticBoxShow()
  picPosition.value[radioValue.value].is_hidden = true
  const cropBoxData = picPosition.value[radioValue.value]
  cropper.value.setCropBoxData(cropBoxData)
}
const setStaticBoxShow = () => {
  picPosition.value.map((item) => {
    item.is_hidden = false
  })
}
const getData = () => {
  const data = cropper.value && cropper.value.getData(true)
  realPicData.value = JSON.stringify(data)
}
const setPageMode = async (mode) => {
  pageMode.value = mode
  const { naturalWidth, naturalHeight } = document.querySelector('#uploadImg') as HTMLImageElement
  const pageModeContainer = document.querySelector('.page-mode') as HTMLElement
  await nextTick()
  if (mode === 1) {
    pageModeContainer.style.width = `auto`
    pageModeContainer.style.height = `auto`
  } else if (mode === 2) {
    // Fit mode暂定 固定width
    pageModeContainer.style.width = `500px`
    pageModeContainer.style.height = `100%`
  } else if (mode === 3) {
    pageModeContainer.style.width = `${naturalWidth}px`
    pageModeContainer.style.height = `${naturalHeight}px`
  }
  resizeImg()
}
const resizeImg = async () => {
  if (isLock.value) cropper.value?.clear() // 锁定状态下
  // initCropper(uploadImg.value)
  initImg()
  cropper.value?.crop()
}
const { cropper, picPosition, getImagePath, initDeFaultCropBoxData, initImg, initCropper, changePage } = useCropper(pageMode, pageData, pageIndex, radioValue, cropperOption)

watch(
  () => isLock.value,
  () => initImg()
)
onMounted(() => {
  initCropper(uploadImg.value)

  const pageObserver = new ResizeObserver(async () => {
    resizeImg()
    if (!isLock.value) {
      initDeFaultCropBoxData()
    }
  })
  pageObserver.observe(document.querySelector('.img-container') as HTMLElement)
})
</script>

<template>
  radioValue: {{ radioValue }}
  <div class="actions" style="text-align: center; margin-bottom: 32px">
    <a-button type="primary" style="margin-right: 16px" @click.prevent="toBlock">Block</a-button>
    <a-button type="primary" @click.prevent="unlock">Edit</a-button>
  </div>
  <a-row type="flex">
    <a-col :lg="4" :sm="24" class="actions left-area">
      {{ radioValue }}
      <LeftPanel :isLock="isLock" :picPosition="picPosition" :radioValue="radioValue" @changeRadio="changeRadio" @addCrop="addCrop" @deleteCrop="deleteCrop" @showDetail="showDetail" />
    </a-col>
    <a-col :lg="20" :sm="24">
      <a-row :gutter="16">
        <a-col :lg="18" :sm="24" class="img-container">
          <div class="scroll-container">
            <div class="page-mode">
              <img ref="uploadImg" id="uploadImg" :src="getImagePath" alt="Picture" style="width: 100%; height: 100%" />
              <template v-for="(item, index) in picPosition" :key="index">
                <div v-if="!item.is_hidden" class="static-box" :style="{ width: `${item.width}px`, height: `${item.height}px`, left: `${item.left}px`, top: `${item.top}px` }"></div>
                <div
                  v-if="item.is_hidden && isLock"
                  class="static-box preview-box"
                  :style="{ width: `${item.width}px`, height: `${item.height}px`, left: `${item.left}px`, top: `${item.top}px` }"></div>
              </template>
            </div>
          </div>
        </a-col>
        <a-col :lg="6" :sm="24" class="actions" style="height: 800px; overflow-y: scroll">
          <RightPanel
            :isLock="isLock"
            :picPosition="picPosition"
            :pageMode="pageMode"
            :cropBoxData="cropBoxData"
            :realPicData="realPicData"
            @zoom="zoom"
            @getData="getData"
            @changePage="changePage"
            @setPageMode="setPageMode"
            @getCropBoxData="getCropBoxData" />
        </a-col>
      </a-row>
    </a-col>
  </a-row>
  <a-modal v-model:open="detailInfo.visible" title="Detail" @ok="handleOk">
    <a-form :label-col="{ style: { width: '100px' } }">
      <a-row>
        <a-col :span="12">
          <a-form-item label="x">
            <a-input-number v-model:value="detailInfo.data.left" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="y">
            <a-input-number v-model:value="detailInfo.data.top" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="width">
            <a-input-number v-model:value="detailInfo.data.width" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="height">
            <a-input-number v-model:value="detailInfo.data.height" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="rotate">
            <a-input-number v-model:value="detailInfo.data.rotate" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <template #footer>
      <a-button @click="detailInfo.visible = false">Cancel</a-button>
      <a-button v-if="!isLock" type="primary" @click="handleOk">OK</a-button>
    </template>
  </a-modal>
</template>

<style scoped>
.flex {
  display: flex;
  width: 100%;
}

.img-container {
  position: relative;
  background-color: rgba(127, 118, 118, 0.342);
  padding: 8px;
}
.scroll-container {
  height: 796px;
  overflow-y: auto;
}
.fit-page {
  height: 796px !important;
}

.data-detail {
  display: flex;
}
.static-box {
  position: absolute;
  border-style: double;
  border-color: red;
  background: rgba(255, 0, 0, 0.2);
  z-index: 0;
}
.preview-box {
  border-color: blue;
  background: rgba(3, 21, 158, 0.2);
}
:deep(.cropper-crop-box) {
  z-index: 1;
  opacity: 0.7;
}
:deep(.cropper-face) {
  background-color: rgba(255, 255, 255, 0.2);
}
:deep(.cropper-modal) {
  background-color: rgba(0, 0, 0, 0.6);
}
:deep(.cropper-canvas) {
  transform: none !important;
}
</style>
