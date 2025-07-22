<template>
  <view class="identity-verify">
    <view class="verify-header">
      <text class="verify-title">{{ title }}</text>
      <text class="verify-desc">{{ description }}</text>
    </view>

    <!-- User Info Display -->
    <user-card 
      v-if="userInfo && currentStep > 0"
      :avatar-url="userInfo.avatarUrl"
      :user-name="userInfo.userName"
      :phone-number="userInfo.phoneNumber"
      :status="verificationStatus"
      class="user-info-card"
    />

    <!-- Verification Steps -->
    <view class="verify-steps">
      <!-- Step 1: Phone Number -->
      <view class="step-item" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
        <view class="step-header">
          <view class="step-icon">
            <text v-if="currentStep > 1">✓</text>
            <text v-else>1</text>
          </view>
          <text class="step-title">手机号验证</text>
        </view>
        
        <view v-if="currentStep === 1" class="step-content">
          <view class="input-group">
            <input 
              type="number"
              class="phone-input"
              placeholder="请输入手机号"
              v-model="phoneNumber"
              maxlength="11"
              @input="handlePhoneInput"
            />
            <button 
              class="code-btn"
              :disabled="!canSendCode || codeCountdown > 0"
              @click="sendVerificationCode"
            >
              {{ codeCountdown > 0 ? `${codeCountdown}s后重试` : '获取验证码' }}
            </button>
          </view>
          
          <view class="input-group" v-if="codeSent">
            <input 
              type="number"
              class="code-input"
              placeholder="请输入验证码"
              v-model="verificationCode"
              maxlength="6"
            />
          </view>
          
          <button 
            class="verify-btn"
            :disabled="!canVerifyPhone"
            @click="verifyPhone"
          >
            验证手机号
          </button>
        </view>
      </view>

      <!-- Step 2: Real Name -->
      <view class="step-item" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
        <view class="step-header">
          <view class="step-icon">
            <text v-if="currentStep > 2">✓</text>
            <text v-else>2</text>
          </view>
          <text class="step-title">实名认证</text>
        </view>
        
        <view v-if="currentStep === 2" class="step-content">
          <view class="input-group">
            <text class="input-label">真实姓名</text>
            <input 
              type="text"
              class="name-input"
              placeholder="请输入真实姓名"
              v-model="realName"
            />
          </view>
          
          <view class="input-group">
            <text class="input-label">身份证号</text>
            <input 
              type="idcard"
              class="idcard-input"
              placeholder="请输入身份证号"
              v-model="idCard"
              maxlength="18"
            />
          </view>
          
          <view class="agreement">
            <checkbox-group @change="handleAgreementChange">
              <label class="agreement-label">
                <checkbox :value="true" :checked="agreementChecked" />
                <text>我已阅读并同意</text>
                <text class="agreement-link" @click.stop="showAgreement">《用户协议》</text>
                <text>和</text>
                <text class="agreement-link" @click.stop="showPrivacy">《隐私政策》</text>
              </label>
            </checkbox-group>
          </view>
          
          <button 
            class="verify-btn"
            :disabled="!canVerifyRealName"
            @click="verifyRealName"
          >
            提交认证
          </button>
        </view>
      </view>

      <!-- Step 3: Face Recognition (Optional) -->
      <view class="step-item" :class="{ active: currentStep === 3, completed: currentStep > 3 }" v-if="enableFaceRecognition">
        <view class="step-header">
          <view class="step-icon">
            <text v-if="currentStep > 3">✓</text>
            <text v-else>3</text>
          </view>
          <text class="step-title">人脸识别</text>
        </view>
        
        <view v-if="currentStep === 3" class="step-content">
          <view class="face-recognition">
            <image src="/static/face-recognition.png" mode="aspectFit" class="face-icon" />
            <text class="face-desc">请正对摄像头，保持光线充足</text>
            <button class="face-btn" @click="startFaceRecognition">
              开始人脸识别
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- Verification Result -->
    <view v-if="verificationComplete" class="verify-result">
      <view class="result-icon" :class="{ success: verificationSuccess }">
        <text v-if="verificationSuccess">✓</text>
        <text v-else>✗</text>
      </view>
      <text class="result-text">
        {{ verificationSuccess ? '身份验证成功' : '身份验证失败' }}
      </text>
      <text class="result-desc" v-if="!verificationSuccess">
        {{ errorMessage }}
      </text>
    </view>
  </view>
</template>

<script>
import UserCard from '../atoms/UserCard.vue'

export default {
  name: 'IdentityVerify',
  components: {
    UserCard
  },
  props: {
    title: {
      type: String,
      default: '身份验证'
    },
    description: {
      type: String,
      default: '为了保障您的财产安全，首次使用需要进行身份验证'
    },
    enableFaceRecognition: {
      type: Boolean,
      default: false
    },
    userInfo: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentStep: 1,
      phoneNumber: '',
      verificationCode: '',
      realName: '',
      idCard: '',
      agreementChecked: false,
      codeSent: false,
      codeCountdown: 0,
      verificationComplete: false,
      verificationSuccess: false,
      errorMessage: '',
      verificationStatus: 'pending'
    }
  },
  computed: {
    canSendCode() {
      return /^1[3-9]\d{9}$/.test(this.phoneNumber)
    },
    canVerifyPhone() {
      return this.canSendCode && this.verificationCode.length === 6
    },
    canVerifyRealName() {
      return this.realName.length >= 2 && 
             /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(this.idCard) &&
             this.agreementChecked
    }
  },
  mounted() {
    // 如果已有手机号，直接跳到第二步
    if (this.userInfo && this.userInfo.phoneNumber) {
      this.phoneNumber = this.userInfo.phoneNumber
      this.currentStep = 2
    }
  },
  methods: {
    handlePhoneInput(e) {
      // 限制只能输入数字
      this.phoneNumber = e.detail.value.replace(/\D/g, '')
    },
    
    sendVerificationCode() {
      if (!this.canSendCode || this.codeCountdown > 0) return
      
      // TODO: 调用发送验证码API
      uni.showLoading({ title: '发送中...' })
      
      setTimeout(() => {
        uni.hideLoading()
        this.codeSent = true
        this.startCountdown()
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
      }, 1000)
    },
    
    startCountdown() {
      this.codeCountdown = 60
      const timer = setInterval(() => {
        this.codeCountdown--
        if (this.codeCountdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    async verifyPhone() {
      if (!this.canVerifyPhone) return
      
      uni.showLoading({ title: '验证中...' })
      
      try {
        // TODO: 调用验证手机号API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        uni.hideLoading()
        this.currentStep = 2
        this.$emit('step-complete', {
          step: 'phone',
          data: { phoneNumber: this.phoneNumber }
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '验证失败',
          icon: 'none'
        })
      }
    },
    
    handleAgreementChange(e) {
      this.agreementChecked = e.detail.value.length > 0
    },
    
    showAgreement() {
      // TODO: 显示用户协议
      uni.navigateTo({
        url: '/pages/common/agreement'
      })
    },
    
    showPrivacy() {
      // TODO: 显示隐私政策
      uni.navigateTo({
        url: '/pages/common/privacy'
      })
    },
    
    async verifyRealName() {
      if (!this.canVerifyRealName) return
      
      uni.showLoading({ title: '认证中...' })
      
      try {
        // TODO: 调用实名认证API
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        uni.hideLoading()
        
        if (this.enableFaceRecognition) {
          this.currentStep = 3
        } else {
          this.completeVerification(true)
        }
        
        this.$emit('step-complete', {
          step: 'realname',
          data: {
            realName: this.realName,
            idCard: this.idCard
          }
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '认证失败',
          icon: 'none'
        })
      }
    },
    
    startFaceRecognition() {
      // TODO: 调用微信人脸识别API
      uni.showLoading({ title: '准备中...' })
      
      setTimeout(() => {
        uni.hideLoading()
        // 模拟人脸识别成功
        this.completeVerification(true)
        this.$emit('step-complete', {
          step: 'face',
          data: { faceVerified: true }
        })
      }, 1500)
    },
    
    completeVerification(success) {
      this.verificationComplete = true
      this.verificationSuccess = success
      this.verificationStatus = success ? 'verified' : 'normal'
      
      if (success) {
        this.$emit('complete', {
          phoneNumber: this.phoneNumber,
          realName: this.realName,
          idCard: this.idCard
        })
      } else {
        this.errorMessage = '身份验证失败，请重试'
        this.$emit('error', this.errorMessage)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.identity-verify {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .verify-header {
    text-align: center;
    margin-bottom: 48rpx;
    
    .verify-title {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 16rpx;
    }
    
    .verify-desc {
      display: block;
      font-size: 28rpx;
      color: #666666;
      line-height: 40rpx;
    }
  }
  
  .user-info-card {
    margin-bottom: 32rpx;
  }
  
  .verify-steps {
    .step-item {
      margin-bottom: 32rpx;
      padding: 24rpx;
      border: 2rpx solid #e8e8e8;
      border-radius: 16rpx;
      transition: all 0.3s;
      
      &.active {
        border-color: #1890ff;
        background-color: #f0f9ff;
      }
      
      &.completed {
        border-color: #52c41a;
        background-color: #f6ffed;
      }
      
      .step-header {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
        
        .step-icon {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          background-color: #e8e8e8;
          color: #999999;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          font-weight: 500;
          margin-right: 16rpx;
          transition: all 0.3s;
        }
        
        .step-title {
          font-size: 32rpx;
          font-weight: 500;
          color: #333333;
        }
      }
      
      &.active .step-icon {
        background-color: #1890ff;
        color: #ffffff;
      }
      
      &.completed .step-icon {
        background-color: #52c41a;
        color: #ffffff;
      }
      
      .step-content {
        margin-left: 64rpx;
        
        .input-group {
          margin-bottom: 24rpx;
          
          .input-label {
            display: block;
            font-size: 28rpx;
            color: #666666;
            margin-bottom: 12rpx;
          }
          
          input {
            width: 100%;
            height: 88rpx;
            padding: 0 24rpx;
            border: 2rpx solid #e8e8e8;
            border-radius: 12rpx;
            font-size: 32rpx;
            
            &.phone-input {
              width: calc(100% - 200rpx);
              margin-right: 16rpx;
            }
          }
          
          .code-btn {
            display: inline-block;
            width: 180rpx;
            height: 88rpx;
            line-height: 88rpx;
            text-align: center;
            background-color: #1890ff;
            color: #ffffff;
            border-radius: 12rpx;
            font-size: 28rpx;
            
            &[disabled] {
              background-color: #d9d9d9;
            }
          }
        }
        
        .verify-btn {
          width: 100%;
          height: 88rpx;
          background-color: #1890ff;
          color: #ffffff;
          border-radius: 44rpx;
          font-size: 32rpx;
          font-weight: 500;
          
          &[disabled] {
            background-color: #d9d9d9;
          }
        }
        
        .agreement {
          margin: 24rpx 0;
          
          .agreement-label {
            display: flex;
            align-items: center;
            font-size: 26rpx;
            color: #666666;
            
            checkbox {
              margin-right: 12rpx;
            }
            
            .agreement-link {
              color: #1890ff;
              margin: 0 4rpx;
            }
          }
        }
        
        .face-recognition {
          text-align: center;
          padding: 48rpx 0;
          
          .face-icon {
            width: 160rpx;
            height: 160rpx;
            margin-bottom: 32rpx;
          }
          
          .face-desc {
            display: block;
            font-size: 28rpx;
            color: #666666;
            margin-bottom: 32rpx;
          }
          
          .face-btn {
            width: 280rpx;
            height: 88rpx;
            background-color: #1890ff;
            color: #ffffff;
            border-radius: 44rpx;
            font-size: 32rpx;
            font-weight: 500;
            margin: 0 auto;
          }
        }
      }
    }
  }
  
  .verify-result {
    text-align: center;
    padding: 48rpx 0;
    
    .result-icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 60rpx;
      color: #ffffff;
      margin: 0 auto 32rpx;
      
      &.success {
        background-color: #52c41a;
      }
      
      &:not(.success) {
        background-color: #ff4d4f;
      }
    }
    
    .result-text {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 16rpx;
    }
    
    .result-desc {
      display: block;
      font-size: 28rpx;
      color: #666666;
    }
  }
}
</style>