-- 创建门店表
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
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_name` (`name`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门店表';

-- 插入默认门店数据
INSERT INTO `litemall_store` (`name`, `code`, `address`, `phone`, `business_hours`, `status`, `locker_count`, `manager_name`, `manager_phone`)
VALUES ('耶氏体育台球俱乐部（总店）', 'YS001', '北京市朝阳区建国路88号', '010-12345678', '09:00-22:00', 'active', 20, '张经理', '13800138000');

-- 创建用户-门店关联表
CREATE TABLE IF NOT EXISTS `litemall_user_store` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `store_id` int(11) NOT NULL COMMENT '门店ID',
  `is_default` tinyint(1) DEFAULT '0' COMMENT '是否默认门店',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_store` (`user_id`, `store_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_store_id` (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-门店关联表';

-- 添加 store_id 到 litemall_locker 表
-- 注意：这个脚本已经在 add-store-id-to-locker.sql 中了，这里只是为了完整性
-- ALTER TABLE litemall_locker 
-- ADD COLUMN store_id INT DEFAULT 1 COMMENT '所属门店ID' AFTER id,
-- ADD INDEX idx_store_id (store_id);

-- 添加 store_id 到 litemall_locker_operation 表
ALTER TABLE litemall_locker_operation 
ADD COLUMN store_id INT DEFAULT 1 COMMENT '所属门店ID' AFTER locker_id,
ADD INDEX idx_store_id (store_id);

-- 管理员门店权限表（可选，用于限制管理员只能管理特定门店）
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