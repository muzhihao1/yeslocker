<template>
  <view class="membership-page">
    <!-- Header Section -->
    <view class="header-section">
      <view class="header-bg">
        <image src="/static/vip-bg.jpg" mode="aspectFill" class="bg-image" />
        <view class="gradient-overlay"></view>
      </view>
      <view class="header-content">
        <!-- User Info -->
        <view class="user-info">
          <image 
            :src="userInfo.avatarUrl || '/static/default-avatar.png'" 
            mode="aspectFill"
            class="user-avatar"
          />
          <view class="user-details">
            <text class="user-name">{{ userInfo.nickName || '尊敬的用户' }}</text>
            <view class="vip-badge" v-if="memberInfo.isMember">
              <text class="vip-icon">👑</text>
              <text class="vip-level">{{ getMemberLevelName(memberInfo.level) }}</text>
            </view>
          </view>
        </view>
        
        <!-- Member Status -->
        <view class="member-status" v-if="memberInfo.isMember">
          <view class="status-item">
            <text class="status-label">会员到期</text>
            <text class="status-value">{{ formatExpiryDate(memberInfo.expiryDate) }}</text>
          </view>
          <view class="status-item">
            <text class="status-label">累计存储</text>
            <text class="status-value">{{ memberInfo.totalStorage }}次</text>
          </view>
        </view>
        
        <!-- Action Button -->
        <button 
          v-if="!memberInfo.isMember || isExpiringSoon"
          class="upgrade-btn"
          @click="showUpgradeModal"
        >
          <text class="btn-text">{{ memberInfo.isMember ? '续费会员' : '立即升级' }}</text>
          <text class="btn-price">¥{{ getCurrentPrice() }}/月起</text>
        </button>
      </view>
    </view>
    
    <!-- Benefits Section -->
    <view class="benefits-section">
      <view class="section-header">
        <text class="section-title">会员专享特权</text>
        <text class="section-desc">升级会员，享受更多优质服务</text>
      </view>
      
      <view class="benefits-grid">
        <view 
          v-for="benefit in benefits" 
          :key="benefit.id"
          class="benefit-item"
          :class="{ locked: !memberInfo.isMember }"
        >
          <view class="benefit-icon">{{ benefit.icon }}</view>
          <text class="benefit-title">{{ benefit.title }}</text>
          <text class="benefit-desc">{{ benefit.description }}</text>
          <view v-if="!memberInfo.isMember" class="lock-mask">
            <text class="lock-icon">🔒</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Exclusive Lockers -->
    <view class="exclusive-section" v-if="memberInfo.isMember">
      <view class="section-header">
        <text class="section-title">专属储物柜</text>
        <text class="section-desc">为您预留的专属空间</text>
      </view>
      
      <view class="locker-list">
        <view 
          v-for="locker in exclusiveLockers" 
          :key="locker.id"
          class="exclusive-locker"
          :class="{ occupied: locker.isOccupied }"
        >
          <view class="locker-icon">{{ locker.isOccupied ? '🔒' : '🔓' }}</view>
          <view class="locker-info">
            <text class="locker-number">{{ locker.number }}号柜</text>
            <text class="locker-status">{{ locker.isOccupied ? '使用中' : '可使用' }}</text>
          </view>
          <button 
            v-if="!locker.isOccupied" 
            class="use-btn"
            @click="useExclusiveLocker(locker)"
          >
            立即使用
          </button>
        </view>
      </view>
    </view>
    
    <!-- Pricing Plans -->
    <view class="pricing-section">
      <view class="section-header">
        <text class="section-title">选择会员套餐</text>
        <text class="section-desc">更长周期，更多优惠</text>
      </view>
      
      <view class="pricing-list">
        <view 
          v-for="plan in pricingPlans" 
          :key="plan.id"
          class="pricing-card"
          :class="{ recommended: plan.recommended, selected: selectedPlan === plan.id }"
          @click="selectPlan(plan.id)"
        >
          <view v-if="plan.recommended" class="recommend-tag">推荐</view>
          <text class="plan-name">{{ plan.name }}</text>
          <view class="plan-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ plan.price }}</text>
            <text class="price-unit">/{{ plan.unit }}</text>
          </view>
          <text class="plan-original" v-if="plan.originalPrice">
            原价 ¥{{ plan.originalPrice }}
          </text>
          <text class="plan-desc">{{ plan.description }}</text>
          <view class="plan-features">
            <text 
              v-for="(feature, index) in plan.features" 
              :key="index"
              class="feature-item"
            >
              ✓ {{ feature }}
            </text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- History Section -->
    <view class="history-section" v-if="memberInfo.isMember">
      <view class="section-header">
        <text class="section-title">会员权益使用记录</text>
        <button class="view-all-btn" @click="viewAllHistory">
          查看全部 ›
        </button>
      </view>
      
      <view class="history-list">
        <view 
          v-for="record in recentRecords" 
          :key="record.id"
          class="history-item"
        >
          <view class="history-icon">{{ getRecordIcon(record.type) }}</view>
          <view class="history-info">
            <text class="history-title">{{ record.title }}</text>
            <text class="history-time">{{ formatTime(record.createTime) }}</text>
          </view>
          <text class="history-value">{{ record.value }}</text>
        </view>
      </view>
    </view>
    
    <!-- Upgrade Modal -->
    <view class="modal-mask" v-if="showModal" @click="hideModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">升级会员</text>
          <text class="modal-close" @click="hideModal">×</text>
        </view>
        
        <view class="modal-body">
          <view class="selected-plan-info">
            <text class="plan-name">{{ getSelectedPlanInfo().name }}</text>
            <view class="plan-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ getSelectedPlanInfo().price }}</text>
            </view>
          </view>
          
          <view class="payment-methods">
            <text class="payment-title">选择支付方式</text>
            <label 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="payment-item"
            >
              <radio 
                :value="method.id"
                :checked="selectedPayment === method.id"
                @change="selectPayment(method.id)"
                color="#1890ff"
              />
              <image :src="method.icon" class="payment-icon" />
              <text class="payment-name">{{ method.name }}</text>
            </label>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="pay-btn" @click="handlePayment">
            立即支付 ¥{{ getSelectedPlanInfo().price }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MembershipPage',
  data() {
    return {
      userInfo: {},
      memberInfo: {
        isMember: false,
        level: 1,
        expiryDate: '',
        totalStorage: 0
      },
      benefits: [
        {
          id: 1,
          icon: '🏆',
          title: '专属储物柜',
          description: '3个VIP专用柜，优先使用'
        },
        {
          id: 2,
          icon: '⏱️',
          title: '延长存储时间',
          description: '存储时限延长至60天'
        },
        {
          id: 3,
          icon: '💰',
          title: '存储费优惠',
          description: '享受8折优惠价格'
        },
        {
          id: 4,
          icon: '🔔',
          title: '专属提醒',
          description: '到期前7天贴心提醒'
        },
        {
          id: 5,
          icon: '⚡',
          title: '快速通道',
          description: '会员专属快速存取'
        },
        {
          id: 6,
          icon: '🎁',
          title: '生日特权',
          description: '生日当月免费存储'
        }
      ],
      exclusiveLockers: [],
      pricingPlans: [
        {
          id: 'monthly',
          name: '月度会员',
          price: 29,
          originalPrice: 39,
          unit: '月',
          description: '适合短期体验',
          features: ['全部会员特权', '自动续费更优惠']
        },
        {
          id: 'quarterly',
          name: '季度会员',
          price: 79,
          originalPrice: 117,
          unit: '3个月',
          description: '省38元',
          features: ['全部会员特权', '赠送优惠券', '专属客服'],
          recommended: true
        },
        {
          id: 'yearly',
          name: '年度会员',
          price: 288,
          originalPrice: 468,
          unit: '年',
          description: '省180元',
          features: ['全部会员特权', '赠送2个月', '专属客服', '生日礼包']
        }
      ],
      selectedPlan: 'quarterly',
      recentRecords: [],
      showModal: false,
      selectedPayment: 'wechat',
      paymentMethods: [
        {
          id: 'wechat',
          name: '微信支付',
          icon: '/static/pay-wechat.png'
        },
        {
          id: 'alipay',
          name: '支付宝',
          icon: '/static/pay-alipay.png'
        }
      ]
    }
  },
  computed: {
    isExpiringSoon() {
      if (!this.memberInfo.isMember || !this.memberInfo.expiryDate) return false
      
      const now = new Date()
      const expiry = new Date(this.memberInfo.expiryDate)
      const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24))
      
      return daysLeft <= 7
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadMemberInfo()
    this.loadExclusiveLockers()
    this.loadRecentRecords()
  },
  methods: {
    loadUserInfo() {
      const userInfo = uni.getStorageSync('userInfo')
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    
    async loadMemberInfo() {
      // TODO: 调用API获取会员信息
      // 模拟数据
      this.memberInfo = {
        isMember: true,
        level: 2,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalStorage: 15
      }
    },
    
    async loadExclusiveLockers() {
      // TODO: 调用API获取专属储物柜
      // 模拟数据
      if (this.memberInfo.isMember) {
        this.exclusiveLockers = [
          { id: 1, number: 'V01', isOccupied: false },
          { id: 2, number: 'V02', isOccupied: true },
          { id: 3, number: 'V03', isOccupied: false }
        ]
      }
    },
    
    async loadRecentRecords() {
      // TODO: 调用API获取使用记录
      // 模拟数据
      if (this.memberInfo.isMember) {
        this.recentRecords = [
          {
            id: 1,
            type: 'locker',
            title: '使用专属储物柜V01',
            value: '已节省¥10',
            createTime: new Date().getTime() - 2 * 24 * 60 * 60 * 1000
          },
          {
            id: 2,
            type: 'discount',
            title: '存储费优惠',
            value: '优惠¥5',
            createTime: new Date().getTime() - 5 * 24 * 60 * 60 * 1000
          },
          {
            id: 3,
            type: 'reminder',
            title: '到期提醒服务',
            value: '已提醒',
            createTime: new Date().getTime() - 7 * 24 * 60 * 60 * 1000
          }
        ]
      }
    },
    
    getMemberLevelName(level) {
      const levels = {
        1: '银卡会员',
        2: '金卡会员',
        3: '钻石会员'
      }
      return levels[level] || '普通会员'
    },
    
    formatExpiryDate(date) {
      if (!date) return '未知'
      
      const expiry = new Date(date)
      const now = new Date()
      const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24))
      
      if (daysLeft <= 0) {
        return '已过期'
      } else if (daysLeft <= 7) {
        return `${daysLeft}天后到期`
      } else {
        const year = expiry.getFullYear()
        const month = String(expiry.getMonth() + 1).padStart(2, '0')
        const day = String(expiry.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    },
    
    getCurrentPrice() {
      const plan = this.pricingPlans.find(p => p.id === 'monthly')
      return plan ? plan.price : 29
    },
    
    showUpgradeModal() {
      this.showModal = true
    },
    
    hideModal() {
      this.showModal = false
    },
    
    selectPlan(planId) {
      this.selectedPlan = planId
    },
    
    selectPayment(methodId) {
      this.selectedPayment = methodId
    },
    
    getSelectedPlanInfo() {
      return this.pricingPlans.find(p => p.id === this.selectedPlan) || this.pricingPlans[0]
    },
    
    async handlePayment() {
      const plan = this.getSelectedPlanInfo()
      
      uni.showLoading({
        title: '正在发起支付...'
      })
      
      try {
        // TODO: 调用支付API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        uni.hideLoading()
        
        // 模拟支付成功
        uni.showToast({
          title: '支付成功',
          icon: 'success'
        })
        
        this.hideModal()
        
        // 刷新会员信息
        setTimeout(() => {
          this.loadMemberInfo()
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '支付失败',
          icon: 'none'
        })
      }
    },
    
    useExclusiveLocker(locker) {
      uni.navigateTo({
        url: `/pages/storage/index?lockerNumber=${locker.number}`
      })
    },
    
    viewAllHistory() {
      uni.navigateTo({
        url: '/pages/user/member-history'
      })
    },
    
    getRecordIcon(type) {
      const icons = {
        locker: '🏪',
        discount: '💰',
        reminder: '🔔',
        gift: '🎁'
      }
      return icons[type] || '📋'
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 24 * 60 * 60 * 1000) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `今天 ${hours}:${minutes}`
      } else if (diff < 48 * 60 * 60 * 1000) {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `昨天 ${hours}:${minutes}`
      } else {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${month}-${day}`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.membership-page {
  min-height: 100vh;
  background-color: #f5f6f7;
}

.header-section {
  position: relative;
  padding-bottom: 32rpx;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 400rpx;
    overflow: hidden;
    
    .bg-image {
      width: 100%;
      height: 100%;
    }
    
    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        180deg, 
        rgba(0, 0, 0, 0.3) 0%, 
        rgba(0, 0, 0, 0.5) 100%
      );
    }
  }
  
  .header-content {
    position: relative;
    padding: 60rpx 32rpx 32rpx;
    color: #ffffff;
    
    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 32rpx;
      
      .user-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 4rpx solid rgba(255, 255, 255, 0.3);
        margin-right: 24rpx;
      }
      
      .user-details {
        flex: 1;
        
        .user-name {
          display: block;
          font-size: 36rpx;
          font-weight: 600;
          margin-bottom: 12rpx;
        }
        
        .vip-badge {
          display: inline-flex;
          align-items: center;
          padding: 8rpx 20rpx;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-radius: 20rpx;
          
          .vip-icon {
            font-size: 24rpx;
            margin-right: 8rpx;
          }
          
          .vip-level {
            font-size: 26rpx;
            font-weight: 500;
          }
        }
      }
    }
    
    .member-status {
      display: flex;
      gap: 48rpx;
      margin-bottom: 32rpx;
      
      .status-item {
        .status-label {
          display: block;
          font-size: 26rpx;
          opacity: 0.8;
          margin-bottom: 8rpx;
        }
        
        .status-value {
          display: block;
          font-size: 32rpx;
          font-weight: 500;
        }
      }
    }
    
    .upgrade-btn {
      width: 100%;
      height: 96rpx;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      border-radius: 48rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: none;
      box-shadow: 0 8rpx 24rpx rgba(255, 165, 0, 0.3);
      
      .btn-text {
        font-size: 32rpx;
        font-weight: 600;
        color: #333333;
      }
      
      .btn-price {
        font-size: 26rpx;
        color: #666666;
        margin-top: 4rpx;
      }
    }
  }
}

.benefits-section {
  padding: 32rpx;
  background-color: #ffffff;
  margin-bottom: 24rpx;
  
  .section-header {
    text-align: center;
    margin-bottom: 32rpx;
    
    .section-title {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8rpx;
    }
    
    .section-desc {
      display: block;
      font-size: 28rpx;
      color: #666666;
    }
  }
  
  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24rpx;
    
    .benefit-item {
      position: relative;
      padding: 32rpx 16rpx;
      text-align: center;
      background-color: #f8f8f8;
      border-radius: 16rpx;
      transition: all 0.3s;
      
      .benefit-icon {
        font-size: 48rpx;
        margin-bottom: 16rpx;
      }
      
      .benefit-title {
        display: block;
        font-size: 28rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 8rpx;
      }
      
      .benefit-desc {
        display: block;
        font-size: 24rpx;
        color: #666666;
        line-height: 1.4;
      }
      
      &.locked {
        opacity: 0.7;
        
        .lock-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 16rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .lock-icon {
            font-size: 40rpx;
            opacity: 0.5;
          }
        }
      }
      
      &:not(.locked):active {
        transform: scale(0.95);
        background-color: #e6f7ff;
      }
    }
  }
}

.exclusive-section {
  padding: 32rpx;
  background-color: #ffffff;
  margin-bottom: 24rpx;
  
  .section-header {
    margin-bottom: 24rpx;
    
    .section-title {
      display: block;
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
      margin-bottom: 8rpx;
    }
    
    .section-desc {
      display: block;
      font-size: 28rpx;
      color: #666666;
    }
  }
  
  .locker-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    
    .exclusive-locker {
      display: flex;
      align-items: center;
      padding: 24rpx;
      background-color: #f8f8f8;
      border-radius: 12rpx;
      
      .locker-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }
      
      .locker-info {
        flex: 1;
        
        .locker-number {
          display: block;
          font-size: 30rpx;
          font-weight: 500;
          color: #333333;
          margin-bottom: 4rpx;
        }
        
        .locker-status {
          display: block;
          font-size: 26rpx;
          color: #666666;
        }
      }
      
      .use-btn {
        padding: 16rpx 32rpx;
        background-color: #1890ff;
        color: #ffffff;
        border-radius: 8rpx;
        font-size: 28rpx;
        border: none;
      }
      
      &.occupied {
        opacity: 0.7;
        
        .locker-status {
          color: #ff4d4f;
        }
      }
    }
  }
}

.pricing-section {
  padding: 32rpx;
  background-color: #ffffff;
  margin-bottom: 24rpx;
  
  .section-header {
    text-align: center;
    margin-bottom: 32rpx;
    
    .section-title {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8rpx;
    }
    
    .section-desc {
      display: block;
      font-size: 28rpx;
      color: #666666;
    }
  }
  
  .pricing-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    
    .pricing-card {
      position: relative;
      padding: 32rpx;
      background-color: #f8f8f8;
      border-radius: 16rpx;
      border: 2rpx solid transparent;
      transition: all 0.3s;
      
      .recommend-tag {
        position: absolute;
        top: 0;
        right: 32rpx;
        padding: 8rpx 20rpx;
        background-color: #ff4d4f;
        color: #ffffff;
        font-size: 24rpx;
        border-radius: 0 0 8rpx 8rpx;
      }
      
      .plan-name {
        display: block;
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 16rpx;
      }
      
      .plan-price {
        display: flex;
        align-items: baseline;
        margin-bottom: 12rpx;
        
        .price-symbol {
          font-size: 32rpx;
          color: #ff4d4f;
          margin-right: 4rpx;
        }
        
        .price-value {
          font-size: 56rpx;
          font-weight: 600;
          color: #ff4d4f;
        }
        
        .price-unit {
          font-size: 28rpx;
          color: #666666;
          margin-left: 8rpx;
        }
      }
      
      .plan-original {
        display: block;
        font-size: 26rpx;
        color: #999999;
        text-decoration: line-through;
        margin-bottom: 12rpx;
      }
      
      .plan-desc {
        display: block;
        font-size: 28rpx;
        color: #666666;
        margin-bottom: 20rpx;
      }
      
      .plan-features {
        .feature-item {
          display: block;
          font-size: 26rpx;
          color: #666666;
          margin-bottom: 8rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
      
      &.recommended {
        background-color: #fff7e6;
        border-color: #ffa500;
      }
      
      &.selected {
        border-color: #1890ff;
        background-color: #e6f7ff;
      }
    }
  }
}

.history-section {
  padding: 32rpx;
  background-color: #ffffff;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .view-all-btn {
      padding: 0;
      background: none;
      border: none;
      font-size: 28rpx;
      color: #1890ff;
    }
  }
  
  .history-list {
    .history-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .history-icon {
        font-size: 36rpx;
        margin-right: 20rpx;
      }
      
      .history-info {
        flex: 1;
        
        .history-title {
          display: block;
          font-size: 28rpx;
          color: #333333;
          margin-bottom: 4rpx;
        }
        
        .history-time {
          display: block;
          font-size: 24rpx;
          color: #999999;
        }
      }
      
      .history-value {
        font-size: 28rpx;
        color: #52c41a;
        font-weight: 500;
      }
    }
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  width: 100%;
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .modal-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .modal-close {
      font-size: 40rpx;
      color: #999999;
    }
  }
  
  .modal-body {
    padding: 32rpx;
    
    .selected-plan-info {
      text-align: center;
      padding: 32rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 32rpx;
      
      .plan-name {
        display: block;
        font-size: 32rpx;
        color: #666666;
        margin-bottom: 16rpx;
      }
      
      .plan-price {
        display: flex;
        align-items: baseline;
        justify-content: center;
        
        .price-symbol {
          font-size: 36rpx;
          color: #ff4d4f;
          margin-right: 4rpx;
        }
        
        .price-value {
          font-size: 64rpx;
          font-weight: 600;
          color: #ff4d4f;
        }
      }
    }
    
    .payment-methods {
      .payment-title {
        display: block;
        font-size: 30rpx;
        color: #333333;
        margin-bottom: 24rpx;
      }
      
      .payment-item {
        display: flex;
        align-items: center;
        padding: 24rpx;
        background-color: #f8f8f8;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
        
        .payment-icon {
          width: 48rpx;
          height: 48rpx;
          margin: 0 20rpx;
        }
        
        .payment-name {
          flex: 1;
          font-size: 30rpx;
          color: #333333;
        }
      }
    }
  }
  
  .modal-footer {
    padding: 32rpx;
    padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
    
    .pay-btn {
      width: 100%;
      height: 96rpx;
      background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
      color: #ffffff;
      border-radius: 48rpx;
      font-size: 32rpx;
      font-weight: 500;
      border: none;
      box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);
    }
  }
}
</style>