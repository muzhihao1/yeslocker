<template>
  <view class="about-page">
    <!-- Logo Section -->
    <view class="logo-section">
      <image class="app-logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="app-name">耶氏台球杆存取</text>
      <text class="app-version">版本 v1.0.0</text>
    </view>
    
    <!-- Info Section -->
    <view class="info-section">
      <view class="info-item">
        <text class="info-label">公司名称</text>
        <text class="info-value">上海耶氏体育用品有限公司</text>
      </view>
      <view class="info-item">
        <text class="info-label">官方网站</text>
        <text class="info-value link" @click="openWebsite">www.yesports.com</text>
      </view>
      <view class="info-item">
        <text class="info-label">客服邮箱</text>
        <text class="info-value link" @click="copyEmail">service@yesports.com</text>
      </view>
      <view class="info-item">
        <text class="info-label">客服电话</text>
        <text class="info-value link" @click="makePhoneCall">400-123-4567</text>
      </view>
    </view>
    
    <!-- Links Section -->
    <view class="links-section">
      <view class="link-item" @click="viewAgreement">
        <text class="link-text">用户协议</text>
        <text class="arrow-icon">›</text>
      </view>
      <view class="link-item" @click="viewPrivacy">
        <text class="link-text">隐私政策</text>
        <text class="arrow-icon">›</text>
      </view>
      <view class="link-item" @click="checkUpdate">
        <text class="link-text">检查更新</text>
        <text class="arrow-icon">›</text>
      </view>
    </view>
    
    <!-- Description -->
    <view class="description">
      <text class="desc-title">关于我们</text>
      <text class="desc-content">
        耶氏体育成立于2010年，是一家专业的台球用品服务商。我们致力于为台球爱好者提供最优质的服务体验。
        
        本小程序提供专业的台球杆存储服务，让您无需携带球杆即可随时享受台球运动的乐趣。我们采用先进的储物柜管理系统，确保您的球杆安全、便捷地存取。
        
        感谢您选择耶氏体育，我们将持续改进，为您提供更好的服务。
      </text>
    </view>
    
    <!-- Footer -->
    <view class="footer">
      <text class="copyright">Copyright © 2024 耶氏体育</text>
      <text class="copyright">All Rights Reserved</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AboutPage',
  methods: {
    openWebsite() {
      // 在小程序中需要配置业务域名
      // #ifdef H5
      window.open('https://www.yesports.com')
      // #endif
      // #ifdef MP-WEIXIN
      uni.setClipboardData({
        data: 'https://www.yesports.com',
        success: () => {
          uni.showToast({
            title: '网址已复制',
            icon: 'success'
          })
        }
      })
      // #endif
    },
    
    copyEmail() {
      uni.setClipboardData({
        data: 'service@yesports.com',
        success: () => {
          uni.showToast({
            title: '邮箱已复制',
            icon: 'success'
          })
        }
      })
    },
    
    makePhoneCall() {
      uni.makePhoneCall({
        phoneNumber: '4001234567'
      })
    },
    
    viewAgreement() {
      uni.navigateTo({
        url: '/pages/common/agreement'
      })
    },
    
    viewPrivacy() {
      uni.navigateTo({
        url: '/pages/common/privacy'
      })
    },
    
    checkUpdate() {
      uni.showLoading({
        title: '检查更新中...'
      })
      
      setTimeout(() => {
        uni.hideLoading()
        
        // #ifdef MP-WEIXIN
        const updateManager = uni.getUpdateManager()
        
        updateManager.onCheckForUpdate((res) => {
          if (res.hasUpdate) {
            updateManager.onUpdateReady(() => {
              uni.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: (res) => {
                  if (res.confirm) {
                    updateManager.applyUpdate()
                  }
                }
              })
            })
          } else {
            uni.showToast({
              title: '已是最新版本',
              icon: 'none'
            })
          }
        })
        // #endif
        
        // #ifndef MP-WEIXIN
        uni.showToast({
          title: '已是最新版本',
          icon: 'none'
        })
        // #endif
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

// Logo Section
.logo-section {
  padding: 80rpx 32rpx 60rpx;
  text-align: center;
  background-color: #ffffff;
  
  .app-logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 32rpx;
  }
  
  .app-name {
    font-size: 40rpx;
    font-weight: 600;
    color: #333333;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .app-version {
    font-size: 28rpx;
    color: #999999;
  }
}

// Info Section
.info-section {
  margin-top: 24rpx;
  background-color: #ffffff;
  padding: 0 32rpx;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-size: 30rpx;
      color: #666666;
    }
    
    .info-value {
      font-size: 30rpx;
      color: #333333;
      
      &.link {
        color: #1890ff;
      }
    }
  }
}

// Links Section
.links-section {
  margin-top: 24rpx;
  background-color: #ffffff;
  
  .link-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .link-text {
      font-size: 30rpx;
      color: #333333;
    }
    
    .arrow-icon {
      font-size: 32rpx;
      color: #999999;
    }
  }
}

// Description
.description {
  margin-top: 24rpx;
  background-color: #ffffff;
  padding: 32rpx;
  
  .desc-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 24rpx;
    display: block;
  }
  
  .desc-content {
    font-size: 28rpx;
    color: #666666;
    line-height: 48rpx;
    white-space: pre-wrap;
  }
}

// Footer
.footer {
  padding: 60rpx 32rpx 40rpx;
  text-align: center;
  
  .copyright {
    font-size: 24rpx;
    color: #999999;
    display: block;
    margin-bottom: 8rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>