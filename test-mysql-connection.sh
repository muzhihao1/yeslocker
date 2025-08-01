#!/bin/bash

echo "🔍 测试MySQL连接..."

# 尝试无密码连接
MYSQL_BIN="/opt/homebrew/Cellar/mysql@8.0/8.0.42/bin/mysql"

# 测试无密码连接
echo "尝试无密码连接..."
if $MYSQL_BIN -uroot -e "SELECT 1" 2>/dev/null; then
    echo "✅ 可以无密码连接MySQL！"
    echo ""
    echo "🚀 正在自动设置数据库..."
    
    # 创建数据库
    $MYSQL_BIN -uroot -e "CREATE DATABASE IF NOT EXISTS yeslocker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "✅ 数据库 yeslocker 已创建"
    
    # 导入SQL文件
    echo "📥 导入数据表..."
    
    # 导入Litemall基础表
    for sql_file in litemall-db/sql/litemall_schema.sql litemall-db/sql/litemall_table.sql litemall-db/sql/litemall_data.sql; do
        if [ -f "$sql_file" ]; then
            echo "  导入 $sql_file ..."
            $MYSQL_BIN -uroot yeslocker < "$sql_file"
        fi
    done
    
    # 导入储物柜扩展表
    if [ -f "sql/locker-extension.sql" ]; then
        echo "  导入储物柜扩展表..."
        $MYSQL_BIN -uroot yeslocker < "sql/locker-extension.sql"
    fi
    
    # 导入初始数据
    if [ -f "sql/init-data.sql" ]; then
        echo "  导入初始数据..."
        $MYSQL_BIN -uroot yeslocker < "sql/init-data.sql"
    fi
    
    echo ""
    echo "🎉 数据库设置完成！"
    echo ""
    echo "📝 现在请修改配置文件："
    echo "   编辑 litemall-all/src/main/resources/application-dev.yml"
    echo "   将 password: 123456 改为空字符串 password:"
    echo ""
    echo "   或者如果你的MySQL有密码，将其改为实际密码"
    
else
    echo "❌ 无法无密码连接MySQL"
    echo ""
    echo "请使用以下方法之一："
    echo ""
    echo "1. 使用MySQL客户端工具（推荐）："
    echo "   - 打开 Sequel Pro, MySQL Workbench 或 phpMyAdmin"
    echo "   - 执行 scripts/all-in-one-setup.sql"
    echo ""
    echo "2. 或者先设置MySQL允许无密码登录："
    echo "   sudo mysql -u root"
    echo "   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';"
    echo "   FLUSH PRIVILEGES;"
fi