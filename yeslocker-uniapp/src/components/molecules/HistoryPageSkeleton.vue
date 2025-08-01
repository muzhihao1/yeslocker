<template>
  <view class="history-skeleton">
    <!-- Header Skeleton -->
    <view class="header-skeleton">
      <view class="skeleton-line title skeleton-animate"></view>
      <view class="skeleton-line desc skeleton-animate"></view>
    </view>
    
    <!-- Filter Tabs Skeleton -->
    <view class="tabs-skeleton">
      <view v-for="i in 3" :key="i" class="tab-skeleton">
        <view class="skeleton-line tab skeleton-animate"></view>
      </view>
    </view>
    
    <!-- Records List Skeleton -->
    <view class="records-skeleton">
      <view v-for="i in count" :key="i" class="record-skeleton">
        <view class="record-header">
          <view class="type-skeleton">
            <view class="skeleton-icon skeleton-animate"></view>
            <view class="skeleton-line type skeleton-animate"></view>
          </view>
          <view class="skeleton-line time skeleton-animate"></view>
        </view>
        
        <view class="record-content">
          <view v-for="j in 3" :key="j" class="content-row">
            <view class="skeleton-line label skeleton-animate"></view>
            <view class="skeleton-line value skeleton-animate"></view>
          </view>
        </view>
        
        <view class="record-footer">
          <view class="skeleton-line status skeleton-animate"></view>
          <view class="skeleton-line action skeleton-animate"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HistoryPageSkeleton',
  props: {
    count: {
      type: Number,
      default: 3
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

.history-skeleton {
  min-height: 100vh;
  background-color: #f5f6f7;
  
  .header-skeleton {
    padding: 32rpx;
    background-color: #ffffff;
    text-align: center;
    
    .skeleton-line {
      margin: 0 auto;
      border-radius: 6rpx;
      
      &.title {
        width: 160rpx;
        height: 40rpx;
        margin-bottom: 16rpx;
      }
      
      &.desc {
        width: 200rpx;
        height: 28rpx;
      }
    }
  }
  
  .tabs-skeleton {
    display: flex;
    padding: 0 32rpx;
    background-color: #ffffff;
    border-bottom: 1rpx solid #f0f0f0;
    
    .tab-skeleton {
      flex: 1;
      padding: 24rpx 0;
      display: flex;
      justify-content: center;
      
      .skeleton-line {
        width: 80rpx;
        height: 30rpx;
        border-radius: 6rpx;
      }
    }
  }
  
  .records-skeleton {
    padding: 24rpx 32rpx;
    
    .record-skeleton {
      background-color: #ffffff;
      border-radius: 16rpx;
      padding: 32rpx;
      margin-bottom: 24rpx;
      
      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24rpx;
        
        .type-skeleton {
          display: flex;
          align-items: center;
          
          .skeleton-icon {
            width: 32rpx;
            height: 32rpx;
            border-radius: 50%;
            margin-right: 12rpx;
          }
          
          .skeleton-line {
            width: 60rpx;
            height: 30rpx;
            border-radius: 6rpx;
          }
        }
        
        .skeleton-line.time {
          width: 120rpx;
          height: 26rpx;
          border-radius: 4rpx;
        }
      }
      
      .record-content {
        margin-bottom: 24rpx;
        
        .content-row {
          display: flex;
          align-items: center;
          margin-bottom: 16rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .skeleton-line {
            border-radius: 4rpx;
            
            &.label {
              width: 80rpx;
              height: 28rpx;
              margin-right: 16rpx;
            }
            
            &.value {
              width: 160rpx;
              height: 28rpx;
            }
          }
        }
      }
      
      .record-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .skeleton-line {
          border-radius: 20rpx;
          
          &.status {
            width: 80rpx;
            height: 32rpx;
          }
          
          &.action {
            width: 100rpx;
            height: 28rpx;
          }
        }
      }
    }
  }
}
</style>