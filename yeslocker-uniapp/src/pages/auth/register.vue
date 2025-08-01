<template>
  <view class="register-page">
    <!-- Progress Steps -->
    <view class="progress-container">
      <view class="progress-wrapper">
        <view class="progress-track"></view>
        <view class="progress-step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <view class="step-number">{{ currentStep > 1 ? '✓' : '1' }}</view>
          <text class="step-text">身份验证</text>
        </view>
        <view class="progress-step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <view class="step-number">{{ currentStep > 2 ? '✓' : '2' }}</view>
          <text class="step-text">选择门店</text>
        </view>
        <view class="progress-step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
          <view class="step-number">{{ currentStep > 3 ? '✓' : '3' }}</view>
          <text class="step-text">选择储物柜</text>
        </view>
        <view class="progress-step" :class="{ active: currentStep >= 4 }">
          <view class="step-number">4</view>
          <text class="step-text">完成注册</text>
        </view>
      </view>
    </view>

    <!-- Step 1: Identity Verification -->
    <view v-if="currentStep === 1" class="step-content">
      <view class="form-section">
        <text class="section-title">身份信息验证</text>
        <text class="section-desc">为保障您的权益，请完成实名认证</text>
        
        <view class="form-group">
          <text class="form-label">真实姓名</text>
          <input 
            v-model="formData.realName" 
            class="form-input" 
            placeholder="请输入您的真实姓名"
            @blur="validateName"
          />
        </view>
        
        <view class="form-group">
          <text class="form-label">身份证号</text>
          <input 
            v-model="formData.idCard" 
            class="form-input" 
            placeholder="请输入18位身份证号"
            maxlength="18"
            @blur="validateIdCard"
          />
        </view>
        
        <view class="form-group">
          <text class="form-label">手机号码</text>
          <view class="input-with-button">
            <input 
              v-model="formData.mobile" 
              class="form-input" 
              placeholder="请输入手机号"
              type="number"
              maxlength="11"
              @blur="validatePhone"
            />
            <button 
              class="sms-button" 
              :disabled="smsCountdown > 0"
              @click="sendSms"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}秒后重试` : '获取验证码' }}
            </button>
          </view>
        </view>
        
        <view class="form-group">
          <text class="form-label">验证码</text>
          <input 
            v-model="formData.smsCode" 
            class="form-input" 
            placeholder="请输入验证码"
            type="number"
            maxlength="6"
          />
        </view>
      </view>
      
      <view class="button-container">
        <button class="btn-primary" :disabled="!canProceed" @click="verifyIdentity">
          下一步
        </button>
      </view>
    </view>

    <!-- Step 4: Registration Complete -->
    <view v-if="currentStep === 4" class="step-content success-content">
      <view class="success-icon">✓</view>
      <text class="success-title">注册成功！</text>
      <text class="success-desc">您已成功完成注册，现在可以开始使用储物柜服务了</text>
      
      <view class="locker-info">
        <text class="info-label">您的专属储物柜</text>
        <text class="info-value">{{ userInfo.locker_number }}</text>
      </view>
      
      <view class="button-container">
        <button class="btn-primary" @click="goToHome">
          开始使用
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { sendSmsCode, verifyIdentity } from '@/api/auth'

export default {
  name: 'RegisterPage',
  data() {
    return {
      currentStep: 1,
      formData: {
        realName: '',
        idCard: '',
        mobile: '',
        smsCode: ''
      },
      smsCountdown: 0,
      userInfo: {},
      loading: false
    }
  },
  computed: {
    canProceed() {
      return this.formData.realName && 
             this.formData.idCard && 
             this.formData.mobile && 
             this.formData.smsCode &&
             this.validateIdCard(this.formData.idCard, true) &&
             this.validatePhone(this.formData.mobile, true)
    }
  },
  onLoad() {
    // 检查是否已经登录但未完成注册
    const token = uni.getStorageSync('token')
    const isVerified = uni.getStorageSync('isVerified')
    
    if (!token) {
      uni.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: () => {
          uni.navigateBack()
        }
      })
    } else if (isVerified) {
      uni.showModal({
        title: '提示',
        content: '您已完成注册',
        showCancel: false,
        success: () => {
          uni.switchTab({
            url: '/pages/home/index'
          })
        }
      })
    }
  },
  methods: {
    validateName() {
      if (!this.formData.realName) {
        uni.showToast({
          title: '请输入真实姓名',
          icon: 'none'
        })
        return false
      }
      if (this.formData.realName.length < 2 || this.formData.realName.length > 20) {
        uni.showToast({
          title: '姓名长度应在2-20个字符之间',
          icon: 'none'
        })
        return false
      }
      return true
    },
    
    validateIdCard(idCard, silent = false) {
      const id = idCard || this.formData.idCard
      if (!id) {
        if (!silent) {
          uni.showToast({
            title: '请输入身份证号',
            icon: 'none'
          })
        }
        return false
      }
      
      // 简单的身份证号验证
      const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      if (!reg.test(id)) {
        if (!silent) {
          uni.showToast({
            title: '身份证号格式不正确',
            icon: 'none'
          })
        }
        return false
      }
      return true
    },
    
    validatePhone(phone, silent = false) {
      const mobile = phone || this.formData.mobile
      if (!mobile) {
        if (!silent) {
          uni.showToast({
            title: '请输入手机号',
            icon: 'none'
          })
        }
        return false
      }
      
      const reg = /^1[3-9]\d{9}$/
      if (!reg.test(mobile)) {
        if (!silent) {
          uni.showToast({
            title: '手机号格式不正确',
            icon: 'none'
          })
        }
        return false
      }
      return true
    },
    
    async sendSms() {
      if (!this.validatePhone()) {
        return
      }
      
      try {
        uni.showLoading({
          title: '发送中...'
        })
        
        const res = await sendSmsCode(this.formData.mobile)
        
        if (res.errno === 0) {
          uni.hideLoading()
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
          
          // 开始倒计时
          this.smsCountdown = 60
          const timer = setInterval(() => {
            this.smsCountdown--
            if (this.smsCountdown <= 0) {
              clearInterval(timer)
            }
          }, 1000)
        } else {
          throw new Error(res.errmsg || '发送失败')
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '发送失败',
          icon: 'none'
        })
      }
    },
    
    async verifyIdentity() {
      if (!this.canProceed) {
        return
      }
      
      try {
        uni.showLoading({
          title: '验证中...'
        })
        
        const res = await verifyIdentity(this.formData)
        
        if (res.errno === 0) {
          uni.hideLoading()
          
          // 保存注册数据，供下一步使用
          uni.setStorageSync('registrationData', this.formData)
          
          // 跳转到选择门店页面
          uni.navigateTo({
            url: '/pages/auth/store-select'
          })
        } else {
          throw new Error(res.errmsg || '验证失败')
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '验证失败',
          icon: 'none'
        })
      }
    },
    
    goToHome() {
      uni.switchTab({
        url: '/pages/home/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.progress-container {
  padding: 40rpx 32rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .progress-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .progress-track {
      position: absolute;
      top: 32rpx;
      left: 15%;
      right: 15%;
      height: 4rpx;
      background: #e8e8e8;
      z-index: 1;
    }
    
    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      z-index: 2;
      
      .step-number {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        background: #ffffff;
        border: 4rpx solid #e8e8e8;
        color: #999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        font-weight: 600;
        margin-bottom: 12rpx;
        transition: all 0.3s;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      }
      
      .step-text {
        font-size: 26rpx;
        color: #999999;
        transition: all 0.3s;
        font-weight: 500;
        text-align: center;
      }
      
      &.active {
        .step-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: #ffffff;
          box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
        }
        
        .step-text {
          color: #667eea;
          font-weight: 600;
        }
      }
      
      &.completed {
        .step-number {
          background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
          border-color: #52c41a;
          color: #ffffff;
          box-shadow: 0 6rpx 20rpx rgba(82, 196, 26, 0.3);
        }
        
        .step-text {
          color: #52c41a;
          font-weight: 600;
        }
      }
    }
  }
}

.step-content {
  padding: 32rpx;
  
  .form-section {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 40rpx 32rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    
    .section-title {
      display: block;
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 12rpx;
    }
    
    .section-desc {
      display: block;
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 40rpx;
    }
    
    .form-group {
      margin-bottom: 32rpx;
      
      .form-label {
        display: block;
        font-size: 30rpx;
        color: #333333;
        margin-bottom: 16rpx;
        font-weight: 500;
      }
      
      .form-input {
        width: 100%;
        height: 88rpx;
        background: #f5f6f7;
        border-radius: 12rpx;
        padding: 0 24rpx;
        font-size: 30rpx;
        color: #333333;
        border: 2rpx solid transparent;
        transition: all 0.3s;
        
        &:focus {
          background: #ffffff;
          border-color: #667eea;
        }
      }
      
      .input-with-button {
        display: flex;
        gap: 20rpx;
        
        .form-input {
          flex: 1;
        }
        
        .sms-button {
          width: 200rpx;
          height: 88rpx;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          border-radius: 12rpx;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          
          &:disabled {
            background: #cccccc;
            color: #ffffff;
          }
          
          &:active:not(:disabled) {
            opacity: 0.8;
          }
        }
      }
    }
  }
  
  &.success-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 100rpx;
    
    .success-icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      color: #ffffff;
      font-size: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40rpx;
      box-shadow: 0 8rpx 32rpx rgba(82, 196, 26, 0.3);
    }
    
    .success-title {
      font-size: 40rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
    }
    
    .success-desc {
      font-size: 30rpx;
      color: #666666;
      text-align: center;
      margin-bottom: 60rpx;
      padding: 0 40rpx;
    }
    
    .locker-info {
      background: #f5f6f7;
      border-radius: 16rpx;
      padding: 32rpx 60rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 60rpx;
      
      .info-label {
        font-size: 28rpx;
        color: #666666;
        margin-bottom: 12rpx;
      }
      
      .info-value {
        font-size: 48rpx;
        font-weight: bold;
        color: #667eea;
      }
    }
  }
}

.button-container {
  padding: 40rpx 32rpx;
  
  .btn-primary {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
    
    &:active:not(:disabled) {
      opacity: 0.8;
    }
    
    &:disabled {
      opacity: 0.5;
    }
  }
}
</style>