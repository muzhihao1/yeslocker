<template>
  <view class="network-error">
    <view class="error-content">
      <!-- Error Icon -->
      <view class="error-icon">
        <text class="icon-wifi">📡</text>
      </view>
      
      <!-- Error Message -->
      <text class="error-title">{{ title || '网络连接失败' }}</text>
      <text class="error-message">{{ message || '请检查您的网络设置' }}</text>
      
      <!-- Retry Button -->
      <button class="retry-btn" @click="handleRetry">
        <text class="retry-icon" v-if="retrying">🔄</text>
        <text>{{ retryText || '重试' }}</text>
      </button>
      
      <!-- Additional Actions -->
      <view class="error-actions" v-if="showSettings">
        <text class="action-link" @click="openSettings">打开网络设置</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'NetworkError',
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    retryText: {
      type: String,
      default: '重试'
    },
    showSettings: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      retrying: false
    }
  },
  methods: {
    async handleRetry() {
      if (this.retrying) return
      
      this.retrying = true
      
      // 动画效果
      setTimeout(() => {
        this.$emit('retry')
        this.retrying = false
      }, 500)
    },
    
    openSettings() {
      // 打开系统网络设置
      uni.openSystemSettings({
        success: () => {
          console.log('打开设置成功')
        },
        fail: (err) => {
          console.error('打开设置失败', err)
          uni.showToast({
            title: '无法打开设置',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.network-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  padding: 48rpx;
  
  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .error-icon {
      width: 120rpx;
      height: 120rpx;
      background-color: #f5f5f5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32rpx;
      
      .icon-wifi {
        font-size: 60rpx;
        opacity: 0.6;
      }
    }
    
    .error-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 16rpx;
    }
    
    .error-message {
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 48rpx;
      line-height: 40rpx;
    }
    
    .retry-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 200rpx;
      height: 80rpx;
      background-color: #1890ff;
      color: #ffffff;
      border-radius: 40rpx;
      font-size: 30rpx;
      border: none;
      
      .retry-icon {
        margin-right: 8rpx;
        display: inline-block;
        animation: rotate 1s linear infinite;
      }
    }
    
    .error-actions {
      margin-top: 24rpx;
      
      .action-link {
        font-size: 26rpx;
        color: #1890ff;
        text-decoration: underline;
      }
    }
  }
}
</style>