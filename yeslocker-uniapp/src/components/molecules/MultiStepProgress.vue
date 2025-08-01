<template>
  <view class="multi-step-progress">
    <view class="progress-header" v-if="title">
      <text class="progress-title">{{ title }}</text>
    </view>
    
    <view class="steps-container">
      <view 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-wrapper"
      >
        <!-- Step Item -->
        <view 
          class="step-item"
          :class="getStepClass(index)"
        >
          <!-- Step Circle -->
          <view class="step-circle">
            <view v-if="index < currentStep" class="step-check">
              <text class="check-icon">✓</text>
            </view>
            <view v-else-if="index === currentStep && loading" class="step-loading">
              <view class="loading-spinner"></view>
            </view>
            <text v-else class="step-number">{{ index + 1 }}</text>
          </view>
          
          <!-- Step Content -->
          <view class="step-content">
            <text class="step-label">{{ step.label }}</text>
            <text v-if="step.description" class="step-desc">{{ step.description }}</text>
          </view>
        </view>
        
        <!-- Step Line -->
        <view 
          v-if="index < steps.length - 1"
          class="step-line"
          :class="{ 'completed': index < currentStep }"
        ></view>
      </view>
    </view>
    
    <!-- Current Step Message -->
    <view v-if="currentMessage" class="current-message">
      <text class="message-text">{{ currentMessage }}</text>
    </view>
    
    <!-- Error State -->
    <view v-if="error" class="error-container">
      <text class="error-text">{{ error }}</text>
      <button v-if="showRetry" class="retry-btn" @click="$emit('retry')">
        重试
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MultiStepProgress',
  props: {
    steps: {
      type: Array,
      required: true,
      validator: steps => steps.every(step => step.label)
    },
    currentStep: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: ''
    },
    currentMessage: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    showRetry: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    getStepClass(index) {
      if (index < this.currentStep) {
        return 'completed'
      } else if (index === this.currentStep) {
        return this.error ? 'error' : 'active'
      } else {
        return 'pending'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.multi-step-progress {
  padding: 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  
  .progress-header {
    margin-bottom: 32rpx;
    text-align: center;
    
    .progress-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
  }
  
  .steps-container {
    position: relative;
  }
  
  .step-wrapper {
    position: relative;
    
    .step-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 48rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .step-circle {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-right: 24rpx;
        transition: all 0.3s ease;
        position: relative;
        z-index: 2;
        
        .step-check {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .check-icon {
            color: #ffffff;
            font-size: 24rpx;
            font-weight: bold;
          }
        }
        
        .step-loading {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .loading-spinner {
            width: 24rpx;
            height: 24rpx;
            border: 3rpx solid #ffffff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
        }
        
        .step-number {
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .step-content {
        flex: 1;
        padding-top: 4rpx;
        
        .step-label {
          font-size: 30rpx;
          color: #666666;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .step-desc {
          font-size: 26rpx;
          color: #999999;
          line-height: 36rpx;
        }
      }
      
      // States
      &.completed {
        .step-circle {
          background-color: #52c41a;
        }
        
        .step-content {
          .step-label {
            color: #333333;
          }
        }
      }
      
      &.active {
        .step-circle {
          background-color: #1890ff;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .step-content {
          .step-label {
            color: #333333;
            font-weight: 500;
          }
        }
      }
      
      &.error {
        .step-circle {
          background-color: #ff4d4f;
        }
        
        .step-content {
          .step-label {
            color: #ff4d4f;
          }
        }
      }
    }
    
    .step-line {
      position: absolute;
      left: 24rpx;
      top: 48rpx;
      width: 2rpx;
      height: 48rpx;
      background-color: #e8e8e8;
      transition: background-color 0.3s ease;
      z-index: 1;
      
      &.completed {
        background-color: #52c41a;
      }
    }
  }
  
  .current-message {
    margin-top: 32rpx;
    padding: 24rpx;
    background-color: #f0f5ff;
    border-radius: 12rpx;
    
    .message-text {
      font-size: 28rpx;
      color: #1890ff;
      line-height: 40rpx;
    }
  }
  
  .error-container {
    margin-top: 32rpx;
    padding: 24rpx;
    background-color: #fff1f0;
    border-radius: 12rpx;
    text-align: center;
    
    .error-text {
      font-size: 28rpx;
      color: #ff4d4f;
      line-height: 40rpx;
      display: block;
      margin-bottom: 24rpx;
    }
    
    .retry-btn {
      width: 160rpx;
      height: 64rpx;
      line-height: 64rpx;
      background-color: #ff4d4f;
      color: #ffffff;
      font-size: 28rpx;
      border-radius: 32rpx;
      border: none;
    }
  }
}
</style>