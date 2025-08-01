# 耶氏体育台球杆存取系统 - 剩余3周开发计划

## 📋 项目现状总结

### ✅ 第1周已完成
- **UI重新设计**：从二维码自助改为请求式系统，员工验证后操作
- **永久柜位分配**：用户注册时获得永久柜位（如A12）
- **操作流程**：提交请求 → 向员工展示 → 获取钥匙 → 操作 → 归还钥匙
- **前端页面完成**：首页、请求页、请求详情、历史记录、柜位详情
- **数据库架构**：已更新以支持新流程
- **模拟数据**：已实现用于测试

### 🎯 剩余任务
1. 用户注册时的柜位选择功能
2. 后端API实现（支持请求式流程）
3. 员工端界面开发
4. 完整的用户流程测试
5. 性能优化

## 📅 第2周：后端开发与核心功能集成（Days 8-14）

### Day 8-9：后端API核心实现

#### 1. 用户注册与柜位分配API
```javascript
// POST /api/user/register
// 用户注册时分配永久柜位
{
  endpoint: "/api/user/register",
  method: "POST",
  body: {
    openId: "wx_openid",
    nickName: "用户昵称",
    avatarUrl: "头像URL",
    phoneNumber: "手机号",
    realName: "真实姓名",
    selectedLockerId: "A12" // 用户选择的柜位
  },
  response: {
    userId: 123,
    lockerId: "A12",
    registrationTime: "2024-01-15T10:00:00Z"
  }
}

// GET /api/lockers/available
// 获取可用柜位列表
{
  endpoint: "/api/lockers/available",
  method: "GET",
  response: {
    lockers: [
      { id: "A12", status: "available", zone: "A" },
      { id: "B05", status: "available", zone: "B" }
    ]
  }
}
```

#### 2. 请求式操作API
```javascript
// POST /api/requests/create
// 创建存取请求
{
  endpoint: "/api/requests/create",
  method: "POST",
  body: {
    userId: 123,
    requestType: "store|retrieve",
    lockerId: "A12"
  },
  response: {
    requestId: "REQ20240115001",
    requestCode: "ST-A12-0115",
    qrCode: "data:image/png;base64...",
    expiresAt: "2024-01-15T12:00:00Z"
  }
}

// GET /api/requests/:requestId
// 获取请求详情
{
  endpoint: "/api/requests/:requestId",
  method: "GET",
  response: {
    requestId: "REQ20240115001",
    userId: 123,
    lockerId: "A12",
    requestType: "store",
    status: "pending|verified|completed|expired",
    createdAt: "2024-01-15T10:00:00Z",
    verifiedBy: null,
    completedAt: null
  }
}

// POST /api/requests/:requestId/verify
// 员工验证请求（员工端）
{
  endpoint: "/api/requests/:requestId/verify",
  method: "POST",
  headers: { "Staff-Token": "staff_jwt_token" },
  body: {
    staffId: 456
  },
  response: {
    success: true,
    keyLocation: "前台第3排第5个钩子"
  }
}
```

#### 3. 操作记录API
```javascript
// POST /api/operations/complete
// 完成操作记录
{
  endpoint: "/api/operations/complete",
  method: "POST",
  body: {
    requestId: "REQ20240115001",
    actualLockerId: "A12",
    operationType: "store",
    notes: "球杆已存放"
  }
}

// GET /api/users/:userId/history
// 获取用户操作历史
{
  endpoint: "/api/users/:userId/history",
  method: "GET",
  query: { page: 1, limit: 20 },
  response: {
    total: 45,
    records: [
      {
        operationId: 789,
        type: "store",
        lockerId: "A12",
        requestTime: "2024-01-15T10:00:00Z",
        completedTime: "2024-01-15T10:15:00Z"
      }
    ]
  }
}
```

### Day 10-11：员工端界面开发

#### 1. 员工登录页面
- 员工账号密码登录
- JWT token管理
- 权限验证

#### 2. 请求验证界面
```javascript
// 员工端主页面功能
Page({
  data: {
    pendingRequests: [], // 待验证请求列表
    scanResult: null,    // 扫码结果
    currentRequest: null // 当前处理的请求
  },

  // 扫描用户展示的二维码
  scanRequest() {
    wx.scanCode({
      success: (res) => {
        this.verifyRequest(res.result);
      }
    });
  },

  // 验证请求
  verifyRequest(requestCode) {
    wx.request({
      url: `/api/staff/verify-request`,
      method: 'POST',
      header: { 'Staff-Token': this.data.staffToken },
      data: { requestCode },
      success: (res) => {
        this.setData({
          currentRequest: res.data,
          keyLocation: res.data.keyLocation
        });
        wx.showModal({
          title: '验证成功',
          content: `请将${res.data.keyLocation}的钥匙交给用户`,
          showCancel: false
        });
      }
    });
  }
});
```

#### 3. 操作监控面板
- 实时请求列表
- 异常操作提醒
- 快速处理功能

### Day 12-13：数据库优化与缓存实现

#### 1. 数据库索引优化
```sql
-- 添加必要索引
CREATE INDEX idx_requests_status_created ON requests(status, created_at);
CREATE INDEX idx_operations_user_time ON operations(user_id, operation_time);
CREATE INDEX idx_lockers_status ON lockers(status);

-- 添加请求表
CREATE TABLE requests (
    id VARCHAR(20) PRIMARY KEY,
    user_id INT NOT NULL,
    locker_id VARCHAR(10) NOT NULL,
    request_type ENUM('store', 'retrieve') NOT NULL,
    request_code VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('pending', 'verified', 'completed', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    verified_by INT NULL,
    completed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (locker_id) REFERENCES lockers(id),
    FOREIGN KEY (verified_by) REFERENCES staff(id)
);
```

#### 2. Redis缓存策略
```javascript
// 缓存配置
const cacheConfig = {
  // 用户永久柜位缓存（长期）
  userLocker: {
    key: 'user:locker:{userId}',
    ttl: 86400 * 30 // 30天
  },
  
  // 活跃请求缓存（短期）
  activeRequest: {
    key: 'request:active:{requestId}',
    ttl: 7200 // 2小时
  },
  
  // 柜位可用性缓存
  lockerAvailability: {
    key: 'lockers:available',
    ttl: 300 // 5分钟
  }
};

// 缓存实现示例
class CacheService {
  async getUserLocker(userId) {
    const cacheKey = `user:locker:${userId}`;
    let lockerId = await redis.get(cacheKey);
    
    if (!lockerId) {
      const user = await db.query('SELECT locker_id FROM users WHERE id = ?', [userId]);
      lockerId = user.locker_id;
      await redis.setex(cacheKey, 86400 * 30, lockerId);
    }
    
    return lockerId;
  }
}
```

### Day 14：集成测试与Bug修复

#### 测试清单
- [ ] 用户注册流程（包括柜位选择）
- [ ] 存杆请求完整流程
- [ ] 取杆请求完整流程
- [ ] 员工验证功能
- [ ] 异常情况处理（过期请求、重复请求等）
- [ ] 并发请求测试
- [ ] 缓存一致性测试

## 📅 第3周：员工系统与高级功能（Days 15-21）

### Day 15-16：员工管理系统完善

#### 1. 员工权限管理
```javascript
// 权限等级定义
const StaffRoles = {
  ADMIN: 'admin',        // 管理员：所有权限
  SUPERVISOR: 'supervisor', // 主管：查看报表、处理异常
  OPERATOR: 'operator'   // 操作员：日常验证操作
};

// 权限中间件
const checkPermission = (requiredRole) => {
  return (req, res, next) => {
    const staffRole = req.staff.role;
    if (!hasPermission(staffRole, requiredRole)) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
};
```

#### 2. 员工操作日志
```sql
CREATE TABLE staff_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(50),
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);
```

### Day 17-18：统计报表与数据分析

#### 1. 运营数据统计
- 日/周/月活跃用户数
- 存取操作频率分析
- 柜位使用率统计
- 高峰时段分析

#### 2. 报表生成API
```javascript
// GET /api/admin/reports/daily
{
  date: "2024-01-15",
  summary: {
    totalUsers: 156,
    activeUsers: 45,
    storeOperations: 38,
    retrieveOperations: 42,
    newRegistrations: 5
  },
  lockerUtilization: {
    total: 100,
    occupied: 67,
    available: 33,
    utilizationRate: "67%"
  },
  peakHours: [
    { hour: "10:00-11:00", operations: 12 },
    { hour: "19:00-20:00", operations: 18 }
  ]
}
```

### Day 19-20：异常处理与告警系统

#### 1. 异常情况处理
- 长期未取球杆告警（超过30天）
- 请求超时自动处理
- 钥匙未归还提醒
- 系统异常自动恢复

#### 2. 微信模板消息集成
```javascript
// 发送提醒消息
async function sendReminder(userId, type, data) {
  const templates = {
    LONG_TIME_STORAGE: 'template_id_1',
    REQUEST_EXPIRED: 'template_id_2',
    KEY_NOT_RETURNED: 'template_id_3'
  };
  
  const user = await getUserInfo(userId);
  const message = {
    touser: user.openId,
    template_id: templates[type],
    data: formatTemplateData(type, data)
  };
  
  await wxApi.sendTemplateMessage(message);
}
```

### Day 21：性能优化专项

#### 1. 前端优化
- 图片懒加载
- 页面预加载
- 请求防抖节流
- 本地缓存优化

#### 2. 后端优化
- SQL查询优化
- 批量操作优化
- 连接池配置
- 异步任务队列

```javascript
// 请求防抖示例
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 使用防抖优化搜索
const searchLockers = debounce((keyword) => {
  wx.request({
    url: '/api/lockers/search',
    data: { keyword }
  });
}, 300);
```

## 📅 第4周：测试、部署与上线（Days 22-28）

### Day 22-23：全面测试

#### 1. 功能测试矩阵
| 功能模块 | 测试场景 | 预期结果 | 测试状态 |
|---------|---------|---------|---------|
| 用户注册 | 选择可用柜位 | 成功分配永久柜位 | [ ] |
| 存杆请求 | 创建并展示给员工 | 生成有效请求码 | [ ] |
| 员工验证 | 扫码验证请求 | 显示钥匙位置 | [ ] |
| 取杆流程 | 完整取杆操作 | 更新柜位状态 | [ ] |
| 异常处理 | 请求超时 | 自动标记过期 | [ ] |

#### 2. 性能测试指标
- API响应时间 < 200ms (95分位)
- 并发用户数 > 200
- 页面加载时间 < 2秒
- 系统可用性 > 99.5%

### Day 24-25：部署准备

#### 1. 服务器环境配置
```bash
# 生产环境配置清单
- [ ] 阿里云ECS服务器 (2核4G)
- [ ] MySQL 8.0数据库
- [ ] Redis 6.0缓存
- [ ] Nginx反向代理
- [ ] SSL证书配置
- [ ] 域名备案完成
```

#### 2. CI/CD配置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Backend
        run: |
          cd backend
          npm install
          npm run build
          
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/yeslocker
            git pull origin main
            npm install --production
            pm2 restart yeslocker
```

### Day 26：小程序审核准备

#### 1. 审核材料准备
- [ ] 营业执照
- [ ] 软件著作权（如需要）
- [ ] 用户服务协议
- [ ] 隐私政策
- [ ] 测试账号和演示视频

#### 2. 小程序配置
```json
// app.json 关键配置
{
  "pages": [
    "pages/index/index",
    "pages/request/request",
    "pages/history/history",
    "pages/locker/detail",
    "pages/auth/register"
  ],
  "permission": {
    "scope.userLocation": {
      "desc": "获取位置信息用于定位最近的门店"
    }
  },
  "requiredBackgroundModes": ["audio"],
  "networkTimeout": {
    "request": 10000,
    "uploadFile": 10000
  }
}
```

### Day 27-28：上线与监控

#### 1. 分阶段上线策略
- **Phase 1**: 内部测试（10个测试用户）
- **Phase 2**: 灰度发布（50个用户）
- **Phase 3**: 全量发布

#### 2. 监控告警配置
```javascript
// 监控指标配置
const monitoringMetrics = {
  // API监控
  apiMetrics: {
    responseTime: { threshold: 500, unit: 'ms' },
    errorRate: { threshold: 1, unit: '%' },
    qps: { threshold: 1000, unit: 'req/s' }
  },
  
  // 业务监控
  businessMetrics: {
    dailyActiveUsers: { threshold: 10, unit: 'users' },
    failedRequests: { threshold: 5, unit: 'count' },
    longStorageAlerts: { threshold: 10, unit: 'count' }
  },
  
  // 系统监控
  systemMetrics: {
    cpuUsage: { threshold: 80, unit: '%' },
    memoryUsage: { threshold: 85, unit: '%' },
    diskUsage: { threshold: 90, unit: '%' }
  }
};
```

## 🎯 关键里程碑与交付物

### 里程碑时间表
| 日期 | 里程碑 | 交付物 |
|------|--------|--------|
| Day 14 | 后端API完成 | 所有API可调用，员工端基础功能 |
| Day 21 | 功能开发完成 | 用户端、员工端全功能实现 |
| Day 25 | 部署就绪 | 生产环境配置完成 |
| Day 28 | MVP上线 | 小程序发布，系统正式运行 |

### 最终交付清单
1. **代码交付**
   - 小程序前端完整代码
   - 后端API服务代码
   - 员工管理端代码
   - 数据库脚本和迁移文件

2. **文档交付**
   - API接口文档
   - 部署操作手册
   - 员工操作指南
   - 系统维护手册

3. **配置交付**
   - 生产环境配置文件
   - Nginx配置
   - 监控告警规则
   - 备份恢复脚本

## 🚨 风险管理与应急预案

### 技术风险
1. **小程序审核延迟**
   - 缓解：提前一周提交审核
   - 预案：先使用企业内部体验版

2. **性能瓶颈**
   - 缓解：提前进行压力测试
   - 预案：准备弹性扩容方案

### 业务风险
1. **员工操作不熟练**
   - 缓解：提前培训，准备操作视频
   - 预案：安排技术支持值班

2. **用户接受度**
   - 缓解：准备用户引导教程
   - 预案：保留人工处理通道

## 📊 成功标准

### 技术指标
- ✅ 系统可用性 > 99%
- ✅ 平均响应时间 < 300ms
- ✅ 并发支持 > 200用户
- ✅ 零严重bug

### 业务指标
- ✅ 首月注册用户 > 100
- ✅ 日活跃用户 > 30
- ✅ 员工操作效率提升 > 50%
- ✅ 用户满意度 > 90%

---

*此计划基于第1周完成情况制定，可根据实际进展动态调整*