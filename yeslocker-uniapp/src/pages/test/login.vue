<template>
  <view class="test-login-container">
    <view class="header">
      <text class="title">测试登录页面</text>
      <text class="subtitle">仅用于开发环境测试</text>
    </view>
    
    <view class="login-form">
      <view class="form-item">
        <text class="label">用户名：</text>
        <input 
          v-model="username" 
          class="input" 
          placeholder="请输入用户名"
        />
      </view>
      
      <view class="form-item">
        <text class="label">密码：</text>
        <input 
          v-model="password" 
          type="password"
          class="input" 
          placeholder="请输入密码"
        />
      </view>
      
      <button class="login-btn" @click="handleLogin">
        账号密码登录
      </button>
      
      <view class="divider">
        <text>或</text>
      </view>
      
      <button class="login-btn wx-login" @click="handleWxTestLogin">
        模拟微信登录
      </button>
      
      <button class="login-btn admin-login" @click="handleAdminLogin">
        管理员登录
      </button>
    </view>
    
    <view class="test-accounts">
      <text class="section-title">测试账号：</text>
      <view class="account-item">
        <text>普通用户：user123 / user123</text>
      </view>
      <view class="account-item">
        <text>管理员：admin123 / admin123</text>
      </view>
      <view class="account-item">
        <text>储物柜管理员：locker_admin / locker123</text>
      </view>
    </view>
  </view>
</template>

<script>
import { loginByWeixin } from '@/api/auth'
import { saveToken } from '@/utils/request'
import { post } from '@/utils/request'

export default {
  name: 'TestLogin',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    // 账号密码登录
    async handleLogin() {
      if (!this.username || !this.password) {
        uni.showToast({
          title: '请输入账号密码',
          icon: 'none'
        })
        return
      }
      
      try {
        const res = await post('/auth/login', {
          username: this.username,
          password: this.password
        })
        
        this.handleLoginSuccess(res)
      } catch (error) {
        console.error('登录失败：', error)
      }
    },
    
    // 模拟微信登录
    async handleWxTestLogin() {
      try {
        // 使用测试数据模拟微信登录
        const res = await loginByWeixin({
          code: 'test_code_' + Date.now(),
          userInfo: {
            nickName: '测试用户_' + Math.floor(Math.random() * 1000),
            avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
            gender: 1,
            country: '中国',
            province: '广东',
            city: '深圳'
          }
        })
        
        this.handleLoginSuccess(res)
      } catch (error) {
        console.error('模拟微信登录失败：', error)
        uni.showToast({
          title: '登录失败：' + error.message,
          icon: 'none',
          duration: 3000
        })
      }
    },
    
    // 管理员登录
    handleAdminLogin() {
      this.username = 'admin123'
      this.password = 'admin123'
      this.handleLogin()
    },
    
    // 处理登录成功
    handleLoginSuccess(res) {
      if (res.token) {
        // 保存 token
        saveToken(res.token, res.tokenExpire || Date.now() + 7 * 24 * 60 * 60 * 1000)
        
        // 保存用户信息到 Vuex
        this.$store.commit('user/SET_USER_INFO', res.userInfo)
        this.$store.commit('user/SET_LOGIN_STATUS', true)
        
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 延迟跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/home/index'
          })
        }, 1500)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.test-login-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40rpx;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: #999;
  }
}

.login-form {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  
  .form-item {
    margin-bottom: 30rpx;
    
    .label {
      display: block;
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      padding: 0 20rpx;
      border: 1rpx solid #ddd;
      border-radius: 10rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }
  
  .login-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background-color: #2E7D32;
    color: #fff;
    font-size: 32rpx;
    border-radius: 44rpx;
    margin-top: 40rpx;
    
    &.wx-login {
      background-color: #07C160;
    }
    
    &.admin-login {
      background-color: #FF6B6B;
    }
  }
  
  .divider {
    text-align: center;
    margin: 40rpx 0;
    
    text {
      font-size: 28rpx;
      color: #999;
      padding: 0 20rpx;
      background-color: #fff;
      position: relative;
      
      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 200rpx;
        height: 1rpx;
        background-color: #ddd;
      }
      
      &::before {
        right: 100%;
        margin-right: 20rpx;
      }
      
      &::after {
        left: 100%;
        margin-left: 20rpx;
      }
    }
  }
}

.test-accounts {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .account-item {
    padding: 20rpx;
    background-color: #f5f5f5;
    border-radius: 10rpx;
    margin-bottom: 20rpx;
    
    text {
      font-size: 28rpx;
      color: #666;
    }
  }
}
</style>