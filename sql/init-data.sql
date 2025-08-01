-- 初始测试数据
-- 用于开发和测试环境

-- 插入测试储物柜数据（40个柜子）
INSERT INTO `litemall_locker` (`cabinet_number`, `zone`, `status`, `current_user_id`, `notes`, `add_time`, `update_time`, `deleted`) VALUES
-- A区储物柜（1-20号）
('A001', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A002', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A003', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A004', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A005', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A006', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A007', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A008', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A009', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A010', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A011', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A012', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A013', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A014', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A015', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A016', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A017', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A018', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A019', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),
('A020', 'A区', 'available', NULL, '标准储物柜', NOW(), NOW(), 0),

-- B区储物柜（21-40号）
('B021', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B022', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B023', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B024', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B025', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B026', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B027', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B028', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B029', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B030', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B031', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B032', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B033', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B034', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B035', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B036', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B037', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B038', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B039', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0),
('B040', 'B区', 'available', NULL, '大型储物柜', NOW(), NOW(), 0);

-- 插入测试管理员账号（如果不存在）
INSERT IGNORE INTO `litemall_admin` (`username`, `password`, `last_login_ip`, `last_login_time`, `avatar`, `add_time`, `update_time`, `deleted`, `role_ids`) VALUES
('locker_admin', '$2a$10$nbOOOcA5e7mV8VvAW4bLc.u8JmJSg9pEnv2q3d.Mgap1T7E0q3XvG', '127.0.0.1', NOW(), 'https://yanxuan.nosdn.127.net/80841d741d7fa3073e0ae27bf487339f.jpg?imageView&quality=90&thumbnail=64x64', NOW(), NOW(), 0, '[1]');
-- 密码：locker123

-- 插入储物柜系统配置
INSERT IGNORE INTO `litemall_system` (`key_name`, `key_value`, `add_time`, `update_time`, `deleted`) VALUES
('litemall_locker_voucher_valid_days', '30', NOW(), NOW(), 0),
('litemall_locker_daily_limit', '10', NOW(), NOW(), 0),
('litemall_locker_fee_per_day', '5', NOW(), NOW(), 0),
('litemall_locker_max_storage_days', '90', NOW(), NOW(), 0);

-- 输出初始化完成信息
SELECT '✅ 初始数据导入完成' AS message;
SELECT CONCAT('储物柜总数：', COUNT(*)) AS locker_count FROM litemall_locker;
SELECT CONCAT('可用储物柜：', COUNT(*)) AS available_count FROM litemall_locker WHERE status = 'available';