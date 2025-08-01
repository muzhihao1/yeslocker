<template>
  <view v-if="visible" class="loading-overlay" @touchmove.stop.prevent>
    <view class="loading-content">
      <!-- Default Spinner -->
      <view v-if="type === 'spinner'" class="loading-spinner">
        <view class="spinner-circle"></view>
      </view>
      
      <!-- Progress Bar -->
      <view v-else-if="type === 'progress'" class="loading-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progress + '%' }"></view>
        </view>
        <text class="progress-text">{{ progress }}%</text>
      </view>
      
      <!-- Steps Progress -->
      <view v-else-if="type === 'steps'" class="loading-steps">
        <view class="steps-indicator">
          <view 
            v-for="(step, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 
              'active': index === currentStep,
              'completed': index < currentStep 
            }"
          >
            <view class="step-dot">
              <text v-if="index < currentStep" class="step-check">✓</text>
              <text v-else>{{ index + 1 }}</text>
            </view>
            <text class="step-label">{{ step }}</text>
          </view>
        </view>
      </view>
      
      <!-- Custom Content -->
      <view v-else-if="type === 'custom'" class="loading-custom">
        <slot></slot>
      </view>
      
      <!-- Loading Text -->
      <text v-if="text" class="loading-text">{{ text }}</text>
      
      <!-- Sub Text -->
      <text v-if="subText" class="loading-subtext">{{ subText }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LoadingOverlay',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'spinner', // spinner, progress, steps, custom
      validator: value => ['spinner', 'progress', 'steps', 'custom'].includes(value)
    },
    text: {
      type: String,
      default: '加载中...'
    },
    subText: {
      type: String,
      default: ''
    },
    progress: {
      type: Number,
      default: 0,
      validator: value => value >= 0 && value <= 100
    },
    steps: {
      type: Array,
      default: () => []
    },
    currentStep: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.9);
    opacity: 0.7;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-content {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 48rpx;
    min-width: 280rpx;
    max-width: 560rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    // Spinner
    .loading-spinner {
      margin-bottom: 24rpx;
      
      .spinner-circle {
        width: 80rpx;
        height: 80rpx;
        border: 6rpx solid #f0f0f0;
        border-top-color: #1890ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
    
    // Progress Bar
    .loading-progress {
      width: 100%;
      margin-bottom: 24rpx;
      
      .progress-bar {
        width: 100%;
        height: 12rpx;
        background-color: #f0f0f0;
        border-radius: 6rpx;
        overflow: hidden;
        margin-bottom: 16rpx;
        
        .progress-fill {
          height: 100%;
          background-color: #1890ff;
          border-radius: 6rpx;
          transition: width 0.3s ease;
        }
      }
      
      .progress-text {
        text-align: center;
        font-size: 28rpx;
        color: #666666;
      }
    }
    
    // Steps Progress
    .loading-steps {
      margin-bottom: 24rpx;
      
      .steps-indicator {
        display: flex;
        align-items: flex-start;
        gap: 32rpx;
        
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .step-dot {
            width: 48rpx;
            height: 48rpx;
            border-radius: 50%;
            background-color: #f0f0f0;
            color: #999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            margin-bottom: 8rpx;
            transition: all 0.3s ease;
            
            .step-check {
              color: #ffffff;
              font-size: 20rpx;
            }
          }
          
          .step-label {
            font-size: 24rpx;
            color: #999999;
            white-space: nowrap;
          }
          
          &.active {
            .step-dot {
              background-color: #1890ff;
              color: #ffffff;
              animation: pulse 1.5s ease-in-out infinite;
            }
            
            .step-label {
              color: #333333;
            }
          }
          
          &.completed {
            .step-dot {
              background-color: #52c41a;
              color: #ffffff;
            }
            
            .step-label {
              color: #666666;
            }
          }
        }
      }
    }
    
    // Loading Text
    .loading-text {
      font-size: 30rpx;
      color: #333333;
      text-align: center;
      line-height: 42rpx;
    }
    
    // Sub Text
    .loading-subtext {
      font-size: 26rpx;
      color: #999999;
      text-align: center;
      margin-top: 12rpx;
      line-height: 36rpx;
    }
  }
}
</style>