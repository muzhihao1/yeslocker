# 🔐 微信小程序登录最新解决方案

基于微信官方文档，提供完整的登录解决方案。

## 📋 微信登录规则变更说明

### 重要变更（2021年4月起）
- `getUserProfile` 必须通过用户点击手势触发
- `open-type="getUserInfo"` 按钮方式已废弃
- 推荐使用静默登录 + 手机号授权方式

## 🚀 立即可用的解决方案

### ✅ 方案1：使用测试登录（已实现）

刚才已经为您添加了开发环境的测试登录入口：

1. **重新编译项目**
   ```bash
   cd yeslocker-uniapp
   npm run dev:mp-weixin
   ```

2. **刷新开发者工具**后，进入"我的"页面

3. **点击绿色"🧪 测试登录"按钮**

4. **使用测试账号**：
   - 普通用户：user123 / user123
   - 管理员：admin123 / admin123

### 🎯 方案2：修复微信登录（推荐生产环境使用）

根据微信官方文档，正确的登录流程应该是：

#### 1. 修改登录流程

创建新文件 `src/utils/wechat-login-new.js`：

```javascript
/**
 * 新版微信登录流程
 * 基于 wx.login 静默登录
 */

import { getBaseUrl } from './request'

/**
 * 静默登录
 * @returns {Promise<Object>} 返回用户信息和 token
 */
export async function silentLogin() {
  try {
    // 1. 获取登录凭证（静默，无需用户授权）
    const loginRes = await uni.login({
      provider: 'weixin'
    })
    
    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }
    
    // 2. 发送 code 到后端
    const { data } = await uni.request({
      url: `${getBaseUrl()}/wx/auth/login`,
      method: 'POST',
      data: {
        code: loginRes.code,
        loginType: 'silent' // 标识为静默登录
      }
    })
    
    if (data.errno !== 0) {
      throw new Error(data.errmsg || '登录失败')
    }
    
    // 3. 保存登录信息
    const loginData = data.data
    uni.setStorageSync('token', loginData.token)
    uni.setStorageSync('userInfo', loginData.userInfo)
    
    return loginData
  } catch (error) {
    console.error('静默登录失败:', error)
    throw error
  }
}

/**
 * 获取手机号（需要用户授权）
 * 使用 button 的 open-type="getPhoneNumber"
 */
export async function getPhoneNumber(e) {
  if (!e.detail.code) {
    throw new Error('用户拒绝授权手机号')
  }
  
  try {
    const { data } = await uni.request({
      url: `${getBaseUrl()}/wx/auth/phone`,
      method: 'POST',
      data: {
        code: e.detail.code,
        token: uni.getStorageSync('token')
      }
    })
    
    if (data.errno !== 0) {
      throw new Error(data.errmsg || '获取手机号失败')
    }
    
    // 更新用户信息
    const userInfo = uni.getStorageSync('userInfo') || {}
    userInfo.phoneNumber = data.data.phoneNumber
    uni.setStorageSync('userInfo', userInfo)
    
    return data.data
  } catch (error) {
    console.error('获取手机号失败:', error)
    throw error
  }
}
```

#### 2. 修改个人资料页面

更新 `src/pages/user/profile.vue`：

```vue
<template>
  <view class="profile-page">
    <!-- Not Logged In State -->
    <view v-if="!isLoggedIn" class="login-container">
      <!-- ... existing code ... -->
      
      <view class="login-content">
        <!-- 静默登录按钮 -->
        <button 
          class="login-btn wechat-btn" 
          @click="handleSilentLogin"
          :loading="loginLoading"
          :disabled="loginLoading"
        >
          <text class="btn-icon">🔑</text>
          <text class="btn-text">微信快速登录</text>
        </button>
        
        <!-- 手机号授权按钮（登录后显示） -->
        <button 
          v-if="isLoggedIn && !userInfo.phoneNumber"
          class="login-btn phone-btn"
          open-type="getPhoneNumber"
          @getphonenumber="handleGetPhoneNumber"
        >
          <text class="btn-icon">📱</text>
          <text class="btn-text">绑定手机号</text>
        </button>
        
        <!-- ... existing test login button ... -->
      </view>
    </view>
  </view>
</template>

<script>
import { silentLogin, getPhoneNumber } from '@/utils/wechat-login-new'

export default {
  data() {
    return {
      loginLoading: false,
      // ... existing data
    }
  },
  
  methods: {
    // 静默登录
    async handleSilentLogin() {
      this.loginLoading = true
      uni.showLoading({
        title: '登录中...',
        mask: true
      })
      
      try {
        await silentLogin()
        this.checkLoginStatus()
        
        // 登录成功后，可以引导用户绑定手机号
        if (!this.userInfo.phoneNumber) {
          uni.showToast({
            title: '登录成功，建议绑定手机号',
            icon: 'none',
            duration: 3000
          })
        }
      } catch (error) {
        uni.showModal({
          title: '登录失败',
          content: error.message || '请稍后重试',
          showCancel: false
        })
      } finally {
        this.loginLoading = false
        uni.hideLoading()
      }
    },
    
    // 获取手机号
    async handleGetPhoneNumber(e) {
      try {
        await getPhoneNumber(e)
        this.checkLoginStatus()
        
        uni.showToast({
          title: '手机号绑定成功',
          icon: 'success'
        })
      } catch (error) {
        if (error.message !== '用户拒绝授权手机号') {
          uni.showModal({
            title: '绑定失败',
            content: error.message || '请稍后重试',
            showCancel: false
          })
        }
      }
    },
    
    // ... existing methods
  }
}
</script>
```

## 📱 完整的登录流程

### 开发阶段
```
1. 使用测试登录按钮
   ↓
2. 输入测试账号密码
   ↓
3. 开始开发功能
```

### 生产阶段
```
1. 用户打开小程序
   ↓
2. 自动静默登录（wx.login）
   ↓
3. 后端创建/更新用户记录
   ↓
4. 需要时引导绑定手机号
   ↓
5. 完整的用户信息
```

## 🔧 后端需要的改造

### 1. 支持静默登录
```java
@PostMapping("/wx/auth/login")
public Object login(@RequestBody WxLoginRequest request) {
    String code = request.getCode();
    String loginType = request.getLoginType();
    
    if ("silent".equals(loginType)) {
        // 静默登录逻辑
        // 1. 调用微信API换取 openid 和 session_key
        // 2. 查找或创建用户
        // 3. 返回 token 和基础信息
    } else {
        // 原有登录逻辑
    }
}
```

### 2. 支持手机号解密
```java
@PostMapping("/wx/auth/phone")
public Object bindPhone(@RequestBody WxPhoneRequest request) {
    // 1. 验证 token
    // 2. 调用微信API解密手机号
    // 3. 更新用户信息
    // 4. 返回成功
}
```

## ✅ 总结

### 立即可用
- **开发环境**：使用已添加的测试登录按钮
- **测试账号**：user123 / user123

### 后续优化
- **静默登录**：实现 wx.login 方式
- **手机号授权**：使用 getPhoneNumber 按钮
- **后端适配**：支持新的登录流程

### 注意事项
1. getUserProfile 已不推荐使用
2. 开发阶段用测试登录即可
3. 生产环境需要企业认证才能获取手机号

---

💡 **建议**：先使用测试登录完成功能开发，后续再优化生产环境的登录流程。