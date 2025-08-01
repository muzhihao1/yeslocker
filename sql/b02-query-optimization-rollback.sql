-- ====================================
-- B02 查询优化回滚脚本
-- 用于删除优化脚本中添加的索引
-- 执行前请确认是否真的需要回滚
-- ====================================

-- 开启事务
START TRANSACTION;

-- ====================================
-- 1. 删除 litemall_locker 表的新增索引
-- ====================================
ALTER TABLE `litemall_locker` 
DROP INDEX IF EXISTS `idx_store_status_deleted`,
DROP INDEX IF EXISTS `idx_store_zone_status`,
DROP INDEX IF EXISTS `idx_last_used_time`,
DROP INDEX IF EXISTS `idx_assigned_user_deleted`;

-- ====================================
-- 2. 删除 litemall_locker_operation 表的新增索引
-- ====================================
ALTER TABLE `litemall_locker_operation` 
DROP INDEX IF EXISTS `idx_user_type_status_deleted`,
DROP INDEX IF EXISTS `idx_store_type_addtime`,
DROP INDEX IF EXISTS `idx_locker_status_deleted`,
DROP INDEX IF EXISTS `idx_status_expired_deleted`;

-- 恢复原有索引（如果被删除）
-- ALTER TABLE `litemall_locker_operation` ADD INDEX `idx_expired_at` (`expired_at`);

-- ====================================
-- 3. 删除 litemall_voucher 表的新增索引
-- ====================================
ALTER TABLE `litemall_voucher` 
DROP INDEX IF EXISTS `idx_user_status_expired`,
DROP INDEX IF EXISTS `idx_store_status_created`,
DROP INDEX IF EXISTS `idx_status_expired_type`;

-- 恢复原有索引（如果被删除）
-- ALTER TABLE `litemall_voucher` ADD INDEX `idx_expired_at` (`expired_at`);

-- ====================================
-- 4. 删除 litemall_storage_request 表的新增索引
-- ====================================
ALTER TABLE `litemall_storage_request` 
DROP INDEX IF EXISTS `idx_user_status_addtime`,
DROP INDEX IF EXISTS `idx_store_status_type`,
DROP INDEX IF EXISTS `idx_status_addtime_deleted`,
DROP INDEX IF EXISTS `idx_staff_id`;

-- ====================================
-- 5. 删除 litemall_user 表的新增索引
-- ====================================
ALTER TABLE `litemall_user` 
DROP INDEX IF EXISTS `idx_store_verified_deleted`,
DROP INDEX IF EXISTS `idx_real_name`,
DROP INDEX IF EXISTS `idx_mobile_deleted`;

-- ====================================
-- 6. 删除 litemall_staff_log 表的新增索引
-- ====================================
ALTER TABLE `litemall_staff_log` 
DROP INDEX IF EXISTS `idx_staff_addtime`,
DROP INDEX IF EXISTS `idx_store_action_addtime`,
DROP INDEX IF EXISTS `idx_user_id`;

-- ====================================
-- 7. 删除存储过程和视图
-- ====================================
DROP PROCEDURE IF EXISTS `update_table_statistics`;
DROP PROCEDURE IF EXISTS `check_index_usage`;
DROP PROCEDURE IF EXISTS `query_lockers_optimized`;
DROP PROCEDURE IF EXISTS `query_user_operations_optimized`;
DROP VIEW IF EXISTS `v_locker_slow_queries`;

-- 提交事务
COMMIT;

-- ====================================
-- 验证回滚结果
-- ====================================
-- 检查索引是否已删除
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN (
        'litemall_locker',
        'litemall_locker_operation',
        'litemall_voucher',
        'litemall_storage_request',
        'litemall_user',
        'litemall_staff_log'
    )
ORDER BY TABLE_NAME, INDEX_NAME;