# YesLocker 前后端协作开发文档

> Terminal A (前端) × Terminal B (后端) 协同工作

## 🎯 项目目标

完成微信小程序前端最后5%功能 + 管理后台核心功能，实现前后端完整对接。

**项目状态**: 后端API 100% ✅ | 前端 95% 🔄 | 管理后台 80% 🔄

## 📋 任务重新分配（Terminal B 已完成后端任务）

### Terminal A 继续负责

| ID | 任务描述 | API接口 | 优先级 | 状态 |
|----|---------|---------|--------|------|
| A05 | 身份验证优化 | 微信手机号授权获取 | P1 | ✅ 完成 |
| A06 | 历史记录页面 | `GET /wx/locker/history` | P1 | ✅ 完成 |
| A07 | 首页广告轮播 | 广告API | P2 | ⏳ 待开始 |

### Terminal B 协助前端

| ID | 任务描述 | 负责内容 | 优先级 | 状态 |
|----|---------|---------|--------|------|
| B11 | UI响应式适配 | 样式优化、兼容性处理 | P2 | ⏳ 待开始 |
| B12 | 性能优化 | 图片懒加载、请求优化 | P1 | ⏳ 待开始 |
| B13 | 集成测试支持 | API Mock数据、测试用例 | P0 | ⏳ 待开始 |

### 共同任务

| ID | 任务描述 | 分工 | 优先级 | 状态 |
|----|---------|------|--------|------|
| AB1 | 集成测试和Bug修复 | A负责前端测试，B负责后端支持 | P0 | ⏳ 待开始 |
| AB2 | 上线前检查 | A负责功能验证，B负责性能监控 | P0 | ⏳ 待开始 |

### 已完成任务汇总
- ✅ Terminal A: A01, A02, A03, A04, A05, A06, A08
- ✅ Terminal B: B01-B10（储物柜批量管理、用户管理、数据统计等）

## 📡 API契约定义（重要！）

### 1. 储物柜可用列表
```javascript
// GET /wx/locker/available
Response: {
  errno: 0,
  data: [{
    id: 1,
    cabinetNumber: "A01",
    zone: "A区",
    status: "available"
  }]
}
```

### 2. 创建存储请求（新流程）
```javascript
// POST /wx/locker/request/create
Request: {
  lockerId: 1,
  storeId: 1,
  notes: "备注"
}
Response: {
  errno: 0,
  data: {
    requestId: 123,
    voucherCode: "20250726-XXXX",
    qrcodeUrl: "https://..."
  }
}
```

### 3. 批量更新储物柜（管理端）
```javascript
// POST /admin/locker/batch-update
Request: {
  ids: [1, 2, 3],
  status: "maintenance"
}
```

## 🚦 Terminal A 进度更新

### 已完成功能
- ✅ **A01: 储物柜选择页面API对接**
  - 实现了 GET /wx/locker/available 对接
  - 添加了下拉刷新功能
  - 完成了按区域分组显示
  - 加入了错误处理和Mock数据降级

- ✅ **A02: API错误处理机制**
  - 实现了6种错误类型处理
  - 支持自动重试机制（网络/超时/服务器错误）
  - 401自动跳转登录，403权限提示
  - 错误日志本地存储（最多20条）

### 今日进展更新
- ✅ **A03: 存取流程API对接（第一部分）** - 已完成
  - 实现了 POST /wx/locker/request/create API对接
  - 支持在线/离线双模式（网络失败时降级）
  - 凭证二维码自动生成
  - 成功页面完整展示
  - 详见：`src/docs/storage-api-integration.md`

- ✅ **A04: 存取流程API对接（第二部分）** - 已完成
  - 实现了扫码取物功能（首页快捷入口）
  - 支持扫码/手动输入凭证码两种方式
  - 对接 POST /wx/locker/retrieve API
  - 完整的三步流程：验证→确认→成功
  - 添加了逾期费用提示和错误处理
  - 创建了扫码图标资源

- ✅ **A08: 微信授权测试修复** - 已完成
  - 修复了Mock模式下的登录流程
  - 统一了API端点路径（/wx/前缀）
  - 支持多种测试场景（新用户/已验证/VIP等）
  - 解决了微信开发者工具600009错误
  - 优化了错误提示和用户引导
  - 创建了测试指南文档

- ✅ **A05: 身份验证优化** - 已完成
  - 实现了微信手机号快捷授权功能
  - 创建了专门的手机号验证页面 `/pages/auth/phone-verify`
  - 支持两种验证方式：微信授权和手动输入
  - 更新了登录流程，优先引导手机号验证
  - 完善了Mock支持，开发环境可模拟完整流程
  - 创建了详细文档 `docs/phone-verification-flow.md`

- ✅ **A06: 历史记录页面** - 已完成
  - 更新了 API 函数使用正确的端点 `/wx/locker/history`
  - 实现了完整的 Mock 数据支持（支持分页和筛选）
  - 优化了页面使用真实 API 调用替代直接 Mock 数据
  - 支持三种筛选模式：全部、存储中、已完成
  - 实现了下拉刷新和上拉加载更多
  - 添加了使用统计功能（浮动按钮查看）
  - 创建了实现文档 `docs/history-page-implementation.md`

### 下一步行动计划

**Terminal A**:
- 当前任务：A07 首页广告轮播
- 已完成前端核心功能开发
- 准备进入集成测试阶段

**Terminal B**:
- 优先任务：B13 集成测试支持（提供Mock数据）
- 并行任务：B12 性能优化（可与A并行开发）
- 后续任务：B11 UI响应式适配

**协同重点**:
- Terminal B 提供测试数据支持 Terminal A 的开发
- 准备进入集成测试阶段（AB1）

### 待处理问题
| 问题描述 | 影响范围 | 解决方案 |
|---------|---------|---------|
| ~~需要存储请求API的Mock数据~~ | ~~A03任务~~ | ✅ 已提供Mock服务器和测试数据 |

## 💬 协作记录

### 2025-07-27 更新 (Terminal B Support)
- ✅ 为A03任务提供了完整的Mock API服务器
  - 创建了 `mock-storage-api.js` - 独立的Express服务器（端口8081）
  - 实现了 POST /wx/locker/request/create 完整Mock
  - 包含4个测试用户场景（已认证/未认证/无柜子/跨店铺）
  - 自动生成凭证码和二维码URL
- ✅ 创建了60+条测试储物柜数据
  - SQL脚本: `/sql/test-lockers-data.sql`
  - 包含3个区域、2个门店、多种状态的柜子
- ✅ 编写了详细的集成指南
  - 文档: `/docs/api/storage-request-mock-guide.md`
  - 包含所有API端点说明和测试场景

### API变更通知
- `/wx/locker/available` 接口支持分页参数 page和size（可选）

### 数据需求
- ~~需要更多储物柜测试数据用于前端开发（至少50条）~~ ✅ 已提供60条
- ~~需要存储请求API的完整Mock响应格式~~ ✅ 已在Mock服务器中实现

## 🔧 快速参考

### Terminal A 常用命令
```bash
cd yeslocker-uniapp
npm run dev:mp-weixin
# 查看编译输出: dist/dev/mp-weixin
```

### 开发环境
```bash
# 前端开发服务器
cd yeslocker-uniapp
npm run dev:mp-weixin

# 后端服务（已完成，运行即可）
./start-backend.sh
```

### 测试账号
- 测试用户: 使用微信登录Mock模式
- Mock模式已在 application-dev.yml 中启用

## 📌 开发规范

1. **错误码统一**: 使用backend定义的errno体系
2. **API响应格式**: { errno: 0, errmsg: "success", data: {} }
3. **状态更新**: 完成任务立即更新文档状态
4. **Mock降级**: API不可用时自动使用Mock数据

---

**当前任务**: Terminal A - A07 首页广告轮播 | Terminal B - B13 集成测试支持