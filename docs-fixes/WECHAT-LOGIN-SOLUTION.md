# 🔧 微信快速登录解决方案

## 问题分析
用户点击"微信快速登录"按钮时报错"参数不对"，原因是：
1. WeChat login 发送的参数（code, userInfo等）与 Mock 期望的不匹配
2. 测试登录按钮未显示，导致用户无法使用备用登录方式

## 已实施的解决方案

### 1. ✅ 更新 Mock 支持微信登录
修改了 `simple-mock.js`，现在同时支持：
- **微信登录**：检测 `code` 参数，返回微信用户数据
- **账号密码登录**：返回测试管理员数据

### 2. ✅ 修复测试登录按钮显示
在 `profile.vue` 中添加了开发者工具检测：
```javascript
// 如果在开发者工具中，强制显示测试按钮
const systemInfo = uni.getSystemInfoSync()
if (systemInfo.platform === 'devtools') {
  this.isDev = true
}
```

## 使用方法

### 方式一：使用微信快速登录（推荐）
1. 重新编译项目
```bash
npm run dev:mp-weixin
```

2. 刷新开发者工具

3. 点击"微信快速登录"按钮
   - Mock 会自动返回登录成功数据
   - 无需真实的微信授权

### 方式二：使用测试登录按钮
1. 在个人信息页面底部查看"开发环境"区域
2. 点击绿色的"🧪 测试登录"按钮
3. 使用测试账号：
   - 管理员：`admin123` / `admin123`
   - 普通用户：`user123` / `user123`

## 调试信息

登录时会在控制台显示：
- `[SimpleMock] 请求URL: http://localhost:8080/wx/auth/login`
- `[SimpleMock] 拦截登录请求，返回 Mock 数据`
- `[SimpleMock] 请求数据: {code: "...", userInfo: {...}}`

## Mock 返回的用户数据

### 微信登录返回
```javascript
{
  nickName: '微信用户',
  avatarUrl: '/static/default-avatar.png',
  phoneNumber: '138****5678',
  isVerified: true,
  realName: '张*'
}
```

### 测试登录返回
```javascript
{
  nickName: '测试管理员',
  username: 'admin123',
  isAdmin: true,
  // ... 其他字段
}
```

## 注意事项

1. **域名校验**：确保已关闭（详情 → 本地设置）
2. **Mock 生效条件**：仅在开发环境
3. **用户数据持久化**：登录成功后会保存到本地存储

## 常见问题

### Q: 点击微信登录没反应？
A: 检查控制台是否有 `[SimpleMock]` 日志，如果没有说明 Mock 未生效

### Q: 测试登录按钮不显示？
A: 检查控制台输出的 `isDev` 值，确保在开发者工具中运行

### Q: 登录成功但页面没刷新？
A: 手动切换到其他标签再切回"我的"标签

## 后续优化

1. 可以添加更多测试账号类型
2. 模拟不同的用户状态（未认证、已认证等）
3. 添加登录失败的测试场景