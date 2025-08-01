<template>
  <view class="locker-detail-page">
    <!-- Locker Header -->
    <view class="locker-header">
      <view class="locker-icon">🗄️</view>
      <text class="locker-number">{{ lockerInfo.number }}</text>
      <text class="locker-desc">我的专属储物柜</text>
    </view>
    
    <!-- Status Card -->
    <view class="status-card">
      <view class="status-row">
        <text class="status-label">当前状态</text>
        <view class="status-value" :class="lockerInfo.hasStorage ? 'occupied' : 'available'">
          <text class="status-dot"></text>
          <text>{{ lockerInfo.hasStorage ? '已存放' : '空闲' }}</text>
        </view>
      </view>
      <view class="status-row" v-if="lockerInfo.assignedDate">
        <text class="status-label">分配时间</text>
        <text class="status-value">{{ formatDate(lockerInfo.assignedDate) }}</text>
      </view>
      <view class="status-row" v-if="lockerInfo.hasStorage && lockerInfo.lastStoreTime">
        <text class="status-label">存入时间</text>
        <text class="status-value">{{ formatDateTime(lockerInfo.lastStoreTime) }}</text>
      </view>
    </view>
    
    <!-- Quick Actions -->
    <view class="quick-actions">
      <button v-if="!lockerInfo.hasStorage" class="action-btn store" @click="navigateToStore">
        申请存杆
      </button>
      <button v-else class="action-btn retrieve" @click="navigateToRetrieve">
        申请取杆
      </button>
    </view>
    
    <!-- Recent Requests -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最近申请</text>
        <text class="view-all" @click="viewAllRequests">查看全部</text>
      </view>
      <view class="request-list" v-if="recentRequests.length > 0">
        <view class="request-item" v-for="(request, index) in recentRequests" :key="index" @click="viewRequestDetail(request)">
          <view class="request-info">
            <text class="request-type">{{ request.type === 'store' ? '存杆申请' : '取杆申请' }}</text>
            <text class="request-time">{{ formatDateTime(request.createTime) }}</text>
          </view>
          <view class="request-status" :class="request.status">
            {{ getStatusText(request.status) }}
          </view>
        </view>
      </view>
      <view class="empty-state" v-else>
        <text class="empty-text">暂无申请记录</text>
      </view>
    </view>
    
    <!-- Locker Rules -->
    <view class="rules-section">
      <view class="rules-header">
        <text class="rules-icon">📋</text>
        <text class="rules-title">使用须知</text>
      </view>
      <view class="rules-content">
        <view class="rule-item">• 储物柜为个人专属，不可转让他人使用</view>
        <view class="rule-item">• 每次存取需要到前台申请并验证身份</view>
        <view class="rule-item">• 请勿存放违禁物品或贵重物品</view>
        <view class="rule-item">• 长期不使用可能会被回收重新分配</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getRecentRequests } from '@/utils/mockData'

export default {
  name: 'LockerDetail',
  data() {
    return {
      lockerInfo: {
        id: 1,
        number: 'A12',
        hasStorage: false,
        assignedDate: new Date().getTime() - 30 * 24 * 60 * 60 * 1000, // 30天前
        lastStoreTime: null
      },
      recentRequests: []
    }
  },
  onLoad() {
    this.loadLockerInfo()
    this.loadRecentRequests()
  },
  methods: {
    async loadLockerInfo() {
      // TODO: 调用API获取储物柜信息
      // 模拟数据已在data中设置
    },
    
    async loadRecentRequests() {
      // TODO: 调用API获取最近的申请记录
      // 使用统一的模拟数据，只显示最近的2条记录
      this.recentRequests = getRecentRequests(2)
    },
    
    navigateToStore() {
      uni.navigateTo({
        url: '/pages/storage/request?type=store'
      })
    },
    
    navigateToRetrieve() {
      uni.navigateTo({
        url: '/pages/storage/request?type=retrieve'
      })
    },
    
    viewAllRequests() {
      uni.navigateTo({
        url: '/pages/storage/requests'
      })
    },
    
    viewRequestDetail(request) {
      uni.navigateTo({
        url: `/pages/storage/request-detail?code=${request.code}&type=${request.type}`
      })
    },
    
    getStatusText(status) {
      const statusMap = {
        pending: '待处理',
        approved: '已批准',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status] || status
    },
    
    formatDate(timestamp) {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    formatDateTime(timestamp) {
      const date = new Date(timestamp)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${month}-${day} ${hour}:${minute}`
    }
  }
}
</script>

<style lang="scss" scoped>
.locker-detail-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.locker-header {
  padding: 60rpx 32rpx;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  text-align: center;
  
  .locker-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }
  
  .locker-number {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12rpx;
  }
  
  .locker-desc {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.status-card {
  margin: 24rpx 32rpx;
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  
  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .status-label {
      font-size: 28rpx;
      color: #666666;
    }
    
    .status-value {
      font-size: 28rpx;
      color: #333333;
      display: flex;
      align-items: center;
      
      &.available {
        color: #52c41a;
        
        .status-dot {
          background-color: #52c41a;
        }
      }
      
      &.occupied {
        color: #fa8c16;
        
        .status-dot {
          background-color: #fa8c16;
        }
      }
      
      .status-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }
    }
  }
}

.quick-actions {
  padding: 0 32rpx;
  margin-bottom: 48rpx;
  
  .action-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
    color: #ffffff;
    
    &.store {
      background-color: #52c41a;
    }
    
    &.retrieve {
      background-color: #1890ff;
    }
  }
}

.section {
  margin: 0 32rpx 32rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .view-all {
      font-size: 26rpx;
      color: #1890ff;
    }
  }
  
  .request-list {
    background-color: #ffffff;
    border-radius: 16rpx;
    overflow: hidden;
    
    .request-item {
      padding: 24rpx 32rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .request-info {
        flex: 1;
        
        .request-type {
          display: block;
          font-size: 30rpx;
          color: #333333;
          margin-bottom: 8rpx;
        }
        
        .request-time {
          font-size: 26rpx;
          color: #999999;
        }
      }
      
      .request-status {
        padding: 8rpx 20rpx;
        border-radius: 24rpx;
        font-size: 24rpx;
        
        &.pending {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        
        &.completed {
          background-color: #f6ffed;
          color: #52c41a;
        }
        
        &.cancelled {
          background-color: #f5f5f5;
          color: #999999;
        }
      }
    }
  }
  
  .empty-state {
    padding: 60rpx 0;
    text-align: center;
    background-color: #ffffff;
    border-radius: 16rpx;
    
    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }
}

.rules-section {
  margin: 0 32rpx 32rpx;
  padding: 32rpx;
  background-color: #fff7e6;
  border-radius: 16rpx;
  
  .rules-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    .rules-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }
    
    .rules-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
  }
  
  .rules-content {
    .rule-item {
      font-size: 26rpx;
      color: #666666;
      line-height: 44rpx;
      padding-left: 20rpx;
    }
  }
}
</style>