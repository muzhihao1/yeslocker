# 🐛 Mock 调试方案

## 已添加的调试日志

### 1. 请求拦截日志
```javascript
// request.js
console.log('[Request] 请求配置:', {
  url: options.url,
  method: options.method,
  data: options.data
})
```

### 2. Mock 拦截日志
```javascript
// mock/api.js
console.log('[Mock] 拦截到请求:', url);
console.log('[Mock] 找到的 mockKey:', mockKey);
console.log('[Mock] 匹配到登录接口，使用 Mock 数据');
console.log('[Mock] 返回的 Mock 数据:', mockResponse);
```

### 3. 响应处理日志
```javascript
// request.js - interceptResponse
console.log('[Response] 响应数据:', {
  statusCode,
  data: data
})
```

## 调试步骤

1. **重新编译项目**
```bash
npm run dev:mp-weixin
```

2. **清除缓存**
   - 在微信开发者工具中：工具 → 清除缓存 → 清除全部

3. **观察控制台**
   查看以下信息：
   - `[Request]` - 确认请求 URL 是否正确
   - `[Mock]` - 确认 Mock 是否拦截了请求
   - `[Response]` - 确认响应数据结构

## 预期的日志顺序

1. `[Request] 请求配置: { url: "http://localhost:8080/wx/auth/login", ... }`
2. `[Mock] 拦截到请求: http://localhost:8080/wx/auth/login`
3. `[Mock] 匹配到登录接口，使用 Mock 数据`
4. `[Mock] 返回的 Mock 数据: { errno: 0, errmsg: "成功", ... }`
5. `[Response] 响应数据: { statusCode: 200, data: {...} }`

## 常见问题排查

### 如果没有看到 [Mock] 日志
- Mock 拦截器没有生效
- 检查 `process.env.NODE_ENV` 是否为 'development'

### 如果 URL 不匹配
- 检查 BASE_URL 配置
- 确认 URL 路径拼接是否正确

### 如果响应数据结构不对
- 检查 Mock 数据定义
- 验证 interceptResponse 处理逻辑

## 快速修复

如果 Mock 仍然不工作，可以在 `request.js` 中直接拦截：

```javascript
// 临时测试代码
if (options.url.includes('/auth/login')) {
  console.log('直接返回 Mock 数据');
  return Promise.resolve({
    token: 'test-token',
    userInfo: { username: 'admin123', nickname: '测试管理员' }
  });
}
```