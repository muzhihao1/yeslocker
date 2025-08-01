-- ====================================
-- B02 查询优化 - 数据库索引优化脚本
-- 执行时间：2025-01-27
-- 功能：优化储物柜系统的查询性能，添加必要的索引
-- ====================================

-- 开启事务
START TRANSACTION;

-- ====================================
-- 1. litemall_locker 表索引优化
-- ====================================

-- 添加复合索引：门店+状态+删除标记（常用于查询可用储物柜）
ALTER TABLE `litemall_locker` 
ADD INDEX `idx_store_status_deleted` (`store_id`, `status`, `deleted`);

-- 添加复合索引：门店+区域+状态（用于按区域查询）
ALTER TABLE `litemall_locker` 
ADD INDEX `idx_store_zone_status` (`store_id`, `zone`, `status`);

-- 添加索引：最后使用时间（用于清理提醒和统计）
ALTER TABLE `litemall_locker` 
ADD INDEX `idx_last_used_time` (`last_used_time`);

-- 添加索引：分配用户（用于查询用户的专属柜子）
ALTER TABLE `litemall_locker` 
ADD INDEX `idx_assigned_user_deleted` (`assigned_user_id`, `deleted`);

-- 添加索引：柜号（cabinet_number已有唯一索引，无需重复添加）

-- ====================================
-- 2. litemall_locker_operation 表索引优化
-- ====================================

-- 添加复合索引：用户+类型+状态（常用于查询用户的存取记录）
ALTER TABLE `litemall_locker_operation` 
ADD INDEX `idx_user_type_status_deleted` (`user_id`, `type`, `status`, `deleted`);

-- 添加复合索引：门店+类型+创建时间（用于按门店统计）
ALTER TABLE `litemall_locker_operation` 
ADD INDEX `idx_store_type_addtime` (`store_id`, `type`, `add_time`);

-- 添加复合索引：储物柜+状态+删除标记（用于查询特定柜子的操作历史）
ALTER TABLE `litemall_locker_operation` 
ADD INDEX `idx_locker_status_deleted` (`locker_id`, `status`, `deleted`);

-- 优化现有索引：将单字段索引改为复合索引
-- DROP INDEX `idx_expired_at` ON `litemall_locker_operation`;
ALTER TABLE `litemall_locker_operation` 
ADD INDEX `idx_status_expired_deleted` (`status`, `expired_at`, `deleted`);

-- ====================================
-- 3. litemall_voucher 表索引优化  
-- ====================================

-- 添加复合索引：用户+状态+过期时间（用于查询用户有效凭证）
ALTER TABLE `litemall_voucher` 
ADD INDEX `idx_user_status_expired` (`user_id`, `status`, `expired_at`);

-- 添加复合索引：门店+状态+创建时间（用于按门店统计凭证）
ALTER TABLE `litemall_voucher` 
ADD INDEX `idx_store_status_created` (`store_id`, `status`, `created_at`);

-- 添加复合索引：状态+过期时间（用于清理过期凭证）
-- DROP INDEX `idx_expired_at` ON `litemall_voucher`;
ALTER TABLE `litemall_voucher` 
ADD INDEX `idx_status_expired_type` (`status`, `expired_at`, `type`);

-- 凭证码已有唯一索引（uk_code），查询性能已优化

-- ====================================
-- 4. litemall_storage_request 表索引优化
-- ====================================

-- 添加复合索引：用户+状态+创建时间（用于查询用户申请历史）
ALTER TABLE `litemall_storage_request` 
ADD INDEX `idx_user_status_addtime` (`user_id`, `status`, `add_time`);

-- 添加复合索引：门店+状态+类型（用于管理员查询待处理申请）
ALTER TABLE `litemall_storage_request` 
ADD INDEX `idx_store_status_type` (`store_id`, `status`, `type`);

-- 添加复合索引：状态+创建时间（用于查询超时申请）
ALTER TABLE `litemall_storage_request` 
ADD INDEX `idx_status_addtime_deleted` (`status`, `add_time`, `deleted`);

-- 添加索引：员工ID（用于查询员工处理记录）
ALTER TABLE `litemall_storage_request` 
ADD INDEX `idx_staff_id` (`staff_id`);

-- 申请编号已有唯一索引（uk_request_code），查询性能已优化

-- ====================================
-- 5. litemall_user 表索引优化（储物柜相关）
-- ====================================

-- 添加复合索引：门店+身份验证状态（用于查询已验证用户）
ALTER TABLE `litemall_user` 
ADD INDEX `idx_store_verified_deleted` (`store_id`, `identity_verified`, `deleted`);

-- 添加索引：真实姓名（用于模糊搜索，仅索引前缀以节省空间）
ALTER TABLE `litemall_user` 
ADD INDEX `idx_real_name` (`real_name`(20));

-- 添加复合索引：手机号+删除标记（用于手机号查询）
ALTER TABLE `litemall_user` 
ADD INDEX `idx_mobile_deleted` (`mobile`, `deleted`);

-- locker_id 已有索引（idx_locker_id），无需重复添加

-- ====================================
-- 6. litemall_staff_log 表索引优化
-- ====================================

-- 添加复合索引：员工+操作时间（用于查询员工操作历史）
ALTER TABLE `litemall_staff_log` 
ADD INDEX `idx_staff_addtime` (`staff_id`, `add_time`);

-- 添加复合索引：门店+操作+时间（用于按门店统计）
ALTER TABLE `litemall_staff_log` 
ADD INDEX `idx_store_action_addtime` (`store_id`, `action`, `add_time`);

-- 添加索引：用户ID（用于查询特定用户相关的操作）
ALTER TABLE `litemall_staff_log` 
ADD INDEX `idx_user_id` (`user_id`);

-- ====================================
-- 7. 创建统计信息更新存储过程
-- ====================================
DELIMITER $$

DROP PROCEDURE IF EXISTS `update_table_statistics`$$
CREATE PROCEDURE `update_table_statistics`()
BEGIN
    -- 更新表统计信息，帮助优化器选择最佳执行计划
    ANALYZE TABLE `litemall_locker`;
    ANALYZE TABLE `litemall_locker_operation`;
    ANALYZE TABLE `litemall_voucher`;
    ANALYZE TABLE `litemall_storage_request`;
    ANALYZE TABLE `litemall_user`;
    ANALYZE TABLE `litemall_staff_log`;
END$$

DELIMITER ;

-- 执行统计信息更新
CALL update_table_statistics();

-- ====================================
-- 8. 创建慢查询监控视图
-- ====================================
CREATE OR REPLACE VIEW `v_locker_slow_queries` AS
SELECT 
    DIGEST_TEXT,
    COUNT_STAR AS exec_count,
    SUM_TIMER_WAIT/1000000000000 AS total_latency_sec,
    AVG_TIMER_WAIT/1000000000000 AS avg_latency_sec,
    SUM_ROWS_EXAMINED AS total_rows_examined,
    SUM_ROWS_SENT AS total_rows_sent,
    FIRST_SEEN,
    LAST_SEEN
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = DATABASE()
    AND DIGEST_TEXT LIKE '%locker%'
    AND AVG_TIMER_WAIT/1000000000000 > 0.1  -- 超过100ms的查询
ORDER BY avg_latency_sec DESC
LIMIT 20;

-- ====================================
-- 9. 创建索引使用情况监控存储过程
-- ====================================
DELIMITER $$

DROP PROCEDURE IF EXISTS `check_index_usage`$$
CREATE PROCEDURE `check_index_usage`(IN table_name VARCHAR(64))
BEGIN
    -- 检查指定表的索引使用情况
    SELECT 
        INDEX_NAME,
        COLUMN_NAME,
        SEQ_IN_INDEX,
        CARDINALITY,
        NULLABLE
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = table_name
    ORDER BY INDEX_NAME, SEQ_IN_INDEX;
    
    -- 显示未使用的索引（需要开启performance_schema）
    SELECT 
        object_schema,
        object_name,
        index_name
    FROM performance_schema.table_io_waits_summary_by_index_usage
    WHERE object_schema = DATABASE()
        AND object_name = table_name
        AND index_name IS NOT NULL
        AND count_star = 0;
END$$

DELIMITER ;

-- ====================================
-- 10. 添加查询优化提示
-- ====================================

-- 为常用的查询模式创建存储过程，使用查询优化提示
DELIMITER $$

-- 优化的储物柜列表查询
DROP PROCEDURE IF EXISTS `query_lockers_optimized`$$
CREATE PROCEDURE `query_lockers_optimized`(
    IN p_store_id INT,
    IN p_zone VARCHAR(20),
    IN p_status VARCHAR(20),
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    -- 使用 SQL_CALC_FOUND_ROWS 避免额外的 COUNT 查询
    SELECT SQL_CALC_FOUND_ROWS
        l.id,
        l.cabinet_number,
        l.zone,
        l.status,
        l.current_user_id,
        l.last_used_time,
        l.notes,
        u.username,
        u.real_name
    FROM litemall_locker l
    LEFT JOIN litemall_user u ON l.current_user_id = u.id
    WHERE l.deleted = 0
        AND (p_store_id IS NULL OR l.store_id = p_store_id)
        AND (p_zone IS NULL OR l.zone = p_zone)
        AND (p_status IS NULL OR l.status = p_status)
    ORDER BY l.zone, l.cabinet_number
    LIMIT p_limit OFFSET (p_page - 1) * p_limit;
    
    -- 返回总记录数
    SELECT FOUND_ROWS() AS total;
END$$

-- 优化的用户操作历史查询
DROP PROCEDURE IF EXISTS `query_user_operations_optimized`$$
CREATE PROCEDURE `query_user_operations_optimized`(
    IN p_user_id INT,
    IN p_type VARCHAR(10),
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    SELECT SQL_CALC_FOUND_ROWS
        o.id,
        o.type,
        o.voucher_code,
        o.status,
        o.add_time,
        l.cabinet_number,
        l.zone
    FROM litemall_locker_operation o
    INNER JOIN litemall_locker l ON o.locker_id = l.id
    WHERE o.deleted = 0
        AND o.user_id = p_user_id
        AND (p_type IS NULL OR o.type = p_type)
    ORDER BY o.add_time DESC
    LIMIT p_limit OFFSET (p_page - 1) * p_limit;
    
    SELECT FOUND_ROWS() AS total;
END$$

DELIMITER ;

-- 提交事务
COMMIT;

-- ====================================
-- 性能优化建议
-- ====================================
-- 1. 定期执行 CALL update_table_statistics() 更新统计信息
-- 2. 监控慢查询：SELECT * FROM v_locker_slow_queries
-- 3. 检查索引使用：CALL check_index_usage('litemall_locker')
-- 4. 考虑对大表进行分区（按时间或门店）
-- 5. 定期清理历史数据，保持表的适当大小