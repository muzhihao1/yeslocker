<template>
  <view class="mock-login-page">
    <view class="header">
      <text class="title">Mock 登录测试</text>
      <text class="subtitle">选择测试场景进行登录</text>
    </view>
    
    <view class="test-scenarios">
      <view 
        v-for="scenario in scenarios" 
        :key="scenario.code"
        class="scenario-card"
        @click="testLogin(scenario)"
      >
        <view class="scenario-header">
          <text class="scenario-title">{{ scenario.title }}</text>
          <view class="scenario-badge" :class="scenario.badgeClass">
            {{ scenario.badge }}
          </view>
        </view>
        <text class="scenario-desc">{{ scenario.description }}</text>
        <view class="scenario-features">
          <text v-for="(feature, index) in scenario.features" :key="index" class="feature">
            • {{ feature }}
          </text>
        </view>
      </view>
    </view>
    
    <view v-if="loginResult" class="result-panel">
      <view class="result-header">
        <text class="result-title">登录结果</text>
        <text class="close-btn" @click="loginResult = null">关闭</text>
      </view>
      <view class="result-content">
        <pre>{{ JSON.stringify(loginResult, null, 2) }}</pre>
      </view>
    </view>
    
    <view class="tips">
      <text class="tip-title">使用说明：</text>
      <text class="tip-item">1. 确保后端启用了 Mock 模式</text>
      <text class="tip-item">2. 点击场景卡片进行测试登录</text>
      <text class="tip-item">3. 查看返回的用户数据</text>
      <text class="tip-item">4. 测试不同场景的业务流程</text>
    </view>
  </view>
</template>

<script>
import { loginByWeixin } from '@/api/auth';

export default {
  name: 'MockLogin',
  data() {
    return {
      scenarios: [
        {
          code: 'test-new-user-001',
          title: '新用户',
          badge: 'NEW',
          badgeClass: 'badge-new',
          description: '未认证的新用户，需要完成注册流程',
          features: [
            '无手机号',
            '未分配储物柜',
            '需要身份验证'
          ]
        },
        {
          code: 'test-verified-user-001',
          title: '已认证用户',
          badge: '已认证',
          badgeClass: 'badge-verified',
          description: '完成身份验证，已分配储物柜',
          features: [
            '手机号已验证',
            '已分配储物柜',
            '可直接存取'
          ]
        },
        {
          code: 'test-active-storage-001',
          title: '存储中用户',
          badge: '存储中',
          badgeClass: 'badge-active',
          description: '当前有球杆存储在柜中',
          features: [
            '有活跃存储',
            '显示剩余天数',
            '可查看凭证'
          ]
        },
        {
          code: 'test-expired-storage-001',
          title: '超期存储用户',
          badge: '已超期',
          badgeClass: 'badge-expired',
          description: '存储已超过30天',
          features: [
            '存储已超期',
            '需要支付超期费用',
            '提醒清理'
          ]
        },
        {
          code: 'test-vip-user-001',
          title: 'VIP会员',
          badge: 'VIP',
          badgeClass: 'badge-vip',
          description: '享有VIP特权的会员用户',
          features: [
            'VIP专属储物柜',
            '延长存储期限',
            '优先使用权'
          ]
        },
        {
          code: 'test-admin-001',
          title: '管理员',
          badge: 'ADMIN',
          badgeClass: 'badge-admin',
          description: '系统管理员账号',
          features: [
            '系统管理权限',
            '查看所有储物柜',
            '管理用户数据'
          ]
        }
      ],
      loginResult: null
    };
  },
  
  methods: {
    async testLogin(scenario) {
      uni.showLoading({
        title: '登录中...'
      });
      
      try {
        // 模拟微信登录数据
        const wxLoginData = {
          code: scenario.code,
          userInfo: {
            nickName: scenario.title + '测试',
            avatarUrl: '/static/default-avatar.png',
            gender: 1,
            country: '中国',
            province: '北京',
            city: '北京',
            language: 'zh_CN'
          }
        };
        
        // 调用登录接口
        const res = await loginByWeixin(wxLoginData);
        
        uni.hideLoading();
        
        // 登录成功（Mock 模式下总是成功）
        // 保存登录信息
        uni.setStorageSync('token', res.token);
        uni.setStorageSync('userInfo', res.userInfo);
        uni.setStorageSync('isVerified', res.userInfo.isVerified || false);
        
        // 显示结果
        this.loginResult = res;
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        
        // 延迟跳转或提示
        setTimeout(() => {
          if (!res.userInfo.isVerified) {
            uni.showModal({
              title: '提示',
              content: '您还未完成身份认证，是否前往认证？',
              confirmText: '去认证',
              cancelText: '稍后',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.navigateTo({
                    url: '/pages/auth/register'
                  });
                }
              }
            });
          } else {
            uni.showModal({
              title: '登录成功',
              content: '是否返回首页？',
              confirmText: '返回首页',
              cancelText: '留在此页',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.switchTab({
                    url: '/pages/home/index'
                  });
                }
              }
            });
          }
        }, 1500);
      } catch (error) {
        uni.hideLoading();
        console.error('Login error:', error);
        uni.showToast({
          title: '登录异常',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.mock-login-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
  
  .title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-top: 10rpx;
  }
}

.test-scenarios {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.scenario-card {
  width: 48%;
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  &:active {
    transform: scale(0.98);
  }
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.scenario-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.scenario-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  
  &.badge-new {
    background: #e3f2fd;
    color: #1976d2;
  }
  
  &.badge-verified {
    background: #e8f5e9;
    color: #388e3c;
  }
  
  &.badge-active {
    background: #fff3e0;
    color: #f57c00;
  }
  
  &.badge-expired {
    background: #ffebee;
    color: #d32f2f;
  }
  
  &.badge-vip {
    background: #fce4ec;
    color: #c2185b;
  }
  
  &.badge-admin {
    background: #f3e5f5;
    color: #7b1fa2;
  }
}

.scenario-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.scenario-features {
  .feature {
    display: block;
    font-size: 24rpx;
    color: #999;
    line-height: 1.8;
  }
}

.result-panel {
  position: fixed;
  top: 100rpx;
  left: 20rpx;
  right: 20rpx;
  max-height: 70vh;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
  
  .result-title {
    font-size: 32rpx;
    font-weight: bold;
  }
  
  .close-btn {
    color: #1976d2;
    font-size: 28rpx;
  }
}

.result-content {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
  
  pre {
    font-size: 24rpx;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.tips {
  margin-top: 40rpx;
  padding: 30rpx;
  background: white;
  border-radius: 16rpx;
  
  .tip-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .tip-item {
    display: block;
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
  }
}
</style>