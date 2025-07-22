<template>
  <view class="user-card">
    <view class="user-card__avatar">
      <image 
        :src="avatarUrl || '/static/default-avatar.png'" 
        mode="aspectFill"
        @error="handleImageError"
      />
    </view>
    <view class="user-card__info">
      <view class="user-card__name">{{ userName || '未登录用户' }}</view>
      <view class="user-card__phone" v-if="phoneNumber">
        {{ formatPhone(phoneNumber) }}
      </view>
      <view class="user-card__status" :class="`user-card__status--${status}`">
        <text class="status-dot"></text>
        {{ statusText }}
      </view>
    </view>
    <view class="user-card__action" v-if="showAction" @click="handleAction">
      <slot name="action">
        <text class="action-text">{{ actionText }}</text>
      </slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UserCard',
  props: {
    avatarUrl: {
      type: String,
      default: ''
    },
    userName: {
      type: String,
      default: ''
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'normal',
      validator: (value) => ['normal', 'verified', 'pending'].includes(value)
    },
    showAction: {
      type: Boolean,
      default: false
    },
    actionText: {
      type: String,
      default: '操作'
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        normal: '普通用户',
        verified: '已认证',
        pending: '待认证'
      }
      return statusMap[this.status] || '未知状态'
    }
  },
  methods: {
    formatPhone(phone) {
      if (!phone || phone.length !== 11) return phone
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
    },
    handleImageError() {
      this.$emit('avatar-error')
    },
    handleAction() {
      this.$emit('action-click')
    }
  }
}
</script>

<style lang="scss" scoped>
.user-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  
  &__avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 24rpx;
    flex-shrink: 0;
    
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__name {
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  &__phone {
    font-size: 28rpx;
    color: #666666;
    margin-bottom: 8rpx;
  }
  
  &__status {
    display: inline-flex;
    align-items: center;
    font-size: 24rpx;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    
    &--normal {
      color: #666666;
      background-color: #f5f5f5;
      
      .status-dot {
        background-color: #999999;
      }
    }
    
    &--verified {
      color: #52c41a;
      background-color: #f6ffed;
      
      .status-dot {
        background-color: #52c41a;
      }
    }
    
    &--pending {
      color: #faad14;
      background-color: #fffbe6;
      
      .status-dot {
        background-color: #faad14;
      }
    }
    
    .status-dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      margin-right: 8rpx;
    }
  }
  
  &__action {
    margin-left: 24rpx;
    
    .action-text {
      font-size: 28rpx;
      color: #1890ff;
    }
  }
}
</style>