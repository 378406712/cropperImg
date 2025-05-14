import { ref, computed, nextTick } from 'vue'
import Cropper from 'cropperjs'

export function useCropper(pageData, pageIndex, radioValue, picPosition, cropperOption) {
  const cropper = ref<Cropper | null>(null)

  const getImagePath = computed(() => {
    return new URL(`../../assets/${pageIndex.value}.jpg`, import.meta.url).href
  })

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
      picPosition.value = defaultCropBoxData.map((item) => ({
        left: item.left * wRatio,
        top: item.top * hRatio,
        width: item.width * wRatio,
        height: item.height * hRatio,
        is_hidden: false
      }))
      picPosition.value[radioValue.value].is_hidden = true
      cropper.value?.setData(picPosition.value[0])
    }
  }

  const initImg = async () => {
    await nextTick()
    const cropperContainer = document?.querySelector('.cropper-container') as HTMLElement
    const cropperCanvas = document?.querySelector('.cropper-canvas') as HTMLElement
    const cropperCanvasImg = cropperCanvas?.querySelector('img') as HTMLElement
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

  const initCropper = (uploadImg) => {
    cropper.value = new Cropper(uploadImg, cropperOption.value)
  }

  const changePage = async (direction) => {
    if (direction === 'next' && pageIndex.value < 3) {
      pageIndex.value += 1
    } else if (direction === 'previous' && pageIndex.value > 1) {
      pageIndex.value -= 1
    } else {
      return
    }
    cropper.value?.enable()
    cropper.value?.replace(getImagePath.value, true)
    initDeFaultCropBoxData()
    cropper.value?.setCropBoxData(picPosition.value[radioValue.value])
    await nextTick()
    cropper.value?.disable()
  }

  return {
    cropper,
    getImagePath,
    initDeFaultCropBoxData,
    initImg,
    initCropper,
    changePage
  }
}
