<template>
  <view class="home-skeleton">
    <!-- Header Skeleton -->
    <view class="header-skeleton">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="welcome-skeleton">
          <view class="skeleton-line title skeleton-animate"></view>
          <view class="skeleton-line subtitle skeleton-animate"></view>
        </view>
        <view class="skeleton-avatar skeleton-animate"></view>
      </view>
    </view>
    
    <!-- Status Card Skeleton -->
    <view class="status-card-skeleton">
      <view class="skeleton-header">
        <view class="skeleton-line title skeleton-animate"></view>
        <view class="skeleton-line time skeleton-animate"></view>
      </view>
      <view class="skeleton-content">
        <view class="skeleton-row">
          <view class="skeleton-line label skeleton-animate"></view>
          <view class="skeleton-line value skeleton-animate"></view>
        </view>
        <view class="skeleton-row">
          <view class="skeleton-line label skeleton-animate"></view>
          <view class="skeleton-line value skeleton-animate"></view>
        </view>
        <view class="skeleton-button skeleton-animate"></view>
      </view>
    </view>
    
    <!-- Quick Actions Skeleton -->
    <view class="actions-skeleton">
      <view v-for="i in 4" :key="i" class="action-skeleton">
        <view class="skeleton-icon skeleton-animate"></view>
        <view class="skeleton-line text skeleton-animate"></view>
        <view class="skeleton-line desc skeleton-animate"></view>
      </view>
    </view>
    
    <!-- Advertisement Skeleton -->
    <view class="ad-skeleton">
      <view class="skeleton-banner skeleton-animate"></view>
    </view>
    
    <!-- Announcement Skeleton -->
    <view class="announcement-skeleton">
      <view class="skeleton-icon skeleton-animate"></view>
      <view class="skeleton-line text skeleton-animate"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomePageSkeleton'
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

.home-skeleton {
  min-height: 100vh;
  background-color: #f5f6f7;
  
  .header-skeleton {
    position: relative;
    height: 260rpx;
    
    .header-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background: linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%);
      border-radius: 0 0 40rpx 40rpx;
    }
    
    .header-content {
      position: relative;
      padding: 60rpx 32rpx 32rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .welcome-skeleton {
        flex: 1;
        
        .skeleton-line {
          border-radius: 6rpx;
          
          &.title {
            width: 200rpx;
            height: 40rpx;
            margin-bottom: 16rpx;
          }
          
          &.subtitle {
            width: 160rpx;
            height: 28rpx;
          }
        }
      }
      
      .skeleton-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
      }
    }
  }
  
  .status-card-skeleton {
    margin: 32rpx;
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    
    .skeleton-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24rpx;
      
      .skeleton-line {
        border-radius: 6rpx;
        
        &.title {
          width: 160rpx;
          height: 32rpx;
        }
        
        &.time {
          width: 100rpx;
          height: 24rpx;
        }
      }
    }
    
    .skeleton-content {
      .skeleton-row {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;
        
        .skeleton-line {
          border-radius: 6rpx;
          
          &.label {
            width: 60rpx;
            height: 28rpx;
            margin-right: 16rpx;
          }
          
          &.value {
            width: 120rpx;
            height: 40rpx;
          }
        }
      }
      
      .skeleton-button {
        width: 100%;
        height: 88rpx;
        border-radius: 44rpx;
        margin-top: 24rpx;
      }
    }
  }
  
  .actions-skeleton {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24rpx;
    padding: 0 32rpx;
    margin-bottom: 32rpx;
    
    .action-skeleton {
      background-color: #ffffff;
      border-radius: 16rpx;
      padding: 24rpx 16rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .skeleton-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-bottom: 12rpx;
      }
      
      .skeleton-line {
        border-radius: 4rpx;
        
        &.text {
          width: 60rpx;
          height: 28rpx;
          margin-bottom: 8rpx;
        }
        
        &.desc {
          width: 80rpx;
          height: 22rpx;
        }
      }
    }
  }
  
  .ad-skeleton {
    margin: 0 32rpx 32rpx;
    
    .skeleton-banner {
      width: 100%;
      height: 320rpx;
      border-radius: 16rpx;
    }
  }
  
  .announcement-skeleton {
    margin: 0 32rpx 32rpx;
    padding: 20rpx 24rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    
    .skeleton-icon {
      width: 32rpx;
      height: 32rpx;
      border-radius: 50%;
      margin-right: 16rpx;
    }
    
    .skeleton-line {
      flex: 1;
      height: 26rpx;
      border-radius: 4rpx;
    }
  }
}
</style>