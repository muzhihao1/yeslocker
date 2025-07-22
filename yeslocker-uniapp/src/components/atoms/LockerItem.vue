<template>
  <view 
    class="locker-item" 
    :class="[
      `locker-item--${status}`,
      { 'locker-item--selected': isSelected }
    ]"
    @click="handleClick"
  >
    <view class="locker-item__header">
      <view class="locker-item__number">{{ lockerNumber }}</view>
      <view class="locker-item__icon">
        <text v-if="status === 'available'" class="icon-unlock">🔓</text>
        <text v-else-if="status === 'occupied'" class="icon-lock">🔒</text>
        <text v-else class="icon-maintenance">🔧</text>
      </view>
    </view>
    
    <view class="locker-item__status">
      <text class="status-text">{{ statusText }}</text>
    </view>
    
    <view v-if="status === 'occupied' && expiryTime" class="locker-item__info">
      <text class="info-label">到期时间：</text>
      <text class="info-value">{{ formatTime(expiryTime) }}</text>
    </view>
    
    <view v-if="status === 'occupied' && userName" class="locker-item__user">
      <text class="user-name">{{ userName }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LockerItem',
  props: {
    lockerNumber: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'available',
      validator: (value) => ['available', 'occupied', 'maintenance'].includes(value)
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    expiryTime: {
      type: [String, Number],
      default: ''
    },
    userName: {
      type: String,
      default: ''
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        available: '可用',
        occupied: '使用中',
        maintenance: '维护中'
      }
      return statusMap[this.status] || '未知'
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const diff = date - now
      
      if (diff < 0) return '已过期'
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) {
        return `${days}天${hours}小时`
      }
      return `${hours}小时`
    },
    handleClick() {
      if (this.status === 'maintenance') {
        uni.showToast({
          title: '该储物柜维护中',
          icon: 'none'
        })
        return
      }
      this.$emit('click', {
        lockerNumber: this.lockerNumber,
        status: this.status
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.locker-item {
  width: 160rpx;
  height: 200rpx;
  padding: 16rpx;
  background-color: #ffffff;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
  }
  
  &__number {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
  }
  
  &__icon {
    font-size: 32rpx;
  }
  
  &__status {
    margin-bottom: 8rpx;
    
    .status-text {
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
    }
  }
  
  &__info {
    margin-top: 8rpx;
    font-size: 20rpx;
    color: #666666;
    
    .info-label {
      color: #999999;
    }
    
    .info-value {
      color: #ff4d4f;
      margin-left: 4rpx;
    }
  }
  
  &__user {
    margin-top: 8rpx;
    
    .user-name {
      font-size: 22rpx;
      color: #666666;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  // Status variants
  &--available {
    background-color: #f6ffed;
    border-color: #b7eb8f;
    
    .status-text {
      color: #52c41a;
      background-color: #f6ffed;
    }
    
    &:hover {
      border-color: #73d13d;
      box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.2);
    }
  }
  
  &--occupied {
    background-color: #fff7e6;
    border-color: #ffd591;
    
    .status-text {
      color: #fa8c16;
      background-color: #fff7e6;
    }
    
    &:hover {
      border-color: #ffa940;
    }
  }
  
  &--maintenance {
    background-color: #f5f5f5;
    border-color: #d9d9d9;
    cursor: not-allowed;
    
    .status-text {
      color: #8c8c8c;
      background-color: #f5f5f5;
    }
    
    .locker-item__number {
      color: #bfbfbf;
    }
  }
  
  // Selected state
  &--selected {
    border-color: #1890ff;
    border-width: 4rpx;
    box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
  }
}
</style>