-- 储物柜管理权限配置
-- 添加储物柜管理相关的权限到 litemall_permission 表

-- 为超级管理员角色(role_id=1)已有所有权限(*)，无需额外配置

-- 为商场管理员角色(role_id=2)添加储物柜管理权限
INSERT INTO `litemall_permission` (`role_id`, `permission`, `add_time`, `update_time`, `deleted`) VALUES
(2, 'admin:locker:list', NOW(), NOW(), 0),
(2, 'admin:locker:read', NOW(), NOW(), 0),
(2, 'admin:locker:create', NOW(), NOW(), 0),
(2, 'admin:locker:update', NOW(), NOW(), 0),
(2, 'admin:locker:delete', NOW(), NOW(), 0);

-- 为商场管理员角色(role_id=2)添加储物柜操作记录权限
INSERT INTO `litemall_permission` (`role_id`, `permission`, `add_time`, `update_time`, `deleted`) VALUES
(2, 'admin:locker-operation:list', NOW(), NOW(), 0),
(2, 'admin:locker-operation:read', NOW(), NOW(), 0),
(2, 'admin:locker-operation:export', NOW(), NOW(), 0);

-- 如果需要为推广管理员角色(role_id=3)也添加查看权限，可以执行以下语句
-- INSERT INTO `litemall_permission` (`role_id`, `permission`, `add_time`, `update_time`, `deleted`) VALUES
-- (3, 'admin:locker:list', NOW(), NOW(), 0),
-- (3, 'admin:locker:read', NOW(), NOW(), 0),
-- (3, 'admin:locker-operation:list', NOW(), NOW(), 0),
-- (3, 'admin:locker-operation:read', NOW(), NOW(), 0);