<template>
  <view class="user-page">
    <!-- User Header -->
    <view class="user-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="user-info" @click="navigateToProfile">
          <image 
            :src="userInfo.avatarUrl || '/static/default-avatar.png'" 
            class="user-avatar"
            mode="aspectFill"
          />
          <view class="user-details">
            <text class="user-name">{{ userInfo.nickName || '未登录' }}</text>
            <text class="user-phone" v-if="userInfo.phoneNumber">
              {{ formatPhone(userInfo.phoneNumber) }}
            </text>
            <text class="user-status" v-else>点击登录/注册</text>
          </view>
          <text class="arrow-icon">›</text>
        </view>
        
        <!-- Statistics -->
        <view class="user-stats" v-if="userInfo.userId">
          <view class="stat-item">
            <text class="stat-value">{{ stats.totalStorage || 0 }}</text>
            <text class="stat-label">累计存储</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.currentStorage || 0 }}</text>
            <text class="stat-label">当前存储</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.totalDays || 0 }}</text>
            <text class="stat-label">使用天数</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Menu List -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="navigateToHistory">
          <view class="menu-icon">📋</view>
          <text class="menu-text">操作记录</text>
          <view class="menu-right">
            <text class="menu-badge" v-if="unreadCount > 0">{{ unreadCount }}</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
        
        <view class="menu-item" @click="navigateToVouchers">
          <view class="menu-icon">🎫</view>
          <text class="menu-text">我的凭证</text>
          <text class="menu-arrow">›</text>
        </view>
        
        <view class="menu-item" @click="navigateToMembership">
          <view class="menu-icon">👑</view>
          <text class="menu-text">会员中心</text>
          <view class="menu-right">
            <text class="menu-badge vip" v-if="!isMember">升级</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
        
        <view class="menu-item" @click="navigateToOrders">
          <view class="menu-icon">🛍️</view>
          <text class="menu-text">商城订单</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @click="navigateToHelp">
          <view class="menu-icon">❓</view>
          <text class="menu-text">帮助中心</text>
          <text class="menu-arrow">›</text>
        </view>
        
        <view class="menu-item" @click="navigateToFeedback">
          <view class="menu-icon">💬</view>
          <text class="menu-text">意见反馈</text>
          <text class="menu-arrow">›</text>
        </view>
        
        <view class="menu-item" @click="navigateToAbout">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于我们</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
      
      <view class="menu-group">
        <view class="menu-item" @click="navigateToSettings">
          <view class="menu-icon">⚙️</view>
          <text class="menu-text">设置</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
    
    <!-- Logout Button -->
    <view class="logout-section" v-if="userInfo.userId">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
    
    <!-- Version Info -->
    <view class="version-info">
      <text>版本号：v1.0.0</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UserCenter',
  data() {
    return {
      userInfo: {},
      stats: {},
      unreadCount: 0,
      isMember: false
    }
  },
  onShow() {
    this.loadUserInfo()
    this.loadUserStats()
  },
  methods: {
    loadUserInfo() {
      // 从本地存储获取用户信息
      const userInfo = uni.getStorageSync('userInfo') || {}
      this.userInfo = userInfo
      
      // 如果未登录，可以尝试静默登录
      if (!userInfo.userId) {
        this.tryAutoLogin()
      }
    },
    
    async loadUserStats() {
      if (!this.userInfo.userId) return
      
      try {
        // TODO: 调用API获取用户统计数据
        // 模拟数据
        this.stats = {
          totalStorage: 12,
          currentStorage: 1,
          totalDays: 180
        }
        
        // 获取未读消息数
        this.unreadCount = 2
        
        // 获取会员状态
        // TODO: 从API获取会员状态
        this.isMember = false // 模拟非会员状态
      } catch (error) {
        console.error('加载用户统计失败:', error)
      }
    },
    
    async tryAutoLogin() {
      // 尝试使用微信静默登录
      try {
        const loginRes = await uni.login()
        if (loginRes.code) {
          // TODO: 调用后端API换取用户信息
          console.log('静默登录code:', loginRes.code)
        }
      } catch (error) {
        console.error('静默登录失败:', error)
      }
    },
    
    formatPhone(phone) {
      if (!phone || phone.length !== 11) return phone
      return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
    },
    
    navigateToProfile() {
      uni.navigateTo({
        url: '/pages/user/profile'
      })
    },
    
    navigateToHistory() {
      if (!this.checkLogin()) return
      uni.navigateTo({
        url: '/pages/user/history'
      })
    },
    
    navigateToVouchers() {
      if (!this.checkLogin()) return
      uni.navigateTo({
        url: '/pages/user/vouchers'
      })
    },
    
    navigateToMembership() {
      if (!this.checkLogin()) return
      uni.navigateTo({
        url: '/pages/user/membership'
      })
    },
    
    navigateToOrders() {
      if (!this.checkLogin()) return
      uni.navigateTo({
        url: '/pages/marketplace/orders'
      })
    },
    
    navigateToHelp() {
      uni.navigateTo({
        url: '/pages/common/help'
      })
    },
    
    navigateToFeedback() {
      uni.navigateTo({
        url: '/pages/common/feedback'
      })
    },
    
    navigateToAbout() {
      uni.navigateTo({
        url: '/pages/common/about'
      })
    },
    
    navigateToSettings() {
      uni.navigateTo({
        url: '/pages/user/settings'
      })
    },
    
    checkLogin() {
      if (!this.userInfo.userId) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              this.navigateToProfile()
            }
          }
        })
        return false
      }
      return true
    },
    
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除本地存储
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('token')
            
            // 重新加载页面
            this.userInfo = {}
            this.stats = {}
            
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
.user-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.user-header {
  position: relative;
  padding-bottom: 32rpx;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300rpx;
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  }
  
  .header-content {
    position: relative;
    padding: 60rpx 32rpx 0;
    
    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 48rpx;
      
      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
        margin-right: 24rpx;
      }
      
      .user-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .user-name {
          font-size: 36rpx;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8rpx;
        }
        
        .user-phone,
        .user-status {
          font-size: 28rpx;
          color: rgba(255, 255, 255, 0.8);
        }
      }
      
      .arrow-icon {
        font-size: 40rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }
    
    .user-stats {
      display: flex;
      justify-content: space-around;
      background-color: rgba(255, 255, 255, 0.15);
      border-radius: 16rpx;
      padding: 32rpx 0;
      
      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .stat-value {
          font-size: 40rpx;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8rpx;
        }
        
        .stat-label {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
}

.menu-section {
  padding: 32rpx 32rpx 0;
  
  .menu-group {
    background-color: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    
    .menu-item {
      display: flex;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .menu-icon {
        font-size: 40rpx;
        margin-right: 24rpx;
      }
      
      .menu-text {
        flex: 1;
        font-size: 32rpx;
        color: #333333;
      }
      
      .menu-right {
        display: flex;
        align-items: center;
        
        .menu-badge {
          min-width: 36rpx;
          height: 36rpx;
          padding: 0 8rpx;
          background-color: #ff4d4f;
          color: #ffffff;
          font-size: 24rpx;
          text-align: center;
          line-height: 36rpx;
          border-radius: 18rpx;
          margin-right: 16rpx;
          
          &.vip {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #333333;
            font-weight: 500;
          }
        }
      }
      
      .menu-arrow {
        font-size: 32rpx;
        color: #999999;
      }
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

.version-info {
  text-align: center;
  padding: 32rpx 0 48rpx;
  
  text {
    font-size: 24rpx;
    color: #999999;
  }
}
</style>