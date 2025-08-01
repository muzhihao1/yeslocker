# IdentityVerify 身份验证组件

## 组件介绍

IdentityVerify 是一个完整的身份验证流程分子组件。包含手机号验证、验证码发送、身份证上传等功能，用于用户首次使用时的身份认证流程。该组件由多个原子组件组合而成，提供完整的验证体验。

## 基础用法

```vue
<template>
  <identity-verify 
    @verify-success="handleVerifySuccess"
    @verify-fail="handleVerifyFail"
  />
</template>

<script>
import IdentityVerify from '@/components/molecules/IdentityVerify.vue'

export default {
  components: {
    IdentityVerify
  },
  methods: {
    handleVerifySuccess(userInfo) {
      console.log('验证成功:', userInfo)
      // 跳转到下一步
      uni.navigateTo({
        url: '/pages/storage/select-locker'
      })
    },
    handleVerifyFail(error) {
      console.error('验证失败:', error)
      uni.showToast({
        title: error.message,
        icon: 'none'
      })
    }
  }
}
</script>
```

## API 文档

### Props

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| mode | String | full | 否 | 验证模式：full(完整)/simple(简化) |
| skipIdCard | Boolean | false | 否 | 是否跳过身份证验证 |
| phoneNumber | String | - | 否 | 预填手机号 |
| autoSendCode | Boolean | false | 否 | 是否自动发送验证码 |
| maxRetry | Number | 3 | 否 | 最大重试次数 |
| codeLength | Number | 6 | 否 | 验证码长度 |
| countdown | Number | 60 | 否 | 验证码倒计时（秒） |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| verify-success | userInfo | 验证成功时触发 |
| verify-fail | error | 验证失败时触发 |
| step-change | step | 步骤变化时触发 |
| code-sent | phone | 验证码发送成功时触发 |
| retry | attemptCount | 重试时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| header | 自定义头部内容 |
| footer | 自定义底部内容 |
| tips | 自定义提示信息 |

### Methods

| 方法名 | 参数 | 说明 |
|--------|------|------|
| reset | - | 重置验证流程 |
| setPhone | phone | 设置手机号 |
| sendCode | - | 手动发送验证码 |
| validateCode | code | 验证验证码 |

## 验证流程

### 1. 完整模式 (mode="full")
```vue
<identity-verify 
  mode="full"
  @verify-success="handleSuccess"
>
  <template #header>
    <view class="verify-header">
      <text class="title">身份认证</text>
      <text class="subtitle">首次使用需要验证您的身份</text>
    </view>
  </template>
</identity-verify>
```

流程步骤：
1. 输入手机号
2. 获取并输入验证码
3. 上传身份证照片（正反面）
4. 人脸识别（可选）
5. 提交验证

### 2. 简化模式 (mode="simple")
```vue
<identity-verify 
  mode="simple"
  :skip-id-card="true"
  @verify-success="handleSuccess"
/>
```

流程步骤：
1. 输入手机号
2. 获取并输入验证码
3. 提交验证

## 高级用法

### 自定义验证步骤

```vue
<template>
  <identity-verify 
    ref="verifyRef"
    :auto-send-code="false"
    @step-change="handleStepChange"
    @verify-success="handleSuccess"
  >
    <template #tips>
      <view class="custom-tips" v-if="currentStep === 1">
        <text>请输入您的常用手机号</text>
        <text class="sub">该手机号将用于接收取件通知</text>
      </view>
      
      <view class="custom-tips" v-else-if="currentStep === 2">
        <text>验证码已发送至 {{ maskedPhone }}</text>
        <text class="sub">请在{{ countdown }}秒内输入</text>
      </view>
    </template>
    
    <template #footer>
      <view class="custom-actions">
        <button 
          v-if="currentStep === 1" 
          class="skip-btn"
          @click="skipVerification"
        >
          暂不验证
        </button>
      </view>
    </template>
  </identity-verify>
</template>

<script>
export default {
  data() {
    return {
      currentStep: 1,
      maskedPhone: '',
      countdown: 60
    }
  },
  methods: {
    handleStepChange(step) {
      this.currentStep = step
      if (step === 2) {
        this.startCountdown()
      }
    },
    handleSuccess(userInfo) {
      // 保存用户信息
      this.$store.commit('user/setUserInfo', userInfo)
      
      // 记录验证状态
      uni.setStorageSync('identityVerified', true)
      uni.setStorageSync('verifyTime', Date.now())
      
      // 跳转到下一步
      uni.redirectTo({
        url: '/pages/storage/select-locker'
      })
    },
    skipVerification() {
      uni.showModal({
        title: '提示',
        content: '未验证身份将无法使用储物柜服务',
        confirmText: '继续验证',
        cancelText: '暂不使用',
        success: (res) => {
          if (res.cancel) {
            uni.navigateBack()
          }
        }
      })
    },
    startCountdown() {
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
          this.countdown = 60
        }
      }, 1000)
    }
  }
}
</script>
```

### 集成第三方实名认证

```vue
<template>
  <identity-verify 
    ref="verifyComponent"
    @verify-success="handleVerifySuccess"
  >
    <!-- 自定义实名认证方式 -->
    <template #custom-verify>
      <view class="verify-options">
        <button class="verify-btn alipay" @click="useAlipayVerify">
          <image src="/static/alipay.png" />
          <text>支付宝认证</text>
        </button>
        
        <button class="verify-btn wechat" @click="useWechatVerify">
          <image src="/static/wechat.png" />
          <text>微信认证</text>
        </button>
        
        <button class="verify-btn bank" @click="useBankVerify">
          <image src="/static/bank.png" />
          <text>银行卡认证</text>
        </button>
      </view>
    </template>
  </identity-verify>
</template>

<script>
export default {
  methods: {
    async useAlipayVerify() {
      try {
        // 调用支付宝实名认证 SDK
        const result = await this.callAlipaySDK()
        if (result.success) {
          this.$refs.verifyComponent.handleThirdPartyVerify(result)
        }
      } catch (error) {
        uni.showToast({
          title: '支付宝认证失败',
          icon: 'none'
        })
      }
    },
    
    async useWechatVerify() {
      // 调用微信实名认证
      // #ifdef MP-WEIXIN
      wx.navigateToMiniProgram({
        appId: 'wx_verify_app_id',
        path: 'pages/verify/index',
        success: (res) => {
          // 处理返回结果
        }
      })
      // #endif
    },
    
    async useBankVerify() {
      // 银行卡四要素认证
      uni.navigateTo({
        url: '/pages/verify/bank-verify'
      })
    }
  }
}
</script>
```

### 错误处理和重试机制

```vue
<template>
  <view class="verify-container">
    <identity-verify 
      :max-retry="3"
      @verify-fail="handleVerifyFail"
      @retry="handleRetry"
    />
    
    <!-- 错误提示 -->
    <view class="error-tips" v-if="errorInfo">
      <view class="error-icon">⚠️</view>
      <text class="error-message">{{ errorInfo.message }}</text>
      <view class="error-actions">
        <button class="retry-btn" @click="retryVerification">
          重新验证
        </button>
        <button class="help-btn" @click="showHelp">
          需要帮助
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      errorInfo: null,
      retryCount: 0
    }
  },
  methods: {
    handleVerifyFail(error) {
      this.errorInfo = error
      
      // 根据错误类型显示不同提示
      switch (error.code) {
        case 'INVALID_PHONE':
          this.showError('手机号格式不正确')
          break
        case 'CODE_EXPIRED':
          this.showError('验证码已过期，请重新获取')
          break
        case 'CODE_ERROR':
          this.showError('验证码错误，请重新输入')
          break
        case 'ID_CARD_INVALID':
          this.showError('身份证信息无效')
          break
        case 'FACE_VERIFY_FAIL':
          this.showError('人脸识别失败，请确保光线充足')
          break
        case 'NETWORK_ERROR':
          this.showError('网络连接失败，请检查网络')
          break
        default:
          this.showError('验证失败，请重试')
      }
    },
    
    handleRetry(attemptCount) {
      this.retryCount = attemptCount
      if (attemptCount >= 3) {
        uni.showModal({
          title: '验证失败',
          content: '多次验证失败，请联系客服处理',
          confirmText: '联系客服',
          cancelText: '稍后再试',
          success: (res) => {
            if (res.confirm) {
              this.contactSupport()
            } else {
              uni.navigateBack()
            }
          }
        })
      }
    },
    
    showError(message) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      })
    },
    
    retryVerification() {
      this.errorInfo = null
      this.$refs.verifyComponent.reset()
    },
    
    showHelp() {
      uni.navigateTo({
        url: '/pages/help/verify-help'
      })
    },
    
    contactSupport() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      })
    }
  }
}
</script>
```

## 样式定制

### CSS 变量

```css
.identity-verify {
  --verify-primary-color: #1890ff;
  --verify-bg-color: #ffffff;
  --verify-border-color: #e8e8e8;
  --verify-text-color: #333333;
  --verify-input-height: 96rpx;
  --verify-button-height: 88rpx;
  --verify-step-size: 60rpx;
}
```

### 自定义主题

```vue
<template>
  <identity-verify class="custom-verify-theme">
    <!-- 组件内容 -->
  </identity-verify>
</template>

<style lang="scss" scoped>
.custom-verify-theme {
  --verify-primary-color: #52c41a;
  --verify-bg-color: #f6ffed;
  
  :deep(.verify-input) {
    border: 2rpx solid #b7eb8f;
    background-color: #ffffff;
    
    &:focus {
      border-color: #52c41a;
      box-shadow: 0 0 0 4rpx rgba(82, 196, 26, 0.1);
    }
  }
  
  :deep(.verify-button) {
    background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
  }
  
  :deep(.step-indicator) {
    &.active {
      background-color: #52c41a;
      color: #ffffff;
    }
    
    &.completed {
      background-color: #95de64;
      color: #ffffff;
    }
  }
}
</style>
```

## 完整示例

```vue
<template>
  <view class="verify-page">
    <identity-verify 
      ref="identityVerify"
      mode="full"
      :phone-number="prefilledPhone"
      :auto-send-code="false"
      :max-retry="3"
      @step-change="onStepChange"
      @code-sent="onCodeSent"
      @verify-success="onVerifySuccess"
      @verify-fail="onVerifyFail"
    >
      <!-- 自定义头部 -->
      <template #header>
        <view class="page-header">
          <image src="/static/logo.png" class="logo" />
          <text class="title">耶氏体育身份认证</text>
          <text class="desc">为了您的财产安全，请完成身份验证</text>
        </view>
      </template>
      
      <!-- 步骤提示 -->
      <template #tips>
        <view class="step-tips">
          <view class="tip-item" v-if="currentStep === 1">
            <icon type="info" size="16" />
            <text>请使用本人手机号进行验证</text>
          </view>
          
          <view class="tip-item" v-else-if="currentStep === 2">
            <icon type="success" size="16" />
            <text>验证码已发送，5分钟内有效</text>
          </view>
          
          <view class="tip-item" v-else-if="currentStep === 3">
            <icon type="info" size="16" />
            <text>请上传清晰的身份证照片</text>
          </view>
        </view>
      </template>
      
      <!-- 底部说明 -->
      <template #footer>
        <view class="agreement">
          <checkbox-group @change="onAgreeChange">
            <label class="agreement-label">
              <checkbox :checked="agreed" />
              <text>我已阅读并同意</text>
              <text class="link" @click.stop="showAgreement">《用户协议》</text>
              <text>和</text>
              <text class="link" @click.stop="showPrivacy">《隐私政策》</text>
            </label>
          </checkbox-group>
        </view>
      </template>
    </identity-verify>
    
    <!-- 验证进度 -->
    <view class="progress-bar" v-if="showProgress">
      <view class="progress" :style="{ width: progressWidth }"></view>
      <text class="progress-text">{{ progressText }}</text>
    </view>
  </view>
</template>

<script>
import IdentityVerify from '@/components/molecules/IdentityVerify.vue'

export default {
  components: {
    IdentityVerify
  },
  data() {
    return {
      currentStep: 1,
      agreed: false,
      showProgress: false,
      progressWidth: '0%',
      progressText: '',
      prefilledPhone: ''
    }
  },
  onLoad(options) {
    // 如果从其他页面传入手机号
    if (options.phone) {
      this.prefilledPhone = options.phone
    }
  },
  methods: {
    onStepChange(step) {
      this.currentStep = step
      this.updateProgress(step)
    },
    
    onCodeSent(phone) {
      uni.showToast({
        title: `验证码已发送至 ${this.maskPhone(phone)}`,
        icon: 'none',
        duration: 3000
      })
    },
    
    async onVerifySuccess(userInfo) {
      this.showProgress = true
      this.progressText = '验证成功，正在保存...'
      this.progressWidth = '100%'
      
      try {
        // 保存用户信息到本地
        await this.saveUserInfo(userInfo)
        
        // 上报验证成功事件
        this.reportAnalytics('identity_verify_success', {
          userId: userInfo.userId,
          verifyType: 'full'
        })
        
        // 延迟跳转，显示成功动画
        setTimeout(() => {
          uni.showToast({
            title: '认证成功',
            icon: 'success',
            duration: 1500
          })
          
          setTimeout(() => {
            // 跳转到存储流程
            uni.redirectTo({
              url: '/pages/storage/select-locker'
            })
          }, 1500)
        }, 500)
        
      } catch (error) {
        console.error('保存用户信息失败:', error)
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    },
    
    onVerifyFail(error) {
      this.showProgress = false
      
      // 上报失败事件
      this.reportAnalytics('identity_verify_fail', {
        errorCode: error.code,
        errorMessage: error.message,
        step: this.currentStep
      })
      
      // 显示错误提示
      this.handleError(error)
    },
    
    onAgreeChange(e) {
      this.agreed = e.detail.value.length > 0
    },
    
    showAgreement() {
      uni.navigateTo({
        url: '/pages/common/agreement'
      })
    },
    
    showPrivacy() {
      uni.navigateTo({
        url: '/pages/common/privacy'
      })
    },
    
    updateProgress(step) {
      const stepProgress = {
        1: { width: '33%', text: '手机号验证' },
        2: { width: '66%', text: '短信验证' },
        3: { width: '90%', text: '身份证验证' }
      }
      
      const progress = stepProgress[step]
      if (progress) {
        this.showProgress = true
        this.progressWidth = progress.width
        this.progressText = progress.text
      }
    },
    
    maskPhone(phone) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    
    async saveUserInfo(userInfo) {
      // 保存到 Vuex
      this.$store.commit('user/setUserInfo', userInfo)
      
      // 保存到本地存储
      uni.setStorageSync('userInfo', userInfo)
      uni.setStorageSync('identityVerified', true)
      uni.setStorageSync('verifyTime', Date.now())
      
      // 调用后端API保存
      await this.$api.user.updateProfile(userInfo)
    },
    
    handleError(error) {
      const errorMessages = {
        'PHONE_REGISTERED': '该手机号已被注册',
        'CODE_SEND_LIMIT': '验证码发送过于频繁，请稍后再试',
        'VERIFY_TIMEOUT': '验证超时，请重新开始',
        'SERVER_ERROR': '服务器繁忙，请稍后再试'
      }
      
      const message = errorMessages[error.code] || error.message || '验证失败'
      
      uni.showModal({
        title: '提示',
        content: message,
        showCancel: false
      })
    },
    
    reportAnalytics(event, data) {
      // 上报埋点数据
      if (typeof wx !== 'undefined' && wx.reportAnalytics) {
        wx.reportAnalytics(event, data)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.verify-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding: 32rpx;
}

.page-header {
  text-align: center;
  margin-bottom: 48rpx;
  
  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 24rpx;
  }
  
  .title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 16rpx;
  }
  
  .desc {
    display: block;
    font-size: 28rpx;
    color: #999999;
  }
}

.step-tips {
  margin: 24rpx 0;
  
  .tip-item {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background-color: #e6f7ff;
    border-radius: 8rpx;
    
    icon {
      margin-right: 12rpx;
    }
    
    text {
      font-size: 26rpx;
      color: #1890ff;
    }
  }
}

.agreement {
  margin-top: 32rpx;
  
  .agreement-label {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #666666;
    
    checkbox {
      margin-right: 12rpx;
    }
    
    .link {
      color: #1890ff;
      margin: 0 4rpx;
    }
  }
}

.progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  padding: 0 32rpx;
  
  .progress {
    position: absolute;
    left: 0;
    top: 0;
    height: 4rpx;
    background-color: #1890ff;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 28rpx;
    color: #666666;
  }
}
</style>
```

## 注意事项

1. **隐私保护**：身份证照片等敏感信息需要加密传输和存储
2. **验证码安全**：实现防刷机制，限制发送频率
3. **错误重试**：合理设置重试次数，避免恶意尝试
4. **用户体验**：验证流程应尽量简化，避免用户流失
5. **兼容性**：不同平台的相机、相册权限需要适配
6. **数据校验**：前后端都需要验证数据格式和有效性

## 更新日志

- 2025-07-23：创建组件文档
- 2025-07-23：添加多种验证模式
- 2025-07-23：集成第三方认证支持