# B02 查询优化实施总结

## 概述

本文档总结了储物柜系统 B02 查询优化的实施内容和注意事项。

## 优化内容

### 1. 数据库索引优化

#### 1.1 新增索引列表

**litemall_locker 表**
- `idx_store_status_deleted`: 复合索引(store_id, status, deleted) - 优化可用储物柜查询
- `idx_store_zone_status`: 复合索引(store_id, zone, status) - 优化按区域查询
- `idx_last_used_time`: 单列索引(last_used_time) - 优化清理提醒查询
- `idx_assigned_user_deleted`: 复合索引(assigned_user_id, deleted) - 优化用户专属柜查询

**litemall_locker_operation 表**
- `idx_user_type_status_deleted`: 复合索引(user_id, type, status, deleted) - 优化用户操作历史查询
- `idx_store_type_addtime`: 复合索引(store_id, type, add_time) - 优化门店统计查询
- `idx_locker_status_deleted`: 复合索引(locker_id, status, deleted) - 优化柜子操作历史查询
- `idx_status_expired_deleted`: 复合索引(status, expired_at, deleted) - 优化过期凭证查询

**litemall_voucher 表**
- `idx_user_status_expired`: 复合索引(user_id, status, expired_at) - 优化用户有效凭证查询
- `idx_store_status_created`: 复合索引(store_id, status, created_at) - 优化门店凭证统计
- `idx_status_expired_type`: 复合索引(status, expired_at, type) - 优化凭证清理查询

**litemall_storage_request 表**
- `idx_user_status_addtime`: 复合索引(user_id, status, add_time) - 优化用户申请历史查询
- `idx_store_status_type`: 复合索引(store_id, status, type) - 优化待处理申请查询
- `idx_status_addtime_deleted`: 复合索引(status, add_time, deleted) - 优化超时申请查询
- `idx_staff_id`: 单列索引(staff_id) - 优化员工处理记录查询

**litemall_user 表**
- `idx_store_verified_deleted`: 复合索引(store_id, identity_verified, deleted) - 优化已验证用户查询
- `idx_real_name`: 前缀索引(real_name(20)) - 优化姓名搜索
- `idx_mobile_deleted`: 复合索引(mobile, deleted) - 优化手机号查询

**litemall_staff_log 表**
- `idx_staff_addtime`: 复合索引(staff_id, add_time) - 优化员工操作历史查询
- `idx_store_action_addtime`: 复合索引(store_id, action, add_time) - 优化门店操作统计
- `idx_user_id`: 单列索引(user_id) - 优化用户相关操作查询

#### 1.2 索引设计原则

1. **复合索引顺序**：按照查询条件的选择性从高到低排列
2. **覆盖索引**：尽可能包含查询所需的所有字段
3. **避免冗余**：不创建被其他索引完全覆盖的索引
4. **前缀索引**：对长字符串字段使用前缀索引节省空间

### 2. 查询优化建议

#### 2.1 分页优化

```java
// 限制最大页码和页面大小
public static final int MAX_PAGE = 100;
public static final int MAX_PAGE_SIZE = 100;

// 使用游标分页替代深分页
public List<LitemallLocker> queryCursor(Integer lastId, Integer limit);

// 按需执行 COUNT 查询
public PageResult<LitemallLocker> queryWithOptionalCount(
    ..., boolean needCount);
```

#### 2.2 查询缓存

- 缓存常用查询结果（如可用储物柜列表）
- 设置合理的缓存过期时间
- 在数据更新时及时清除相关缓存

#### 2.3 查询语句优化

- 使用 `SQL_CALC_FOUND_ROWS` 避免额外的 COUNT 查询
- 选择合适的排序字段以利用索引
- 避免 `SELECT *`，只查询需要的字段
- 合理使用 JOIN，避免笛卡尔积

### 3. 性能监控

#### 3.1 慢查询监控

创建了 `v_locker_slow_queries` 视图，监控超过 100ms 的查询：

```sql
SELECT * FROM v_locker_slow_queries;
```

#### 3.2 索引使用情况检查

创建了 `check_index_usage` 存储过程：

```sql
CALL check_index_usage('litemall_locker');
```

#### 3.3 统计信息更新

创建了 `update_table_statistics` 存储过程，定期更新表统计信息：

```sql
CALL update_table_statistics();
```

### 4. 性能测试

提供了完整的性能测试脚本 `test-query-performance.sh`：

- 数据库查询性能测试
- API 接口性能测试
- 查询计划分析
- 测试数据生成

## 实施步骤

### 第一步：备份数据库

```bash
mysqldump -u root -p litemall > litemall_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 第二步：执行优化脚本

```bash
mysql -u litemall -p litemall < sql/b02-query-optimization.sql
```

### 第三步：验证索引创建

```sql
-- 查看新创建的索引
SHOW INDEX FROM litemall_locker;
SHOW INDEX FROM litemall_locker_operation;
SHOW INDEX FROM litemall_voucher;
SHOW INDEX FROM litemall_storage_request;
SHOW INDEX FROM litemall_user;
SHOW INDEX FROM litemall_staff_log;
```

### 第四步：执行性能测试

```bash
./scripts/test-query-performance.sh
```

### 第五步：监控系统性能

- 观察数据库 CPU 和内存使用情况
- 监控慢查询日志
- 检查 API 响应时间

## 注意事项

### 1. 索引维护成本

- 索引会增加写操作的开销
- 定期检查未使用的索引并考虑删除
- 监控索引碎片情况，必要时重建索引

### 2. 内存使用

- 增加索引会占用更多内存
- 确保 InnoDB buffer pool 大小足够
- 监控内存使用情况

### 3. 查询计划变化

- 新索引可能改变查询执行计划
- 使用 EXPLAIN 验证关键查询的执行计划
- 必要时使用索引提示强制使用特定索引

### 4. 分阶段实施

- 先在测试环境验证
- 生产环境分批次添加索引
- 每次添加后观察系统表现

## 回滚方案

如果需要回滚优化，执行回滚脚本：

```bash
mysql -u litemall -p litemall < sql/b02-query-optimization-rollback.sql
```

## 后续优化建议

### 1. 数据归档

- 定期归档历史操作记录
- 保持活跃数据表的适当大小
- 使用分区表管理大量历史数据

### 2. 读写分离

- 配置主从复制
- 将查询请求路由到从库
- 减轻主库压力

### 3. 缓存优化

- 引入 Redis 缓存热点数据
- 实现多级缓存策略
- 优化缓存失效机制

### 4. 查询重构

- 将复杂查询拆分为多个简单查询
- 使用物化视图预计算统计数据
- 考虑使用 Elasticsearch 进行全文搜索

## 性能基准

优化后的预期性能指标：

- 储物柜列表查询：< 50ms
- 用户操作历史查询：< 100ms
- 待处理申请查询：< 100ms
- 统计查询：< 200ms
- API 响应时间：< 300ms（包含业务逻辑）

## 联系方式

如有问题，请联系：
- 技术负责人：[姓名]
- 邮箱：[email]
- 优化实施日期：2025-01-27