<template>
  <view class="home-page">
    <!-- Header Section -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="welcome-text">
          <text class="welcome-main">欢迎来到耶氏体育</text>
          <text class="welcome-sub">专业台球杆存储服务</text>
        </view>
        <view class="user-info" v-if="userInfo">
          <image 
            :src="userInfo.avatarUrl || '/static/default-avatar.png'" 
            class="user-avatar"
            mode="aspectFill"
          />
        </view>
      </view>
    </view>

    <!-- Storage Status Card -->
    <view class="status-card" v-if="storageStatus">
      <view class="status-header">
        <text class="status-title">当前存储状态</text>
        <text class="status-time">{{ formatTime(storageStatus.updateTime) }}</text>
      </view>
      <view class="status-content">
        <view v-if="storageStatus.hasStorage" class="has-storage">
          <view class="locker-info">
            <text class="locker-label">储物柜号：</text>
            <text class="locker-number">{{ storageStatus.lockerNumber }}</text>
          </view>
          <view class="expire-info">
            <text class="expire-label">到期时间：</text>
            <text class="expire-time">{{ formatDate(storageStatus.expiryTime) }}</text>
          </view>
          <button class="retrieve-btn" @click="navigateToRetrieve">
            取回球杆
          </button>
        </view>
        <view v-else class="no-storage">
          <image src="/static/empty-locker.png" class="empty-icon" mode="aspectFit" />
          <text class="empty-text">您当前没有存储的球杆</text>
        </view>
      </view>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view class="action-item" @click="handleScanCode">
        <view class="action-icon scan-icon">
          <text>📷</text>
        </view>
        <text class="action-text">扫码操作</text>
        <text class="action-desc">快速存取</text>
      </view>
      <view class="action-item" @click="navigateToStorage">
        <view class="action-icon store-icon">
          <text>📥</text>
        </view>
        <text class="action-text">存储球杆</text>
        <text class="action-desc">安全存放</text>
      </view>
      <view class="action-item" @click="navigateToRetrieve">
        <view class="action-icon retrieve-icon">
          <text>📤</text>
        </view>
        <text class="action-text">取回球杆</text>
        <text class="action-desc">凭证取杆</text>
      </view>
      <view class="action-item" @click="navigateToHistory">
        <view class="action-icon history-icon">
          <text>📋</text>
        </view>
        <text class="action-text">历史记录</text>
        <text class="action-desc">操作明细</text>
      </view>
    </view>

    <!-- Advertisement Banner -->
    <view class="ad-section" v-if="advertisements.length > 0">
      <swiper 
        class="ad-swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="5000"
        :duration="500"
        :circular="true"
      >
        <swiper-item v-for="(ad, index) in advertisements" :key="index">
          <view class="ad-item" @click="handleAdClick(ad)">
            <image :src="ad.imageUrl" mode="aspectFill" class="ad-image" />
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- Announcement -->
    <view class="announcement" v-if="announcement">
      <view class="announcement-icon">📢</view>
      <text class="announcement-text">{{ announcement }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      userInfo: null,
      storageStatus: null,
      advertisements: [],
      announcement: '温馨提示：请妥善保管您的存储凭证，凭证是取回球杆的唯一凭据。'
    }
  },
  onLoad() {
    this.checkLoginStatus()
    this.loadStorageStatus()
    this.loadAdvertisements()
  },
  onShow() {
    // 页面显示时刷新存储状态
    this.loadStorageStatus()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    checkLoginStatus() {
      // 检查用户登录状态
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    
    async loadStorageStatus() {
      // TODO: 调用后端API获取存储状态
      // 模拟数据
      this.storageStatus = {
        hasStorage: false,
        lockerNumber: 'A12',
        expiryTime: new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
        updateTime: new Date().getTime()
      }
    },
    
    async loadAdvertisements() {
      // TODO: 调用后端API获取广告数据
      // 模拟数据
      this.advertisements = [
        {
          id: 1,
          imageUrl: '/static/ad-banner-1.jpg',
          link: '/pages/marketplace/index'
        },
        {
          id: 2,
          imageUrl: '/static/ad-banner-2.jpg',
          link: '/pages/marketplace/index'
        }
      ]
    },
    
    async refreshData() {
      await Promise.all([
        this.loadStorageStatus(),
        this.loadAdvertisements()
      ])
      uni.stopPullDownRefresh()
    },
    
    handleScanCode() {
      uni.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: (res) => {
          // 解析扫码结果，判断是存储还是取回
          this.handleScanResult(res.result)
        },
        fail: (err) => {
          uni.showToast({
            title: '扫码失败',
            icon: 'none'
          })
        }
      })
    },
    
    handleScanResult(result) {
      // 根据扫码结果导航到相应页面
      try {
        const data = JSON.parse(result)
        if (data.type === 'locker') {
          // 扫描的是储物柜码
          uni.navigateTo({
            url: `/pages/storage/select-locker?lockerNumber=${data.lockerNumber}`
          })
        } else if (data.type === 'voucher') {
          // 扫描的是凭证码
          uni.navigateTo({
            url: `/pages/retrieval/index?voucherCode=${data.code}`
          })
        }
      } catch (e) {
        uni.showToast({
          title: '无效的二维码',
          icon: 'none'
        })
      }
    },
    
    navigateToStorage() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      uni.navigateTo({
        url: '/pages/storage/index'
      })
    },
    
    navigateToRetrieve() {
      uni.navigateTo({
        url: '/pages/retrieval/index'
      })
    },
    
    navigateToHistory() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      uni.navigateTo({
        url: '/pages/user/history'
      })
    },
    
    navigateToLogin() {
      uni.navigateTo({
        url: '/pages/user/profile'
      })
    },
    
    handleAdClick(ad) {
      if (ad.link) {
        uni.navigateTo({
          url: ad.link
        })
      }
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      return this.formatDate(timestamp)
    },
    
    formatDate(timestamp) {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.header-section {
  position: relative;
  height: 320rpx;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    border-radius: 0 0 40rpx 40rpx;
  }
  
  .header-content {
    position: relative;
    padding: 60rpx 32rpx 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .welcome-text {
      display: flex;
      flex-direction: column;
      
      .welcome-main {
        font-size: 40rpx;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 8rpx;
      }
      
      .welcome-sub {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    
    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.3);
    }
  }
}

.status-card {
  margin: -60rpx 32rpx 32rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .status-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .status-time {
      font-size: 24rpx;
      color: #999999;
    }
  }
  
  .has-storage {
    .locker-info, .expire-info {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      .locker-label, .expire-label {
        font-size: 28rpx;
        color: #666666;
        margin-right: 16rpx;
      }
      
      .locker-number {
        font-size: 36rpx;
        font-weight: 600;
        color: #1890ff;
      }
      
      .expire-time {
        font-size: 28rpx;
        color: #ff4d4f;
      }
    }
    
    .retrieve-btn {
      margin-top: 24rpx;
      width: 100%;
      height: 88rpx;
      background-color: #1890ff;
      color: #ffffff;
      font-size: 32rpx;
      font-weight: 500;
      border-radius: 44rpx;
      border: none;
    }
  }
  
  .no-storage {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
    
    .empty-icon {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 24rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  padding: 0 32rpx;
  margin-bottom: 32rpx;
  
  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx 16rpx;
    
    .action-icon {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40rpx;
      margin-bottom: 12rpx;
      
      &.scan-icon {
        background-color: #e6f7ff;
      }
      
      &.store-icon {
        background-color: #f6ffed;
      }
      
      &.retrieve-icon {
        background-color: #fff7e6;
      }
      
      &.history-icon {
        background-color: #f9f0ff;
      }
    }
    
    .action-text {
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 4rpx;
    }
    
    .action-desc {
      font-size: 22rpx;
      color: #999999;
    }
  }
}

.ad-section {
  margin: 0 32rpx 32rpx;
  
  .ad-swiper {
    height: 280rpx;
    border-radius: 16rpx;
    overflow: hidden;
    
    .ad-item {
      height: 100%;
      
      .ad-image {
        width: 100%;
        height: 100%;
      }
    }
  }
}

.announcement {
  margin: 0 32rpx 32rpx;
  padding: 20rpx 24rpx;
  background-color: #fff7e6;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  
  .announcement-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
  }
  
  .announcement-text {
    flex: 1;
    font-size: 26rpx;
    color: #fa8c16;
    line-height: 36rpx;
  }
}
</style>