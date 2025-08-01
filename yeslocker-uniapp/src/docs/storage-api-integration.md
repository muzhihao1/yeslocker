# 存储流程API对接实现文档

## 概述
本文档记录了存储流程API对接（A03任务）的实现细节。

## 实现内容

### 1. API方法更新
在 `src/api/locker.js` 中更新了 `createStorageRequest` 方法：

```javascript
export function createStorageRequest(params) {
  return post('/locker/request/create', {
    lockerId: params.lockerId,
    storeId: params.storeId || 1,
    notes: params.notes || ''
  })
}
```

### 2. 存储流程集成
在 `src/components/molecules/StorageFlow.vue` 中实现：

- **API调用集成**：在 `submitStorage` 方法中调用 `createStorageRequest` API
- **响应处理**：解析API响应，构建凭证数据
- **二维码生成**：如果后端未返回二维码URL，则本地生成
- **错误处理**：包含网络错误处理和用户友好的错误提示
- **离线降级**：网络失败时提供离线模式选项

### 3. 主要功能

#### 在线存储流程
1. 用户确认存储信息后，调用 `createStorageRequest` API
2. API请求参数：
   - `lockerId`: 选中的储物柜ID
   - `storeId`: 店铺ID（默认为1）
   - `notes`: 用户备注
3. 处理成功响应，提取：
   - `requestId`: 请求ID
   - `voucherCode`: 凭证码
   - `qrcodeUrl`: 二维码URL
   - `status`: 状态
   - `expiresAt`: 过期时间
4. 切换到凭证显示页面

#### 离线存储模式
- 当网络请求失败时，提示用户是否使用离线模式
- 离线模式生成本地凭证（标记为offline）
- 凭证码格式与在线模式一致
- 本地生成二维码

### 4. 数据流
```
用户确认存储 → API请求 → 后端处理 → 返回凭证 → 显示二维码
     ↓ (网络失败)
  离线模式提示 → 本地生成凭证 → 显示二维码
```

### 5. 错误处理策略
- **网络错误**：提供离线模式选项
- **业务错误**：显示具体错误信息
- **未知错误**：显示通用错误提示

## 测试要点
1. 正常流程：选择储物柜 → 确认信息 → 生成凭证
2. 网络异常：测试离线模式降级
3. API错误：测试各种错误码处理
4. 二维码生成：验证二维码可扫描

## 后续优化建议
1. 添加凭证本地存储功能
2. 实现凭证同步机制
3. 优化离线转在线的数据同步
4. 添加凭证分享功能