# Multi-Store Migration Guide

## Overview
This guide provides step-by-step instructions for migrating the existing single-store system to support multiple stores.

## Pre-Migration Checklist

- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Notify users of maintenance window
- [ ] Prepare rollback scripts
- [ ] Verify all migration scripts
- [ ] Document current locker assignments

## Migration Steps

### Step 1: Create Store Table

```sql
-- Create stores table
CREATE TABLE `litemall_store` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '店铺名称',
  `code` varchar(20) NOT NULL COMMENT '店铺代码，如S001',
  `address` varchar(255) NOT NULL COMMENT '店铺地址',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `status` varchar(20) NOT NULL DEFAULT 'active' COMMENT '状态: active/inactive/maintenance',
  `business_hours` varchar(100) DEFAULT NULL COMMENT '营业时间',
  `max_lockers` int(11) DEFAULT 100 COMMENT '最大储物柜数量',
  `notes` text COMMENT '备注信息',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺表';
```

### Step 2: Insert Default Store

```sql
-- Insert default store for existing data
INSERT INTO `litemall_store` (`name`, `code`, `address`, `phone`, `status`, `business_hours`) 
VALUES (
  '耶氏体育台球馆总店', 
  'S001', 
  '北京市朝阳区xxx路xxx号',
  '010-12345678', 
  'active',
  '09:00-22:00'
);

-- Capture the default store ID
SET @default_store_id = LAST_INSERT_ID();
```

### Step 3: Add Store Columns

```sql
-- Add store_id to lockers table
ALTER TABLE `litemall_locker` 
ADD COLUMN `store_id` int(11) DEFAULT NULL COMMENT '所属店铺ID' AFTER `id`;

-- Add store_id to operations table
ALTER TABLE `litemall_locker_operation`
ADD COLUMN `store_id` int(11) DEFAULT NULL COMMENT '操作店铺ID' AFTER `locker_id`;

-- Add default_store_id to users table
ALTER TABLE `litemall_user`
ADD COLUMN `default_store_id` int(11) DEFAULT NULL COMMENT '默认店铺ID' AFTER `phone_verified`;
```

### Step 4: Populate Store Data

```sql
-- Update all existing lockers to default store
UPDATE `litemall_locker` 
SET `store_id` = @default_store_id 
WHERE `store_id` IS NULL;

-- Update all existing operations with store from their locker
UPDATE `litemall_locker_operation` lo
INNER JOIN `litemall_locker` l ON lo.locker_id = l.id
SET lo.store_id = l.store_id
WHERE lo.store_id IS NULL;

-- Set default store for all verified users
UPDATE `litemall_user` 
SET `default_store_id` = @default_store_id 
WHERE `identity_verified` = 1 AND `default_store_id` IS NULL;
```

### Step 5: Add Constraints and Indexes

```sql
-- Make store_id required for lockers
ALTER TABLE `litemall_locker` 
MODIFY COLUMN `store_id` int(11) NOT NULL COMMENT '所属店铺ID';

-- Make store_id required for operations
ALTER TABLE `litemall_locker_operation`
MODIFY COLUMN `store_id` int(11) NOT NULL COMMENT '操作店铺ID';

-- Add indexes for performance
ALTER TABLE `litemall_locker` ADD INDEX `idx_store_id` (`store_id`);
ALTER TABLE `litemall_locker_operation` ADD INDEX `idx_store_id` (`store_id`);
ALTER TABLE `litemall_user` ADD INDEX `idx_default_store` (`default_store_id`);

-- Update unique constraint for cabinet numbers
ALTER TABLE `litemall_locker` 
DROP INDEX `uk_cabinet_number`,
ADD UNIQUE KEY `uk_store_cabinet` (`store_id`, `cabinet_number`);
```

### Step 6: Verify Migration

```sql
-- Check all lockers have store assigned
SELECT COUNT(*) as lockers_without_store 
FROM `litemall_locker` 
WHERE `store_id` IS NULL;

-- Check all operations have store assigned
SELECT COUNT(*) as operations_without_store 
FROM `litemall_locker_operation` 
WHERE `store_id` IS NULL;

-- Verify cabinet number uniqueness per store
SELECT `store_id`, `cabinet_number`, COUNT(*) as count
FROM `litemall_locker`
WHERE `deleted` = 0
GROUP BY `store_id`, `cabinet_number`
HAVING count > 1;

-- Check data integrity
SELECT 
  (SELECT COUNT(*) FROM `litemall_store`) as total_stores,
  (SELECT COUNT(DISTINCT `store_id`) FROM `litemall_locker`) as stores_with_lockers,
  (SELECT COUNT(*) FROM `litemall_locker` WHERE `store_id` NOT IN (SELECT `id` FROM `litemall_store`)) as orphaned_lockers;
```

## Rollback Script

```sql
-- Remove constraints
ALTER TABLE `litemall_locker` 
DROP INDEX `uk_store_cabinet`,
ADD UNIQUE KEY `uk_cabinet_number` (`cabinet_number`);

-- Remove indexes
ALTER TABLE `litemall_locker` DROP INDEX `idx_store_id`;
ALTER TABLE `litemall_locker_operation` DROP INDEX `idx_store_id`;
ALTER TABLE `litemall_user` DROP INDEX `idx_default_store`;

-- Remove columns
ALTER TABLE `litemall_locker` DROP COLUMN `store_id`;
ALTER TABLE `litemall_locker_operation` DROP COLUMN `store_id`;
ALTER TABLE `litemall_user` DROP COLUMN `default_store_id`;

-- Remove store table
DROP TABLE IF EXISTS `litemall_store`;
```

## Post-Migration Tasks

### 1. Application Configuration
```yaml
# Add to application.yml
locker:
  default-store-id: 1  # ID of default store
  multi-store-enabled: true
```

### 2. Cache Invalidation
```bash
# Clear Redis cache
redis-cli FLUSHDB
```

### 3. Update Admin Users
```sql
-- Grant store management permissions to admins
-- (Depends on your permission system)
```

### 4. Communication Template
```
Subject: 系统升级通知 - 支持多店铺功能

尊敬的用户：

我们的系统已升级支持多店铺功能。您的储物柜已自动分配到默认店铺。

主要变化：
1. 注册时需选择店铺
2. 可在个人中心查看/更改默认店铺
3. 储物柜按店铺分类显示

如有任何问题，请联系客服。

耶氏体育
```

## Monitoring Post-Migration

### Key Metrics to Monitor
1. API response times (especially locker queries)
2. Database query performance
3. Error rates
4. User registration completion rates

### Health Check Queries
```sql
-- Daily health check
SELECT 
  s.name as store_name,
  COUNT(DISTINCT l.id) as total_lockers,
  SUM(CASE WHEN l.status = 'available' THEN 1 ELSE 0 END) as available_lockers,
  COUNT(DISTINCT lo.user_id) as active_users
FROM `litemall_store` s
LEFT JOIN `litemall_locker` l ON s.id = l.store_id AND l.deleted = 0
LEFT JOIN `litemall_locker_operation` lo ON s.id = lo.store_id 
  AND lo.type = 'store' 
  AND lo.status = 'active'
GROUP BY s.id;
```

## Troubleshooting

### Common Issues

1. **Duplicate cabinet numbers after migration**
   - Check for lockers with same cabinet_number in same store
   - Update cabinet numbers to be unique per store

2. **Users cannot see lockers**
   - Verify user has default_store_id set
   - Check store status is 'active'

3. **Performance degradation**
   - Check if indexes were created properly
   - Analyze slow queries with EXPLAIN

### Emergency Contacts
- Database Admin: [Contact]
- Backend Lead: [Contact]
- DevOps: [Contact]