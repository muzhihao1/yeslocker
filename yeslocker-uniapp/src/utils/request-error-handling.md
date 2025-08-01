# Request Error Handling Documentation

## 概述

本文档介绍了增强版的 API 错误处理机制，提供了统一的错误处理、重试机制、错误日志记录等功能。

## 错误类型

系统定义了以下错误类型：

```javascript
ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',      // 网络错误
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',      // 超时错误
  SERVER_ERROR: 'SERVER_ERROR',        // 服务器错误 (5xx)
  CLIENT_ERROR: 'CLIENT_ERROR',        // 客户端错误 (4xx)
  BUSINESS_ERROR: 'BUSINESS_ERROR',    // 业务错误 (errno != 0)
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'       // 未知错误
}
```

## 错误处理策略

### 1. HTTP 状态码错误处理

- **401 未授权**: 清除 Token，跳转到登录页
- **403 无权限**: 使用模态框提示用户无权限
- **404 资源不存在**: Toast 提示资源不存在
- **500+ 服务器错误**: Toast 提示服务器错误
- **502/503/504**: 自动重试（最多2次）

### 2. 业务错误处理

当 `errno !== 0` 时，视为业务错误：
- 优先显示后端返回的 `errmsg`
- 401 业务错误同样跳转登录页

### 3. 网络错误处理

- 自动检测网络状态
- 网络错误时显示友好提示
- 支持自动重试机制

## 使用示例

### 基本请求

```javascript
import { get, post } from '@/utils/request'

// GET 请求
const data = await get('/api/user/info')

// POST 请求
const result = await post('/api/user/update', {
  name: '张三',
  phone: '13800138000'
})
```

### 自定义错误处理

```javascript
// 不显示错误提示
const data = await get('/api/user/info', null, {
  showError: false
})

// 自定义加载文字
const result = await post('/api/user/update', userData, {
  loadingText: '更新中...'
})

// 禁用自动重试
const response = await get('/api/critical/data', null, {
  retry: false
})
```

### 错误捕获

```javascript
import { RequestError, ERROR_TYPES } from '@/utils/request'

try {
  const data = await get('/api/user/info')
} catch (error) {
  if (error instanceof RequestError) {
    console.log('错误类型:', error.type)
    console.log('错误代码:', error.code)
    console.log('错误详情:', error.details)
    
    // 根据错误类型处理
    switch (error.type) {
      case ERROR_TYPES.NETWORK_ERROR:
        // 处理网络错误
        break
      case ERROR_TYPES.BUSINESS_ERROR:
        // 处理业务错误
        if (error.code === 10001) {
          // 特定业务错误处理
        }
        break
    }
  }
}
```

### 文件上传

```javascript
import { upload } from '@/utils/request'

// 基本上传
const url = await upload('/api/upload', filePath, {
  type: 'avatar'
})

// 监听上传进度
const result = await upload('/api/upload', filePath, formData, {
  onProgress: (res) => {
    console.log('上传进度:', res.progress)
    console.log('已上传:', res.totalBytesSent)
    console.log('总大小:', res.totalBytesExpectedToSend)
  }
})
```

## 配置选项

请求支持以下配置选项：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showLoading | boolean | true | 是否显示加载提示 |
| showError | boolean | true | 是否显示错误提示 |
| loadingText | string | '加载中...' | 加载提示文字 |
| retry | boolean | true | 是否启用自动重试 |
| timeout | number | 30000 | 请求超时时间（毫秒） |

## 错误日志

### 查看错误日志

```javascript
import { getRecentErrors } from '@/utils/request'

// 获取最近10条错误
const errors = getRecentErrors(10)

errors.forEach(error => {
  console.log('时间:', error.timestamp)
  console.log('类型:', error.type)
  console.log('消息:', error.message)
  console.log('请求信息:', error.context)
})
```

### 清除错误日志

```javascript
import { clearErrorLogs } from '@/utils/request'

// 清除所有错误日志
clearErrorLogs()
```

## 手动错误处理

```javascript
import { handleError } from '@/utils/request'

// 手动触发错误处理
try {
  // 自定义业务逻辑
} catch (error) {
  // 使用统一的错误处理
  handleError(error, {
    showError: true
  })
}
```

## 注意事项

1. **Token 管理**: Token 过期会自动清除并跳转登录页
2. **重试机制**: 只对网络错误、超时和特定服务器错误（502/503/504）进行重试
3. **错误日志**: 生产环境只保留最近20条错误日志，避免占用过多存储空间
4. **并发请求**: 多个请求同时 401 时，只会跳转一次登录页

## 最佳实践

1. **全局错误处理**: 大部分情况下使用默认错误处理即可
2. **特定错误处理**: 对于需要特殊处理的接口，捕获错误后自行处理
3. **用户体验**: 适当使用 `showLoading` 和 `showError` 选项优化用户体验
4. **错误监控**: 生产环境建议接入错误监控服务（如 Sentry）