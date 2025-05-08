<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from "vue";
import Cropper from "cropperjs";
// 样式
import "cropperjs/dist/cropper.css";
import { message } from "ant-design-vue";

// 定义
const cropper = ref<Cropper | null>(null);
const uploadImg = ref<HTMLImageElement>();
const isLock = ref(true);
const radioStyle = reactive({
  display: "flex",
  height: "30px",
  lineHeight: "30px",
});
const radioValue = ref();
const detailInfo = ref<any>({
  visible: false,
  data: {
    x: null,
    y: null,
    width: null,
    height: null,
    rotate: null,
    scaleX: null,
    scaleY: null,
  },
  loading: false,
  rotate: null,
});
// 截图插件配置
const cropperOption = ref<Cropper.Options>({
  viewMode: 1, // 只能在裁剪的图片范围内移动
  cropBoxMovable: true, // 禁止裁剪区移动
  cropBoxResizable: true, // 禁止裁剪区缩放
  background: false, // 关闭默认背景
  zoomOnWheel: false, // 是否允许缩放图片
  guides: false, // 是否显示剪裁框虚线
  autoCrop: false,
  cropend() {
    const cropData = { ...cropper.value?.getCropBoxData(), is_hidden: true };
    picPosition.value[selectIndex.value] = cropData;
  },
  // ready() {
  //   // cropper.value?.crop();

  // },
});

interface CropperData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
  left?: number;
  top?: number;
}
const picPosition = ref<CropperData[] | any>([]);
const selectIndex = ref(0);

const setCropBoxData = () => {
  if (!picPosition.value) return;
  cropper.value?.setCropBoxData(picPosition.value[0]);
};
const zoom = (percent) => {
  cropper?.value?.zoom(percent);
};
const init = () => {
  const ele = uploadImg.value as HTMLImageElement;
  cropper.value = new Cropper(ele, cropperOption.value);
};
const defaultPosition = ref({
  left: 0,
  top: 0,
  width: 1265,
  height: 20,
  is_hidden: true,
});
const add = () => {
  if (!picPosition.value.length) {
    cropper.value?.crop();
    cropper.value?.setCropBoxData(defaultPosition.value);
    picPosition.value.push(defaultPosition.value);
  } else {
    const lastData = picPosition.value[selectIndex.value];
    setStaticBoxShow();
    console.log(lastData);
    selectIndex.value += 1;
    cropper.value?.setCropBoxData({
      left: 0,
      top: lastData.top + lastData.height,
      width: 1265,
      height: 20,
      is_hidden: true,
    });
    picPosition.value[picPosition.value.length] = {
      left: 0,
      top: lastData.top + lastData.height,
      width: 1265,
      height: 20,
      is_hidden: true,
    };
  }
  radioValue.value = picPosition.value.length - 1;
};
const deleteCrop = async () => {};
const showDetail = (index) => {
  selectIndex.value = index;
  radioValue.value = index;
  detailInfo.value.visible = true;
  detailInfo.value.data = picPosition.value[index];
};
const handleOk = () => {
  detailInfo.value.visible = false;
  cropper.value?.setData(detailInfo.value.data);
};
const toBlock = () => {
  if (!cropper.value) return;
  message.warn("已锁定");
  isLock.value = true;
  cropper.value.disable();
};
const unlock = () => {
  isLock.value = false;
  if (!cropper.value) return;
  cropper.value.enable();
};
const changeRadio = () => {
  if (!cropper.value) return;
  picPosition.value[selectIndex.value] = cropper.value?.getCropBoxData();
  selectIndex.value = radioValue.value;
  setStaticBoxShow();
  picPosition.value[selectIndex.value].is_hidden = true;
  const cropBoxData = picPosition.value[selectIndex.value];
  cropper.value.setCropBoxData(cropBoxData);
};
const setStaticBoxShow = () => {
  picPosition.value.map((item) => {
    item.is_hidden = false;
  });
};
const setData = () => {};
onMounted(() => init());
</script>

<template>
  {{ picPosition }}
  <div class="actions" style="text-align: center; margin-bottom: 32px">
    <a-button type="primary" style="margin-right: 16px" @click.prevent="toBlock">
      Block
    </a-button>
    <a-button type="primary" @click.prevent="unlock"> Edit </a-button>
  </div>
  <div class="flex">
    <div class="actions left-area">
      <a-radio-group v-model:value="radioValue" @change="changeRadio">
        <div
          v-for="(item, index) in picPosition"
          :key="index"
          style="margin-bottom: 16px"
        >
          <a-radio :style="radioStyle" :value="index">
            切图{{ index + 1 }} y: {{ item.left }}
            <a-button style="margin-left: 16px" @click="showDetail(index)"
              >Detail</a-button
            >
          </a-radio>
        </div>
      </a-radio-group>
      <div v-if="!isLock">
        <a-button style="margin-right: 16px" type="primary" @click.prevent="add">
          Add
        </a-button>
        <a-button type="primary" v-if="picPosition.length" @click.prevent="deleteCrop">
          Delete
        </a-button>
      </div>
    </div>
    <div class="right-area">
      <div class="img-container">
        <img
          ref="uploadImg"
          id="uploadImg"
          src="../assets/3.jpg"
          alt="Picture"
          style="width: 100%; height: 100%"
        />
        <template v-for="(item, index) in picPosition" :key="index">
          <div
            v-if="!item.is_hidden"
            class="static-box"
            :style="{
              width: `${item.width}px`,
              height: `${item.height}px`,
              left: `${item.left}px`,
              top: `${item.top}px`,
            }"
          ></div>
        </template>
      </div>
      <div class="actions">
        <a href="#" role="button" @click.prevent="zoom(0.2)"> Zoom In </a>
        <a href="#" role="button" @click.prevent="zoom(-0.2)"> Zoom Out </a>
        <a href="#" role="button" @click.prevent="setData"> Set Data </a>
        <a href="#" role="button" @click.prevent="setCropBoxData"> Set CropBox Data </a>
        <a-textarea></a-textarea>
        <div
          v-for="(item, index) in picPosition"
          :key="index"
          style="margin-bottom: 16px"
        >
          <div>left: {{ item.left }}</div>
          <div>top: {{ item.top }}</div>
          <div>width: {{ item.width }}</div>
          <div>height: {{ item.height }}</div>
          <div>is_hidden: {{ item.is_hidden ? "隱藏" : "显示" }}</div>
          <hr />
        </div>
      </div>
    </div>
  </div>
  <a-modal v-model:open="detailInfo.visible" title="Detail" @ok="handleOk">
    <a-form :label-col="{ style: { width: '100px' } }">
      <a-row>
        <a-col :span="12">
          <a-form-item label="x">
            <a-input-number v-model:value="detailInfo.data.left" /> </a-form-item
        ></a-col>
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
  </a-modal>
</template>

<style scoped>
.flex {
  display: flex;
  width: 100%;
}

.left-area {
  width: 25%;
}

.right-area {
  width: 75%;
  display: flex;
  position: relative;
}

.img-container {
  width: 800px;
  height: auto;
  overflow: hidden;
  margin-right: 20px;
  width: 75%;
  position: relative;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
}

input[type="file"] {
  display: none;
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

.actions a {
  display: inline-block;
  padding: 5px 15px;
  background: #0062cc;
  color: white;
  text-decoration: none;
  border-radius: 3px;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

textarea {
  width: 100%;
  height: 100px;
}

.preview-area {
  width: 307px;
}

.preview-area p {
  font-size: 1.25rem;
  margin: 0;
  margin-bottom: 1rem;
}

.preview-area p:last-of-type {
  margin-top: 1rem;
}

.preview {
  width: 100%;
  height: calc(372px * (9 / 16));
  overflow: hidden;
}

.crop-placeholder {
  width: 100%;
  height: 200px;
  background: #ccc;
}

.cropped-image img {
  max-width: 100%;
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

:deep(.cropper-crop-box) {
  z-index: 1;
  opacity: 0.7;
}

:deep(.cropper-face) {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
