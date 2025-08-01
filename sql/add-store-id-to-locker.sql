-- 添加 store_id 到 litemall_locker 表
-- 这是一个简化的迁移脚本，只添加 store_id 字段并设置默认值为 1

-- 检查并添加 store_id 列
ALTER TABLE litemall_locker 
ADD COLUMN store_id INT DEFAULT 1 COMMENT '所属门店ID' AFTER id;

-- 添加索引以提高查询性能
ALTER TABLE litemall_locker 
ADD INDEX idx_store_id (store_id);

-- 更新所有现有记录的 store_id 为 1（如果需要）
UPDATE litemall_locker SET store_id = 1 WHERE store_id IS NULL;