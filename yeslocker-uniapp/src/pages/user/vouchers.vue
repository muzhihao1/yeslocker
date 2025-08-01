<template>
  <view class="vouchers-page">
    <!-- Page Header -->
    <view class="page-header">
      <text class="page-title">我的凭证</text>
    </view>
    
    <!-- Active Voucher -->
    <view class="voucher-section" v-if="activeVoucher">
      <view class="section-title">当前有效凭证</view>
      <view class="voucher-card active">
        <view class="voucher-header">
          <text class="voucher-code">{{ activeVoucher.code }}</text>
          <view class="voucher-status active-status">有效</view>
        </view>
        <view class="voucher-info">
          <view class="info-item">
            <text class="info-label">创建时间：</text>
            <text class="info-value">{{ formatDate(activeVoucher.createTime) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">到期时间：</text>
            <text class="info-value">{{ formatDate(activeVoucher.expireTime) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">储物柜号：</text>
            <text class="info-value">{{ activeVoucher.lockerNumber }}</text>
          </view>
        </view>
        <button class="view-qr-btn" @click="viewQRCode(activeVoucher)">查看二维码</button>
      </view>
    </view>
    
    <!-- History Vouchers -->
    <view class="voucher-section">
      <view class="section-title">历史凭证</view>
      <view class="voucher-list" v-if="historyVouchers.length > 0">
        <view class="voucher-card" v-for="voucher in historyVouchers" :key="voucher.id">
          <view class="voucher-header">
            <text class="voucher-code">{{ voucher.code }}</text>
            <view class="voucher-status" :class="voucher.status">{{ getStatusText(voucher.status) }}</view>
          </view>
          <view class="voucher-info">
            <view class="info-item">
              <text class="info-label">使用时间：</text>
              <text class="info-value">{{ formatDate(voucher.usedTime) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">储物柜号：</text>
              <text class="info-value">{{ voucher.lockerNumber }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="empty-state" v-else>
        <text class="empty-text">暂无历史凭证</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VouchersPage',
  data() {
    return {
      activeVoucher: null,
      historyVouchers: []
    }
  },
  onLoad() {
    this.loadVouchers()
  },
  methods: {
    async loadVouchers() {
      // TODO: 从API加载凭证数据
      // 模拟数据
      this.activeVoucher = {
        id: 1,
        code: 'YES20240122123456',
        createTime: '2024-01-22 10:30:00',
        expireTime: '2024-02-21 10:30:00',
        lockerNumber: 'A12',
        status: 'active'
      }
      
      this.historyVouchers = [
        {
          id: 2,
          code: 'YES20231220098765',
          usedTime: '2023-12-25 15:45:00',
          lockerNumber: 'B08',
          status: 'used'
        }
      ]
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    },
    
    getStatusText(status) {
      const statusMap = {
        active: '有效',
        used: '已使用',
        expired: '已过期'
      }
      return statusMap[status] || status
    },
    
    viewQRCode(voucher) {
      uni.navigateTo({
        url: `/pages/storage/voucher?code=${voucher.code}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.vouchers-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.page-header {
  padding: 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .page-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333333;
  }
}

.voucher-section {
  margin-top: 24rpx;
  
  .section-title {
    padding: 16rpx 32rpx;
    font-size: 28rpx;
    color: #666666;
    font-weight: 500;
  }
}

.voucher-card {
  margin: 0 32rpx 24rpx;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  &.active {
    border: 2rpx solid #1890ff;
  }
  
  .voucher-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .voucher-code {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
      letter-spacing: 1rpx;
    }
    
    .voucher-status {
      padding: 8rpx 16rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
      
      &.active-status {
        background-color: #e6f7ff;
        color: #1890ff;
      }
      
      &.used {
        background-color: #f0f0f0;
        color: #999999;
      }
      
      &.expired {
        background-color: #fff1f0;
        color: #ff4d4f;
      }
    }
  }
  
  .voucher-info {
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-size: 26rpx;
        color: #999999;
        margin-right: 16rpx;
      }
      
      .info-value {
        font-size: 26rpx;
        color: #333333;
      }
    }
  }
  
  .view-qr-btn {
    width: 100%;
    height: 80rpx;
    margin-top: 24rpx;
    background-color: #1890ff;
    color: #ffffff;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 40rpx;
    border: none;
  }
}

.empty-state {
  padding: 80rpx 32rpx;
  text-align: center;
  
  .empty-text {
    font-size: 28rpx;
    color: #999999;
  }
}
</style>