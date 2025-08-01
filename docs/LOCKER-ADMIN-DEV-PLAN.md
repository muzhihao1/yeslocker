# 储物柜管理系统开发计划

## 项目概述
基于Litemall电商平台，为耶氏台球杆存取系统添加完整的后台管理功能。

## 开发目标
1. 实现储物柜状态管理和监控
2. 提供操作记录查询和统计功能
3. 支持用户管理和身份验证查看
4. 确保系统安全性和性能

## 技术架构
- **后端**: Spring Boot 2.x + MyBatis + MySQL 8.0
- **前端**: Vue.js + Element UI (vue-element-admin)
- **认证**: Shiro + JWT Token
- **API文档**: Swagger

## 开发任务分解

### 第1周：后端API开发
#### 1.1 数据访问层 (Day 1-2)
- [ ] 生成储物柜相关的MyBatis Mapper
  - LitemallLockerMapper
  - LitemallLockerOperationMapper
  - LitemallCueStickMapper
  - LitemallVoucherMapper
- [ ] 创建对应的Model类和Example类
- [ ] 编写基础CRUD SQL语句

#### 1.2 服务层开发 (Day 2-3)
- [ ] LockerService - 储物柜管理服务
  ```java
  - list() // 分页查询储物柜
  - findById() // 查询单个储物柜
  - update() // 更新储物柜信息
  - updateStatus() // 更新储物柜状态
  - statistics() // 储物柜使用统计
  ```
- [ ] LockerOperationService - 操作记录服务
  ```java
  - list() // 分页查询操作记录
  - findByUserId() // 按用户查询
  - findByLockerId() // 按储物柜查询
  - export() // 导出Excel
  - dailyStats() // 日统计
  ```

#### 1.3 控制器层开发 (Day 3-4)
- [ ] AdminLockerController
  ```java
  @GetMapping("/list") // 储物柜列表
  @GetMapping("/detail") // 储物柜详情
  @PostMapping("/update") // 更新储物柜
  @PostMapping("/status") // 修改状态
  @GetMapping("/stats") // 统计信息
  ```
- [ ] AdminLockerOperationController
  ```java
  @GetMapping("/list") // 操作记录列表
  @GetMapping("/export") // 导出记录
  @GetMapping("/stats/daily") // 日统计
  @GetMapping("/stats/monthly") // 月统计
  ```

#### 1.4 权限和安全 (Day 4-5)
- [ ] 添加Shiro权限配置
- [ ] 实现储物柜管理员角色权限
- [ ] API接口权限注解
- [ ] 操作日志记录

### 第2周：前端界面开发
#### 2.1 路由和菜单配置 (Day 1)
- [ ] 在router/index.js添加储物柜管理路由
- [ ] 在菜单配置中添加储物柜管理菜单
- [ ] 权限控制配置

#### 2.2 储物柜管理页面 (Day 2-3)
- [ ] LockerList.vue - 储物柜列表页
  - 表格展示（柜号、区域、状态、使用者、最后使用时间）
  - 筛选功能（区域、状态）
  - 状态修改（可用/占用/维护）
  - 批量操作
- [ ] LockerDetail.vue - 储物柜详情弹窗
  - 基本信息展示
  - 使用历史记录
  - 维护记录

#### 2.3 操作记录页面 (Day 3-4)
- [ ] OperationList.vue - 操作记录列表
  - 时间范围筛选
  - 用户/储物柜筛选
  - 操作类型筛选
  - Excel导出功能
- [ ] OperationStats.vue - 统计分析页
  - 使用率图表（ECharts）
  - 高峰时段分析
  - 用户活跃度排行

#### 2.4 API接口集成 (Day 4-5)
- [ ] 创建/api/locker.js API模块
- [ ] 创建/api/operation.js API模块
- [ ] Vuex状态管理集成
- [ ] 错误处理和加载状态

### 第3周：集成测试和优化
#### 3.1 功能测试 (Day 1-2)
- [ ] 后端单元测试（JUnit）
- [ ] 前端组件测试（Vue Test Utils）
- [ ] API接口测试（Postman）
- [ ] 端到端测试

#### 3.2 性能优化 (Day 2-3)
- [ ] 数据库索引优化
- [ ] API响应时间优化
- [ ] 前端加载性能优化
- [ ] 缓存策略实施

#### 3.3 安全加固 (Day 3-4)
- [ ] SQL注入防护验证
- [ ] XSS防护验证
- [ ] 权限越权测试
- [ ] 敏感数据加密

#### 3.4 Bug修复 (Day 4-5)
- [ ] 收集测试反馈
- [ ] 修复发现的问题
- [ ] 回归测试

### 第4周：部署和文档
#### 4.1 部署准备 (Day 1-2)
- [ ] 生产环境配置
- [ ] 数据库迁移脚本
- [ ] 部署文档编写
- [ ] Docker镜像构建

#### 4.2 用户文档 (Day 2-3)
- [ ] 管理员操作手册
- [ ] API接口文档
- [ ] 故障排查指南
- [ ] 培训材料准备

#### 4.3 系统交付 (Day 4-5)
- [ ] 系统演示
- [ ] 用户培训
- [ ] 正式部署
- [ ] 监控配置

## 技术实现细节

### 数据库操作优化
```sql
-- 添加索引提升查询性能
ALTER TABLE litemall_locker ADD INDEX idx_zone_status (zone, status);
ALTER TABLE litemall_locker_operation ADD INDEX idx_user_time (user_id, operation_time);
ALTER TABLE litemall_locker_operation ADD INDEX idx_locker_time (locker_id, operation_time);

-- 储物柜使用率统计视图
CREATE VIEW v_locker_usage_stats AS
SELECT 
    zone,
    COUNT(*) as total_lockers,
    SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_count,
    ROUND(SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as usage_rate
FROM litemall_locker
WHERE deleted = 0
GROUP BY zone;
```

### 定时任务配置
```java
@Component
public class LockerScheduledTasks {
    // 每天凌晨2点检查过期凭证
    @Scheduled(cron = "0 0 2 * * ?")
    public void checkExpiredVouchers() {
        // 实现逻辑
    }
    
    // 每小时统计使用率
    @Scheduled(cron = "0 0 * * * ?")
    public void calculateUsageStats() {
        // 实现逻辑
    }
}
```

### 前端组件结构
```
litemall-admin/src/views/locker/
├── list.vue          # 储物柜列表主页面
├── components/
│   ├── LockerDetail.vue    # 详情弹窗组件
│   ├── LockerFilter.vue    # 筛选器组件
│   └── StatusTag.vue       # 状态标签组件
├── operation/
│   ├── list.vue            # 操作记录列表
│   └── stats.vue           # 统计分析页面
└── api/
    ├── locker.js           # 储物柜相关API
    └── operation.js        # 操作记录API
```

## 风险和应对措施

1. **数据一致性风险**
   - 使用事务管理确保操作原子性
   - 实现乐观锁防止并发冲突

2. **性能瓶颈风险**
   - 使用Redis缓存热点数据
   - 实现分页和懒加载

3. **安全风险**
   - 严格的权限控制
   - 操作审计日志
   - 定期安全扫描

## 交付标准

1. 所有功能测试通过率 > 95%
2. API响应时间 < 200ms
3. 前端页面加载时间 < 3s
4. 代码覆盖率 > 80%
5. 完整的用户文档和API文档

## 项目里程碑

- **M1 (Week 1)**: 后端API开发完成，可通过Postman测试
- **M2 (Week 2)**: 前端界面开发完成，实现基本功能
- **M3 (Week 3)**: 完成测试和优化，系统稳定运行
- **M4 (Week 4)**: 正式部署上线，完成用户培训

## 团队分工建议

- **后端开发**: 1人，负责API和服务层开发
- **前端开发**: 1人，负责Vue页面和组件开发
- **测试工程师**: 1人，负责测试用例设计和执行
- **项目经理**: 兼任，负责进度跟踪和协调

---

**更新时间**: 2025-07-26
**版本**: v1.0