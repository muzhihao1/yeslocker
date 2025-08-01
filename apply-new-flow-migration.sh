#!/bin/bash

# 新流程数据库迁移脚本
# 执行前请确保MySQL服务已启动

echo "======================================"
echo "耶氏台球杆存取系统 - 新流程数据库迁移"
echo "======================================"
echo ""

# 读取数据库密码
echo -n "请输入MySQL root密码: "
read -s DB_PASSWORD
echo ""

# 执行迁移
echo "正在执行数据库迁移..."
mysql -u root -p$DB_PASSWORD litemall < sql/locker-new-flow.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移成功！"
    echo ""
    echo "已完成以下更新："
    echo "- 用户表添加专属柜子字段"
    echo "- 创建存取申请表"
    echo "- 创建员工操作日志表"
    echo "- 更新储物柜表结构"
    echo ""
    echo "下一步："
    echo "1. 重新编译后端：mvn clean package -DskipTests"
    echo "2. 重启后端服务：./start-backend.sh"
else
    echo "❌ 数据库迁移失败！"
    echo "请检查："
    echo "1. MySQL服务是否运行"
    echo "2. 密码是否正确"
    echo "3. litemall数据库是否存在"
fi