-- 手动数据库设置脚本
-- 使用方法：通过MySQL客户端工具执行此脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS yeslocker 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE yeslocker;

-- 提示：接下来需要执行以下SQL文件：
-- 1. litemall-db/sql/litemall_schema.sql
-- 2. litemall-db/sql/litemall_table.sql  
-- 3. litemall-db/sql/litemall_data.sql
-- 4. sql/locker-extension.sql
-- 5. sql/init-data.sql