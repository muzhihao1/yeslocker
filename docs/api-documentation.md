# 耶氏台球杆存取系统 - API 文档

## API 基础信息

- **基础URL**: `http://localhost:8080/wx`
- **认证方式**: JWT Token (放在 Header 中: `X-Litemall-Token: {token}`)
- **响应格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "errno": 错误码,
  "errmsg": "错误信息"
}
```

### 错误码说明
- `0`: 成功
- `401`: 未登录
- `402`: 参数错误
- `501`: 业务错误
- `502`: 系统内部错误

## API 接口列表

### 1. 用户认证相关

#### 1.1 微信登录
- **URL**: `POST /auth/login_by_weixin`
- **描述**: 使用微信授权登录
- **请求参数**:
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "gender": 1
  }
}
```
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpire": 1642752000,
    "userInfo": {
      "id": 1,
      "username": "user_123",
      "nickname": "张三",
      "avatar": "https://...",
      "mobile": "138****1234",
      "identityVerified": false
    }
  }
}
```

#### 1.2 身份验证
- **URL**: `POST /auth/verify`
- **描述**: 验证用户身份信息
- **需要认证**: 是
- **请求参数**:
```json
{
  "realName": "张三",
  "idCard": "110101199001011234",
  "mobile": "13812345678",
  "smsCode": "123456"
}
```
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "verified": true
  }
}
```

#### 1.3 获取用户信息
- **URL**: `GET /user/info`
- **描述**: 获取当前用户详细信息
- **需要认证**: 是
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "id": 1,
    "nickname": "张三",
    "avatar": "https://...",
    "mobile": "138****1234",
    "realName": "张*",
    "identityVerified": true,
    "hasActiveLocker": true,
    "activeLocker": {
      "lockerId": 5,
      "cabinetNumber": "A05",
      "zone": "A区",
      "storedAt": "2024-01-22 10:30:00"
    }
  }
}
```

### 2. 储物柜操作相关

#### 2.1 存储球杆
- **URL**: `POST /locker/store`
- **描述**: 存储球杆到储物柜
- **需要认证**: 是
- **请求参数**:
```json
{
  "lockerId": 5,
  "cueStickInfo": {
    "brand": "Predator",
    "model": "314-3",
    "photos": ["photo1_url", "photo2_url"]
  },
  "notes": "请小心保管"
}
```
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "operationId": 100,
    "voucherCode": "20240122-A1B2-C3D4",
    "qrCodeUrl": "https://qiniu.com/qr/xxx.png",
    "lockerId": 5,
    "cabinetNumber": "A05",
    "zone": "A区",
    "expiredAt": "2024-02-21 10:30:00"
  }
}
```

#### 2.2 取回球杆
- **URL**: `POST /locker/retrieve`
- **描述**: 使用凭证取回球杆
- **需要认证**: 是
- **请求参数**:
```json
{
  "voucherCode": "20240122-A1B2-C3D4"
}
```
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "success": true,
    "lockerId": 5,
    "cabinetNumber": "A05",
    "retrievedAt": "2024-01-22 15:30:00"
  }
}
```

#### 2.3 查询储物柜状态
- **URL**: `GET /locker/status`
- **描述**: 查询当前用户的储物柜使用状态
- **需要认证**: 是
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "hasActiveStorage": true,
    "activeStorage": {
      "operationId": 100,
      "lockerId": 5,
      "cabinetNumber": "A05",
      "zone": "A区",
      "storedAt": "2024-01-22 10:30:00",
      "expiredAt": "2024-02-21 10:30:00",
      "voucherCode": "20240122-A1B2-C3D4",
      "daysRemaining": 29
    }
  }
}
```

#### 2.4 获取可用储物柜列表
- **URL**: `GET /locker/available`
- **描述**: 获取所有可用的储物柜
- **需要认证**: 是
- **查询参数**:
  - `zone`: 区域筛选（可选）
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "total": 15,
    "lockers": [
      {
        "id": 1,
        "cabinetNumber": "A01",
        "zone": "A区",
        "status": "available",
        "notes": "标准储物柜"
      },
      {
        "id": 2,
        "cabinetNumber": "A02",
        "zone": "A区",
        "status": "available",
        "notes": "标准储物柜"
      }
    ]
  }
}
```

#### 2.5 操作历史记录
- **URL**: `GET /locker/history`
- **描述**: 获取用户的存取操作历史
- **需要认证**: 是
- **查询参数**:
  - `page`: 页码（默认1）
  - `limit`: 每页数量（默认10）
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "list": [
      {
        "id": 100,
        "type": "store",
        "cabinetNumber": "A05",
        "zone": "A区",
        "operatedAt": "2024-01-22 10:30:00",
        "status": "active",
        "voucherCode": "20240122-A1B2-C3D4"
      },
      {
        "id": 99,
        "type": "retrieve",
        "cabinetNumber": "B03",
        "zone": "B区",
        "operatedAt": "2024-01-20 15:20:00",
        "status": "used"
      }
    ]
  }
}
```

### 3. 凭证相关

#### 3.1 获取凭证详情
- **URL**: `GET /voucher/{code}`
- **描述**: 根据凭证码获取详情
- **需要认证**: 是
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "code": "20240122-A1B2-C3D4",
    "status": "active",
    "lockerId": 5,
    "cabinetNumber": "A05",
    "zone": "A区",
    "createdAt": "2024-01-22 10:30:00",
    "expiredAt": "2024-02-21 10:30:00",
    "qrCodeUrl": "https://qiniu.com/qr/xxx.png",
    "isOwner": true
  }
}
```

#### 3.2 验证凭证有效性
- **URL**: `POST /voucher/validate`
- **描述**: 验证凭证是否有效（扫码时调用）
- **需要认证**: 是
- **请求参数**:
```json
{
  "code": "20240122-A1B2-C3D4"
}
```
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "valid": true,
    "isOwner": true,
    "message": "凭证有效，可以取回球杆"
  }
}
```

### 4. 广告相关

#### 4.1 获取广告列表
- **URL**: `GET /ad/list`
- **描述**: 获取指定位置的广告
- **查询参数**:
  - `position`: 广告位置（1:首页，2:操作页，3:凭证底部）
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": [
    {
      "id": 1,
      "title": "球杆保养服务",
      "imageUrl": "https://...",
      "linkUrl": "https://...",
      "position": 1
    }
  ]
}
```

### 5. 二手球杆市场

#### 5.1 获取二手球杆列表
- **URL**: `GET /goods/list`
- **描述**: 获取二手球杆商品列表
- **查询参数**:
  - `categoryId`: 分类ID
  - `page`: 页码
  - `limit`: 每页数量
  - `sort`: 排序方式（price_asc, price_desc, time）
- **响应示例**:
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "total": 50,
    "list": [
      {
        "id": 1001,
        "name": "Predator 314-3 九成新",
        "brief": "用了半年，成色很好",
        "picUrl": "https://...",
        "price": 3500.00,
        "originalPrice": 5800.00
      }
    ]
  }
}
```

## Mock 数据服务

在后端服务未就绪前，前端可以使用以下 Mock 数据：

### Mock 服务配置
```javascript
// mock/locker.js
export default {
  // 登录
  'POST /wx/auth/login_by_weixin': {
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'mock-token-123456',
      tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userInfo: {
        id: 1,
        nickname: '测试用户',
        avatar: '/static/avatar.png',
        identityVerified: false
      }
    }
  },
  
  // 存储球杆
  'POST /wx/locker/store': {
    errno: 0,
    errmsg: '成功',
    data: {
      operationId: 100,
      voucherCode: '20240122-MOCK-TEST',
      qrCodeUrl: '/static/qrcode.png',
      cabinetNumber: 'A05',
      expiredAt: '2024-02-21 10:30:00'
    }
  }
}
```

## 注意事项

1. **认证要求**: 除了登录接口外，其他接口都需要在 Header 中携带 Token
2. **时间格式**: 所有时间字段统一使用 `YYYY-MM-DD HH:mm:ss` 格式
3. **图片上传**: 图片需要先上传到七牛云，获取 URL 后再提交
4. **错误处理**: 前端需要统一处理 401 错误，跳转到登录页