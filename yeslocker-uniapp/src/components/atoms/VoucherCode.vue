<template>
  <view class="voucher-code" :class="'voucher-code--' + status">
    <view class="voucher-code__header">
      <text class="header-title">{{ title }}</text>
      <view class="header-status" :class="'header-status--' + status">
        {{ statusText }}
      </view>
    </view>
    
    <view class="voucher-code__qr" @click="handleQrClick">
      <!-- QR Code placeholder - will be replaced with actual QR code component -->
      <view class="qr-placeholder">
        <image 
          v-if="qrCodeUrl" 
          :src="qrCodeUrl" 
          mode="aspectFit"
          @error="handleQrError"
        />
        <view v-else class="qr-generator">
          <text class="qr-text">{{ code }}</text>
        </view>
      </view>
      <text class="qr-hint">点击放大二维码</text>
    </view>
    
    <view class="voucher-code__info">
      <view class="info-item">
        <text class="info-label">凭证码：</text>
        <text class="info-value code-value" @click="handleCopyCode">{{ formatCode(code) }}</text>
        <text class="copy-icon" @click="handleCopyCode">📋</text>
      </view>
      
      <view class="info-item" v-if="lockerNumber">
        <text class="info-label">柜号：</text>
        <text class="info-value">{{ lockerNumber }}</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">创建时间：</text>
        <text class="info-value">{{ formatDateTime(createTime) }}</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">有效期至：</text>
        <text class="info-value" :class="{ 'expired': isExpired }">
          {{ formatDateTime(expiryTime) }}
        </text>
      </view>
      
      <view v-if="isExpired" class="info-item expired-warning">
        <text class="warning-icon">⚠️</text>
        <text class="warning-text">凭证已过期</text>
      </view>
    </view>
    
    <view v-if="showActions" class="voucher-code__actions">
      <button 
        class="action-btn action-btn--primary" 
        @click="handleUseVoucher"
        :disabled="!canUse"
      >
        {{ useButtonText }}
      </button>
      <button 
        v-if="canShare" 
        class="action-btn action-btn--secondary" 
        @click="handleShare"
      >
        分享凭证
      </button>
    </view>
  </view>
</template>

<script>
import { previewQRCode } from '@/utils/qrcode'

export default {
  name: 'VoucherCode',
  props: {
    code: {
      type: String,
      required: true
    },
    qrCodeUrl: {
      type: String,
      default: ''
    },
    lockerNumber: {
      type: String,
      default: ''
    },
    createTime: {
      type: [String, Number],
      required: true
    },
    expiryTime: {
      type: [String, Number],
      required: true
    },
    status: {
      type: String,
      default: 'active',
      validator: (value) => ['active', 'used', 'expired'].includes(value)
    },
    title: {
      type: String,
      default: '存储凭证'
    },
    showActions: {
      type: Boolean,
      default: true
    },
    canShare: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        active: '有效',
        used: '已使用',
        expired: '已过期'
      }
      return statusMap[this.status] || '未知'
    },
    isExpired() {
      return new Date(this.expiryTime) < new Date() || this.status === 'expired'
    },
    canUse() {
      return this.status === 'active' && !this.isExpired
    },
    useButtonText() {
      if (this.status === 'used') return '已使用'
      if (this.isExpired) return '已过期'
      return '使用凭证'
    }
  },
  methods: {
    formatCode(code) {
      if (!code || code.length <= 8) return code
      // Format as XXXX-XXXX-XXXX
      return code.match(/.{1,4}/g).join('-')
    },
    formatDateTime(timestamp) {
      if (!timestamp) return '未知'
      
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    handleQrClick() {
      // 如果有二维码图片，预览它
      if (this.qrCodeUrl) {
        previewQRCode(this.qrCodeUrl)
      }
      
      // 同时触发事件，允许父组件处理
      this.$emit('qr-click', {
        code: this.code,
        qrCodeUrl: this.qrCodeUrl
      })
    },
    handleQrError() {
      console.error('QR code image failed to load')
    },
    handleCopyCode() {
      uni.setClipboardData({
        data: this.code,
        success: () => {
          uni.showToast({
            title: '凭证码已复制',
            icon: 'success',
            duration: 1500
          })
        }
      })
    },
    handleUseVoucher() {
      if (!this.canUse) return
      this.$emit('use', {
        code: this.code,
        lockerNumber: this.lockerNumber
      })
    },
    handleShare() {
      this.$emit('share', {
        code: this.code,
        qrCodeUrl: this.qrCodeUrl
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.voucher-code {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .header-title {
      font-size: 36rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .header-status {
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      
      &--active {
        color: #52c41a;
        background-color: #f6ffed;
      }
      
      &--used {
        color: #8c8c8c;
        background-color: #f5f5f5;
      }
      
      &--expired {
        color: #ff4d4f;
        background-color: #fff1f0;
      }
    }
  }
  
  &__qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32rpx;
    
    .qr-placeholder {
      width: 300rpx;
      height: 300rpx;
      background-color: #f5f5f5;
      border: 2rpx solid #e8e8e8;
      border-radius: 8rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      
      image {
        width: 100%;
        height: 100%;
      }
      
      .qr-generator {
        text-align: center;
        
        .qr-text {
          font-size: 28rpx;
          color: #666666;
          word-break: break-all;
          padding: 20rpx;
        }
      }
    }
    
    .qr-hint {
      margin-top: 12rpx;
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  &__info {
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      font-size: 28rpx;
      
      .info-label {
        color: #666666;
        min-width: 140rpx;
      }
      
      .info-value {
        color: #333333;
        flex: 1;
        
        &.code-value {
          font-family: monospace;
          font-weight: 500;
          color: #1890ff;
        }
        
        &.expired {
          color: #ff4d4f;
        }
      }
      
      .copy-icon {
        margin-left: 12rpx;
        font-size: 24rpx;
        cursor: pointer;
      }
    }
    
    .expired-warning {
      margin-top: 16rpx;
      padding: 12rpx 20rpx;
      background-color: #fff1f0;
      border-radius: 8rpx;
      
      .warning-icon {
        margin-right: 8rpx;
      }
      
      .warning-text {
        color: #ff4d4f;
      }
    }
  }
  
  &__actions {
    margin-top: 32rpx;
    display: flex;
    gap: 20rpx;
    
    .action-btn {
      flex: 1;
      height: 88rpx;
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: 500;
      border: none;
      
      &--primary {
        background-color: #1890ff;
        color: #ffffff;
        
        &:disabled {
          background-color: #d9d9d9;
          color: #ffffff;
        }
      }
      
      &--secondary {
        background-color: #ffffff;
        color: #1890ff;
        border: 2rpx solid #1890ff;
      }
    }
  }
  
  // Status variants
  &--used {
    opacity: 0.7;
    
    .voucher-code__qr {
      filter: grayscale(100%);
    }
  }
  
  &--expired {
    .voucher-code__qr {
      opacity: 0.5;
    }
  }
}
</style>