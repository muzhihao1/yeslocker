# 手机号验证流程文档

## 概述

根据新的业务需求，用户身份验证只需要通过微信登录获取手机号即可，不再需要上传身份证照片。这大大简化了用户注册流程，提升了用户体验。

## 验证流程

### 1. 用户登录流程

```
微信登录 → 检查手机号 → 手机号验证 → 选择门店/储物柜 → 完成注册
```

### 2. 手机号验证方式

#### 2.1 微信快捷验证（推荐）
- 使用微信内置的 `getPhoneNumber` 接口
- 用户一键授权即可获取手机号
- 无需输入验证码，体验最佳

#### 2.2 手动输入验证
- 用户手动输入手机号
- 发送短信验证码
- 输入验证码完成验证

### 3. 页面路径

- **手机号验证页面**: `/pages/auth/phone-verify`
- **用户登录入口**: `/pages/user/profile`

## 实现细节

### 1. 关键文件

- `/src/pages/auth/phone-verify.vue` - 手机号验证页面
- `/src/utils/wechat.js` - 微信相关工具函数（包含获取手机号）
- `/src/api/auth.js` - 认证相关API
- `/src/mock/simple-mock.js` - 开发环境Mock支持

### 2. API接口

#### 获取微信手机号
```javascript
POST /wx/auth/phone
{
  code: "微信授权码"
}

Response:
{
  errno: 0,
  data: {
    phoneNumber: "13800138000",
    purePhoneNumber: "13800138000",
    countryCode: "86"
  }
}
```

#### 验证手机号
```javascript
POST /wx/auth/verify
{
  mobile: "13800138000",
  wxPhoneAuth: true,  // 标记为微信授权验证
  // 或
  smsCode: "123456"   // 手动验证时需要
}

Response:
{
  errno: 0,
  data: {
    verified: true,
    userInfo: {...}
  }
}
```

### 3. 开发环境支持

在开发环境下，系统会自动识别并使用Mock数据：

- 微信手机号授权会返回模拟手机号
- 验证码发送始终成功
- 验证过程立即完成

### 4. 用户状态判断

```javascript
// 检查用户是否已验证手机号
const userInfo = uni.getStorageSync('userInfo')
const isPhoneVerified = userInfo && (userInfo.mobile || userInfo.phoneNumber)

// 检查用户是否已分配储物柜
const hasLocker = userInfo && (userInfo.lockerId || userInfo.locker_id)
```

## 安全考虑

1. **手机号加密存储**: 后端应对手机号进行加密存储
2. **验证码有效期**: 短信验证码有效期为5分钟
3. **发送频率限制**: 同一手机号60秒内只能发送一次验证码
4. **微信授权安全**: 使用微信官方接口，确保手机号真实性

## 用户体验优化

1. **优先推荐微信快捷验证**: 一键授权，无需输入
2. **清晰的提示信息**: 告知用户为什么需要手机号
3. **隐私保护说明**: 明确说明手机号仅用于账户安全
4. **流畅的跳转逻辑**: 验证后自动跳转到下一步

## 测试要点

1. **微信环境测试**: 确保在真机上测试微信授权功能
2. **Mock模式测试**: 开发环境下的完整流程测试
3. **异常处理测试**: 网络异常、授权拒绝等情况
4. **状态持久化测试**: 验证信息正确保存到本地存储

## 后续优化建议

1. 支持更换手机号功能
2. 添加手机号隐私显示（如：138****8000）
3. 支持多种登录方式（如：微信、手机号、邮箱）
4. 实现手机号与微信账号的解绑功能