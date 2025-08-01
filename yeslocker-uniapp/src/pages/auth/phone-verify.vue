<template>
  <view class="phone-verify-page">
    <view class="header">
      <text class="title">手机号验证</text>
      <text class="subtitle">为保障您的账户安全，请完成手机号验证</text>
    </view>
    
    <view class="content">
      <!-- 微信授权获取手机号 -->
      <view class="wechat-auth-section">
        <view class="auth-icon">
          <text class="iconfont icon-phone"></text>
        </view>
        <text class="auth-desc">使用微信绑定的手机号，快速完成验证</text>
        
        <!-- #ifdef MP-WEIXIN -->
        <button 
          class="auth-button"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          <text class="button-icon">📱</text>
          <text class="button-text">微信快捷验证</text>
        </button>
        <!-- #endif -->
        
        <!-- #ifndef MP-WEIXIN -->
        <button class="auth-button" @click="mockPhoneAuth">
          <text class="button-icon">📱</text>
          <text class="button-text">模拟手机号验证</text>
        </button>
        <!-- #endif -->
      </view>
      
      <!-- 或分割线 -->
      <view class="divider">
        <view class="line"></view>
        <text class="or-text">或</text>
        <view class="line"></view>
      </view>
      
      <!-- 手动输入手机号 -->
      <view class="manual-input-section">
        <text class="section-title">手动输入手机号</text>
        
        <view class="form-group">
          <input 
            v-model="phoneNumber" 
            class="phone-input" 
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
            @input="onPhoneInput"
          />
        </view>
        
        <view class="form-group">
          <view class="sms-row">
            <input 
              v-model="smsCode" 
              class="sms-input" 
              placeholder="请输入验证码"
              type="number"
              maxlength="6"
            />
            <button 
              class="sms-button" 
              :disabled="!canSendSms || smsCountdown > 0"
              @click="sendSms"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}秒后重试` : '获取验证码' }}
            </button>
          </view>
        </view>
        
        <button 
          class="verify-button" 
          :disabled="!canVerify"
          @click="verifyPhone"
        >
          完成验证
        </button>
      </view>
      
      <!-- 提示信息 -->
      <view class="tips">
        <text class="tip-item">• 手机号仅用于账户安全验证</text>
        <text class="tip-item">• 我们将严格保护您的隐私信息</text>
        <text class="tip-item">• 验证后可正常使用储物柜服务</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getPhoneNumber } from '@/utils/wechat'
import { sendSmsCode, verifyIdentity } from '@/api/auth'

export default {
  name: 'PhoneVerify',
  data() {
    return {
      phoneNumber: '',
      smsCode: '',
      smsCountdown: 0,
      loading: false
    }
  },
  computed: {
    canSendSms() {
      return /^1[3-9]\d{9}$/.test(this.phoneNumber)
    },
    canVerify() {
      return this.canSendSms && this.smsCode.length === 6
    }
  },
  onLoad(options) {
    // 检查登录状态
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: () => {
          uni.navigateBack()
        }
      })
      return
    }
    
    // 检查是否已验证
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo && userInfo.mobile && userInfo.isVerified) {
      uni.showModal({
        title: '提示',
        content: '您已完成手机号验证',
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
    // 微信授权获取手机号
    async onGetPhoneNumber(e) {
      console.log('[PhoneVerify] 微信手机号授权事件:', e)
      
      if (e.detail.errMsg !== 'getPhoneNumber:ok') {
        uni.showToast({
          title: '您已取消授权',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: '验证中...'
      })
      
      try {
        // 获取手机号
        const phoneNumber = await getPhoneNumber(e.detail.code)
        console.log('[PhoneVerify] 获取到手机号:', phoneNumber)
        
        // 调用验证接口
        const res = await verifyIdentity({
          mobile: phoneNumber,
          wxPhoneAuth: true // 标记为微信授权验证
        })
        
        if (res.errno === 0) {
          // 更新本地用户信息
          const userInfo = uni.getStorageSync('userInfo') || {}
          userInfo.mobile = phoneNumber
          userInfo.phoneNumber = phoneNumber
          userInfo.isVerified = true
          userInfo.identityVerified = true
          uni.setStorageSync('userInfo', userInfo)
          uni.setStorageSync('isVerified', true)
          
          uni.hideLoading()
          uni.showToast({
            title: '验证成功',
            icon: 'success'
          })
          
          // 延迟跳转
          setTimeout(() => {
            // 如果还没有分配储物柜，跳转到选择页面
            if (!userInfo.lockerId) {
              uni.navigateTo({
                url: '/pages/auth/store-select'
              })
            } else {
              uni.switchTab({
                url: '/pages/home/index'
              })
            }
          }, 1500)
        } else {
          throw new Error(res.errmsg || '验证失败')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('[PhoneVerify] 验证失败:', error)
        uni.showToast({
          title: error.message || '验证失败',
          icon: 'none'
        })
      }
    },
    
    // 模拟手机号授权（开发环境）
    async mockPhoneAuth() {
      // #ifndef MP-WEIXIN
      console.log('[PhoneVerify] 模拟微信手机号授权')
      
      const mockPhoneNumbers = [
        '13800138000',
        '13900139000',
        '13700137000',
        '13600136000'
      ]
      
      // 随机选择一个手机号
      const phoneNumber = mockPhoneNumbers[Math.floor(Math.random() * mockPhoneNumbers.length)]
      
      uni.showModal({
        title: '模拟授权',
        content: `将使用手机号 ${phoneNumber} 进行验证`,
        success: async (res) => {
          if (res.confirm) {
            // 模拟授权事件
            await this.onGetPhoneNumber({
              detail: {
                errMsg: 'getPhoneNumber:ok',
                code: 'mock-phone-code-' + phoneNumber
              }
            })
          }
        }
      })
      // #endif
    },
    
    // 手机号输入
    onPhoneInput(e) {
      this.phoneNumber = e.detail.value
    },
    
    // 发送验证码
    async sendSms() {
      if (!this.canSendSms) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({
          title: '发送中...'
        })
        
        const res = await sendSmsCode(this.phoneNumber)
        
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
    
    // 手动验证手机号
    async verifyPhone() {
      if (!this.canVerify) {
        return
      }
      
      try {
        uni.showLoading({
          title: '验证中...'
        })
        
        const res = await verifyIdentity({
          mobile: this.phoneNumber,
          smsCode: this.smsCode
        })
        
        if (res.errno === 0) {
          // 更新本地用户信息
          const userInfo = uni.getStorageSync('userInfo') || {}
          userInfo.mobile = this.phoneNumber
          userInfo.phoneNumber = this.phoneNumber
          userInfo.isVerified = true
          userInfo.identityVerified = true
          uni.setStorageSync('userInfo', userInfo)
          uni.setStorageSync('isVerified', true)
          
          uni.hideLoading()
          uni.showToast({
            title: '验证成功',
            icon: 'success'
          })
          
          // 延迟跳转
          setTimeout(() => {
            // 如果还没有分配储物柜，跳转到选择页面
            if (!userInfo.lockerId) {
              uni.navigateTo({
                url: '/pages/auth/store-select'
              })
            } else {
              uni.switchTab({
                url: '/pages/home/index'
              })
            }
          }, 1500)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.phone-verify-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f6f7 0%, #ffffff 100%);
}

.header {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
  
  .title {
    display: block;
    font-size: 44rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 30rpx;
    color: #666;
    line-height: 1.5;
  }
}

.content {
  padding: 0 40rpx;
}

.wechat-auth-section {
  background: white;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .auth-icon {
    width: 120rpx;
    height: 120rpx;
    margin: 0 auto 32rpx;
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      font-size: 60rpx;
      color: white;
    }
  }
  
  .auth-desc {
    display: block;
    font-size: 30rpx;
    color: #666;
    margin-bottom: 40rpx;
    line-height: 1.5;
  }
  
  .auth-button {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
    color: white;
    border-radius: 48rpx;
    font-size: 32rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 8rpx 32rpx rgba(7, 193, 96, 0.3);
    
    .button-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }
    
    .button-text {
      font-size: 32rpx;
    }
    
    &:active {
      opacity: 0.8;
    }
  }
}

.divider {
  display: flex;
  align-items: center;
  margin: 60rpx 0;
  
  .line {
    flex: 1;
    height: 1rpx;
    background: #e5e5e5;
  }
  
  .or-text {
    margin: 0 32rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.manual-input-section {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 32rpx;
  }
  
  .form-group {
    margin-bottom: 32rpx;
    
    .phone-input,
    .sms-input {
      width: 100%;
      height: 88rpx;
      background: #f5f6f7;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 30rpx;
      color: #333;
      border: 2rpx solid transparent;
      transition: all 0.3s;
      
      &:focus {
        background: white;
        border-color: #07c160;
      }
    }
    
    .sms-row {
      display: flex;
      gap: 20rpx;
      
      .sms-input {
        flex: 1;
      }
      
      .sms-button {
        width: 200rpx;
        height: 88rpx;
        background: #f5f6f7;
        color: #07c160;
        border-radius: 12rpx;
        font-size: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2rpx solid #07c160;
        
        &:disabled {
          background: #f5f6f7;
          color: #999;
          border-color: #e5e5e5;
        }
        
        &:active:not(:disabled) {
          opacity: 0.8;
        }
      }
    }
  }
  
  .verify-button {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
    margin-top: 48rpx;
    
    &:active:not(:disabled) {
      opacity: 0.8;
    }
    
    &:disabled {
      opacity: 0.5;
    }
  }
}

.tips {
  margin-top: 60rpx;
  padding: 0 20rpx 60rpx;
  
  .tip-item {
    display: block;
    font-size: 26rpx;
    color: #999;
    line-height: 2;
  }
}
</style>