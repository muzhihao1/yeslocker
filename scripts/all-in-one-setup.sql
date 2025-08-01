-- 耶氏台球杆存取系统 - 一站式数据库设置
-- 使用方法：
-- 1. 打开你的MySQL客户端（如 Sequel Pro, MySQL Workbench, phpMyAdmin等）
-- 2. 连接到MySQL服务器
-- 3. 执行此脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS yeslocker 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE yeslocker;

-- 创建基础用户表（简化版，足够储物柜功能使用）
CREATE TABLE IF NOT EXISTS `litemall_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(63) NOT NULL COMMENT '用户名称',
  `password` varchar(63) NOT NULL DEFAULT '' COMMENT '用户密码',
  `gender` tinyint(3) NOT NULL DEFAULT '0' COMMENT '性别：0 未知， 1男， 1 女',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `last_login_time` datetime DEFAULT NULL COMMENT '最近一次登录时间',
  `last_login_ip` varchar(63) NOT NULL DEFAULT '' COMMENT '最近一次登录IP地址',
  `user_level` tinyint(3) DEFAULT '0' COMMENT '用户层级',
  `nickname` varchar(63) NOT NULL DEFAULT '' COMMENT '用户昵称',
  `mobile` varchar(20) NOT NULL DEFAULT '' COMMENT '用户手机号码',
  `avatar` varchar(255) NOT NULL DEFAULT '' COMMENT '用户头像图片',
  `weixin_openid` varchar(63) NOT NULL DEFAULT '' COMMENT '微信登录openid',
  `status` tinyint(3) NOT NULL DEFAULT '0' COMMENT '0 可用, 1 禁用, 2 注销',
  `add_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`username`),
  KEY `user_mobile` (`mobile`),
  KEY `user_weixin_openid` (`weixin_openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 创建管理员表（简化版）
CREATE TABLE IF NOT EXISTS `litemall_admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(63) NOT NULL DEFAULT '' COMMENT '管理员名称',
  `password` varchar(63) NOT NULL DEFAULT '' COMMENT '管理员密码',
  `last_login_ip` varchar(63) DEFAULT '' COMMENT '最近一次登录IP地址',
  `last_login_time` datetime DEFAULT NULL COMMENT '最近一次登录时间',
  `avatar` varchar(255) DEFAULT '' COMMENT '头像图片',
  `add_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  `role_ids` varchar(127) DEFAULT '[]' COMMENT '角色列表',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 导入储物柜扩展表
source /Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker/sql/locker-extension.sql;

-- 导入初始数据
source /Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker/sql/init-data.sql;

-- 创建存储文件表（用于文件上传）
CREATE TABLE IF NOT EXISTS `litemall_storage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(63) NOT NULL COMMENT '文件的唯一索引',
  `name` varchar(255) NOT NULL COMMENT '文件名',
  `type` varchar(20) NOT NULL COMMENT '文件类型',
  `size` int(11) NOT NULL COMMENT '文件大小',
  `url` varchar(255) DEFAULT NULL COMMENT '文件访问URL',
  `add_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件存储表';

-- 输出成功信息
SELECT '✅ 数据库设置完成！' AS message;
SELECT '📊 已创建核心表和储物柜扩展表' AS status;
SELECT '🎉 系统已准备就绪！' AS ready;