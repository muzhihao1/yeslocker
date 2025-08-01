<template>
  <view class="settings-page">
    <!-- Page Header -->
    <view class="page-header">
      <text class="page-title">设置</text>
    </view>
    
    <!-- Settings Groups -->
    <view class="settings-group">
      <view class="group-title">账号与安全</view>
      <view class="settings-list">
        <view class="settings-item" @click="goToAccountSecurity">
          <text class="item-label">账号安全</text>
          <view class="item-right">
            <text class="item-value">已保护</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
        <view class="settings-item" @click="goToBindPhone">
          <text class="item-label">手机号</text>
          <view class="item-right">
            <text class="item-value">{{ formatPhone(userInfo.phoneNumber) || '未绑定' }}</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
        <view class="settings-item" @click="goToPrivacySettings">
          <text class="item-label">隐私设置</text>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </view>
    
    <view class="settings-group">
      <view class="group-title">通知设置</view>
      <view class="settings-list">
        <view class="settings-item">
          <text class="item-label">消息通知</text>
          <switch 
            :checked="settings.enableNotification" 
            @change="handleNotificationChange"
            color="#1890ff"
          />
        </view>
        <view class="settings-item">
          <text class="item-label">到期提醒</text>
          <switch 
            :checked="settings.enableExpiryReminder" 
            @change="handleExpiryReminderChange"
            color="#1890ff"
          />
        </view>
        <view class="settings-item" @click="setReminderTime">
          <text class="item-label">提醒时间</text>
          <view class="item-right">
            <text class="item-value">提前{{ settings.reminderDays }}天</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="settings-group">
      <view class="group-title">通用设置</view>
      <view class="settings-list">
        <view class="settings-item" @click="changeLanguage">
          <text class="item-label">语言</text>
          <view class="item-right">
            <text class="item-value">简体中文</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
        <view class="settings-item">
          <text class="item-label">深色模式</text>
          <switch 
            :checked="settings.darkMode" 
            @change="handleDarkModeChange"
            color="#1890ff"
            :disabled="true"
          />
        </view>
        <view class="settings-item" @click="clearCache">
          <text class="item-label">清理缓存</text>
          <view class="item-right">
            <text class="item-value">{{ cacheSize }}</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="settings-group">
      <view class="group-title">关于</view>
      <view class="settings-list">
        <view class="settings-item" @click="goToAbout">
          <text class="item-label">关于我们</text>
          <text class="item-arrow">›</text>
        </view>
        <view class="settings-item" @click="goToAgreement">
          <text class="item-label">用户协议</text>
          <text class="item-arrow">›</text>
        </view>
        <view class="settings-item" @click="goToPrivacy">
          <text class="item-label">隐私政策</text>
          <text class="item-arrow">›</text>
        </view>
        <view class="settings-item" @click="checkUpdate">
          <text class="item-label">版本更新</text>
          <view class="item-right">
            <text class="item-value">v1.0.0</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Account Management -->
    <view class="account-actions" v-if="isLoggedIn">
      <button class="action-btn logout-btn" @click="handleLogout">退出登录</button>
      <button class="action-btn delete-btn" @click="deleteAccount">注销账号</button>
    </view>
    
    <!-- Developer Options (Hidden) -->
    <view class="developer-section" v-if="showDeveloper">
      <view class="settings-group">
        <view class="group-title">开发者选项</view>
        <view class="settings-list">
          <view class="settings-item" @click="switchEnvironment">
            <text class="item-label">服务器环境</text>
            <view class="item-right">
              <text class="item-value">{{ currentEnv }}</text>
              <text class="item-arrow">›</text>
            </view>
          </view>
          <view class="settings-item" @click="showLogs">
            <text class="item-label">查看日志</text>
            <text class="item-arrow">›</text>
          </view>
          <view class="settings-item" @click="goToStatistics">
            <text class="item-label">数据统计</text>
            <text class="item-arrow">›</text>
          </view>
          <view class="settings-item" @click="goToAnalytics">
            <text class="item-label">广告统计</text>
            <text class="item-arrow">›</text>
          </view>
          <view class="settings-item" @click="goToAdManage">
            <text class="item-label">广告管理</text>
            <text class="item-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SettingsPage',
  data() {
    return {
      userInfo: {},
      isLoggedIn: false,
      settings: {
        enableNotification: true,
        enableExpiryReminder: true,
        reminderDays: 3,
        darkMode: false
      },
      cacheSize: '计算中...',
      showDeveloper: false,
      currentEnv: '生产环境',
      tapCount: 0,
      tapTimer: null
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadSettings()
    this.calculateCacheSize()
  },
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      const token = uni.getStorageSync('token')
      
      if (userInfo && token) {
        this.userInfo = userInfo
        this.isLoggedIn = true
      }
    },
    
    loadSettings() {
      // 从本地存储加载设置
      const savedSettings = uni.getStorageSync('appSettings')
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings }
      }
    },
    
    saveSettings() {
      // 保存设置到本地存储
      uni.setStorageSync('appSettings', this.settings)
    },
    
    async calculateCacheSize() {
      try {
        const res = await uni.getStorageInfo()
        const size = res.currentSize || 0
        
        if (size < 1024) {
          this.cacheSize = `${size} KB`
        } else {
          this.cacheSize = `${(size / 1024).toFixed(2)} MB`
        }
      } catch (error) {
        this.cacheSize = '未知'
      }
    },
    
    formatPhone(phone) {
      if (!phone || phone.length !== 11) return phone
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
    },
    
    // 账号与安全
    goToAccountSecurity() {
      uni.navigateTo({
        url: '/pages/user/account-security'
      })
    },
    
    goToBindPhone() {
      uni.navigateTo({
        url: '/pages/user/bind-phone'
      })
    },
    
    goToPrivacySettings() {
      uni.navigateTo({
        url: '/pages/user/privacy-settings'
      })
    },
    
    // 通知设置
    handleNotificationChange(e) {
      this.settings.enableNotification = e.detail.value
      this.saveSettings()
      
      if (e.detail.value) {
        // 请求通知权限
        // #ifdef MP-WEIXIN
        uni.requestSubscribeMessage({
          tmplIds: ['your-template-id'],
          success: () => {
            uni.showToast({
              title: '已开启通知',
              icon: 'success'
            })
          },
          fail: () => {
            this.settings.enableNotification = false
            this.saveSettings()
            uni.showToast({
              title: '需要授权通知权限',
              icon: 'none'
            })
          }
        })
        // #endif
      }
    },
    
    handleExpiryReminderChange(e) {
      this.settings.enableExpiryReminder = e.detail.value
      this.saveSettings()
    },
    
    setReminderTime() {
      const itemList = ['提前1天', '提前3天', '提前7天', '提前15天']
      const values = [1, 3, 7, 15]
      
      uni.showActionSheet({
        itemList,
        success: (res) => {
          this.settings.reminderDays = values[res.tapIndex]
          this.saveSettings()
        }
      })
    },
    
    // 通用设置
    changeLanguage() {
      uni.showToast({
        title: '暂只支持中文',
        icon: 'none'
      })
    },
    
    handleDarkModeChange(e) {
      this.settings.darkMode = e.detail.value
      this.saveSettings()
      
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    clearCache() {
      uni.showModal({
        title: '清理缓存',
        content: `确定要清理 ${this.cacheSize} 的缓存吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '清理中...'
            })
            
            // 清理部分缓存（保留登录信息）
            const keysToKeep = ['userInfo', 'token', 'appSettings']
            
            uni.getStorageInfo({
              success: (info) => {
                info.keys.forEach(key => {
                  if (!keysToKeep.includes(key)) {
                    uni.removeStorageSync(key)
                  }
                })
                
                setTimeout(() => {
                  uni.hideLoading()
                  uni.showToast({
                    title: '清理完成',
                    icon: 'success'
                  })
                  this.calculateCacheSize()
                }, 1000)
              }
            })
          }
        }
      })
    },
    
    // 关于
    goToAbout() {
      uni.navigateTo({
        url: '/pages/common/about'
      })
      
      // 隐藏的开发者选项入口
      this.tapCount++
      if (this.tapTimer) {
        clearTimeout(this.tapTimer)
      }
      
      this.tapTimer = setTimeout(() => {
        if (this.tapCount >= 7) {
          this.showDeveloper = true
          uni.showToast({
            title: '开发者模式已开启',
            icon: 'none'
          })
        }
        this.tapCount = 0
      }, 1000)
    },
    
    goToAgreement() {
      uni.navigateTo({
        url: '/pages/common/agreement'
      })
    },
    
    goToPrivacy() {
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
        uni.showModal({
          title: '版本更新',
          content: '当前已是最新版本',
          showCancel: false
        })
      }, 1000)
    },
    
    // 账号管理
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
            
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })
            
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/home/index'
              })
            }, 1500)
          }
        }
      })
    },
    
    deleteAccount() {
      uni.showModal({
        title: '注销账号',
        content: '注销后将无法恢复，您的所有数据将被永久删除。确定要注销吗？',
        confirmText: '确定注销',
        confirmColor: '#ff4d4f',
        success: (res) => {
          if (res.confirm) {
            // 二次确认
            uni.showModal({
              title: '再次确认',
              content: '请再次确认是否要注销账号？此操作不可恢复！',
              confirmText: '确定',
              confirmColor: '#ff4d4f',
              success: async (res2) => {
                if (res2.confirm) {
                  uni.showLoading({
                    title: '注销中...',
                    mask: true
                  })
                  
                  try {
                    // TODO: 调用注销API
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    
                    // 清除所有本地数据
                    uni.clearStorageSync()
                    
                    uni.hideLoading()
                    uni.showToast({
                      title: '注销成功',
                      icon: 'success'
                    })
                    
                    setTimeout(() => {
                      uni.reLaunch({
                        url: '/pages/home/index'
                      })
                    }, 1500)
                  } catch (error) {
                    uni.hideLoading()
                    uni.showToast({
                      title: '注销失败',
                      icon: 'none'
                    })
                  }
                }
              }
            })
          }
        }
      })
    },
    
    // 开发者选项
    switchEnvironment() {
      const envList = ['生产环境', '测试环境', '开发环境']
      
      uni.showActionSheet({
        itemList: envList,
        success: (res) => {
          this.currentEnv = envList[res.tapIndex]
          uni.showToast({
            title: `已切换到${this.currentEnv}`,
            icon: 'none'
          })
        }
      })
    },
    
    showLogs() {
      uni.navigateTo({
        url: '/pages/developer/logs'
      })
    },
    
    goToStatistics() {
      uni.navigateTo({
        url: '/pages/user/statistics'
      })
    },
    
    goToAnalytics() {
      uni.navigateTo({
        url: '/pages/user/analytics'
      })
    },
    
    goToAdManage() {
      uni.navigateTo({
        url: '/pages/admin/ad-manage'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
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

.settings-group {
  margin-top: 24rpx;
  
  .group-title {
    padding: 16rpx 32rpx;
    font-size: 26rpx;
    color: #999999;
  }
  
  .settings-list {
    background-color: #ffffff;
    
    .settings-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      position: relative;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:active {
        background-color: #f5f5f5;
      }
      
      .item-label {
        font-size: 30rpx;
        color: #333333;
      }
      
      .item-right {
        display: flex;
        align-items: center;
        
        .item-value {
          font-size: 28rpx;
          color: #999999;
          margin-right: 16rpx;
        }
        
        .item-arrow {
          font-size: 28rpx;
          color: #c8c8c8;
        }
      }
      
      switch {
        transform: scale(0.8);
      }
    }
  }
}

.account-actions {
  margin-top: 48rpx;
  padding: 0 32rpx;
  
  .action-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 500;
    border: none;
    margin-bottom: 24rpx;
    
    &.logout-btn {
      background-color: #ffffff;
      color: #ff4d4f;
      border: 2rpx solid #ff4d4f;
    }
    
    &.delete-btn {
      background-color: #ffffff;
      color: #999999;
      border: 2rpx solid #e8e8e8;
    }
  }
}

.developer-section {
  margin-top: 48rpx;
  opacity: 0.6;
}
</style>