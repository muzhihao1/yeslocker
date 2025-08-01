# 🔍 登录错误根本原因分析

## 问题描述
登录时显示"账号不存在"错误，但实际上是 Mock 数据结构问题。

## 根本原因

### Mock 响应结构嵌套错误

**当前错误的响应结构**：
```javascript
{
  statusCode: 200,
  data: {
    errno: 0,
    errmsg: '成功',
    data: {
      token: '...',
      userInfo: {...}
    }
  }
}
```

**interceptResponse 期望的结构**：
```javascript
{
  statusCode: 200,
  data: {
    errno: 0,
    errmsg: '成功',
    data: {
      token: '...',
      userInfo: {...}
    }
  }
}
```

看起来一样？实际上不是！因为 `mockResponse` 本身已经是完整的响应体。

### 问题分析流程

1. **Mock 数据定义** (`mockData['/wx/auth/login']`)：
   ```javascript
   {
     errno: 0,
     errmsg: '成功',
     data: { token: '...', userInfo: {...} }
   }
   ```

2. **Mock 返回时**：
   ```javascript
   resolve({
     statusCode: 200,
     data: mockResponse  // mockResponse 已经包含 errno, errmsg, data
   })
   ```

3. **实际返回的结构**：
   ```javascript
   {
     statusCode: 200,
     data: {
       errno: 0,
       errmsg: '成功',
       data: { token: '...', userInfo: {...} }
     }
   }
   ```

4. **interceptResponse 处理**：
   - 检查 `response.data.errno`：✓ 找到了，值是 0
   - errno === 0，认为成功
   - 返回 `response.data.data`：✓ 返回了正确的数据

## 为什么还是报错？

经过仔细分析，发现问题可能在于：

1. **Mock 没有正确拦截请求**
   - URL 匹配可能失败
   - Mock 条件判断有问题

2. **请求实际到达了后端**
   - 后端返回了"账号不存在"错误
   - 说明 Mock 拦截失败

## 解决方案

### 方案1：调试 Mock 拦截逻辑
```javascript
console.log('请求URL:', url);
console.log('找到的mockKey:', mockKey);
console.log('是否匹配登录接口:', mockKey && (mockKey.includes('/auth/login') || mockKey.includes('login_by_account')));
```

### 方案2：简化 Mock 条件
```javascript
if (url.includes('/auth/login')) {
  // 直接返回 Mock 数据
}
```

### 方案3：检查 URL 构建
确保 `post('/auth/login')` 最终生成的 URL 包含 Mock 期望的路径。

## 最终解决

需要在 Mock 拦截器中添加更多日志，确认：
1. 请求是否被 Mock 拦截
2. URL 匹配是否成功
3. 返回的数据结构是否正确