<template>
  <view class="global-toast-container">
    <toast
      v-for="toast in toasts"
      :key="toast.id"
      :visible="true"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :position="toast.position"
      :duration="0"
      :show-icon="toast.showIcon"
      :show-close="toast.showClose"
      :show-action="toast.showAction"
      :action-text="toast.actionText"
      :custom-color="toast.customColor"
      @close="removeToast(toast.id)"
      @action="handleAction(toast)"
    />
  </view>
</template>

<script>
import Toast from '@/components/atoms/Toast.vue'
import toastManager from '@/utils/toast'

export default {
  name: 'GlobalToast',
  components: {
    Toast
  },
  data() {
    return {
      toasts: []
    }
  },
  mounted() {
    // 设置自己为全局 toast 组件
    toastManager.setComponent(this)
  },
  beforeUnmount() {
    // 清理
    toastManager.setComponent(null)
  },
  methods: {
    show(config) {
      // 添加到队列
      this.toasts.push(config)
      
      // 如果有持续时间，自动移除
      if (config.duration > 0) {
        setTimeout(() => {
          this.removeToast(config.id)
        }, config.duration)
      }
    },
    
    hide() {
      // 移除最后一个
      if (this.toasts.length > 0) {
        this.toasts.pop()
      }
    },
    
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    },
    
    handleAction(toast) {
      if (toast.onAction) {
        toast.onAction()
      }
      this.removeToast(toast.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.global-toast-container {
  pointer-events: none;
}
</style>