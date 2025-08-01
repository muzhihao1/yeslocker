# 第2周快速启动指南

## 🚀 本周目标
完成后端API开发、员工端界面、数据库优化，实现核心业务流程的前后端集成。

## 📋 Day 8-9 任务清单（后端API开发）

### 1. 环境准备
```bash
# 确保后端项目可以运行
cd /Users/liasiloam/项目开发/杆柜管理/yeslocker
./start-backend.sh

# 验证数据库连接
mysql -u root -p yeslocker -e "SHOW TABLES;"
```

### 2. API开发顺序

#### 上午：用户注册与柜位管理
- [ ] 实现 `/api/lockers/available` - 获取可用柜位列表
- [ ] 实现 `/api/user/register` - 用户注册（含柜位分配）
- [ ] 添加柜位状态管理逻辑

#### 下午：请求管理核心API
- [ ] 实现 `/api/requests/create` - 创建存取请求
- [ ] 实现 `/api/requests/:requestId` - 获取请求详情
- [ ] 实现请求过期自动处理逻辑

### 3. 数据库更新脚本
```sql
-- 执行前请备份数据库
-- 添加请求表
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(20) PRIMARY KEY,
    user_id INT NOT NULL,
    locker_id VARCHAR(10) NOT NULL,
    request_type ENUM('store', 'retrieve') NOT NULL,
    request_code VARCHAR(20) UNIQUE NOT NULL,
    qr_code_url VARCHAR(255),
    status ENUM('pending', 'verified', 'completed', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    verified_by INT NULL,
    completed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_status_created (status, created_at),
    INDEX idx_user_requests (user_id, created_at),
    INDEX idx_request_code (request_code)
);

-- 更新用户表，添加永久柜位字段
ALTER TABLE litemall_user 
ADD COLUMN IF NOT EXISTS permanent_locker_id VARCHAR(10) DEFAULT NULL,
ADD INDEX idx_permanent_locker (permanent_locker_id);
```

## 📋 Day 10-11 任务清单（员工端开发）

### 1. 员工端页面创建
```bash
# 在小程序项目中创建员工端页面
cd yeslocker-wx
mkdir -p pages/staff/{login,verify,monitor}
```

### 2. 员工功能实现顺序
- [ ] 员工登录页面和JWT认证
- [ ] 请求扫码验证功能
- [ ] 实时请求监控面板
- [ ] 异常操作处理界面

### 3. 员工API实现
```javascript
// 需要实现的员工端API
POST   /api/staff/login          // 员工登录
POST   /api/staff/verify-request // 验证用户请求
GET    /api/staff/pending-requests // 获取待处理请求
POST   /api/staff/complete-operation // 完成操作
GET    /api/staff/dashboard      // 监控面板数据
```

## 📋 Day 12-13 任务清单（优化与缓存）

### 1. Redis缓存实现
```bash
# 确保Redis运行
redis-cli ping

# 测试缓存连接
node -e "
const redis = require('redis');
const client = redis.createClient();
client.on('connect', () => console.log('Redis connected'));
client.connect();
"
```

### 2. 性能优化任务
- [ ] 实现用户柜位缓存
- [ ] 实现活跃请求缓存
- [ ] 添加数据库查询索引
- [ ] 实现批量操作优化

## 📋 Day 14 任务清单（集成测试）

### 1. 测试场景准备
```javascript
// 测试数据准备
const testData = {
  users: [
    { openId: 'test_user_1', nickName: '测试用户1', phone: '13800138001' },
    { openId: 'test_user_2', nickName: '测试用户2', phone: '13800138002' }
  ],
  staff: [
    { username: 'staff1', password: 'password1', role: 'operator' },
    { username: 'admin1', password: 'password1', role: 'admin' }
  ]
};
```

### 2. 集成测试脚本
```bash
# 运行API测试
npm test -- --testPathPattern=api

# 运行集成测试
npm test -- --testPathPattern=integration

# 生成测试报告
npm run test:coverage
```

## 🔧 常用命令速查

### 后端开发
```bash
# 启动后端服务
./start-backend.sh

# 查看日志
tail -f logs/yeslocker.log

# 重启服务
pm2 restart yeslocker

# 数据库迁移
npm run migrate
```

### 前端开发
```bash
# 启动小程序开发工具
# 使用微信开发者工具打开项目

# 构建npm
npm run build:mp-weixin

# 实时编译
npm run dev:mp-weixin
```

## ⚡ 每日检查清单

### 早上开始
- [ ] 拉取最新代码
- [ ] 检查环境状态
- [ ] 查看昨日测试结果
- [ ] 更新今日任务

### 晚上结束
- [ ] 提交代码
- [ ] 更新进度文档
- [ ] 运行自动化测试
- [ ] 记录遇到的问题

## 🆘 常见问题快速解决

### 1. 数据库连接失败
```bash
# 检查MySQL服务
systemctl status mysql

# 重置密码
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
```

### 2. Redis连接失败
```bash
# 检查Redis服务
redis-cli ping

# 重启Redis
redis-server restart
```

### 3. API调用失败
```bash
# 检查后端日志
tail -f logs/error.log

# 测试API连通性
curl http://localhost:8080/health
```

## 📞 支持资源

- API文档：`/docs/api-documentation.md`
- 数据库设计：`/docs/database-design.md`
- 问题追踪：在项目issues中记录
- 每日站会：上午10:00同步进度

---

*保持专注，稳步推进！如遇问题及时沟通。*