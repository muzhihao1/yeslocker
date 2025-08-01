<template>
  <view class="feedback-page">
    <!-- Page Header -->
    <view class="page-header">
      <text class="page-title">意见反馈</text>
    </view>
    
    <!-- Feedback Form -->
    <view class="feedback-form">
      <!-- Feedback Type -->
      <view class="form-group">
        <text class="form-label">反馈类型</text>
        <view class="type-list">
          <view 
            class="type-item" 
            v-for="type in feedbackTypes" 
            :key="type.value"
            :class="{ active: selectedType === type.value }"
            @click="selectType(type.value)"
          >
            {{ type.label }}
          </view>
        </view>
      </view>
      
      <!-- Feedback Content -->
      <view class="form-group">
        <text class="form-label">反馈内容</text>
        <textarea 
          class="feedback-textarea"
          v-model="content"
          placeholder="请详细描述您遇到的问题或建议（10-500字）"
          maxlength="500"
        />
        <text class="char-count">{{ content.length }}/500</text>
      </view>
      
      <!-- Upload Images -->
      <view class="form-group">
        <text class="form-label">上传图片（选填）</text>
        <view class="image-upload">
          <view class="image-item" v-for="(image, index) in images" :key="index">
            <image :src="image" mode="aspectFill" @click="previewImage(index)"></image>
            <view class="delete-btn" @click="deleteImage(index)">×</view>
          </view>
          <view class="add-image" v-if="images.length < 4" @click="chooseImage">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
        <text class="upload-tip">最多上传4张图片，支持jpg/png格式</text>
      </view>
      
      <!-- Contact Info -->
      <view class="form-group">
        <text class="form-label">联系方式（选填）</text>
        <input 
          class="contact-input"
          v-model="contact"
          placeholder="手机号或邮箱，方便我们联系您"
        />
      </view>
    </view>
    
    <!-- Submit Button -->
    <view class="submit-section">
      <button class="submit-btn" @click="submitFeedback" :disabled="!canSubmit">
        提交反馈
      </button>
    </view>
    
    <!-- History Link -->
    <view class="history-link" @click="viewHistory">
      <text>查看我的反馈记录</text>
      <text class="arrow-icon">›</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FeedbackPage',
  data() {
    return {
      feedbackTypes: [
        { label: '功能异常', value: 'bug' },
        { label: '体验问题', value: 'experience' },
        { label: '功能建议', value: 'suggestion' },
        { label: '其他', value: 'other' }
      ],
      selectedType: 'bug',
      content: '',
      images: [],
      contact: ''
    }
  },
  computed: {
    canSubmit() {
      return this.selectedType && this.content.length >= 10
    }
  },
  methods: {
    selectType(value) {
      this.selectedType = value
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 4 - this.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths]
        }
      })
    },
    
    previewImage(index) {
      uni.previewImage({
        urls: this.images,
        current: index
      })
    },
    
    deleteImage(index) {
      this.images.splice(index, 1)
    },
    
    async submitFeedback() {
      if (!this.canSubmit) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: '提交中...'
      })
      
      try {
        // TODO: 调用提交反馈API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        uni.hideLoading()
        uni.showToast({
          title: '提交成功',
          icon: 'success'
        })
        
        // 清空表单
        setTimeout(() => {
          this.selectedType = 'bug'
          this.content = ''
          this.images = []
          this.contact = ''
          
          uni.navigateBack()
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      }
    },
    
    viewHistory() {
      uni.navigateTo({
        url: '/pages/common/feedback-history'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 32rpx;
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

.feedback-form {
  background-color: #ffffff;
  margin-top: 24rpx;
  padding: 32rpx;
  
  .form-group {
    margin-bottom: 48rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .form-label {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 24rpx;
      display: block;
    }
  }
}

// Feedback Type
.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  
  .type-item {
    padding: 16rpx 32rpx;
    background-color: #f5f6f7;
    border-radius: 32rpx;
    font-size: 28rpx;
    color: #666666;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    
    &.active {
      background-color: #e6f7ff;
      color: #1890ff;
      border-color: #1890ff;
    }
  }
}

// Feedback Content
.feedback-textarea {
  width: 100%;
  height: 300rpx;
  padding: 24rpx;
  background-color: #f5f6f7;
  border-radius: 16rpx;
  font-size: 30rpx;
  line-height: 44rpx;
  box-sizing: border-box;
}

.char-count {
  font-size: 26rpx;
  color: #999999;
  text-align: right;
  margin-top: 16rpx;
  display: block;
}

// Image Upload
.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  
  .image-item {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    
    image {
      width: 100%;
      height: 100%;
      border-radius: 16rpx;
    }
    
    .delete-btn {
      position: absolute;
      top: -12rpx;
      right: -12rpx;
      width: 48rpx;
      height: 48rpx;
      background-color: rgba(0, 0, 0, 0.6);
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
    }
  }
  
  .add-image {
    width: 160rpx;
    height: 160rpx;
    background-color: #f5f6f7;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2rpx dashed #d9d9d9;
    
    .add-icon {
      font-size: 48rpx;
      color: #999999;
      margin-bottom: 8rpx;
    }
    
    .add-text {
      font-size: 24rpx;
      color: #999999;
    }
  }
}

.upload-tip {
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
  display: block;
}

// Contact Input
.contact-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: #f5f6f7;
  border-radius: 16rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

// Submit Section
.submit-section {
  padding: 48rpx 32rpx;
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    background-color: #1890ff;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 44rpx;
    border: none;
    
    &:disabled {
      background-color: #d9d9d9;
      color: #ffffff;
    }
  }
}

// History Link
.history-link {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx;
  
  text {
    font-size: 28rpx;
    color: #1890ff;
  }
  
  .arrow-icon {
    margin-left: 8rpx;
  }
}
</style>