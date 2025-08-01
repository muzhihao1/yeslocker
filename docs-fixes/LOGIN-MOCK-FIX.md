# 🔧 登录 Mock 数据修复

## 问题原因

"账号不存在"错误是因为：
1. Mock 数据的 URL 路径不匹配（实际请求 `/wx/auth/login`，Mock 配置的是 `/wx/auth/login_by_account`）
2. Mock 返回的数据格式不正确（缺少 statusCode）

## 已修复内容

### 1. ✅ 添加正确的 Mock 路径
```javascript
// 现在同时支持两个登录接口
'/wx/auth/login': { ... }  // 账号密码登录
'/wx/auth/login_by_account': { ... }  // 备用接口
```

### 2. ✅ 修复 Mock 响应格式
Mock 现在返回完整的响应对象：
```javascript
{
  statusCode: 200,
  data: {
    errno: 0,
    errmsg: '成功',
    data: { ... }
  }
}
```

### 3. ✅ 改进响应处理
修复了 `request.js` 中的 Promise 处理逻辑

## 测试步骤

1. **重新编译项目**
```bash
npm run dev:mp-weixin
```

2. **刷新开发者工具**
   - 点击"编译"按钮

3. **测试登录**
   - 进入测试登录页面
   - 使用 `admin123 / admin123`
   - 点击"账号密码登录"

## Mock 数据说明

登录成功后会返回：
- token: Mock JWT token
- userInfo: 管理员测试账号信息
- tokenExpire: 7天后过期

## 注意事项

- Mock 仅在开发环境生效
- 控制台会显示 "使用 Mock 数据进行登录测试"
- 登录成功后会跳转到首页