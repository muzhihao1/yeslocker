<template>
  <view class="loading-skeleton">
    <!-- Card Skeleton -->
    <view v-if="type === 'card'" class="skeleton-card">
      <view class="skeleton-header">
        <view class="skeleton-title skeleton-animate"></view>
        <view class="skeleton-subtitle skeleton-animate"></view>
      </view>
      <view class="skeleton-content">
        <view v-for="i in lines" :key="i" class="skeleton-line skeleton-animate" :style="{ width: getLineWidth(i) }"></view>
      </view>
    </view>
    
    <!-- List Item Skeleton -->
    <view v-else-if="type === 'list'" class="skeleton-list">
      <view v-for="i in count" :key="i" class="skeleton-list-item">
        <view class="skeleton-avatar skeleton-animate" v-if="showAvatar"></view>
        <view class="skeleton-list-content">
          <view class="skeleton-list-title skeleton-animate"></view>
          <view class="skeleton-list-subtitle skeleton-animate"></view>
        </view>
      </view>
    </view>
    
    <!-- Image Skeleton -->
    <view v-else-if="type === 'image'" class="skeleton-image skeleton-animate" :style="{ width: width, height: height }"></view>
    
    <!-- Button Skeleton -->
    <view v-else-if="type === 'button'" class="skeleton-button skeleton-animate" :style="{ width: width, height: height }"></view>
    
    <!-- Custom Skeleton -->
    <view v-else-if="type === 'custom'" class="skeleton-custom">
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LoadingSkeleton',
  props: {
    type: {
      type: String,
      default: 'card', // card, list, image, button, custom
      validator: value => ['card', 'list', 'image', 'button', 'custom'].includes(value)
    },
    lines: {
      type: Number,
      default: 3
    },
    count: {
      type: Number,
      default: 3
    },
    showAvatar: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '200rpx'
    }
  },
  methods: {
    getLineWidth(index) {
      // 创建不同宽度的线条以增加真实感
      const widths = ['100%', '90%', '75%', '85%', '95%']
      return widths[index % widths.length]
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes skeleton-loading {
  0% {
    background-position: 200% 50%;
  }
  100% {
    background-position: -200% 50%;
  }
}

.loading-skeleton {
  .skeleton-animate {
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
  }
  
  // Card Skeleton
  .skeleton-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    
    .skeleton-header {
      margin-bottom: 24rpx;
      
      .skeleton-title {
        height: 40rpx;
        width: 60%;
        border-radius: 8rpx;
        margin-bottom: 16rpx;
      }
      
      .skeleton-subtitle {
        height: 28rpx;
        width: 40%;
        border-radius: 6rpx;
      }
    }
    
    .skeleton-content {
      .skeleton-line {
        height: 28rpx;
        border-radius: 6rpx;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
  
  // List Skeleton
  .skeleton-list {
    .skeleton-list-item {
      display: flex;
      align-items: center;
      padding: 24rpx 32rpx;
      background-color: #ffffff;
      margin-bottom: 2rpx;
      
      .skeleton-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 24rpx;
        flex-shrink: 0;
      }
      
      .skeleton-list-content {
        flex: 1;
        
        .skeleton-list-title {
          height: 32rpx;
          width: 70%;
          border-radius: 6rpx;
          margin-bottom: 12rpx;
        }
        
        .skeleton-list-subtitle {
          height: 24rpx;
          width: 50%;
          border-radius: 4rpx;
        }
      }
    }
  }
  
  // Image Skeleton
  .skeleton-image {
    border-radius: 12rpx;
  }
  
  // Button Skeleton
  .skeleton-button {
    border-radius: 44rpx;
  }
  
  // Custom Skeleton
  .skeleton-custom {
    :deep(.skeleton-item) {
      @extend .skeleton-animate;
      background-color: #f0f0f0;
    }
  }
}
</style>