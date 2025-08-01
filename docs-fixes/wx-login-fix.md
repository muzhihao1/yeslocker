# 微信登录问题修复说明

## 🔍 问题原因

1. **API 路径错误**
   - 错误：使用了 `/wx/auth/login`（这是账号密码登录接口）
   - 正确：应该使用 `/wx/auth/login_by_weixin`（微信登录专用接口）

2. **参数格式不匹配**
   - 后端期望的参数格式：
   ```json
   {
     "code": "微信登录凭证",
     "userInfo": {
       "nickName": "用户昵称",
       "avatarUrl": "头像URL",
       "gender": 性别,
       "country": "国家",
       "province": "省份",
       "city": "城市",
       "language": "语言"
     }
   }
   ```

3. **uni.request 使用问题**
   - 不需要额外的 `.then().catch()`，因为 `uni.promisify.adaptor.js` 已经处理了

## ✅ 已完成的修复

1. 修改了 `src/config/api.js`：
   ```javascript
   wxLogin: '/wx/auth/login_by_weixin',  // 微信登录专用接口
   ```

2. 修改了 `src/pages/user/profile.vue`：
   - 调整了请求参数格式
   - 去掉了多余的 Promise 处理
   - 添加了详细的日志输出

## 🚀 测试步骤

1. **重新编译小程序**
   ```bash
   cd yeslocker-uniapp
   npm run dev:mp-weixin
   ```

2. **在微信开发者工具中**
   - 刷新项目
   - 确保勾选"不校验合法域名"
   - 打开控制台查看日志

3. **点击"微信快速登录"**
   - 应该看到正确的 API 地址：`http://localhost:8080/wx/auth/login_by_weixin`
   - 查看请求参数是否正确

## 🔧 如果仍有问题

### 1. 检查后端日志
```bash
tail -f backend.log | grep login
```

### 2. 手动测试 API
```bash
curl -X POST http://localhost:8080/wx/auth/login_by_weixin \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_code",
    "userInfo": {
      "nickName": "测试用户",
      "avatarUrl": "https://example.com/avatar.jpg",
      "gender": 1
    }
  }'
```

### 3. 可能的其他问题
- 微信开发者工具版本过旧
- 需要清除缓存：在开发者工具中点击"清缓存"
- 后端微信配置未正确设置（appid, secret）

## 📝 注意事项

1. **开发环境**：由于没有配置真实的微信 AppID 和 Secret，登录可能会在后端验证 code 时失败
2. **测试登录**：可以使用页面上的"测试登录"按钮（绿色）绕过微信验证
3. **生产环境**：需要在 `application-dev.yml` 中配置正确的微信小程序信息：
   ```yaml
   litemall:
     wx:
       app-id: 你的小程序AppID
       app-secret: 你的小程序Secret
   ```