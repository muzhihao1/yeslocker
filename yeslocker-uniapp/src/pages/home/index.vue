<template>
  <view class="home-page">
    <!-- Loading Skeleton -->
    <home-page-skeleton v-if="loading" />
    
    <!-- Main Content -->
    <view v-else>
    <!-- Header Section -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="welcome-text">
          <text class="welcome-main">欢迎来到耶氏体育</text>
          <text class="welcome-sub">专业台球杆存储服务</text>
        </view>
        <view class="user-info" v-if="userInfo">
          <lazy-image 
            :src="userInfo.avatarUrl || '/static/default-avatar.png'" 
            custom-class="user-avatar"
            mode="aspectFill"
            :width="60"
            :height="60"
          />
        </view>
      </view>
    </view>

    <!-- Storage Status Card -->
    <!-- 暂时总是显示，方便演示 -->
    <view class="status-card" v-if="storageStatus.lockerNumber">
      <view class="status-header">
        <text class="status-title">我的专属储物柜</text>
        <text class="status-time">{{ formatTime(new Date()) }}</text>
      </view>
      <view class="status-content">
        <view class="locker-assigned">
          <view class="locker-info">
            <text class="locker-label">柜号：</text>
            <text class="locker-number">{{ storageStatus.lockerNumber }}</text>
          </view>
          <view class="locker-status">
            <text class="status-label">状态：</text>
            <text class="status-value" :class="storageStatus.hasStorage ? 'occupied' : 'available'">
              {{ storageStatus.hasStorage ? '已存放' : '空闲' }}
            </text>
          </view>
          
          <!-- 如果有存储，显示凭证信息 -->
          <view v-if="storageStatus.hasStorage && storageStatus.voucher" class="voucher-info">
            <view class="voucher-code">
              <text class="voucher-label">凭证码：</text>
              <text class="voucher-value">{{ storageStatus.voucher.code }}</text>
            </view>
            <view class="storage-time">
              <text class="time-label">存储时间：</text>
              <text class="time-value">{{ formatDate(storageStatus.voucher.createdAt) }}</text>
            </view>
            <view class="days-info">
              <text class="days-label">已存天数：</text>
              <text class="days-value">{{ storageStatus.daysUsed }} 天</text>
              <text class="days-remain">（剩余 {{ storageStatus.daysRemaining }} 天）</text>
            </view>
          </view>
          
          <view class="action-buttons">
            <button v-if="!storageStatus.hasStorage" class="store-request-btn" @click="navigateToStoreRequest">
              申请存杆
            </button>
            <button v-else class="retrieve-request-btn" @click="navigateToRetrieveRequest">
              申请取杆
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 无储物柜提示 -->
    <view class="status-card" v-else-if="userInfo && !storageStatus.lockerNumber">
      <view class="no-locker">
        <image class="no-locker-icon" src="/static/empty-locker.png" mode="aspectFit"></image>
        <text class="no-locker-text">您还未分配专属储物柜</text>
        <button class="select-locker-btn" @click="navigateToSelectLocker">完成注册</button>
      </view>
    </view>

    <!-- Quick Actions -->
    <view class="quick-actions">
      <view class="action-item" @click="startScanForRetrieve">
        <view class="action-icon scan-icon">
          <text>📷</text>
        </view>
        <text class="action-text">扫码取杆</text>
        <text class="action-desc">快速取回</text>
      </view>
      <view class="action-item" @click="navigateToMyLocker">
        <view class="action-icon locker-icon">
          <text>🗄️</text>
        </view>
        <text class="action-text">我的柜子</text>
        <text class="action-desc">查看详情</text>
      </view>
      <view class="action-item" @click="navigateToRequests">
        <view class="action-icon request-icon">
          <text>📝</text>
        </view>
        <text class="action-text">申请记录</text>
        <text class="action-desc">查看进度</text>
      </view>
      <view class="action-item" @click="navigateToHistory">
        <view class="action-icon history-icon">
          <text>📋</text>
        </view>
        <text class="action-text">历史记录</text>
        <text class="action-desc">存取明细</text>
      </view>
    </view>

    <!-- Advertisement Banner -->
    <view class="ad-section" v-if="advertisements.length > 0">
      <advertisement
        type="carousel"
        :ad-list="advertisements"
        :show-close-btn="false"
        position="home_banner"
        @click="handleAdClick"
        @exposure="handleAdExposure"
      />
    </view>

    <!-- Announcement -->
    <view class="announcement" v-if="announcement">
      <view class="announcement-icon">📢</view>
      <text class="announcement-text">{{ announcement }}</text>
    </view>
    
    <!-- Popup Advertisement -->
    <advertisement
      v-if="showPopupAd"
      type="popup"
      :ad-data="popupAd"
      position="home_popup"
      @click="handlePopupAdClick"
      @close="handlePopupAdClose"
    />
    </view>
    
    <!-- Network Error -->
    <network-error 
      v-if="networkError"
      title="无法连接到服务器"
      message="请检查网络连接后重试"
      @retry="retryLoading"
    />
  </view>
</template>

<script>
import { scanQRCode, parseScanResult } from '@/utils/wechat'
import Advertisement from '@/components/molecules/Advertisement.vue'
import HomePageSkeleton from '@/components/molecules/HomePageSkeleton.vue'
import NetworkError from '@/components/atoms/NetworkError.vue'
import { getMyLocker, getActiveRequest } from '@/api/locker'
import { getMyVouchers } from '@/api/voucher'
import { toast } from '@/utils/toast'

export default {
  name: 'HomePage',
  components: {
    Advertisement,
    HomePageSkeleton,
    NetworkError
  },
  data() {
    return {
      loading: true,
      networkError: false,
      userInfo: null,
      storageStatus: {
        hasStorage: false,
        updateTime: new Date().getTime(),
        lockerNumber: null,
        lockerId: null,
        voucher: null,
        daysUsed: 0,
        daysRemaining: 30
      },
      advertisements: [],
      announcement: '温馨提示：请妥善保管您的存储凭证，凭证是取回球杆的唯一凭据。',
      showPopupAd: false,
      popupAd: {
        id: 'popup_welcome',
        title: '新人专享礼',
        imageUrl: '/static/ad-banner-1.jpg',
        linkType: 'page',
        linkUrl: '/pages/user/profile'
      }
    }
  },
  async onLoad() {
    this.checkLoginStatus()
    await this.initializeData()
  },
  onShow() {
    // 页面显示时刷新存储状态
    this.checkLoginStatus()
    this.loadStorageStatus()
    this.checkActiveRequest()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    async initializeData() {
      this.loading = true
      this.networkError = false
      
      try {
        // 并行加载所有数据
        await Promise.all([
          this.loadStorageStatus(),
          this.loadAdvertisements(),
          this.checkActiveRequest()
        ])
        
        // 检查注册状态
        this.checkRegistrationStatus()
        
        // 检查是否显示弹窗广告
        this.checkShowPopupAd()
        
        this.loading = false
      } catch (error) {
        console.error('初始化失败:', error)
        this.loading = false
        
        // 判断是否是网络错误
        if (error.type === 'NETWORK_ERROR' || !navigator.onLine) {
          this.networkError = true
        } else {
          toast.error('加载失败，请稍后重试')
        }
      }
    },
    
    async retryLoading() {
      await this.initializeData()
    },
    
    checkLoginStatus() {
      // 检查用户登录状态
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    
    checkRegistrationStatus() {
      // 检查用户是否已选择储物柜
      if (this.userInfo && !this.userInfo.locker_id) {
        uni.showModal({
          title: '提示',
          content: '您还未选择专属储物柜，请先完成注册',
          confirmText: '去注册',
          cancelText: '稍后',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/auth/register'
              })
            }
          }
        })
      }
    },
    
    async loadStorageStatus() {
      // 先检查是否登录
      if (!this.userInfo) {
        this.storageStatus = {
          hasStorage: false,
          updateTime: new Date().getTime(),
          lockerNumber: null,
          lockerId: null,
          voucher: null,
          daysUsed: 0,
          daysRemaining: 30
        }
        return
      }
      
      try {
        // 并行获取储物柜信息和凭证信息
        const [lockerRes, voucherRes] = await Promise.all([
          getMyLocker(),
          getMyVouchers({ status: 'active', limit: 1 })
        ])
        
        if (lockerRes.errno === 0 && lockerRes.data) {
          const lockerData = lockerRes.data
          
          // 判断是否有存储（根据柜子状态）
          const hasStorage = lockerData.status === 'occupied' && 
                           lockerData.currentUserId === this.userInfo.id
          
          // 初始化存储状态
          this.storageStatus = {
            hasStorage: hasStorage,
            updateTime: new Date().getTime(),
            lockerNumber: lockerData.lockerNumber || lockerData.number,
            lockerId: lockerData.id,
            voucher: null,
            daysUsed: 0,
            daysRemaining: 30
          }
          
          // 如果有存储且有活跃凭证，更新凭证信息
          if (hasStorage && voucherRes.errno === 0 && voucherRes.data && voucherRes.data.list && voucherRes.data.list.length > 0) {
            const activeVoucher = voucherRes.data.list[0]
            this.storageStatus.voucher = activeVoucher
            
            // 计算存储天数
            const createdDate = new Date(activeVoucher.createdAt || activeVoucher.createTime)
            const now = new Date()
            const diffTime = Math.abs(now - createdDate)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            this.storageStatus.daysUsed = diffDays
            this.storageStatus.daysRemaining = Math.max(0, 30 - diffDays)
          }
          
          // 更新用户信息中的柜子信息
          if (this.userInfo) {
            this.userInfo.lockerId = lockerData.id
            this.userInfo.lockerNumber = this.storageStatus.lockerNumber
          }
        } else {
          // API调用失败，但不使用硬编码的默认值
          console.error('获取储物柜信息失败', lockerRes.errmsg)
          // 只保留必要的空状态
          this.storageStatus = {
            hasStorage: false,
            updateTime: new Date().getTime(),
            lockerNumber: null,
            lockerId: null,
            voucher: null,
            daysUsed: 0,
            daysRemaining: 30
          }
        }
      } catch (error) {
        console.error('获取储物柜状态失败', error)
        // 出错时不使用默认值，保持空状态
        this.storageStatus = {
          hasStorage: false,
          updateTime: new Date().getTime(),
          lockerNumber: null,
          lockerId: null,
          voucher: null,
          daysUsed: 0,
          daysRemaining: 30
        }
      }
    },
    
    
    async loadAdvertisements() {
      // TODO: 调用后端API获取广告数据
      // 模拟数据
      this.advertisements = [
        {
          id: 1,
          title: '新用户专享优惠',
          imageUrl: '/static/ad-banner-1.jpg',
          linkType: 'page',
          linkUrl: '/pages/marketplace/index',
          priority: 1
        },
        {
          id: 2,
          title: '会员储物柜限时特惠',
          imageUrl: '/static/ad-banner-1.jpg',
          linkType: 'page',
          linkUrl: '/pages/user/index',
          priority: 2
        },
        {
          id: 3,
          title: '推荐好友得奖励',
          imageUrl: '/static/ad-banner-1.jpg',
          linkType: 'webview',
          linkUrl: 'https://example.com/promotion',
          priority: 3
        }
      ]
    },
    
    async refreshData() {
      try {
        await Promise.all([
          this.loadStorageStatus(),
          this.loadAdvertisements(),
          this.checkActiveRequest()
        ])
        
        toast.success('刷新成功')
      } catch (error) {
        toast.error('刷新失败')
      } finally {
        uni.stopPullDownRefresh()
      }
    },
    
    navigateToStoreRequest() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      uni.navigateTo({
        url: '/pages/storage/request?type=store'
      })
    },
    
    navigateToRetrieveRequest() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      // 如果有凭证码，直接跳转到取杆页面
      if (this.storageStatus.voucher && this.storageStatus.voucher.code) {
        uni.navigateTo({
          url: `/pages/retrieval/index?code=${this.storageStatus.voucher.code}`
        })
      } else {
        uni.navigateTo({
          url: '/pages/storage/request?type=retrieve'
        })
      }
    },
    
    navigateToSelectLocker() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      uni.navigateTo({
        url: '/pages/auth/register'
      })
    },
    
    navigateToMyLocker() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      uni.navigateTo({
        url: '/pages/locker/detail'
      })
    },
    
    navigateToRequests() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      uni.navigateTo({
        url: '/pages/storage/requests'
      })
    },
    
    navigateToMarket() {
      uni.navigateTo({
        url: '/pages/marketplace/index'
      })
    },
    
    navigateToHistory() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      uni.switchTab({
        url: '/pages/user/history'
      })
    },
    
    async startScanForRetrieve() {
      if (!this.userInfo) {
        this.navigateToLogin()
        return
      }
      
      try {
        // 调用扫码功能
        const result = await scanQRCode({
          onlyFromCamera: true,
          scanType: ['qrCode']
        })
        
        // 解析扫码结果
        const data = parseScanResult(result)
        
        if (data.type === 'voucher') {
          // 跳转到取杆页面，带上凭证码
          uni.navigateTo({
            url: `/pages/retrieval/index?code=${data.voucherCode}`
          })
        } else {
          // 不是凭证码，提示用户
          uni.showModal({
            title: '提示',
            content: '请扫描储物凭证二维码',
            showCancel: false
          })
        }
      } catch (error) {
        // 扫码失败或取消
        if (error.message !== '用户取消授权' && error.message !== '用户取消扫码') {
          uni.showToast({
            title: error.message || '扫码失败',
            icon: 'none'
          })
        }
      }
    },
    
    navigateToLogin() {
      uni.navigateTo({
        url: '/pages/user/profile'
      })
    },
    
    async checkActiveRequest() {
      if (!this.userInfo) return
      
      try {
        const res = await getActiveRequest()
        if (res.errno === 0 && res.data) {
          // 有进行中的申请，提示用户
          toast.info('您有进行中的申请', {
            duration: 3000,
            showAction: true,
            actionText: '查看',
            onAction: () => {
              uni.navigateTo({
                url: `/pages/storage/request-detail?id=${res.data.id}`
              })
            }
          })
        }
      } catch (error) {
        console.error('检查活跃申请失败', error)
      }
    },
    
    handleAdClick(ad) {
      // 广告点击已在组件内部处理
      console.log('广告被点击:', ad)
      
      // 可以添加额外的业务逻辑
      // 比如记录用户行为等
    },
    
    handleAdExposure(ad) {
      // 广告曝光事件
      console.log('广告曝光:', ad)
      
      // TODO: 可以在这里添加额外的统计逻辑
    },
    
    checkShowPopupAd() {
      // 检查是否显示弹窗广告
      const hasShownPopup = uni.getStorageSync('hasShownWelcomePopup')
      
      if (!hasShownPopup && !this.userInfo) {
        // 新用户第一次访问，延迟显示弹窗
        setTimeout(() => {
          this.showPopupAd = true
        }, 2000)
      }
    },
    
    handlePopupAdClick(ad) {
      // 弹窗广告点击
      console.log('弹窗广告被点击:', ad)
      
      // 记录已显示过弹窗
      uni.setStorageSync('hasShownWelcomePopup', true)
      
      // 关闭弹窗
      this.showPopupAd = false
    },
    
    handlePopupAdClose() {
      // 弹窗广告关闭
      console.log('弹窗广告被关闭')
      
      // 记录已显示过弹窗
      uni.setStorageSync('hasShownWelcomePopup', true)
      
      // 关闭弹窗
      this.showPopupAd = false
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
  height: 260rpx;
  
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
  margin: 32rpx;
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
  
  .locker-assigned {
    .locker-info, .locker-status {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .locker-label, .status-label {
        font-size: 28rpx;
        color: #666666;
        margin-right: 16rpx;
      }
      
      .locker-number {
        font-size: 40rpx;
        font-weight: 600;
        color: #1890ff;
      }
      
      .status-value {
        font-size: 28rpx;
        font-weight: 500;
        
        &.available {
          color: #52c41a;
        }
        
        &.occupied {
          color: #fa8c16;
        }
      }
    }
    
    .voucher-info {
      background-color: #f0f8ff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin: 20rpx 0;
      
      .voucher-code, .storage-time, .days-info {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .voucher-label, .time-label, .days-label {
          font-size: 26rpx;
          color: #666666;
          margin-right: 12rpx;
        }
        
        .voucher-value {
          font-size: 32rpx;
          font-weight: 600;
          color: #1890ff;
          letter-spacing: 2rpx;
        }
        
        .time-value {
          font-size: 26rpx;
          color: #333333;
        }
        
        .days-value {
          font-size: 28rpx;
          font-weight: 500;
          color: #fa8c16;
        }
        
        .days-remain {
          font-size: 24rpx;
          color: #999999;
          margin-left: 8rpx;
        }
      }
    }
    
    .action-buttons {
      margin-top: 24rpx;
      
      .store-request-btn, .retrieve-request-btn {
        width: 100%;
        height: 88rpx;
        color: #ffffff;
        font-size: 32rpx;
        font-weight: 500;
        border-radius: 44rpx;
        border: none;
        margin-bottom: 16rpx;
      }
      
      .store-request-btn {
        background-color: #52c41a;
      }
      
      .retrieve-request-btn {
        background-color: #1890ff;
      }
    }
  }
  
  .no-locker {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
    
    .no-locker-icon {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 24rpx;
    }
    
    .no-locker-text {
      font-size: 28rpx;
      color: #999999;
      margin-bottom: 32rpx;
    }
    
    .select-locker-btn {
      width: 240rpx;
      height: 80rpx;
      background-color: #1890ff;
      color: #ffffff;
      font-size: 30rpx;
      font-weight: 500;
      border-radius: 40rpx;
      border: none;
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
      
      &.locker-icon {
        background-color: #f0f5ff;
      }
      
      &.request-icon {
        background-color: #f6ffed;
      }
      
      &.history-icon {
        background-color: #fff7e6;
      }
      
      &.market-icon {
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