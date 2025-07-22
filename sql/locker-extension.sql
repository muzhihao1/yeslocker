-- 耶氏台球杆存取系统 - 数据库扩展脚本
-- 基于 Litemall 数据库扩展储物柜管理功能
-- 执行前请确保已导入 Litemall 基础表结构

-- ====================================
-- 1. 储物柜表
-- ====================================
DROP TABLE IF EXISTS `litemall_locker`;
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

-- ====================================
-- 2. 储物柜操作记录表
-- ====================================
DROP TABLE IF EXISTS `litemall_locker_operation`;
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

-- ====================================
-- 3. 球杆信息表
-- ====================================
DROP TABLE IF EXISTS `litemall_cue_stick`;
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

-- ====================================
-- 4. 凭证表
-- ====================================
DROP TABLE IF EXISTS `litemall_voucher`;
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

-- ====================================
-- 5. 修改用户表，添加身份验证字段
-- ====================================
ALTER TABLE `litemall_user` 
ADD COLUMN `real_name` varchar(63) DEFAULT NULL COMMENT '真实姓名' AFTER `nickname`,
ADD COLUMN `identity_verified` tinyint(1) DEFAULT '0' COMMENT '身份验证状态' AFTER `real_name`,
ADD COLUMN `identity_card` varchar(255) DEFAULT NULL COMMENT '身份证号（加密存储）' AFTER `identity_verified`,
ADD COLUMN `phone_verified` tinyint(1) DEFAULT '0' COMMENT '手机号验证状态' AFTER `mobile`;

-- ====================================
-- 6. 修改广告表，扩展广告位置
-- ====================================
ALTER TABLE `litemall_ad` 
MODIFY COLUMN `position` tinyint(3) DEFAULT '1' 
COMMENT '广告位置：1首页，2储物柜操作页，3凭证底部，4二手市场';

-- ====================================
-- 7. 修改商品表，添加球杆关联
-- ====================================
ALTER TABLE `litemall_goods` 
ADD COLUMN `cue_stick_id` int(11) DEFAULT NULL COMMENT '关联球杆ID' AFTER `category_id`,
ADD KEY `idx_cue_stick_id` (`cue_stick_id`);

-- ====================================
-- 8. 插入系统配置
-- ====================================
INSERT INTO `litemall_system` (`key_name`, `key_value`, `add_time`, `update_time`) VALUES
('locker_clean_days', '90', NOW(), NOW()),
('voucher_valid_days', '30', NOW(), NOW()),
('max_store_per_user', '1', NOW(), NOW()),
('enable_wechat_notify', 'true', NOW(), NOW()),
('daily_operation_limit', '10', NOW(), NOW());

-- ====================================
-- 9. 插入初始储物柜数据
-- ====================================
INSERT INTO `litemall_locker` (`cabinet_number`, `zone`, `status`, `notes`) VALUES
-- A区储物柜
('A01', 'A区', 'available', '标准储物柜'),
('A02', 'A区', 'available', '标准储物柜'),
('A03', 'A区', 'available', '标准储物柜'),
('A04', 'A区', 'available', '标准储物柜'),
('A05', 'A区', 'available', '标准储物柜'),
('A06', 'A区', 'available', '标准储物柜'),
('A07', 'A区', 'available', '标准储物柜'),
('A08', 'A区', 'available', '标准储物柜'),
('A09', 'A区', 'available', '标准储物柜'),
('A10', 'A区', 'available', '标准储物柜'),
-- B区储物柜
('B01', 'B区', 'available', '大型储物柜'),
('B02', 'B区', 'available', '大型储物柜'),
('B03', 'B区', 'available', '大型储物柜'),
('B04', 'B区', 'available', '大型储物柜'),
('B05', 'B区', 'available', '大型储物柜'),
('B06', 'B区', 'maintenance', '维护中'),
('B07', 'B区', 'available', '大型储物柜'),
('B08', 'B区', 'available', '大型储物柜'),
('B09', 'B区', 'available', '大型储物柜'),
('B10', 'B区', 'available', '大型储物柜');

-- ====================================
-- 10. 创建测试用户数据（可选）
-- ====================================
-- UPDATE `litemall_user` 
-- SET `real_name` = '测试用户', 
--     `identity_verified` = 1,
--     `phone_verified` = 1
-- WHERE `username` = 'user123';

COMMIT;