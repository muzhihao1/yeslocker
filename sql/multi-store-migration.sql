-- ====================================
-- 多门店支持迁移脚本
-- 执行时间：2025-01-26
-- 功能：支持多门店管理，包括用户注册时选择门店、储物柜按门店管理、管理员按门店管理
-- ====================================

-- 开启事务
START TRANSACTION;

-- ====================================
-- 1. 创建门店表（如果不存在）
-- ====================================
CREATE TABLE IF NOT EXISTS `litemall_store` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(63) NOT NULL COMMENT '门店名称',
  `code` varchar(63) NOT NULL COMMENT '门店编号',
  `address` varchar(255) DEFAULT NULL COMMENT '门店地址',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `business_hours` varchar(63) DEFAULT NULL COMMENT '营业时间',
  `status` varchar(31) NOT NULL DEFAULT 'active' COMMENT '状态: active-营业中, inactive-已停业, maintenance-维护中',
  `locker_count` int(11) DEFAULT '0' COMMENT '储物柜数量',
  `manager_name` varchar(63) DEFAULT NULL COMMENT '管理员姓名',
  `manager_phone` varchar(20) DEFAULT NULL COMMENT '管理员电话',
  `province` varchar(63) DEFAULT NULL COMMENT '省份',
  `city` varchar(63) DEFAULT NULL COMMENT '城市',
  `district` varchar(63) DEFAULT NULL COMMENT '区县',
  `latitude` decimal(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(10,7) DEFAULT NULL COMMENT '经度',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_name` (`name`),
  KEY `idx_status` (`status`),
  KEY `idx_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店表';

-- ====================================
-- 2. 插入默认门店数据（如果不存在）
-- ====================================
INSERT INTO `litemall_store` (`name`, `code`, `address`, `phone`, `business_hours`, `status`, `locker_count`, `manager_name`, `manager_phone`, `province`, `city`, `district`)
SELECT '耶氏体育台球俱乐部（总店）', 'YS001', '北京市朝阳区建国路88号', '010-12345678', '09:00-22:00', 'active', 20, '张经理', '13800138000', '北京市', '北京市', '朝阳区'
WHERE NOT EXISTS (SELECT 1 FROM `litemall_store` WHERE `code` = 'YS001');

-- 获取默认门店ID
SET @default_store_id = (SELECT `id` FROM `litemall_store` WHERE `code` = 'YS001' LIMIT 1);

-- ====================================
-- 3. 为 litemall_locker 表添加 store_id 字段
-- ====================================
-- 检查字段是否已存在
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'litemall_locker' 
  AND COLUMN_NAME = 'store_id';

-- 如果不存在则添加
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `litemall_locker` ADD COLUMN `store_id` int(11) NOT NULL DEFAULT 1 COMMENT ''所属门店ID'' AFTER `id`',
    'SELECT ''Column store_id already exists in litemall_locker''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加索引（如果不存在）
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'litemall_locker'
  AND INDEX_NAME = 'idx_store_id';

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `litemall_locker` ADD KEY `idx_store_id` (`store_id`)',
    'SELECT ''Index idx_store_id already exists in litemall_locker''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有储物柜的 store_id 为默认门店
UPDATE `litemall_locker` SET `store_id` = @default_store_id WHERE `store_id` = 1 OR `store_id` IS NULL;

-- ====================================
-- 4. 为 litemall_user 表添加 store_id 字段
-- ====================================
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'litemall_user' 
  AND COLUMN_NAME = 'store_id';

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `litemall_user` ADD COLUMN `store_id` int(11) DEFAULT NULL COMMENT ''注册门店ID'' AFTER `phone_verified`',
    'SELECT ''Column store_id already exists in litemall_user''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加索引
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'litemall_user'
  AND INDEX_NAME = 'idx_store_id';

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `litemall_user` ADD KEY `idx_store_id` (`store_id`)',
    'SELECT ''Index idx_store_id already exists in litemall_user''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有用户的 store_id 为默认门店
UPDATE `litemall_user` SET `store_id` = @default_store_id WHERE `store_id` IS NULL;

-- ====================================
-- 5. 为 litemall_storage_request 表添加 store_id 字段
-- ====================================
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'litemall_storage_request' 
  AND COLUMN_NAME = 'store_id';

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `litemall_storage_request` ADD COLUMN `store_id` int(11) NOT NULL COMMENT ''所属门店ID'' AFTER `locker_id`',
    'SELECT ''Column store_id already exists in litemall_storage_request''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加索引
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'litemall_storage_request'
  AND INDEX_NAME = 'idx_store_id';

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `litemall_storage_request` ADD KEY `idx_store_id` (`store_id`)',
    'SELECT ''Index idx_store_id already exists in litemall_storage_request''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有申请的 store_id（基于储物柜的门店）
UPDATE `litemall_storage_request` sr
INNER JOIN `litemall_locker` l ON sr.`locker_id` = l.`id`
SET sr.`store_id` = l.`store_id`
WHERE sr.`store_id` IS NULL OR sr.`store_id` = 0;

-- ====================================
-- 6. 为 litemall_locker_operation 表添加 store_id 字段（如果不存在）
-- ====================================
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'litemall_locker_operation' 
  AND COLUMN_NAME = 'store_id';

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `litemall_locker_operation` ADD COLUMN `store_id` int(11) NOT NULL DEFAULT 1 COMMENT ''所属门店ID'' AFTER `locker_id`',
    'SELECT ''Column store_id already exists in litemall_locker_operation''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加索引
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'litemall_locker_operation'
  AND INDEX_NAME = 'idx_store_id';

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `litemall_locker_operation` ADD KEY `idx_store_id` (`store_id`)',
    'SELECT ''Index idx_store_id already exists in litemall_locker_operation''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有操作记录的 store_id
UPDATE `litemall_locker_operation` lo
INNER JOIN `litemall_locker` l ON lo.`locker_id` = l.`id`
SET lo.`store_id` = l.`store_id`
WHERE lo.`store_id` = 1 OR lo.`store_id` IS NULL;

-- ====================================
-- 7. 为 litemall_voucher 表添加 store_id 字段
-- ====================================
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'litemall_voucher' 
  AND COLUMN_NAME = 'store_id';

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `litemall_voucher` ADD COLUMN `store_id` int(11) NOT NULL COMMENT ''所属门店ID'' AFTER `locker_id`',
    'SELECT ''Column store_id already exists in litemall_voucher''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加索引
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'litemall_voucher'
  AND INDEX_NAME = 'idx_store_id';

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `litemall_voucher` ADD KEY `idx_store_id` (`store_id`)',
    'SELECT ''Index idx_store_id already exists in litemall_voucher''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有凭证的 store_id
UPDATE `litemall_voucher` v
INNER JOIN `litemall_locker` l ON v.`locker_id` = l.`id`
SET v.`store_id` = l.`store_id`
WHERE v.`store_id` IS NULL OR v.`store_id` = 0;

-- ====================================
-- 8. 为 litemall_staff_log 表添加 store_id 字段
-- ====================================
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'litemall_staff_log' 
  AND COLUMN_NAME = 'store_id';

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `litemall_staff_log` ADD COLUMN `store_id` int(11) NOT NULL COMMENT ''所属门店ID'' AFTER `locker_id`',
    'SELECT ''Column store_id already exists in litemall_staff_log''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加索引
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'litemall_staff_log'
  AND INDEX_NAME = 'idx_store_id';

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `litemall_staff_log` ADD KEY `idx_store_id` (`store_id`)',
    'SELECT ''Index idx_store_id already exists in litemall_staff_log''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有日志的 store_id
UPDATE `litemall_staff_log` sl
INNER JOIN `litemall_locker` l ON sl.`locker_id` = l.`id`
SET sl.`store_id` = l.`store_id`
WHERE sl.`store_id` IS NULL OR sl.`store_id` = 0;

-- ====================================
-- 9. 创建管理员-门店权限表（可选）
-- ====================================
CREATE TABLE IF NOT EXISTS `litemall_admin_store` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL COMMENT '管理员ID',
  `store_id` int(11) NOT NULL COMMENT '门店ID',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_store` (`admin_id`, `store_id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_store_id` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员-门店权限表';

-- ====================================
-- 10. 为超级管理员添加所有门店权限
-- ====================================
INSERT INTO `litemall_admin_store` (`admin_id`, `store_id`)
SELECT a.`id`, s.`id`
FROM `litemall_admin` a
CROSS JOIN `litemall_store` s
WHERE a.`username` = 'admin123' AND s.`deleted` = 0
  AND NOT EXISTS (
    SELECT 1 FROM `litemall_admin_store` 
    WHERE `admin_id` = a.`id` AND `store_id` = s.`id`
  );

-- ====================================
-- 11. 添加系统配置
-- ====================================
INSERT INTO `litemall_system` (`key_name`, `key_value`, `add_time`, `update_time`) VALUES
('enable_multi_store', 'true', NOW(), NOW()),
('default_store_id', @default_store_id, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  `key_value` = VALUES(`key_value`),
  `update_time` = NOW();

-- ====================================
-- 12. 创建视图：按门店统计储物柜使用情况
-- ====================================
CREATE OR REPLACE VIEW `v_store_locker_stats` AS
SELECT 
  s.`id` AS `store_id`,
  s.`name` AS `store_name`,
  s.`code` AS `store_code`,
  COUNT(l.`id`) AS `total_lockers`,
  SUM(CASE WHEN l.`status` = 'available' THEN 1 ELSE 0 END) AS `available_lockers`,
  SUM(CASE WHEN l.`status` = 'occupied' THEN 1 ELSE 0 END) AS `occupied_lockers`,
  SUM(CASE WHEN l.`status` = 'maintenance' THEN 1 ELSE 0 END) AS `maintenance_lockers`
FROM `litemall_store` s
LEFT JOIN `litemall_locker` l ON s.`id` = l.`store_id` AND l.`deleted` = 0
WHERE s.`deleted` = 0
GROUP BY s.`id`, s.`name`, s.`code`;

-- ====================================
-- 13. 创建存储过程：获取门店可用储物柜
-- ====================================
DELIMITER $$
DROP PROCEDURE IF EXISTS `get_available_lockers_by_store`$$
CREATE PROCEDURE `get_available_lockers_by_store`(
  IN p_store_id INT
)
BEGIN
  SELECT 
    l.`id`,
    l.`cabinet_number`,
    l.`zone`,
    l.`notes`
  FROM `litemall_locker` l
  WHERE l.`store_id` = p_store_id
    AND l.`status` = 'available'
    AND l.`deleted` = 0
    AND l.`assigned_user_id` IS NULL
  ORDER BY l.`zone`, l.`cabinet_number`;
END$$
DELIMITER ;

-- 提交事务
COMMIT;

-- ====================================
-- 回滚脚本（如需要回滚，执行以下语句）
-- ====================================
/*
-- 开启事务
START TRANSACTION;

-- 删除添加的字段
ALTER TABLE `litemall_locker` DROP COLUMN IF EXISTS `store_id`, DROP KEY IF EXISTS `idx_store_id`;
ALTER TABLE `litemall_user` DROP COLUMN IF EXISTS `store_id`, DROP KEY IF EXISTS `idx_store_id`;
ALTER TABLE `litemall_storage_request` DROP COLUMN IF EXISTS `store_id`, DROP KEY IF EXISTS `idx_store_id`;
ALTER TABLE `litemall_locker_operation` DROP COLUMN IF EXISTS `store_id`, DROP KEY IF EXISTS `idx_store_id`;
ALTER TABLE `litemall_voucher` DROP COLUMN IF EXISTS `store_id`, DROP KEY IF EXISTS `idx_store_id`;
ALTER TABLE `litemall_staff_log` DROP COLUMN IF EXISTS `store_id`, DROP KEY IF EXISTS `idx_store_id`;

-- 删除表
DROP TABLE IF EXISTS `litemall_admin_store`;
DROP TABLE IF EXISTS `litemall_store`;

-- 删除视图
DROP VIEW IF EXISTS `v_store_locker_stats`;

-- 删除存储过程
DROP PROCEDURE IF EXISTS `get_available_lockers_by_store`;

-- 删除系统配置
DELETE FROM `litemall_system` WHERE `key_name` IN ('enable_multi_store', 'default_store_id');

-- 提交事务
COMMIT;
*/