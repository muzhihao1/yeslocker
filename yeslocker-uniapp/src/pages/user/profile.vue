<template>
  <view class="profile-page">
    <!-- Not Logged In State -->
    <view v-if="!isLoggedIn" class="login-container">
      <view class="login-header">
        <lazy-image src="/static/logo.png" mode="aspectFit" custom-class="app-logo" :width="200" :height="200" />
        <text class="app-name">耶氏体育台球杆存取</text>
        <text class="app-desc">专业的台球杆存储服务</text>
      </view>
      
      <view class="login-content">
        <button 
          class="login-btn wechat-btn" 
          @click="handleWeChatLogin"
        >
          <text class="btn-icon">🔑</text>
          <text class="btn-text">微信快速登录</text>
        </button>
        
        <view class="login-tips">
          <text class="tips-text">登录即表示您同意</text>
          <text class="tips-link" @click="showAgreement">《用户协议》</text>
          <text class="tips-text">和</text>
          <text class="tips-link" @click="showPrivacy">《隐私政策》</text>
        </view>
        
        <!-- Development Test Login -->
        <view class="dev-login" v-if="isDev">
          <view class="divider">
            <text class="divider-text">开发环境</text>
          </view>
          <button 
            class="login-btn test-btn" 
            @click="goToTestLogin"
          >
            <text class="btn-icon">🧪</text>
            <text class="btn-text">测试登录</text>
          </button>
        </view>
        
        <view class="other-login" v-if="isDev">
          <text class="other-title">其他登录方式</text>
          <view class="other-methods">
            <view class="method-item" @click="phoneLogin">
              <text class="method-icon">📱</text>
              <text class="method-text">手机号登录</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Logged In State -->
    <view v-else class="profile-container">
      <!-- User Header -->
      <view class="profile-header">
        <view class="header-bg"></view>
        <view class="header-content">
          <lazy-image 
            :src="userInfo.avatarUrl || '/static/default-avatar.png'" 
            custom-class="user-avatar"
            mode="aspectFill"
            :width="120"
            :height="120"
            @click="changeAvatar"
          />
          <text class="user-name">{{ userInfo.nickName || '用户' + userInfo.userId }}</text>
          <view class="user-tags">
            <text class="tag-item verified" v-if="userInfo.isVerified">已认证</text>
            <text class="tag-item member">普通会员</text>
          </view>
        </view>
      </view>
      
      <!-- User Info Card -->
      <view class="info-card">
        <view class="info-item" @click="editNickname">
          <text class="info-label">昵称</text>
          <view class="info-value">
            <text>{{ userInfo.nickName || '未设置' }}</text>
            <text class="info-arrow">›</text>
          </view>
        </view>
        
        <view class="info-item">
          <text class="info-label">手机号</text>
          <view class="info-value">
            <text>{{ formatPhone(userInfo.phoneNumber) || '未绑定' }}</text>
            <text class="info-arrow" @click="bindPhone" v-if="!userInfo.phoneNumber">›</text>
          </view>
        </view>
        
        <view class="info-item">
          <text class="info-label">实名认证</text>
          <view class="info-value">
            <text v-if="userInfo.isVerified" class="verified-text">{{ userInfo.realName }} 已认证</text>
            <text v-else class="unverified-text" @click="goVerify">去认证 ›</text>
          </view>
        </view>
        
        <view class="info-item">
          <text class="info-label">注册时间</text>
          <view class="info-value">
            <text>{{ formatDate(userInfo.createTime) }}</text>
          </view>
        </view>
      </view>
      
      <!-- Quick Actions -->
      <view class="action-card">
        <view class="action-header">
          <text class="action-title">快捷操作</text>
        </view>
        <view class="action-grid">
          <view class="action-item" @click="goToVouchers">
            <text class="action-icon">🎫</text>
            <text class="action-text">我的凭证</text>
          </view>
          <view class="action-item" @click="goToHistory">
            <text class="action-icon">📋</text>
            <text class="action-text">操作记录</text>
          </view>
          <view class="action-item" @click="goToHelp">
            <text class="action-icon">❓</text>
            <text class="action-text">帮助中心</text>
          </view>
          <view class="action-item" @click="contactService">
            <text class="action-icon">💬</text>
            <text class="action-text">联系客服</text>
          </view>
        </view>
      </view>
      
      <!-- Settings List -->
      <view class="settings-list">
        <view class="settings-item" @click="goToSettings">
          <text class="settings-icon">⚙️</text>
          <text class="settings-text">设置</text>
          <text class="settings-arrow">›</text>
        </view>
      </view>
      
      <!-- Logout Button -->
      <view class="logout-section">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script>
import { wechatLogin } from '@/utils/wechat'
import apiConfig from '@/config/api'

export default {
  name: 'UserProfilePage',
  data() {
    return {
      userInfo: {},
      isLoggedIn: false,
      isDev: process.env.NODE_ENV === 'development'
    }
  },
  onLoad() {
    this.checkLoginStatus()
    // 确保开发环境能显示测试登录按钮
    console.log('当前环境:', process.env.NODE_ENV)
    console.log('isDev:', this.isDev)
    // 如果在开发者工具中，强制显示测试按钮
    // #ifdef MP-WEIXIN
    const systemInfo = uni.getSystemInfoSync()
    if (systemInfo.platform === 'devtools') {
      this.isDev = true
      console.log('检测到开发者工具，启用测试登录按钮')
    }
    // #endif
  },
  onShow() {
    // 页面显示时重新检查登录状态
    this.checkLoginStatus()
  },
  methods: {
    checkLoginStatus() {
      const userInfo = uni.getStorageSync('userInfo')
      const token = uni.getStorageSync('token')
      
      if (userInfo && token) {
        this.userInfo = userInfo
        this.isLoggedIn = true
      } else {
        this.isLoggedIn = false
      }
    },
    
    async handleWeChatLogin() {
      try {
        // 开发环境下检测是否在微信开发者工具中
        // #ifdef MP-WEIXIN
        const systemInfo = uni.getSystemInfoSync()
        if (process.env.NODE_ENV === 'development' && systemInfo.platform === 'devtools') {
          console.log('[WeChat Login] 开发者工具环境，使用模拟登录')
          // 在开发者工具中，跳过 getUserProfile，使用模拟数据
          const mockUserInfo = {
            nickName: '测试用户',
            avatarUrl: '/static/default-avatar.png',
            gender: 1,
            country: '中国',
            province: '北京',
            city: '北京',
            language: 'zh_CN'
          }
          
          uni.showLoading({
            title: '登录中...',
            mask: true
          })
          
          // 使用模拟的 code
          const mockCode = 'mock-code-' + Date.now()
          
          // 直接调用登录接口
          const loginUrl = apiConfig.baseURL + apiConfig.api.wxLogin
          const loginData = {
            code: mockCode,
            userInfo: mockUserInfo
          }
          
          const [error, response] = await uni.request({
            url: loginUrl,
            method: 'POST',
            data: loginData,
            header: {
              'content-type': 'application/json'
            }
          })
          
          if (error) {
            throw error
          }
          
          const { data } = response
          
          if (data.errno !== 0) {
            throw new Error(data.errmsg || '登录失败')
          }
          
          // 保存登录信息
          const loginResult = data.data
          uni.setStorageSync('token', loginResult.token)
          uni.setStorageSync('userInfo', loginResult.userInfo)
          
          // 更新组件状态
          this.userInfo = loginResult.userInfo
          this.isLoggedIn = true
          
          uni.hideLoading()
          
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 登录成功后的处理
          this.handleLoginSuccess()
          return
        }
        // #endif
        
        // 真机环境或非开发者工具环境
        // 重要：getUserProfile必须是点击事件后的第一个调用
        // 不能在调用前有任何其他API调用，包括showLoading
        const userInfoRes = await uni.getUserProfile({
          desc: '用于完善用户资料',
          lang: 'zh_CN'
        })
        
        // 用户同意授权后，显示loading
        uni.showLoading({
          title: '登录中...',
          mask: true
        })
        
        // 获取登录凭证
        const loginRes = await uni.login({
          provider: 'weixin'
        })
        
        if (!loginRes.code) {
          throw new Error('获取登录凭证失败')
        }
        
        // 调用后端接口进行登录
        // 确保使用完整的URL地址，避免600009错误
        const loginUrl = apiConfig.baseURL + apiConfig.api.wxLogin
        console.log('登录API地址:', loginUrl)
        console.log('当前环境:', process.env.NODE_ENV)
        
        // 构造符合后端期望的参数格式
        // 注意：后端期望的是 wx/auth/login_by_weixin 接口格式
        const loginData = {
          code: loginRes.code,
          userInfo: {
            nickName: userInfoRes.userInfo.nickName,
            avatarUrl: userInfoRes.userInfo.avatarUrl,
            gender: userInfoRes.userInfo.gender,
            country: userInfoRes.userInfo.country,
            province: userInfoRes.userInfo.province,
            city: userInfoRes.userInfo.city,
            language: userInfoRes.userInfo.language
          }
        }
        
        console.log('发送登录请求:', loginUrl)
        console.log('请求参数:', loginData)
        
        const [error, response] = await uni.request({
          url: loginUrl,
          method: 'POST',
          data: loginData,
          header: {
            'content-type': 'application/json'
          }
        })
        
        if (error) {
          console.error('请求失败:', error)
          throw error
        }
        
        const { data } = response
        
        if (data.errno !== 0) {
          throw new Error(data.errmsg || '登录失败')
        }
        
        // 保存登录信息
        const loginResult = data.data
        uni.setStorageSync('token', loginResult.token)
        uni.setStorageSync('userInfo', loginResult.userInfo)
        
        // 更新组件状态
        this.userInfo = loginResult.userInfo
        this.isLoggedIn = true
        
        uni.hideLoading()
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 登录成功后的处理
        this.handleLoginSuccess()
      } catch (error) {
        uni.hideLoading()
        console.error('登录失败:', error)
        
        // 判断错误类型提供更友好的提示
        let errorMessage = '登录失败，请稍后重试'
        
        if (error.errMsg) {
          if (error.errMsg.includes('cancel')) {
            // 用户取消授权，不需要提示
            return
          } else if (error.errMsg.includes('getUserProfile')) {
            errorMessage = '需要您的授权才能登录'
          } else if (error.errMsg.includes('invalid url')) {
            errorMessage = 'API地址配置错误，请联系管理员'
            console.error('600009错误：请检查API地址是否为完整的HTTPS地址')
          }
        } else if (error.message) {
          if (error.message.includes('网络')) {
            errorMessage = '网络连接失败，请检查网络'
          } else {
            errorMessage = error.message
          }
        }
        
        // 特殊处理600009错误
        if (error.errno === 600009 || (error.errMsg && error.errMsg.includes('600009'))) {
          errorMessage = 'API地址格式错误'
          console.error('错误详情:', {
            url: loginUrl,
            environment: process.env.NODE_ENV,
            error: error
          })
          console.error('修复建议：')
          console.error('1. 开发环境：在微信开发者工具中勾选"不校验合法域名"')
          console.error('2. 生产环境：确保域名已添加到小程序后台的request合法域名')
          console.error('3. 检查后端服务是否正在运行')
          console.error('4. 当前配置的API地址:', apiConfig.baseURL)
          
          // 开发环境下提供更友好的提示
          if (process.env.NODE_ENV === 'development') {
            errorMessage = '请在微信开发者工具中勾选"不校验合法域名"选项'
          }
        }
        
        uni.showModal({
          title: '登录失败',
          content: errorMessage,
          showCancel: false
        })
      }
    },
    
    handleLoginSuccess() {
      // 检查是否已完成手机号验证
      if (!this.userInfo.mobile && !this.userInfo.phoneNumber) {
        setTimeout(() => {
          uni.showModal({
            title: '欢迎使用',
            content: '请先验证您的手机号',
            confirmText: '去验证',
            cancelText: '稍后再说',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/auth/phone-verify'
                })
              }
            }
          })
        }, 1000)
      } else if (!this.userInfo.locker_id && !this.userInfo.lockerId) {
        // 已验证手机号但未选择储物柜
        setTimeout(() => {
          uni.showModal({
            title: '提示',
            content: '请选择您的专属储物柜',
            confirmText: '去选择',
            cancelText: '稍后再说',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/auth/store-select'
                })
              }
            }
          })
        }, 1000)
      }
    },
    
    phoneLogin() {
      // TODO: 实现手机号登录
      uni.navigateTo({
        url: '/pages/auth/phone-login'
      })
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
    
    async goToTestLogin() {
      // 跳转到测试登录页面
      uni.navigateTo({
        url: '/pages/test/mock-login'
      })
    },
    
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0]
          
          uni.showLoading({
            title: '上传中...'
          })
          
          try {
            // TODO: 上传头像到服务器
            // 模拟上传
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 更新本地信息
            this.userInfo.avatarUrl = tempFilePath
            uni.setStorageSync('userInfo', this.userInfo)
            
            uni.hideLoading()
            uni.showToast({
              title: '更换成功',
              icon: 'success'
            })
          } catch (error) {
            uni.hideLoading()
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        }
      })
    },
    
    editNickname() {
      uni.navigateTo({
        url: '/pages/user/edit-nickname'
      })
    },
    
    bindPhone() {
      uni.navigateTo({
        url: '/pages/user/bind-phone'
      })
    },
    
    goVerify() {
      uni.navigateTo({
        url: '/pages/storage/verify'
      })
    },
    
    goToVouchers() {
      uni.navigateTo({
        url: '/pages/user/vouchers'
      })
    },
    
    goToHistory() {
      uni.navigateTo({
        url: '/pages/user/history'
      })
    },
    
    goToHelp() {
      uni.navigateTo({
        url: '/pages/common/help'
      })
    },
    
    contactService() {
      // 打开客服会话
      // #ifdef MP-WEIXIN
      uni.openCustomerServiceChat({
        extInfo: { url: '' },
        corpId: '',
        success: () => {
          console.log('打开客服成功')
        },
        fail: () => {
          // 使用备用方案
          uni.makePhoneCall({
            phoneNumber: '400-123-4567'
          })
        }
      })
      // #endif
      
      // #ifndef MP-WEIXIN
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      })
      // #endif
    },
    
    goToSettings() {
      uni.navigateTo({
        url: '/pages/user/settings'
      })
    },
    
    formatPhone(phone) {
      if (!phone || phone.length !== 11) return phone
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
    },
    
    formatDate(timestamp) {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录信息
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('token')
            uni.removeStorageSync('isVerified')
            
            // 重置状态
            this.userInfo = {}
            this.isLoggedIn = false
            
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

// 未登录状态
.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  
  .login-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 32rpx 80rpx;
    
    .app-logo {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 32rpx;
    }
    
    .app-name {
      font-size: 40rpx;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 16rpx;
    }
    
    .app-desc {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  
  .login-content {
    flex: 1;
    background-color: #ffffff;
    border-radius: 40rpx 40rpx 0 0;
    padding: 64rpx 48rpx;
    
    .login-btn {
      width: 100%;
      height: 96rpx;
      border-radius: 48rpx;
      font-size: 32rpx;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.wechat-btn {
        background-color: #07c160;
        color: #ffffff;
        margin-bottom: 32rpx;
        
        .btn-icon {
          font-size: 40rpx;
          margin-right: 16rpx;
        }
      }
    }
    
    .login-tips {
      text-align: center;
      margin-top: 48rpx;
      
      .tips-text {
        font-size: 26rpx;
        color: #999999;
      }
      
      .tips-link {
        font-size: 26rpx;
        color: #1890ff;
        margin: 0 8rpx;
      }
    }
    
    .dev-login {
      margin-top: 60rpx;
      
      .divider {
        position: relative;
        text-align: center;
        margin-bottom: 32rpx;
        
        .divider-text {
          position: relative;
          display: inline-block;
          padding: 0 32rpx;
          font-size: 26rpx;
          color: #999999;
          background-color: #ffffff;
          z-index: 1;
        }
        
        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1rpx;
          background-color: #e8e8e8;
        }
      }
      
      .test-btn {
        background-color: #52c41a;
        color: #ffffff;
        
        &:active {
          background-color: #389e0d;
        }
      }
    }
    
    .other-login {
      margin-top: 80rpx;
      
      .other-title {
        display: block;
        text-align: center;
        font-size: 26rpx;
        color: #999999;
        margin-bottom: 32rpx;
        position: relative;
        
        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 80rpx;
          height: 1rpx;
          background-color: #e8e8e8;
        }
        
        &::before {
          left: 0;
        }
        
        &::after {
          right: 0;
        }
      }
      
      .other-methods {
        display: flex;
        justify-content: center;
        gap: 64rpx;
        
        .method-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .method-icon {
            font-size: 48rpx;
            margin-bottom: 12rpx;
          }
          
          .method-text {
            font-size: 24rpx;
            color: #666666;
          }
        }
      }
    }
  }
}

// 已登录状态
.profile-container {
  padding-bottom: 32rpx;
  
  .profile-header {
    position: relative;
    height: 360rpx;
    
    .header-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 280rpx;
      background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    }
    
    .header-content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 60rpx;
      
      .user-avatar {
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        border: 6rpx solid #ffffff;
        margin-bottom: 24rpx;
      }
      
      .user-name {
        font-size: 36rpx;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 16rpx;
      }
      
      .user-tags {
        display: flex;
        gap: 16rpx;
        
        .tag-item {
          padding: 8rpx 20rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
          
          &.verified {
            background-color: rgba(82, 196, 26, 0.2);
            color: #52c41a;
          }
          
          &.member {
            background-color: rgba(255, 255, 255, 0.2);
            color: #ffffff;
          }
        }
      }
    }
  }
  
  .info-card {
    margin: -60rpx 32rpx 24rpx;
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .info-label {
        font-size: 30rpx;
        color: #666666;
      }
      
      .info-value {
        display: flex;
        align-items: center;
        font-size: 30rpx;
        color: #333333;
        
        .info-arrow {
          margin-left: 12rpx;
          color: #999999;
        }
        
        .verified-text {
          color: #52c41a;
        }
        
        .unverified-text {
          color: #1890ff;
        }
      }
    }
  }
  
  .action-card {
    margin: 0 32rpx 24rpx;
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 32rpx;
    
    .action-header {
      margin-bottom: 24rpx;
      
      .action-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
      }
    }
    
    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 32rpx;
      
      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .action-icon {
          font-size: 48rpx;
          margin-bottom: 12rpx;
        }
        
        .action-text {
          font-size: 26rpx;
          color: #666666;
        }
      }
    }
  }
  
  .settings-list {
    margin: 0 32rpx 24rpx;
    background-color: #ffffff;
    border-radius: 16rpx;
    overflow: hidden;
    
    .settings-item {
      display: flex;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .settings-icon {
        font-size: 36rpx;
        margin-right: 24rpx;
      }
      
      .settings-text {
        flex: 1;
        font-size: 30rpx;
        color: #333333;
      }
      
      .settings-arrow {
        font-size: 32rpx;
        color: #999999;
      }
    }
  }
  
  .logout-section {
    padding: 48rpx 32rpx;
    
    .logout-btn {
      width: 100%;
      height: 88rpx;
      background-color: #ffffff;
      color: #ff4d4f;
      border: 2rpx solid #ff4d4f;
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: 500;
    }
  }
}
</style>