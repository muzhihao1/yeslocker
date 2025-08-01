#!/bin/bash

# 耶氏台球杆存取系统 - 数据库设置脚本

echo "🗄️  设置MySQL数据库..."

# MySQL连接信息
MYSQL_USER="root"
MYSQL_HOST="localhost"
MYSQL_PORT="3306"
DB_NAME="yeslocker"

# 设置MySQL路径
MYSQL_BIN="/opt/homebrew/Cellar/mysql@8.0/8.0.42/bin/mysql"
if [ ! -f "$MYSQL_BIN" ]; then
    # 尝试其他常见位置
    if [ -f "/usr/local/bin/mysql" ]; then
        MYSQL_BIN="/usr/local/bin/mysql"
    elif [ -f "/opt/homebrew/bin/mysql" ]; then
        MYSQL_BIN="/opt/homebrew/bin/mysql"
    else
        echo "❌ 未找到MySQL命令，请确保MySQL已安装"
        exit 1
    fi
fi

# 提示输入MySQL密码
echo -n "请输入MySQL root密码: "
read -s MYSQL_PASSWORD
echo ""

# 创建数据库
echo "📊 创建数据库 ${DB_NAME}..."
"$MYSQL_BIN" -u${MYSQL_USER} -p${MYSQL_PASSWORD} -h${MYSQL_HOST} -P${MYSQL_PORT} -e "
CREATE DATABASE IF NOT EXISTS ${DB_NAME} 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;"

if [ $? -ne 0 ]; then
    echo "❌ 创建数据库失败"
    exit 1
fi

echo "✅ 数据库创建成功"

# 导入Litemall基础表
LITEMALL_SQL="/Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker/litemall-db/sql/litemall_schema.sql"
if [ -f "$LITEMALL_SQL" ]; then
    echo "📥 导入Litemall基础表..."
    "$MYSQL_BIN" -u${MYSQL_USER} -p${MYSQL_PASSWORD} -h${MYSQL_HOST} -P${MYSQL_PORT} ${DB_NAME} < "$LITEMALL_SQL"
    
    if [ $? -eq 0 ]; then
        echo "✅ Litemall基础表导入成功"
    else
        echo "⚠️  Litemall基础表导入失败，请检查SQL文件"
    fi
else
    echo "⚠️  未找到Litemall基础表SQL文件: $LITEMALL_SQL"
    echo "   请确保已从Litemall项目复制基础表结构"
fi

# 导入储物柜扩展表
LOCKER_SQL="/Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker/sql/locker-extension.sql"
if [ -f "$LOCKER_SQL" ]; then
    echo "📥 导入储物柜扩展表..."
    "$MYSQL_BIN" -u${MYSQL_USER} -p${MYSQL_PASSWORD} -h${MYSQL_HOST} -P${MYSQL_PORT} ${DB_NAME} < "$LOCKER_SQL"
    
    if [ $? -eq 0 ]; then
        echo "✅ 储物柜扩展表导入成功"
    else
        echo "❌ 储物柜扩展表导入失败"
        exit 1
    fi
else
    echo "❌ 未找到储物柜扩展表SQL文件: $LOCKER_SQL"
    exit 1
fi

# 导入初始数据
INIT_DATA_SQL="/Users/liasiloam/Library/CloudStorage/Dropbox/项目开发/杆柜管理/yeslocker/sql/init-data.sql"
if [ -f "$INIT_DATA_SQL" ]; then
    echo "📥 导入初始数据..."
    "$MYSQL_BIN" -u${MYSQL_USER} -p${MYSQL_PASSWORD} -h${MYSQL_HOST} -P${MYSQL_PORT} ${DB_NAME} < "$INIT_DATA_SQL"
    
    if [ $? -eq 0 ]; then
        echo "✅ 初始数据导入成功"
    else
        echo "⚠️  初始数据导入失败（非关键错误）"
    fi
else
    echo "ℹ️  未找到初始数据文件，跳过"
fi

# 验证表创建
echo ""
echo "🔍 验证数据库表..."
TABLES=$("$MYSQL_BIN" -u${MYSQL_USER} -p${MYSQL_PASSWORD} -h${MYSQL_HOST} -P${MYSQL_PORT} ${DB_NAME} -N -e "SHOW TABLES LIKE 'litemall_locker%'")

if [ -n "$TABLES" ]; then
    echo "✅ 储物柜相关表已创建："
    echo "$TABLES"
else
    echo "❌ 未找到储物柜相关表，请检查SQL文件"
    exit 1
fi

echo ""
echo "🎉 数据库设置完成！"
echo ""
echo "下一步："
echo "1. 运行 ./start-backend.sh 启动后端服务"
echo "2. 访问 http://localhost:8080/admin/index.html 查看管理后台"
echo "3. 默认管理员账号：admin123 / admin123"