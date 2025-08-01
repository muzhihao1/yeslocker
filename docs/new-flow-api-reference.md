# 新流程API接口文档

## 基础信息
- 基础URL: `http://localhost:8080/wx`
- 需要登录: 所有接口都需要用户登录
- 认证方式: JWT Token in Header

## 接口列表

### 1. 创建存取申请
```
POST /locker/request/create
```

请求参数：
```json
{
  "type": "store",    // 类型：store（存杆）或 retrieve（取杆）
  "notes": "备注信息"  // 可选
}
```

响应示例：
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "requestId": 1,
    "requestCode": "REQ20250126001",
    "type": "store",
    "status": "active",
    "lockerId": 5,
    "cabinetNumber": "A12",
    "zone": "A区",
    "createdAt": "2025-01-26T15:30:00"
  }
}
```

错误码：
- 502: 您还没有分配储物柜
- 503: 您有进行中的申请
- 505: 储物柜已被占用（存杆时）
- 506: 储物柜内没有物品（取杆时）

### 2. 查询申请记录列表
```
GET /locker/request/list
```

请求参数：
- `type`: 可选，筛选类型（store/retrieve）
- `page`: 页码，默认1
- `limit`: 每页数量，默认10

响应示例：
```json
{
  "errno": 0,
  "data": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "list": [
      {
        "id": 1,
        "requestCode": "REQ20250126001",
        "type": "store",
        "status": "completed",
        "cabinetNumber": "A12",
        "zone": "A区",
        "createdAt": "2025-01-26T15:30:00",
        "completedAt": "2025-01-26T15:45:00"
      }
    ]
  }
}
```

### 3. 查询申请详情
```
GET /locker/request/detail?requestId=1
```

请求参数：
- `requestId`: 申请ID

响应示例：
```json
{
  "errno": 0,
  "data": {
    "id": 1,
    "requestCode": "REQ20250126001",
    "type": "store",
    "status": "active",
    "notes": "备注信息",
    "createdAt": "2025-01-26T15:30:00",
    "completedAt": null,
    "locker": {
      "id": 5,
      "cabinetNumber": "A12",
      "zone": "A区",
      "location": "一楼大厅"
    },
    "user": {
      "nickname": "张三",
      "mobile": "138****1234"
    }
  }
}
```

### 4. 确认钥匙归还
```
POST /locker/request/confirm-return
```

请求参数：
```json
{
  "requestId": 1
}
```

响应示例：
```json
{
  "errno": 0,
  "data": {
    "success": true,
    "completedAt": "2025-01-26T15:45:00"
  }
}
```

错误码：
- 510: 申请不存在
- 511: 无权操作此申请
- 512: 申请状态不正确

### 5. 获取我的储物柜信息
```
GET /locker/my-locker
```

响应示例（有储物柜）：
```json
{
  "errno": 0,
  "data": {
    "hasLocker": true,
    "locker": {
      "id": 5,
      "cabinetNumber": "A12",
      "zone": "A区",
      "location": "一楼大厅",
      "status": "occupied",
      "size": "medium"
    },
    "hasActiveRequest": false,
    "activeRequest": null
  }
}
```

响应示例（无储物柜）：
```json
{
  "errno": 0,
  "data": {
    "hasLocker": false,
    "locker": null
  }
}
```

## 状态说明

### 申请状态（status）
- `active`: 进行中（待归还钥匙）
- `completed`: 已完成
- `cancelled`: 已取消

### 储物柜状态（locker.status）
- `available`: 空闲
- `occupied`: 已占用
- `assigned`: 已分配（专属）

## 错误码汇总
- 501: 请登录
- 502: 您还没有分配储物柜
- 503: 您有进行中的申请
- 504: 储物柜不存在
- 505: 储物柜已被占用
- 506: 储物柜内没有物品
- 507: 创建申请失败
- 508: 申请不存在
- 509: 无权查看此申请
- 510: 申请不存在
- 511: 无权操作此申请
- 512: 申请状态不正确
- 513: 确认失败
- 514: 操作失败