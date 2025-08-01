<template>
  <view v-if="visible" class="toast-container" :class="['toast-' + position]">
    <view 
      class="toast-content" 
      :class="['toast-' + type, { 'with-icon': showIcon }]"
      :style="{ backgroundColor: customColor }"
    >
      <!-- Icon -->
      <view v-if="showIcon" class="toast-icon">
        <text v-if="type === 'success'" class="icon-success">✓</text>
        <text v-else-if="type === 'error'" class="icon-error">✕</text>
        <text v-else-if="type === 'warning'" class="icon-warning">!</text>
        <text v-else-if="type === 'info'" class="icon-info">i</text>
      </view>
      
      <!-- Message -->
      <view class="toast-message">
        <text class="toast-title" v-if="title">{{ title }}</text>
        <text class="toast-text">{{ message }}</text>
      </view>
      
      <!-- Action Button -->
      <view v-if="showAction" class="toast-action" @click="handleAction">
        <text class="action-text">{{ actionText }}</text>
      </view>
      
      <!-- Close Button -->
      <view v-if="showClose" class="toast-close" @click="handleClose">
        <text class="close-icon">✕</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'default', // success, error, warning, info, default
      validator: value => ['success', 'error', 'warning', 'info', 'default'].includes(value)
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    position: {
      type: String,
      default: 'top', // top, center, bottom
      validator: value => ['top', 'center', 'bottom'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: false
    },
    showAction: {
      type: Boolean,
      default: false
    },
    actionText: {
      type: String,
      default: '查看'
    },
    customColor: {
      type: String,
      default: ''
    }
  },
  watch: {
    visible(val) {
      if (val && this.duration > 0) {
        this.startTimer()
      }
    }
  },
  methods: {
    startTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.$emit('close')
      }, this.duration)
    },
    handleClose() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.$emit('close')
    },
    handleAction() {
      this.$emit('action')
      this.handleClose()
    }
  },
  beforeUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 9998;
  pointer-events: none;
  display: flex;
  justify-content: center;
  padding: 0 32rpx;
  
  &.toast-top {
    top: 120rpx;
  }
  
  &.toast-center {
    top: 50%;
    transform: translateY(-50%);
  }
  
  &.toast-bottom {
    bottom: 120rpx;
  }
  
  .toast-content {
    background-color: rgba(0, 0, 0, 0.85);
    border-radius: 12rpx;
    padding: 24rpx 32rpx;
    max-width: 600rpx;
    min-width: 200rpx;
    display: flex;
    align-items: center;
    pointer-events: all;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
    
    &.with-icon {
      padding-left: 24rpx;
    }
    
    // Type Styles
    &.toast-success {
      background-color: #52c41a;
    }
    
    &.toast-error {
      background-color: #ff4d4f;
    }
    
    &.toast-warning {
      background-color: #faad14;
    }
    
    &.toast-info {
      background-color: #1890ff;
    }
    
    &.toast-default {
      background-color: rgba(0, 0, 0, 0.85);
    }
    
    // Icon
    .toast-icon {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;
      flex-shrink: 0;
      
      text {
        color: #ffffff;
        font-size: 24rpx;
        font-weight: bold;
      }
    }
    
    // Message
    .toast-message {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .toast-title {
        font-size: 30rpx;
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 4rpx;
      }
      
      .toast-text {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.9);
        line-height: 40rpx;
      }
    }
    
    // Action Button
    .toast-action {
      margin-left: 24rpx;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      background-color: rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
      
      .action-text {
        font-size: 26rpx;
        color: #ffffff;
      }
    }
    
    // Close Button
    .toast-close {
      margin-left: 16rpx;
      width: 32rpx;
      height: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .close-icon {
        color: rgba(255, 255, 255, 0.7);
        font-size: 24rpx;
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>