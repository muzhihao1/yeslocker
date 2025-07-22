# 耶氏台球杆存取系统 - 数据库设计文档

## 概述

本文档基于 Context Engineering Level-1 的实体定义，设计 Litemall 的扩展数据表。我们保留 Litemall 原有的用户、商品等表结构，新增储物柜管理相关的表。

## 扩展表设计

### 1. 储物柜表 (litemall_locker)

```sql
CREATE TABLE `litemall_locker` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cabinet_number` varchar(20) NOT NULL COMMENT '柜号，如A01, B12',
  `zone` varchar(20) NOT NULL COMMENT '区域，如A区、B区',
  `status` varchar(20) NOT NULL DEFAULT 'available' COMMENT '状态: available/occupied/maintenance',
  `current_user_id` int(11) DEFAULT NULL COMMENT '当前使用者ID',
  `last_used_time` datetime DEFAULT NULL COMMENT '最后使用时间',
  `clean_alert_days` int(11) NOT NULL DEFAULT '90' COMMENT '清理提醒天数',
  `notes` varchar(500) DEFAULT NULL COMMENT '备注信息',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cabinet_number` (`cabinet_number`),
  KEY `idx_zone` (`zone`),
  KEY `idx_status` (`status`),
  KEY `idx_current_user` (`current_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='储物柜表';
```

### 2. 储物柜操作记录表 (litemall_locker_operation)

```sql
CREATE TABLE `litemall_locker_operation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '操作用户ID',
  `type` varchar(10) NOT NULL COMMENT '操作类型: store/retrieve',
  `locker_id` int(11) NOT NULL COMMENT '储物柜ID',
  `voucher_code` varchar(32) DEFAULT NULL COMMENT '凭证码，格式：YYYYMMDD-XXXX-XXXX',
  `qr_code_url` varchar(255) DEFAULT NULL COMMENT '二维码URL',
  `status` varchar(10) NOT NULL DEFAULT 'active' COMMENT '状态: active/used/expired',
  `expired_at` datetime DEFAULT NULL COMMENT '过期时间',
  `staff_id` int(11) DEFAULT NULL COMMENT '操作员工ID（可选）',
  `notes` text COMMENT '备注',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_voucher_code` (`voucher_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_locker_id` (`locker_id`),
  KEY `idx_type_status` (`type`,`status`),
  KEY `idx_expired_at` (`expired_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='储物柜操作记录表';
```

### 3. 球杆信息表 (litemall_cue_stick)

```sql
CREATE TABLE `litemall_cue_stick` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '所属用户ID',
  `brand` varchar(100) DEFAULT NULL COMMENT '品牌',
  `model` varchar(100) DEFAULT NULL COMMENT '型号',
  `serial_number` varchar(100) DEFAULT NULL COMMENT '序列号',
  `purchase_date` date DEFAULT NULL COMMENT '购买日期',
  `price` decimal(10,2) DEFAULT NULL COMMENT '购买价格',
  `photos` text COMMENT '照片JSON数组',
  `description` text COMMENT '描述',
  `is_for_sale` tinyint(1) DEFAULT '0' COMMENT '是否在售',
  `sale_price` decimal(10,2) DEFAULT NULL COMMENT '出售价格',
  `category` varchar(20) DEFAULT NULL COMMENT '类别: playing_cue/breaking_cue/jump_cue',
  `price_range` varchar(20) DEFAULT NULL COMMENT '价格区间: entry/intermediate/professional/luxury',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_for_sale` (`is_for_sale`),
  KEY `idx_brand` (`brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='球杆信息表';
```

### 4. 凭证表 (litemall_voucher)

```sql
CREATE TABLE `litemall_voucher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL COMMENT '凭证码',
  `operation_id` int(11) NOT NULL COMMENT '关联操作ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `locker_id` int(11) NOT NULL COMMENT '储物柜ID',
  `type` varchar(10) NOT NULL COMMENT '类型: store/retrieve',
  `status` varchar(10) NOT NULL DEFAULT 'active' COMMENT '状态: active/used/expired',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `used_at` datetime DEFAULT NULL COMMENT '使用时间',
  `expired_at` datetime NOT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_operation_id` (`operation_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_expired_at` (`expired_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='凭证表';
```

### 5. 系统配置扩展 (使用 litemall_system 表)

```sql
-- 插入储物柜相关配置
INSERT INTO `litemall_system` (`key_name`, `key_value`, `add_time`, `update_time`) VALUES
('locker_clean_days', '90', NOW(), NOW()),
('voucher_valid_days', '30', NOW(), NOW()),
('max_store_per_user', '1', NOW(), NOW()),
('enable_wechat_notify', 'true', NOW(), NOW()),
('daily_operation_limit', '10', NOW(), NOW());
```

## 与 Litemall 现有表的关联

### 1. 用户表扩展 (litemall_user)

```sql
-- 为用户表添加身份验证相关字段
ALTER TABLE `litemall_user` 
ADD COLUMN `real_name` varchar(63) DEFAULT NULL COMMENT '真实姓名' AFTER `nickname`,
ADD COLUMN `identity_verified` tinyint(1) DEFAULT '0' COMMENT '身份验证状态' AFTER `real_name`,
ADD COLUMN `identity_card` varchar(255) DEFAULT NULL COMMENT '身份证号（加密存储）' AFTER `identity_verified`,
ADD COLUMN `phone_verified` tinyint(1) DEFAULT '0' COMMENT '手机号验证状态' AFTER `mobile`;
```

### 2. 广告表复用 (litemall_ad)

Litemall 已有广告表，我们可以直接使用，只需要添加位置类型：

```sql
-- 添加储物柜相关的广告位置
ALTER TABLE `litemall_ad` 
MODIFY COLUMN `position` tinyint(3) DEFAULT '1' 
COMMENT '广告位置：1首页，2储物柜操作页，3凭证底部，4二手市场';
```

### 3. 商品表关联 (litemall_goods)

用户的球杆可以作为二手商品发布，通过添加关联字段：

```sql
-- 为商品表添加球杆关联
ALTER TABLE `litemall_goods` 
ADD COLUMN `cue_stick_id` int(11) DEFAULT NULL COMMENT '关联球杆ID' AFTER `category_id`,
ADD KEY `idx_cue_stick_id` (`cue_stick_id`);
```

## 索引设计原则

1. **主键索引**：所有表都有自增主键
2. **唯一索引**：凭证码、柜号等业务唯一字段
3. **查询索引**：用户ID、状态、时间等高频查询字段
4. **联合索引**：根据查询模式设计，如 (type, status)

## 数据完整性约束

1. **外键约束**：考虑性能，不使用物理外键，通过应用层保证
2. **唯一约束**：凭证码、柜号必须唯一
3. **非空约束**：核心业务字段不允许为空
4. **默认值**：状态字段设置合理默认值

## 性能优化建议

1. **分表策略**：操作记录表按年份分表（当数据量大时）
2. **归档策略**：超过1年的操作记录归档到历史表
3. **缓存策略**：活跃储物柜信息使用 Redis 缓存
4. **查询优化**：避免全表扫描，使用覆盖索引

## 数据迁移计划

```sql
-- 1. 创建所有新表
-- 2. 修改现有表结构
-- 3. 导入初始数据（储物柜信息）
-- 4. 设置系统配置
-- 5. 验证数据完整性
```

## 备份策略

1. **全量备份**：每日凌晨3点
2. **增量备份**：每小时
3. **归档备份**：每月1日归档上月数据
4. **异地备份**：实时同步到备份数据库