<template>
  <view class="retrieval-confirm-page">
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">确认取杆</text>
      <text class="page-desc">请确认以下信息无误</text>
    </view>
    
    <!-- Voucher Display -->
    <view class="voucher-section">
      <voucher-code
        :code="voucherInfo.code"
        :qr-code-url="voucherInfo.qrCodeUrl"
        :locker-number="voucherInfo.lockerNumber"
        :create-time="voucherInfo.createTime"
        :expiry-time="voucherInfo.expiryTime"
        :status="voucherInfo.status"
        :show-actions="false"
      />
    </view>
    
    <!-- Storage Details -->
    <view class="details-card">
      <view class="card-header">
        <text class="card-title">存储详情</text>
      </view>
      <view class="card-content">
        <view class="detail-item">
          <text class="detail-label">存储时间：</text>
          <text class="detail-value">{{ formatDateTime(voucherInfo.createTime) }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">存储时长：</text>
          <text class="detail-value">{{ calculateDuration() }}</text>
        </view>
        <view class="detail-item" v-if="voucherInfo.notes">
          <text class="detail-label">备注信息：</text>
          <text class="detail-value">{{ voucherInfo.notes }}</text>
        </view>
        <view class="detail-item" v-if="overdueFee > 0">
          <text class="detail-label">超期费用：</text>
          <text class="detail-value fee">¥{{ overdueFee }}</text>
        </view>
      </view>
    </view>
    
    <!-- Important Notice -->
    <view class="notice-card" v-if="hasImportantNotice">
      <view class="notice-header">
        <text class="notice-icon">⚠️</text>
        <text class="notice-title">重要提示</text>
      </view>
      <view class="notice-content">
        <view class="notice-item" v-if="isOverdue">
          您的存储已超期 {{ overdueDays }} 天，需支付超期费用 ¥{{ overdueFee }}
        </view>
        <view class="notice-item">
          请在工作人员指导下取出球杆
        </view>
        <view class="notice-item">
          取出后请检查球杆是否完好
        </view>
      </view>
    </view>
    
    <!-- User Confirmation -->
    <view class="confirmation-section">
      <checkbox-group @change="handleConfirmChange">
        <label class="confirm-checkbox">
          <checkbox :value="true" :checked="confirmed" />
          <text>我确认以上信息无误，同意取回球杆</text>
        </label>
      </checkbox-group>
    </view>
    
    <!-- Bottom Actions -->
    <view class="bottom-actions">
      <button class="btn-cancel" @click="cancelRetrieval">取消</button>
      <button 
        class="btn-confirm"
        :disabled="!confirmed"
        @click="confirmRetrieval"
      >
        确认取回{{ overdueFee > 0 ? `（需支付¥${overdueFee}）` : '' }}
      </button>
    </view>
    
    <!-- Success Modal -->
    <view class="success-modal" v-if="showSuccess">
      <view class="modal-mask" @click="closeSuccessModal"></view>
      <view class="modal-content">
        <view class="success-icon">
          <text>✅</text>
        </view>
        <text class="success-title">取杆成功</text>
        <text class="success-desc">您的球杆已成功取回</text>
        <view class="success-info">
          <text>储物柜 {{ voucherInfo.lockerNumber }} 已释放</text>
          <text>取回时间：{{ formatDateTime(new Date()) }}</text>
        </view>
        <button class="success-btn" @click="goToHome">完成</button>
      </view>
    </view>
  </view>
</template>

<script>
import VoucherCode from '@/components/atoms/VoucherCode.vue'

export default {
  name: 'RetrievalConfirmPage',
  components: {
    VoucherCode
  },
  data() {
    return {
      voucherInfo: {},
      confirmed: false,
      showSuccess: false
    }
  },
  computed: {
    isOverdue() {
      if (!this.voucherInfo.expiryTime) return false
      return new Date() > new Date(this.voucherInfo.expiryTime)
    },
    overdueDays() {
      if (!this.isOverdue) return 0
      
      const now = new Date()
      const expiryDate = new Date(this.voucherInfo.expiryTime)
      const diffTime = Math.abs(now - expiryDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays
    },
    overdueFee() {
      // 每天5元超期费
      return this.overdueDays * 5
    },
    hasImportantNotice() {
      return this.isOverdue || true // 始终显示取杆提示
    }
  },
  onLoad(options) {
    // 获取凭证信息
    if (options.voucher) {
      try {
        this.voucherInfo = JSON.parse(decodeURIComponent(options.voucher))
      } catch (e) {
        console.error('解析凭证信息失败:', e)
        uni.showModal({
          title: '错误',
          content: '凭证信息异常',
          showCancel: false,
          success: () => {
            uni.navigateBack()
          }
        })
      }
    } else {
      // 从上一页获取数据
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.voucherInfo) {
        this.voucherInfo = prevPage.voucherInfo
      }
    }
  },
  methods: {
    formatDateTime(timestamp) {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    
    calculateDuration() {
      if (!this.voucherInfo.createTime) return '未知'
      
      const now = new Date()
      const createTime = new Date(this.voucherInfo.createTime)
      const diff = now - createTime
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (days > 0) {
        return `${days}天${hours}小时`
      } else if (hours > 0) {
        return `${hours}小时${minutes}分钟`
      } else {
        return `${minutes}分钟`
      }
    },
    
    handleConfirmChange(e) {
      this.confirmed = e.detail.value.length > 0
    },
    
    cancelRetrieval() {
      uni.showModal({
        title: '提示',
        content: '确定要取消取杆吗？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    },
    
    async confirmRetrieval() {
      if (!this.confirmed) return
      
      uni.showLoading({
        title: '处理中...',
        mask: true
      })
      
      try {
        // TODO: 调用API确认取杆
        const retrievalData = {
          voucherCode: this.voucherInfo.code,
          lockerNumber: this.voucherInfo.lockerNumber,
          overdueFee: this.overdueFee,
          retrievalTime: new Date().getTime()
        }
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        uni.hideLoading()
        
        // 显示成功提示
        this.showSuccess = true
        
        // 清除本地存储的凭证
        this.removeLocalVoucher()
        
        // 更新存储状态
        this.updateStorageStatus()
      } catch (error) {
        uni.hideLoading()
        uni.showModal({
          title: '取杆失败',
          content: error.message || '请稍后重试',
          showCancel: false
        })
      }
    },
    
    removeLocalVoucher() {
      // 从本地凭证列表中移除
      let vouchers = uni.getStorageSync('myVouchers') || []
      vouchers = vouchers.filter(v => v.code !== this.voucherInfo.code)
      uni.setStorageSync('myVouchers', vouchers)
    },
    
    updateStorageStatus() {
      // 更新首页的存储状态
      uni.$emit('storage-status-changed', {
        hasStorage: false
      })
    },
    
    closeSuccessModal() {
      this.showSuccess = false
      this.goToHome()
    },
    
    goToHome() {
      uni.switchTab({
        url: '/pages/home/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.retrieval-confirm-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 120rpx;
}

.page-header {
  padding: 32rpx;
  background-color: #ffffff;
  text-align: center;
  border-bottom: 1rpx solid #f0f0f0;
  
  .page-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 8rpx;
  }
  
  .page-desc {
    display: block;
    font-size: 28rpx;
    color: #666666;
  }
}

.voucher-section {
  padding: 32rpx;
}

.details-card {
  margin: 0 32rpx 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .card-header {
    padding: 24rpx 32rpx;
    background-color: #fafafa;
    border-bottom: 1rpx solid #f0f0f0;
    
    .card-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
  }
  
  .card-content {
    padding: 24rpx 32rpx;
    
    .detail-item {
      display: flex;
      align-items: center;
      padding: 12rpx 0;
      
      .detail-label {
        font-size: 28rpx;
        color: #666666;
        width: 140rpx;
        flex-shrink: 0;
      }
      
      .detail-value {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
        
        &.fee {
          color: #ff4d4f;
          font-weight: 500;
          font-size: 32rpx;
        }
      }
    }
  }
}

.notice-card {
  margin: 0 32rpx 24rpx;
  background-color: #fff7e6;
  border: 2rpx solid #ffd591;
  border-radius: 12rpx;
  padding: 24rpx;
  
  .notice-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    .notice-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }
    
    .notice-title {
      font-size: 30rpx;
      font-weight: 500;
      color: #fa8c16;
    }
  }
  
  .notice-content {
    .notice-item {
      font-size: 26rpx;
      color: #fa8c16;
      line-height: 40rpx;
      margin-bottom: 8rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.confirmation-section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
  
  .confirm-checkbox {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #666666;
    
    checkbox {
      margin-right: 16rpx;
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  background-color: #ffffff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
  
  button {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    
    &.btn-cancel {
      background-color: #ffffff;
      color: #666666;
      border: 2rpx solid #e8e8e8;
    }
    
    &.btn-confirm {
      background-color: #1890ff;
      color: #ffffff;
      border: none;
      
      &[disabled] {
        background-color: #d9d9d9;
      }
    }
  }
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600rpx;
    background-color: #ffffff;
    border-radius: 24rpx;
    padding: 48rpx;
    text-align: center;
    
    .success-icon {
      font-size: 120rpx;
      margin-bottom: 32rpx;
    }
    
    .success-title {
      display: block;
      font-size: 40rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 16rpx;
    }
    
    .success-desc {
      display: block;
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 32rpx;
    }
    
    .success-info {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      margin-bottom: 48rpx;
      
      text {
        font-size: 26rpx;
        color: #999999;
      }
    }
    
    .success-btn {
      width: 100%;
      height: 88rpx;
      background-color: #1890ff;
      color: #ffffff;
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: 500;
    }
  }
}
</style>