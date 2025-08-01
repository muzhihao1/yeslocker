-- 耶氏台球杆存取系统 - 新流程数据库更新
-- 更新为申请制存取流程
-- 执行时间：2024-01-22

-- ====================================
-- 1. 修改用户表，添加专属柜子字段
-- ====================================
ALTER TABLE `litemall_user` 
ADD COLUMN `locker_id` int(11) DEFAULT NULL COMMENT '专属储物柜ID' AFTER `phone_verified`,
ADD KEY `idx_locker_id` (`locker_id`),
ADD CONSTRAINT `fk_user_locker` FOREIGN KEY (`locker_id`) REFERENCES `litemall_locker`(`id`);

-- ====================================
-- 2. 创建存取申请表
-- ====================================
DROP TABLE IF EXISTS `litemall_storage_request`;
CREATE TABLE `litemall_storage_request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `request_code` varchar(20) NOT NULL COMMENT '申请编号，格式：REQ20240122001',
  `user_id` int(11) NOT NULL COMMENT '申请用户ID',
  `locker_id` int(11) NOT NULL COMMENT '储物柜ID',
  `type` varchar(10) NOT NULL COMMENT '申请类型: store/retrieve',
  `status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/approved/completed/cancelled',
  `staff_id` int(11) DEFAULT NULL COMMENT '处理员工ID',
  `approved_at` datetime DEFAULT NULL COMMENT '审批时间',
  `completed_at` datetime DEFAULT NULL COMMENT '完成时间',
  `notes` text COMMENT '备注',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_request_code` (`request_code`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_locker_id` (`locker_id`),
  KEY `idx_type_status` (`type`,`status`),
  KEY `idx_add_time` (`add_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='存取申请表';

-- ====================================
-- 3. 修改储物柜操作记录表
-- ====================================
ALTER TABLE `litemall_locker_operation` 
ADD COLUMN `request_id` int(11) DEFAULT NULL COMMENT '关联申请ID' AFTER `locker_id`,
ADD COLUMN `operation_type` varchar(20) DEFAULT NULL COMMENT '操作类型: user_store/user_retrieve/staff_confirm' AFTER `type`,
ADD KEY `idx_request_id` (`request_id`);

-- ====================================
-- 4. 创建员工操作日志表
-- ====================================
DROP TABLE IF EXISTS `litemall_staff_log`;
CREATE TABLE `litemall_staff_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL COMMENT '员工ID',
  `request_id` int(11) NOT NULL COMMENT '申请ID',
  `action` varchar(50) NOT NULL COMMENT '操作动作: approve_request/give_key/confirm_storage/confirm_retrieval',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `locker_id` int(11) NOT NULL COMMENT '储物柜ID',
  `identity_verified` tinyint(1) DEFAULT '0' COMMENT '是否验证身份',
  `notes` text COMMENT '操作备注',
  `add_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_staff_id` (`staff_id`),
  KEY `idx_request_id` (`request_id`),
  KEY `idx_add_time` (`add_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工操作日志表';

-- ====================================
-- 5. 更新储物柜表，添加分配相关字段
-- ====================================
ALTER TABLE `litemall_locker` 
ADD COLUMN `assigned_user_id` int(11) DEFAULT NULL COMMENT '分配的用户ID（永久绑定）' AFTER `current_user_id`,
ADD COLUMN `assigned_at` datetime DEFAULT NULL COMMENT '分配时间' AFTER `assigned_user_id`,
ADD KEY `idx_assigned_user` (`assigned_user_id`);

-- ====================================
-- 6. 创建触发器：用户选择柜子后自动更新
-- ====================================
DELIMITER $$
CREATE TRIGGER `update_locker_assignment` 
AFTER UPDATE ON `litemall_user`
FOR EACH ROW
BEGIN
    IF NEW.locker_id IS NOT NULL AND OLD.locker_id IS NULL THEN
        UPDATE `litemall_locker` 
        SET `assigned_user_id` = NEW.id,
            `assigned_at` = NOW(),
            `status` = 'assigned'
        WHERE `id` = NEW.locker_id;
    END IF;
END$$
DELIMITER ;

-- ====================================
-- 7. 更新系统配置
-- ====================================
INSERT INTO `litemall_system` (`key_name`, `key_value`, `add_time`, `update_time`) VALUES
('request_auto_expire_hours', '24', NOW(), NOW()),
('allow_locker_change', 'false', NOW(), NOW()),
('require_staff_confirm', 'true', NOW(), NOW()),
('max_pending_requests', '3', NOW(), NOW())
ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- ====================================
-- 8. 创建申请编号生成函数
-- ====================================
DELIMITER $$
CREATE FUNCTION `generate_request_code`() 
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE new_code VARCHAR(20);
    DECLARE seq_num INT;
    
    -- 获取今天的序号
    SELECT IFNULL(MAX(CAST(SUBSTRING(request_code, 12) AS UNSIGNED)), 0) + 1 INTO seq_num
    FROM litemall_storage_request
    WHERE DATE(add_time) = CURDATE();
    
    -- 生成编号：REQ + 日期 + 3位序号
    SET new_code = CONCAT('REQ', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(seq_num, 3, '0'));
    
    RETURN new_code;
END$$
DELIMITER ;

-- ====================================
-- 9. 迁移现有数据（如果需要）
-- ====================================
-- 将现有的储物柜使用记录转换为新的申请记录
-- INSERT INTO litemall_storage_request (user_id, locker_id, type, status, completed_at)
-- SELECT user_id, locker_id, type, 'completed', add_time
-- FROM litemall_locker_operation
-- WHERE deleted = 0;

-- ====================================
-- 10. 添加示例数据
-- ====================================
-- 为A12柜子分配给测试用户
UPDATE `litemall_locker` SET `status` = 'available' WHERE `cabinet_number` = 'A12';

COMMIT;