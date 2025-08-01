<template>
  <loading-overlay
    v-if="currentLoading"
    :visible="true"
    :type="currentLoading.type"
    :text="currentLoading.text"
    :sub-text="currentLoading.subText"
    :progress="currentLoading.progress"
    :steps="currentLoading.steps"
    :current-step="currentLoading.currentStep"
  />
</template>

<script>
import LoadingOverlay from '@/components/atoms/LoadingOverlay.vue'
import loadingManager from '@/utils/loading'

export default {
  name: 'GlobalLoading',
  components: {
    LoadingOverlay
  },
  data() {
    return {
      currentLoading: null
    }
  },
  mounted() {
    // 设置自己为全局 loading 组件
    loadingManager.setComponent(this)
  },
  beforeUnmount() {
    // 清理
    loadingManager.setComponent(null)
  },
  methods: {
    show(config) {
      this.currentLoading = config
    },
    
    hide() {
      this.currentLoading = null
    },
    
    updateProgress(progress, text) {
      if (this.currentLoading) {
        this.currentLoading.progress = progress
        if (text) {
          this.currentLoading.text = text
        }
      }
    },
    
    updateStep(currentStep, text) {
      if (this.currentLoading) {
        this.currentLoading.currentStep = currentStep
        if (text) {
          this.currentLoading.text = text
        }
      }
    }
  }
}
</script>