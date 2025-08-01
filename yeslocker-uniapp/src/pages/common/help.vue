<template>
  <view class="help-page">
    <!-- Page Header -->
    <view class="page-header">
      <text class="page-title">帮助中心</text>
    </view>
    
    <!-- FAQ Section -->
    <view class="faq-section">
      <view class="section-title">常见问题</view>
      
      <view class="faq-list">
        <view 
          class="faq-item" 
          v-for="(item, index) in faqList" 
          :key="index"
          @click="toggleFaq(index)"
        >
          <view class="faq-question">
            <text class="question-text">{{ item.question }}</text>
            <text class="arrow-icon" :class="{ expanded: item.expanded }">›</text>
          </view>
          <view class="faq-answer" v-show="item.expanded">
            <text class="answer-text">{{ item.answer }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Contact Section -->
    <view class="contact-section">
      <view class="section-title">联系我们</view>
      
      <view class="contact-list">
        <view class="contact-item" @click="makePhoneCall">
          <view class="contact-icon">📞</view>
          <view class="contact-info">
            <text class="contact-label">客服电话</text>
            <text class="contact-value">400-123-4567</text>
          </view>
          <text class="arrow-icon">›</text>
        </view>
        
        <view class="contact-item" @click="openLocation">
          <view class="contact-icon">📍</view>
          <view class="contact-info">
            <text class="contact-label">门店地址</text>
            <text class="contact-value">上海市浦东新区张江高科技园区</text>
          </view>
          <text class="arrow-icon">›</text>
        </view>
        
        <view class="contact-item">
          <view class="contact-icon">⏰</view>
          <view class="contact-info">
            <text class="contact-label">营业时间</text>
            <text class="contact-value">每天 10:00 - 22:00</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Guide Section -->
    <view class="guide-section">
      <view class="section-title">使用指南</view>
      
      <view class="guide-list">
        <view class="guide-item" @click="viewGuide('store')">
          <text class="guide-title">如何存储球杆</text>
          <text class="arrow-icon">›</text>
        </view>
        <view class="guide-item" @click="viewGuide('retrieve')">
          <text class="guide-title">如何取回球杆</text>
          <text class="arrow-icon">›</text>
        </view>
        <view class="guide-item" @click="viewGuide('voucher')">
          <text class="guide-title">凭证使用说明</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HelpPage',
  data() {
    return {
      faqList: [
        {
          question: '存储球杆需要什么条件？',
          answer: '您需要先完成实名认证，包括微信登录和手机号验证。验证通过后即可选择储物柜存储球杆。',
          expanded: false
        },
        {
          question: '存储期限是多久？',
          answer: '每次存储的有效期为30天。到期前3天系统会发送提醒通知。如需继续存储，请在到期前取出并重新存入。',
          expanded: false
        },
        {
          question: '忘记凭证码怎么办？',
          answer: '您可以在"我的"-"我的凭证"中查看当前有效的凭证码。如果遗失手机，请联系客服处理。',
          expanded: false
        },
        {
          question: '可以帮别人取球杆吗？',
          answer: '不可以。为保障财产安全，只有凭证持有人本人才能取出球杆。',
          expanded: false
        },
        {
          question: '储物柜是否安全？',
          answer: '我们的储物柜采用电子锁系统，24小时监控，确保您的球杆安全。',
          expanded: false
        }
      ]
    }
  },
  methods: {
    toggleFaq(index) {
      this.faqList[index].expanded = !this.faqList[index].expanded
    },
    
    makePhoneCall() {
      uni.makePhoneCall({
        phoneNumber: '4001234567'
      })
    },
    
    openLocation() {
      uni.openLocation({
        latitude: 31.2014,
        longitude: 121.6033,
        name: '耶氏体育台球馆',
        address: '上海市浦东新区张江高科技园区'
      })
    },
    
    viewGuide(type) {
      // TODO: 跳转到具体的使用指南页面
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.help-page {
  min-height: 100vh;
  background-color: #f5f6f7;
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

.section-title {
  padding: 24rpx 32rpx 16rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
}

// FAQ Section
.faq-section {
  margin-bottom: 24rpx;
  
  .faq-list {
    background-color: #ffffff;
    
    .faq-item {
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 32rpx;
        
        .question-text {
          flex: 1;
          font-size: 30rpx;
          color: #333333;
          padding-right: 24rpx;
        }
        
        .arrow-icon {
          font-size: 32rpx;
          color: #999999;
          transition: transform 0.3s;
          
          &.expanded {
            transform: rotate(90deg);
          }
        }
      }
      
      .faq-answer {
        padding: 0 32rpx 32rpx;
        
        .answer-text {
          font-size: 28rpx;
          color: #666666;
          line-height: 44rpx;
        }
      }
    }
  }
}

// Contact Section
.contact-section {
  margin-bottom: 24rpx;
  
  .contact-list {
    background-color: #ffffff;
    
    .contact-item {
      display: flex;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .contact-icon {
        font-size: 48rpx;
        margin-right: 24rpx;
      }
      
      .contact-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .contact-label {
          font-size: 28rpx;
          color: #999999;
          margin-bottom: 8rpx;
        }
        
        .contact-value {
          font-size: 30rpx;
          color: #333333;
        }
      }
      
      .arrow-icon {
        font-size: 32rpx;
        color: #999999;
      }
    }
  }
}

// Guide Section
.guide-section {
  .guide-list {
    background-color: #ffffff;
    
    .guide-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .guide-title {
        font-size: 30rpx;
        color: #333333;
      }
      
      .arrow-icon {
        font-size: 32rpx;
        color: #999999;
      }
    }
  }
}
</style>