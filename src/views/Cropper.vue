<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { message } from 'ant-design-vue'

interface CropBoxData extends Cropper.CropBoxData {
  is_hidden: boolean
}
const cropper = ref<Cropper | null>(null)
const uploadImg = ref<HTMLImageElement>()
const isLock = ref(true)
const pageMode = ref<1 | 2 | 3>(1) // 1: 默认按当前容器 2: 适应容器高度缩放 3: 原图缩放
const radioStyle = reactive({ display: 'flex', height: '30px', lineHeight: '30px' })
const pageData = ref([
  {
    page: 1,
    data: [
      { left: 0, top: 0, width: 100, height: 100 },
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
const realPicData = ref()
const pageIndex = ref(1)

const detailInfo = ref({
  visible: false,
  data: { left: 0, top: 0, width: 0, height: 0, rotate: 0 },
  loading: false
})

const picPosition = ref<CropBoxData[]>([])
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
  cropend() {
    const cropData = { ...cropper.value?.getCropBoxData(), is_hidden: true }
    picPosition.value[radioValue.value] = { left: cropData.left || 0, top: cropData.top || 0, width: cropData.width || 0, height: cropData.height || 0, is_hidden: true }
  },
  ready() {
    initDeFaultCropBoxData()
    initImg()
    setTimeout(() => cropper.value && cropper.value.disable(), 0)
  }
})

const getImagePath = computed(() => {
  return new URL(`../assets/${pageIndex.value}.jpg`, import.meta.url).href
})
const getCropBoxData = () => {
  cropBoxData.value = JSON.stringify(cropper.value?.getCropBoxData())
}
const zoom = (percent) => {
  cropper?.value?.zoom(percent)
}
const init = () => {
  const ele = uploadImg.value as HTMLImageElement
  cropper.value = new Cropper(ele, cropperOption.value)
}
const defaultPosition = ref({
  left: 0,
  top: 0,
  width: 1265,
  height: 20,
  is_hidden: true
})
const add = () => {
  if (!picPosition.value.length) {
    cropper.value?.crop()
    cropper.value?.setCropBoxData(defaultPosition.value)
    picPosition.value.push(defaultPosition.value)
  } else {
    const lastData = picPosition.value[radioValue.value]
    setStaticBoxShow()
    cropper.value?.setCropBoxData({
      ...defaultPosition.value,
      top: lastData.top + lastData.height
    })
    picPosition.value[picPosition.value.length] = {
      ...defaultPosition.value,
      top: lastData.top + lastData.height
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
const changeRadio = () => {
  if (!cropper.value) return
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
const previous = () => {
  if (pageIndex.value > 1) {
    pageIndex.value -= 1
    cropper.value?.replace(getImagePath.value, true)
    initDeFaultCropBoxData()
    cropper.value && cropper?.value.setCropBoxData(picPosition.value[radioValue.value])
    radioValue.value = 0
  }
}
const next = () => {
  if (pageIndex.value > 2) return
  if (pageIndex.value >= 0) {
    pageIndex.value += 1
    cropper.value?.replace(getImagePath.value, true)
    initDeFaultCropBoxData()
    cropper.value && cropper?.value.setCropBoxData(picPosition.value[radioValue.value])
    radioValue.value = 0
  }
}
const calculateImgSize = () => {
  const cropperCanvas = document?.querySelector('.cropper-canvas') as HTMLElement
  const cropperCanvasImg = cropperCanvas?.querySelector('img') as HTMLElement
  const oriImg = document?.querySelector('#uploadImg') as HTMLImageElement
  const { width, height } = cropperCanvasImg?.getBoundingClientRect() || { width: 0, height: 0 }
  const wRatio = width / oriImg.naturalWidth
  const hRatio = height / oriImg.naturalHeight
  return { wRatio, hRatio }
}
const initDeFaultCropBoxData = () => {
  const { wRatio, hRatio } = calculateImgSize()
  const defaultCropBoxData = pageData.value.find((item) => item.page === pageIndex.value)?.data
  if (defaultCropBoxData) {
    picPosition.value = defaultCropBoxData.map((item) => ({ left: item.left * wRatio, top: item.top * hRatio, width: item.width * wRatio, height: item.height * hRatio, is_hidden: false }))
    picPosition.value[radioValue.value].is_hidden = true
    cropper.value?.setData(picPosition.value[0])
  }
}
const initImg = async () => {
  await nextTick()
  const cropperContainer = document?.querySelector('.cropper-container') as HTMLElement
  const cropperCanvas = document?.querySelector('.cropper-canvas') as HTMLElement
  const cropperCanvasImg = cropperCanvas?.querySelector('img') as HTMLImageElement
  const { width, height } = cropperCanvasImg?.getBoundingClientRect() || { width: 0, height: 0 }
  if (cropperContainer) {
    cropperContainer.style.width = `${width}px`
    cropperContainer.style.height = `${height}px`
  }
  if (cropperCanvas) {
    cropperCanvas.style.transform = `none`
  }

  cropper.value?.moveTo(0, 0)
}
const setPageMode = async (mode) => {
  pageMode.value = mode
  const { naturalWidth, naturalHeight } = document.querySelector('#uploadImg') as HTMLImageElement
  const dom = document.querySelector('.page-mode') as HTMLElement

  await nextTick()
  if (mode === 1) {
    dom.style.width = `auto`
    dom.style.height = `auto`
  } else if (mode === 2) {
    dom.style.width = `auto`
    dom.style.height = `${796}px`
  } else if (mode === 3) {
    dom.style.width = `${naturalWidth}px`
    dom.style.height = `${naturalHeight}px`
  }
  resizeImg()
}
const resizeImg = async () => {
  cropper.value?.destroy()
  await nextTick()
  init()
  initImg()
  cropper.value?.crop()
}
watch(
  () => isLock.value,
  () => initImg()
)
onMounted(() => {
  init()
  const pageObserver = new ResizeObserver(async () => {
    resizeImg()
  })
  pageObserver.observe(document.querySelector('.img-container') as HTMLElement)
})
</script>

<template>
  <div class="actions" style="text-align: center; margin-bottom: 32px">
    <a-button type="primary" style="margin-right: 16px" @click.prevent="toBlock">Block</a-button>
    <a-button type="primary" @click.prevent="unlock">Edit</a-button>
  </div>
  <a-row type="flex">
    <a-col :lg="4" :sm="24" class="actions left-area">
      <a-radio-group v-model:value="radioValue" @change="changeRadio" :disabled="isLock">
        <div v-for="(item, index) in picPosition" :key="index" style="margin-bottom: 16px">
          <a-radio :style="radioStyle" :value="index">
            切图{{ index + 1 }} y: {{ item.left }}
            <a-button style="margin-left: 16px" @click="showDetail(index)">Detail</a-button>
          </a-radio>
        </div>
      </a-radio-group>
      <div v-if="!isLock">
        <a-button style="margin-right: 16px" type="primary" @click.prevent="add">Add</a-button>
        <a-button type="primary" v-if="picPosition.length" @click.prevent="deleteCrop">Delete</a-button>
      </div>
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
          <a-button :disabled="isLock" @click.prevent="zoom(0.2)">Zoom In</a-button>
          <a-button :disabled="isLock" @click.prevent="zoom(-0.2)">Zoom Out</a-button>
          <a-button :disabled="isLock" @click.prevent="getData">Get Data</a-button>
          <a-button :disabled="isLock" type="primary" @click.prevent="getCropBoxData">Get CropBox Data</a-button>
          <div>
            <a-button :disabled="!isLock" style="margin-right: 16px" @click.prevent="previous">Previous Page</a-button>
            <a-button :disabled="!isLock" role="button" @click.prevent="next">Next Page</a-button>
          </div>
          <div>
            <a-button :type="pageMode === 1 ? 'primary' : null" :disabled="!isLock" @click="setPageMode(1)">Responsive Page</a-button>
            <a-button :type="pageMode === 2 ? 'primary' : null" :disabled="!isLock" @click="setPageMode(2)">Fit Page</a-button>
            <a-button :type="pageMode === 3 ? 'primary' : null" :disabled="!isLock" @click="setPageMode(3)">Original Page</a-button>
          </div>
          <div>
            cropBoxData:
            <a-textarea style="margin-bottom: 16px" v-model:value="cropBoxData"></a-textarea>
            RealPicData:
            <a-textarea v-model:value="realPicData"></a-textarea>
          </div>
          <div v-for="(item, index) in picPosition" :key="index" style="margin-bottom: 16px">
            CropBox:
            <div>left: {{ item.left }}</div>
            <div>top: {{ item.top }}</div>
            <div>width: {{ item.width }}</div>
            <div>height: {{ item.height }}</div>
            <div>is_hidden: {{ item.is_hidden ? '隱藏' : '显示' }}</div>
            <hr />
          </div>
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 5px 0;
}

.header h2 {
  margin: 0;
}

.header a {
  text-decoration: none;
  color: black;
}

.content {
  display: flex;
  justify-content: space-between;
}

.cropper-area {
  width: 614px;
}

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
